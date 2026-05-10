import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { z } from 'zod'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
if (!OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

async function embed(text) {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000),
  })
  return res.data[0].embedding
}

function youtubeLink(youtubeId, startSeconds) {
  const base = `https://www.youtube.com/watch?v=${youtubeId}`
  if (startSeconds && startSeconds > 0) return `${base}&t=${Math.floor(startSeconds)}s`
  return base
}

function communityLink(videoId, startSeconds) {
  const base = `https://hykohub.com/videos/${videoId}`
  if (startSeconds && startSeconds > 0) return `${base}?t=${Math.floor(startSeconds)}`
  return base
}

const server = new McpServer({
  name: 'hykohub-knowledge-base',
  version: '1.0.0',
})

// Tool 1: Semantic search
server.tool(
  'search_videos',
  'Search the HykoHub video knowledge base semantically. Returns relevant video segments with community and YouTube links.',
  {
    query: z.string().describe('The question or topic to search for'),
    limit: z.number().int().min(1).max(10).default(5).describe('Max results to return'),
    threshold: z.number().min(0).max(1).default(0.45).describe('Similarity threshold (0-1)'),
  },
  async ({ query, limit, threshold }) => {
    const embedding = await embed(query)

    const { data, error } = await supabase.rpc('match_video_chunks', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit,
    })

    if (error) throw new Error(`Supabase error: ${error.message}`)

    if (!data || data.length === 0) {
      return {
        content: [{
          type: 'text',
          text: 'Nenhum vídeo encontrado para esta pesquisa na base de conhecimento.',
        }],
      }
    }

    const results = data.map((row, i) => {
      const community = communityLink(row.video_id, row.start_seconds)
      const youtube = youtubeLink(row.youtube_id, row.start_seconds)
      const time = row.start_seconds ? `${Math.floor(row.start_seconds / 60)}min${Math.floor(row.start_seconds % 60)}s` : ''
      return [
        `${i + 1}. **${row.video_title}**${time ? ` (${time})` : ''}`,
        `   Relevância: ${(row.similarity * 100).toFixed(0)}%`,
        `   Trecho: "${row.chunk_text.slice(0, 200)}..."`,
        `   Comunidade: ${community}`,
        `   YouTube: ${youtube}`,
      ].join('\n')
    }).join('\n\n')

    return {
      content: [{
        type: 'text',
        text: `Encontrei ${data.length} resultado(s) para "${query}":\n\n${results}`,
      }],
    }
  }
)

// Tool 2: Store transcript + generate embeddings
server.tool(
  'index_video',
  'Index a video transcript into the knowledge base. Chunks the text and generates embeddings for semantic search.',
  {
    video_id: z.string().uuid().describe('UUID of the video_posts record'),
    full_text: z.string().describe('Full transcript text'),
    source: z.enum(['youtube_api', 'whisper', 'manual']).default('youtube_api'),
    language: z.string().default('pt'),
    duration_seconds: z.number().int().optional(),
    chunks: z.array(z.object({
      text: z.string(),
      start_seconds: z.number().optional(),
      end_seconds: z.number().optional(),
    })).describe('Pre-chunked segments with timestamps'),
  },
  async ({ video_id, full_text, source, language, duration_seconds, chunks }) => {
    // Save transcript
    const { data: transcript, error: tErr } = await supabase
      .from('video_transcripts')
      .insert({ video_id, source, language, full_text, duration_seconds })
      .select('id')
      .single()

    if (tErr) throw new Error(`Failed to save transcript: ${tErr.message}`)

    // Generate embeddings for each chunk
    const chunkRows = []
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const embedding = await embed(chunk.text)
      chunkRows.push({
        video_id,
        transcript_id: transcript.id,
        chunk_index: i,
        start_seconds: chunk.start_seconds ?? null,
        end_seconds: chunk.end_seconds ?? null,
        text: chunk.text,
        embedding,
      })
    }

    const { error: cErr } = await supabase.from('video_chunks').insert(chunkRows)
    if (cErr) throw new Error(`Failed to save chunks: ${cErr.message}`)

    return {
      content: [{
        type: 'text',
        text: `Vídeo indexado com sucesso. Transcrição ID: ${transcript.id}. ${chunks.length} chunks criados com embeddings.`,
      }],
    }
  }
)

// Tool 3: List indexed videos
server.tool(
  'list_indexed_videos',
  'List all videos that have been indexed in the knowledge base.',
  {},
  async () => {
    const { data, error } = await supabase
      .from('video_transcripts')
      .select('video_id, source, language, created_at, video_posts(title, youtube_id)')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    if (!data || data.length === 0) {
      return { content: [{ type: 'text', text: 'Nenhum vídeo indexado ainda.' }] }
    }

    const list = data.map(r => {
      const v = r.video_posts
      return `• ${v?.title ?? r.video_id} (${r.source}, ${r.language}) — indexado em ${new Date(r.created_at).toLocaleDateString('pt-BR')}`
    }).join('\n')

    return { content: [{ type: 'text', text: `Vídeos indexados:\n\n${list}` }] }
  }
)

const transport = new StdioServerTransport()
await server.connect(transport)
