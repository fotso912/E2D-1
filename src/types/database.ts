export interface Database {
  public: {
    Tables: {
      membres: {
        Row: {
          id: string
          email: string
          nom: string
          prenom: string
          telephone: string | null
          photo_url: string | null
          statut: 'actif' | 'inactif' | 'suspendu'
          montant_cotisation_mensuelle: number
          date_adhesion: string
          mot_de_passe_modifiable: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          nom: string
          prenom: string
          telephone?: string | null
          photo_url?: string | null
          statut?: 'actif' | 'inactif' | 'suspendu'
          montant_cotisation_mensuelle?: number
          date_adhesion?: string
          mot_de_passe_modifiable?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nom?: string
          prenom?: string
          telephone?: string | null
          photo_url?: string | null
          statut?: 'actif' | 'inactif' | 'suspendu'
          montant_cotisation_mensuelle?: number
          date_adhesion?: string
          mot_de_passe_modifiable?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          nom: string
          description: string | null
          permissions: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nom: string
          description?: string | null
          permissions?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nom?: string
          description?: string | null
          permissions?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      membres_roles: {
        Row: {
          id: string
          membre_id: string
          role_id: string
          date_attribution: string
          attribue_par: string | null
        }
        Insert: {
          id?: string
          membre_id: string
          role_id: string
          date_attribution?: string
          attribue_par?: string | null
        }
        Update: {
          id?: string
          membre_id?: string
          role_id?: string
          date_attribution?: string
          attribue_par?: string | null
        }
      }
      cotisations: {
        Row: {
          id: string
          membre_id: string
          mois: number
          annee: number
          montant_attendu: number
          montant_paye: number
          huile_paye: boolean
          savon_paye: boolean
          fond_sport_paye: boolean
          montant_fond_sport: number
          date_paiement: string | null
          saisi_par: string | null
          created_at: string
        }
        Insert: {
          id?: string
          membre_id: string
          mois: number
          annee: number
          montant_attendu: number
          montant_paye?: number
          huile_paye?: boolean
          savon_paye?: boolean
          fond_sport_paye?: boolean
          montant_fond_sport?: number
          date_paiement?: string | null
          saisi_par?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          membre_id?: string
          mois?: number
          annee?: number
          montant_attendu?: number
          montant_paye?: number
          huile_paye?: boolean
          savon_paye?: boolean
          fond_sport_paye?: boolean
          montant_fond_sport?: number
          date_paiement?: string | null
          saisi_par?: string | null
          created_at?: string
        }
      }
      prets: {
        Row: {
          id: string
          emprunteur_id: string
          montant_principal: number
          taux_interet: number
          montant_interet: number
          date_pret: string
          date_echeance: string
          statut: 'en_cours' | 'rembourse' | 'reconduit' | 'en_retard'
          nombre_reconductions: number
          document_url: string | null
          accorde_par: string | null
          created_at: string
        }
        Insert: {
          id?: string
          emprunteur_id: string
          montant_principal: number
          taux_interet?: number
          date_pret: string
          date_echeance: string
          statut?: 'en_cours' | 'rembourse' | 'reconduit' | 'en_retard'
          nombre_reconductions?: number
          document_url?: string | null
          accorde_par?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          emprunteur_id?: string
          montant_principal?: number
          taux_interet?: number
          date_pret?: string
          date_echeance?: string
          statut?: 'en_cours' | 'rembourse' | 'reconduit' | 'en_retard'
          nombre_reconductions?: number
          document_url?: string | null
          accorde_par?: string | null
          created_at?: string
        }
      }
      sanctions: {
        Row: {
          id: string
          membre_id: string
          type_sanction_id: string
          montant: number
          motif: string | null
          date_sanction: string
          statut: 'impayee' | 'payee' | 'annulee'
          date_paiement: string | null
          automatique: boolean
          saisi_par: string | null
          created_at: string
        }
        Insert: {
          id?: string
          membre_id: string
          type_sanction_id: string
          montant: number
          motif?: string | null
          date_sanction?: string
          statut?: 'impayee' | 'payee' | 'annulee'
          date_paiement?: string | null
          automatique?: boolean
          saisi_par?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          membre_id?: string
          type_sanction_id?: string
          montant?: number
          motif?: string | null
          date_sanction?: string
          statut?: 'impayee' | 'payee' | 'annulee'
          date_paiement?: string | null
          automatique?: boolean
          saisi_par?: string | null
          created_at?: string
        }
      }
      configurations: {
        Row: {
          id: string
          cle: string
          valeur: string
          type_valeur: 'text' | 'number' | 'boolean' | 'json'
          description: string | null
          categorie: 'general' | 'financier' | 'sport' | 'sanctions' | 'notifications'
          modifiable: boolean
          modifie_par: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cle: string
          valeur: string
          type_valeur?: 'text' | 'number' | 'boolean' | 'json'
          description?: string | null
          categorie?: 'general' | 'financier' | 'sport' | 'sanctions' | 'notifications'
          modifiable?: boolean
          modifie_par?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cle?: string
          valeur?: string
          type_valeur?: 'text' | 'number' | 'boolean' | 'json'
          description?: string | null
          categorie?: 'general' | 'financier' | 'sport' | 'sanctions' | 'notifications'
          modifiable?: boolean
          modifie_par?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}