export type MemberTier = 'level0' | 'level1' | 'level2' | 'level3'
export type OperationProfile = 'hobby' | 'varejo_eventual' | 'atacado'
export type PoolInterest = 'sim' | 'nao' | 'talvez'
export type AlertCategory = 'firmware' | 'manutencao' | 'otimizacao' | 'seguranca'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          nome: string
          email: string
          cidade: string
          estado: string
          tem_impressora: boolean
          lgpd_aceito: boolean
          avatar_url: string | null
          bio: string | null
          qtd_impressoras: number | null
          nivel_experiencia: string | null
          whatsapp: string | null
          tier: MemberTier
          trust_score: number
          consumo_mensal_kg: number | null
          tipos_filamento: string[] | null
          bed_size_max: string | null
          horas_semana: number | null
          faz_pos_processamento: string[] | null
          perfil_operacao: OperationProfile | null
          interesse_pool: PoolInterest | null
          interesse_aprendizado: string[] | null
          pais: string | null
          is_admin: boolean
          admin_notes: string | null
          cnpj_cpf: string | null
          endereco_completo: string | null
          acordo_pro_assinado: boolean
          foto_bancada_url: string | null
          video_impressao_url: string | null
          is_pro: boolean
          pro_qualified_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at' | 'trust_score' | 'tier' | 'is_pro' | 'acordo_pro_assinado'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      printer_models: {
        Row: {
          id: string
          marca: string
          modelo: string
          slug: string
          bed_size: string
        }
        Insert: Omit<Database['public']['Tables']['printer_models']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['printer_models']['Insert']>
        Relationships: []
      }
      user_printers: {
        Row: {
          id: string
          user_id: string
          printer_model_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_printers']['Row'], 'id' | 'created_at'>
        Update: Record<string, never>
        Relationships: [
          {
            foreignKeyName: 'user_printers_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_printers_printer_model_id_fkey'
            columns: ['printer_model_id']
            isOneToOne: false
            referencedRelation: 'printer_models'
            referencedColumns: ['id']
          }
        ]
      }
      alerts: {
        Row: {
          id: string
          created_at: string
          titulo: string
          descricao: string
          categoria: AlertCategory
          printer_model_slug: string | null
          link_externo: string | null
          is_featured: boolean
        }
        Insert: Omit<Database['public']['Tables']['alerts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['alerts']['Insert']>
        Relationships: []
      }
      group_purchases: {
        Row: {
          id: string
          created_at: string
          produto: string
          fornecedor: string
          preco_cheio: number
          preco_grupo: number
          preco_pro: number | null
          prazo_dias: number
          minimo_adesoes: number
          atual_adesoes: number
          ativo: boolean
          imagem_url: string | null
        }
        Insert: Omit<Database['public']['Tables']['group_purchases']['Row'], 'id' | 'created_at' | 'atual_adesoes'>
        Update: Partial<Database['public']['Tables']['group_purchases']['Insert']>
        Relationships: []
      }
      stl_files: {
        Row: {
          id: string
          created_at: string
          titulo: string
          descricao: string | null
          imagem_url: string | null
          download_url: string
          licenca: string
          tags: string[]
          downloads: number
        }
        Insert: Omit<Database['public']['Tables']['stl_files']['Row'], 'id' | 'created_at' | 'downloads'>
        Update: Partial<Database['public']['Tables']['stl_files']['Insert']>
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
