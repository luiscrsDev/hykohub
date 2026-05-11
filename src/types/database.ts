export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type MemberTier = 'level0' | 'level1' | 'level2' | 'level3'

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          categoria: string
          created_at: string
          descricao: string
          id: string
          is_featured: boolean
          link_externo: string | null
          printer_model_slug: string | null
          titulo: string
        }
        Insert: {
          categoria: string
          created_at?: string
          descricao: string
          id?: string
          is_featured?: boolean
          link_externo?: string | null
          printer_model_slug?: string | null
          titulo: string
        }
        Update: {
          categoria?: string
          created_at?: string
          descricao?: string
          id?: string
          is_featured?: boolean
          link_externo?: string | null
          printer_model_slug?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_printer_model_slug_fkey"
            columns: ["printer_model_slug"]
            isOneToOne: false
            referencedRelation: "printer_models"
            referencedColumns: ["slug"]
          },
        ]
      }
      group_purchases: {
        Row: {
          ativo: boolean
          atual_adesoes: number
          created_at: string
          fornecedor: string
          id: string
          imagem_url: string | null
          minimo_adesoes: number
          pais: string
          prazo_dias: number
          preco_cheio: number
          preco_grupo: number
          preco_pro: number | null
          produto: string
        }
        Insert: {
          ativo?: boolean
          atual_adesoes?: number
          created_at?: string
          fornecedor: string
          id?: string
          imagem_url?: string | null
          minimo_adesoes?: number
          pais: string
          prazo_dias: number
          preco_cheio: number
          preco_grupo: number
          preco_pro?: number | null
          produto: string
        }
        Update: {
          ativo?: boolean
          atual_adesoes?: number
          created_at?: string
          fornecedor?: string
          id?: string
          imagem_url?: string | null
          minimo_adesoes?: number
          pais?: string
          prazo_dias?: number
          preco_cheio?: number
          preco_grupo?: number
          preco_pro?: number | null
          produto?: string
        }
        Relationships: []
      }
      printer_models: {
        Row: {
          bed_size: string
          id: string
          marca: string
          modelo: string
          slug: string
        }
        Insert: {
          bed_size: string
          id?: string
          marca: string
          modelo: string
          slug: string
        }
        Update: {
          bed_size?: string
          id?: string
          marca?: string
          modelo?: string
          slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          acordo_pro_assinado: boolean
          admin_notes: string | null
          avatar_url: string | null
          bed_size_max: string | null
          bio: string | null
          cidade: string
          cnpj_cpf: string | null
          consumo_mensal_kg: number | null
          created_at: string
          email: string
          endereco_completo: string | null
          estado: string
          faz_pos_processamento: string[] | null
          foto_bancada_url: string | null
          horas_semana: number | null
          id: string
          interesse_aprendizado: string[] | null
          interesse_pool: string | null
          is_admin: boolean | null
          is_pro: boolean
          lgpd_aceito: boolean
          nivel_experiencia: string | null
          nome: string
          pais: string | null
          perfil_operacao: string | null
          pro_qualified_at: string | null
          qtd_impressoras: number | null
          tem_impressora: boolean
          tier: string
          tipos_filamento: string[] | null
          trust_score: number
          updated_at: string
          video_impressao_url: string | null
          whatsapp: string | null
        }
        Insert: {
          acordo_pro_assinado?: boolean
          admin_notes?: string | null
          avatar_url?: string | null
          bed_size_max?: string | null
          bio?: string | null
          cidade: string
          cnpj_cpf?: string | null
          consumo_mensal_kg?: number | null
          created_at?: string
          email: string
          endereco_completo?: string | null
          estado: string
          faz_pos_processamento?: string[] | null
          foto_bancada_url?: string | null
          horas_semana?: number | null
          id: string
          interesse_aprendizado?: string[] | null
          interesse_pool?: string | null
          is_admin?: boolean | null
          is_pro?: boolean
          lgpd_aceito?: boolean
          nivel_experiencia?: string | null
          nome: string
          pais?: string | null
          perfil_operacao?: string | null
          pro_qualified_at?: string | null
          qtd_impressoras?: number | null
          tem_impressora?: boolean
          tier?: string
          tipos_filamento?: string[] | null
          trust_score?: number
          updated_at?: string
          video_impressao_url?: string | null
          whatsapp?: string | null
        }
        Update: {
          acordo_pro_assinado?: boolean
          admin_notes?: string | null
          avatar_url?: string | null
          bed_size_max?: string | null
          bio?: string | null
          cidade?: string
          cnpj_cpf?: string | null
          consumo_mensal_kg?: number | null
          created_at?: string
          email?: string
          endereco_completo?: string | null
          estado?: string
          faz_pos_processamento?: string[] | null
          foto_bancada_url?: string | null
          horas_semana?: number | null
          id?: string
          interesse_aprendizado?: string[] | null
          interesse_pool?: string | null
          is_admin?: boolean | null
          is_pro?: boolean
          lgpd_aceito?: boolean
          nivel_experiencia?: string | null
          nome?: string
          pais?: string | null
          perfil_operacao?: string | null
          pro_qualified_at?: string | null
          qtd_impressoras?: number | null
          tem_impressora?: boolean
          tier?: string
          tipos_filamento?: string[] | null
          trust_score?: number
          updated_at?: string
          video_impressao_url?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      stl_files: {
        Row: {
          created_at: string
          descricao: string | null
          download_url: string
          downloads: number
          id: string
          imagem_url: string | null
          licenca: string
          tags: string[]
          titulo: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          download_url: string
          downloads?: number
          id?: string
          imagem_url?: string | null
          licenca?: string
          tags?: string[]
          titulo: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          download_url?: string
          downloads?: number
          id?: string
          imagem_url?: string | null
          licenca?: string
          tags?: string[]
          titulo?: string
        }
        Relationships: []
      }
      stl_posts: {
        Row: {
          compatibilidade: string[] | null
          created_at: string | null
          description: string | null
          download_count: number | null
          external_link: string | null
          file_url: string | null
          id: string
          is_featured: boolean | null
          status: string
          submitted_by: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          compatibilidade?: string[] | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          external_link?: string | null
          file_url?: string | null
          id?: string
          is_featured?: boolean | null
          status?: string
          submitted_by?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
        }
        Update: {
          compatibilidade?: string[] | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          external_link?: string | null
          file_url?: string | null
          id?: string
          is_featured?: boolean | null
          status?: string
          submitted_by?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "stl_posts_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_printers: {
        Row: {
          created_at: string
          custom_model_name: string | null
          id: string
          printer_model_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_model_name?: string | null
          id?: string
          printer_model_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_model_name?: string | null
          id?: string
          printer_model_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_printers_printer_model_id_fkey"
            columns: ["printer_model_id"]
            isOneToOne: false
            referencedRelation: "printer_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_printers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_chunks: {
        Row: {
          chunk_index: number
          created_at: string | null
          embedding: string | null
          end_seconds: number | null
          id: string
          start_seconds: number | null
          text: string
          transcript_id: string
          video_id: string
        }
        Insert: {
          chunk_index: number
          created_at?: string | null
          embedding?: string | null
          end_seconds?: number | null
          id?: string
          start_seconds?: number | null
          text: string
          transcript_id: string
          video_id: string
        }
        Update: {
          chunk_index?: number
          created_at?: string | null
          embedding?: string | null
          end_seconds?: number | null
          id?: string
          start_seconds?: number | null
          text?: string
          transcript_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_chunks_transcript_id_fkey"
            columns: ["transcript_id"]
            isOneToOne: false
            referencedRelation: "video_transcripts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_chunks_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      video_posts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          status: string
          submitted_by: string | null
          tags: string[] | null
          title: string
          youtube_id: string
          youtube_url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          status?: string
          submitted_by?: string | null
          tags?: string[] | null
          title: string
          youtube_id: string
          youtube_url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          status?: string
          submitted_by?: string | null
          tags?: string[] | null
          title?: string
          youtube_id?: string
          youtube_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_posts_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_transcripts: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          full_text: string
          id: string
          language: string
          source: string
          video_id: string
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          full_text: string
          id?: string
          language?: string
          source?: string
          video_id: string
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          full_text?: string
          id?: string
          language?: string
          source?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_transcripts_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video_posts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_video_chunks: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          chunk_id: string
          chunk_text: string
          end_seconds: number
          similarity: number
          start_seconds: number
          video_id: string
          video_title: string
          youtube_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
