/**
 * Rótulos e helpers compartilhados pela seção de vídeos (páginas públicas e admin).
 *
 * Os códigos de categoria vêm do gabarito de classificação usado na curadoria
 * (A = negócio/loja, B = técnica de impressão, C = modelagem, D = outros) e são
 * validados no banco pela constraint video_posts_problem_category_check.
 */

export const CATEGORIA_LABELS: Record<string, string> = {
  A1: 'Escolha de filamento',
  A2: 'Qualidade do material',
  A3: 'Custo e desperdício',
  A4: 'Vender e precificar',
  A5: 'Atendimento e entrega',
  B1: 'Aderência na mesa',
  B2: 'Entupimento e extrusão',
  B3: 'Calibração',
  B4: 'Acabamento',
  B5: 'Manutenção da impressora',
  B6: 'Configuração do fatiador',
  B7: 'Pós-processamento',
  C1: 'Modelagem do zero',
  C2: 'Consertar modelos',
  C3: 'Onde achar modelos',
  C4: 'Render e apresentação',
  D1: 'Entretenimento',
  D2: 'Fora do universo 3D',
}

export const NIVEL_LABELS: Record<string, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
}

type VideoLike = {
  thumbnail_url?: string | null
  youtube_id?: string | null
}

/** Capa própria (Instagram e afins) ou, na falta dela, a capa gerada pelo YouTube. */
export function thumbnailFor(v: VideoLike): string | null {
  if (v.thumbnail_url) return v.thumbnail_url
  if (v.youtube_id) return `https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`
  return null
}

/** Link para assistir: o post original quando existir, senão a URL do YouTube. */
export function watchUrlFor(v: { source_url?: string | null; youtube_url?: string | null }): string | null {
  return v.source_url ?? v.youtube_url ?? null
}

/** Formata 82 -> "1:22". */
export function formatDuration(seconds?: number | null): string | null {
  if (!seconds || seconds <= 0) return null
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
