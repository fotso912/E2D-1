import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d\'environnement Supabase manquantes')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Fonctions utilitaires pour l'authentification
export const auth = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Fonctions utilitaires pour les rôles
export const roles = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('nom')
    return { data, error }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  getByMembre: async (membreId: string) => {
    const { data, error } = await supabase
      .from('membres_roles')
      .select(`
        roles (*)
      `)
      .eq('membre_id', membreId)
    return { data, error }
  }
}

// Fonctions utilitaires pour les membres
export const membres = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('membres')
      .select(`
        *,
        membres_roles (
          roles (*)
        )
      `)
      .order('nom')
    return { data, error }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('membres')
      .select(`
        *,
        membres_roles (
          roles (*)
        )
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  create: async (membre: any) => {
    const { data, error } = await supabase
      .from('membres')
      .insert(membre)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('membres')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  delete: async (id: string) => {
    const { data, error } = await supabase
      .from('membres')
      .delete()
      .eq('id', id)
    return { data, error }
  },

  assignRole: async (membreId: string, roleId: string, attribueParId?: string) => {
    const { data, error } = await supabase
      .from('membres_roles')
      .insert({
        membre_id: membreId,
        role_id: roleId,
        attribue_par: attribueParId || null
      })
      .select()
      .single()
    return { data, error }
  },

  removeRole: async (membreId: string, roleId: string) => {
    const { data, error } = await supabase
      .from('membres_roles')
      .delete()
      .eq('membre_id', membreId)
      .eq('role_id', roleId)
    return { data, error }
  }
}

// Fonctions utilitaires pour les cotisations
export const cotisations = {
  getByPeriod: async (mois: number, annee: number) => {
    const { data, error } = await supabase
      .from('cotisations')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url)
      `)
      .eq('mois', mois)
      .eq('annee', annee)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getByMembre: async (membreId: string) => {
    const { data, error } = await supabase
      .from('cotisations')
      .select('*')
      .eq('membre_id', membreId)
      .order('annee', { ascending: false })
      .order('mois', { ascending: false })
    return { data, error }
  },

  create: async (cotisation: any) => {
    const { data, error } = await supabase
      .from('cotisations')
      .insert(cotisation)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('cotisations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

// Fonctions utilitaires pour les prêts
export const prets = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('prets')
      .select(`
        *,
        emprunteur:membres!emprunteur_id (nom, prenom, photo_url)
      `)
      .order('date_pret', { ascending: false })
    return { data, error }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('prets')
      .select(`
        *,
        emprunteur:membres!emprunteur_id (nom, prenom, photo_url)
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  getByMembre: async (membreId: string) => {
    const { data, error } = await supabase
      .from('prets')
      .select('*')
      .eq('emprunteur_id', membreId)
      .order('date_pret', { ascending: false })
    return { data, error }
  },

  create: async (pret: any) => {
    const { data, error } = await supabase
      .from('prets')
      .insert(pret)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('prets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

// Fonctions utilitaires pour les épargnes
export const epargnes = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('epargnes')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url)
      `)
      .order('date_depot', { ascending: false })
    return { data, error }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('epargnes')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url)
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  getByMembre: async (membreId: string) => {
    const { data, error } = await supabase
      .from('epargnes')
      .select('*')
      .eq('membre_id', membreId)
      .order('date_depot', { ascending: false })
    return { data, error }
  },

  getByExercice: async (exercice: number) => {
    const { data, error } = await supabase
      .from('epargnes')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url)
      `)
      .eq('exercice', exercice)
      .order('montant', { ascending: false })
    return { data, error }
  },

  create: async (epargne: any) => {
    const { data, error } = await supabase
      .from('epargnes')
      .insert(epargne)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('epargnes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

// Fonctions utilitaires pour les sanctions
export const sanctions = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('sanctions')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url),
        type_sanction:types_sanctions!type_sanction_id (nom, categorie, description)
      `)
      .order('date_sanction', { ascending: false })
    return { data, error }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('sanctions')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url),
        type_sanction:types_sanctions!type_sanction_id (nom, categorie, description)
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  getByMembre: async (membreId: string) => {
    const { data, error } = await supabase
      .from('sanctions')
      .select(`
        *,
        type_sanction:types_sanctions!type_sanction_id (nom, categorie, description)
      `)
      .eq('membre_id', membreId)
      .order('date_sanction', { ascending: false })
    return { data, error }
  },

  create: async (sanction: any) => {
    const { data, error } = await supabase
      .from('sanctions')
      .insert(sanction)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('sanctions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

// Fonctions utilitaires pour les types de sanctions
export const typesSanctions = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('types_sanctions')
      .select('*')
      .eq('actif', true)
      .order('categorie', { ascending: true })
      .order('nom', { ascending: true })
    return { data, error }
  },

  getByCategorie: async (categorie: string) => {
    const { data, error } = await supabase
      .from('types_sanctions')
      .select('*')
      .eq('categorie', categorie)
      .eq('actif', true)
      .order('nom', { ascending: true })
    return { data, error }
  },

  create: async (typeSanction: any) => {
    const { data, error } = await supabase
      .from('types_sanctions')
      .insert(typeSanction)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('types_sanctions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

// Fonctions utilitaires pour les aides sociales
export const aidesSociales = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('aides_sociales')
      .select(`
        *,
        beneficiaire:membres!beneficiaire_id (nom, prenom, photo_url),
        type_aide:types_aides!type_aide_id (nom, montant_defaut, delai_remboursement_mois, description)
      `)
      .order('date_aide', { ascending: false })
    return { data, error }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('aides_sociales')
      .select(`
        *,
        beneficiaire:membres!beneficiaire_id (nom, prenom, photo_url),
        type_aide:types_aides!type_aide_id (nom, montant_defaut, delai_remboursement_mois, description)
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  getByMembre: async (membreId: string) => {
    const { data, error } = await supabase
      .from('aides_sociales')
      .select(`
        *,
        type_aide:types_aides!type_aide_id (nom, montant_defaut, delai_remboursement_mois, description)
      `)
      .eq('beneficiaire_id', membreId)
      .order('date_aide', { ascending: false })
    return { data, error }
  },

  create: async (aide: any) => {
    const { data, error } = await supabase
      .from('aides_sociales')
      .insert(aide)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('aides_sociales')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

// Fonctions utilitaires pour les types d'aides
export const typesAides = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('types_aides')
      .select('*')
      .eq('actif', true)
      .order('nom', { ascending: true })
    return { data, error }
  },

  create: async (typeAide: any) => {
    const { data, error } = await supabase
      .from('types_aides')
      .insert(typeAide)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('types_aides')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

// Fonctions utilitaires pour les dettes de fond souverain
export const dettesFondSouverain = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('dettes_fond_souverain')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url),
        aide_sociale:aides_sociales!aide_sociale_id (*)
      `)
      .order('date_echeance', { ascending: true })
    return { data, error }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('dettes_fond_souverain')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url),
        aide_sociale:aides_sociales!aide_sociale_id (*)
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  getByMembre: async (membreId: string) => {
    const { data, error } = await supabase
      .from('dettes_fond_souverain')
      .select('*')
      .eq('membre_id', membreId)
      .order('date_echeance', { ascending: true })
    return { data, error }
  },

  create: async (dette: any) => {
    const { data, error } = await supabase
      .from('dettes_fond_souverain')
      .insert(dette)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('dettes_fond_souverain')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

// Fonctions utilitaires pour les adhérents Phoenix
export const adherentsPhoenix = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('adherents_phoenix')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url)
      `)
      .order('nom')
    return { data, error }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('adherents_phoenix')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url)
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  getActifs: async () => {
    const { data, error } = await supabase
      .from('adherents_phoenix')
      .select('*')
      .eq('statut', 'actif')
      .order('nom')
    return { data, error }
  },

  create: async (adherent: any) => {
    const { data, error } = await supabase
      .from('adherents_phoenix')
      .insert(adherent)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('adherents_phoenix')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  delete: async (id: string) => {
    const { data, error } = await supabase
      .from('adherents_phoenix')
      .delete()
      .eq('id', id)
    return { data, error }
  }
}

// Fonctions utilitaires pour les séances d'entraînement
export const seancesEntrainement = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('seances_entrainement')
      .select('*')
      .order('date_seance', { ascending: false })
    return { data, error }
  },

  getByType: async (typeSport: 'e2d' | 'phoenix') => {
    const { data, error } = await supabase
      .from('seances_entrainement')
      .select('*')
      .eq('type_sport', typeSport)
      .order('date_seance', { ascending: false })
    return { data, error }
  },

  getByPeriod: async (dateDebut: string, dateFin: string) => {
    const { data, error } = await supabase
      .from('seances_entrainement')
      .select('*')
      .gte('date_seance', dateDebut)
      .lte('date_seance', dateFin)
      .order('date_seance', { ascending: false })
    return { data, error }
  },

  create: async (seance: any) => {
    const { data, error } = await supabase
      .from('seances_entrainement')
      .insert(seance)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('seances_entrainement')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  delete: async (id: string) => {
    const { data, error } = await supabase
      .from('seances_entrainement')
      .delete()
      .eq('id', id)
    return { data, error }
  }
}

// Fonctions utilitaires pour les présences aux entraînements
export const presencesEntrainement = {
  getBySeance: async (seanceId: string) => {
    const { data, error } = await supabase
      .from('presences_entrainement')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url),
        adherent_phoenix:adherents_phoenix!adherent_phoenix_id (nom, prenom, photo_url)
      `)
      .eq('seance_id', seanceId)
    return { data, error }
  },

  getByMembre: async (membreId: string) => {
    const { data, error } = await supabase
      .from('presences_entrainement')
      .select(`
        *,
        seance:seances_entrainement!seance_id (date_seance, type_sport, lieu)
      `)
      .eq('membre_id', membreId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getByAdherentPhoenix: async (adherentId: string) => {
    const { data, error } = await supabase
      .from('presences_entrainement')
      .select(`
        *,
        seance:seances_entrainement!seance_id (date_seance, type_sport, lieu)
      `)
      .eq('adherent_phoenix_id', adherentId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  create: async (presence: any) => {
    const { data, error } = await supabase
      .from('presences_entrainement')
      .insert(presence)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('presences_entrainement')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

// Fonctions utilitaires pour les matchs
export const matchs = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('matchs')
      .select('*')
      .order('date_match', { ascending: false })
    return { data, error }
  },

  getByType: async (typeSport: 'e2d' | 'phoenix') => {
    const { data, error } = await supabase
      .from('matchs')
      .select('*')
      .eq('type_sport', typeSport)
      .order('date_match', { ascending: false })
    return { data, error }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('matchs')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  create: async (match: any) => {
    const { data, error } = await supabase
      .from('matchs')
      .insert(match)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('matchs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  delete: async (id: string) => {
    const { data, error } = await supabase
      .from('matchs')
      .delete()
      .eq('id', id)
    return { data, error }
  }
}

// Fonctions utilitaires pour les statistiques des joueurs
export const statistiquesJoueurs = {
  getByMatch: async (matchId: string) => {
    const { data, error } = await supabase
      .from('statistiques_joueurs')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url),
        adherent_phoenix:adherents_phoenix!adherent_phoenix_id (nom, prenom, photo_url),
        match:matchs!match_id (date_match, adversaire, type_sport)
      `)
      .eq('match_id', matchId)
    return { data, error }
  },

  getByMembre: async (membreId: string) => {
    const { data, error } = await supabase
      .from('statistiques_joueurs')
      .select(`
        *,
        match:matchs!match_id (date_match, adversaire, type_sport)
      `)
      .eq('membre_id', membreId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getByAdherentPhoenix: async (adherentId: string) => {
    const { data, error } = await supabase
      .from('statistiques_joueurs')
      .select(`
        *,
        match:matchs!match_id (date_match, adversaire, type_sport)
      `)
      .eq('adherent_phoenix_id', adherentId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getStatistiquesGlobales: async (membreId?: string, adherentPhoenixId?: string, typeSport?: 'e2d' | 'phoenix') => {
    let query = supabase
      .from('statistiques_joueurs')
      .select(`
        buts,
        passes_decisives,
        cartons_jaunes,
        cartons_rouges,
        minutes_jouees,
        match:matchs!match_id (type_sport)
      `)

    if (membreId) {
      query = query.eq('membre_id', membreId)
    }
    if (adherentPhoenixId) {
      query = query.eq('adherent_phoenix_id', adherentPhoenixId)
    }
    if (typeSport) {
      query = query.eq('match.type_sport', typeSport)
    }

    const { data, error } = await query
    return { data, error }
  },

  create: async (statistique: any) => {
    const { data, error } = await supabase
      .from('statistiques_joueurs')
      .insert(statistique)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('statistiques_joueurs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

// Fonctions utilitaires pour les dons sport
export const donsSport = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('dons_sport')
      .select('*')
      .order('date_don', { ascending: false })
    return { data, error }
  },

  getByType: async (typeSport: 'e2d' | 'phoenix') => {
    const { data, error } = await supabase
      .from('dons_sport')
      .select('*')
      .eq('type_sport', typeSport)
      .order('date_don', { ascending: false })
    return { data, error }
  },

  create: async (don: any) => {
    const { data, error } = await supabase
      .from('dons_sport')
      .insert(don)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('dons_sport')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  delete: async (id: string) => {
    const { data, error } = await supabase
      .from('dons_sport')
      .delete()
      .eq('id', id)
    return { data, error }
  }
}

// Fonctions utilitaires pour les dépenses sport
export const depensesSport = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('depenses_sport')
      .select(`
        *,
        approuve_par_membre:membres!approuve_par (nom, prenom)
      `)
      .order('date_depense', { ascending: false })
    return { data, error }
  },

  getByType: async (typeSport: 'e2d' | 'phoenix') => {
    const { data, error } = await supabase
      .from('depenses_sport')
      .select(`
        *,
        approuve_par_membre:membres!approuve_par (nom, prenom)
      `)
      .eq('type_sport', typeSport)
      .order('date_depense', { ascending: false })
    return { data, error }
  },

  getByCategorie: async (categorie: string) => {
    const { data, error } = await supabase
      .from('depenses_sport')
      .select('*')
      .eq('categorie', categorie)
      .order('date_depense', { ascending: false })
    return { data, error }
  },

  create: async (depense: any) => {
    const { data, error } = await supabase
      .from('depenses_sport')
      .insert(depense)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('depenses_sport')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  delete: async (id: string) => {
    const { data, error } = await supabase
      .from('depenses_sport')
      .delete()
      .eq('id', id)
    return { data, error }
  }
}

// Fonctions utilitaires pour les rapports de séances
export const rapportsSeances = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('rapports_seances')
      .select(`
        *,
        hote:membres!hote_membre_id (nom, prenom, photo_url),
        redige_par_membre:membres!redige_par (nom, prenom)
      `)
      .order('date_seance', { ascending: false })
    return { data, error }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('rapports_seances')
      .select(`
        *,
        hote:membres!hote_membre_id (nom, prenom, photo_url),
        redige_par_membre:membres!redige_par (nom, prenom),
        points_ordre_jour (
          *,
          resolutions (
            *,
            responsable:membres!responsable_membre_id (nom, prenom)
          )
        )
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  create: async (rapport: any) => {
    const { data, error } = await supabase
      .from('rapports_seances')
      .insert(rapport)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('rapports_seances')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

// Fonctions utilitaires pour les points à l'ordre du jour
export const pointsOrdreJour = {
  getByRapport: async (rapportId: string) => {
    const { data, error } = await supabase
      .from('points_ordre_jour')
      .select(`
        *,
        resolutions (
          *,
          responsable:membres!responsable_membre_id (nom, prenom)
        )
      `)
      .eq('rapport_seance_id', rapportId)
      .order('numero_point')
    return { data, error }
  },

  create: async (point: any) => {
    const { data, error } = await supabase
      .from('points_ordre_jour')
      .insert(point)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('points_ordre_jour')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

// Fonctions utilitaires pour les résolutions
export const resolutions = {
  getByPoint: async (pointId: string) => {
    const { data, error } = await supabase
      .from('resolutions')
      .select(`
        *,
        responsable:membres!responsable_membre_id (nom, prenom)
      `)
      .eq('point_ordre_jour_id', pointId)
    return { data, error }
  },

  create: async (resolution: any) => {
    const { data, error } = await supabase
      .from('resolutions')
      .insert(resolution)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('resolutions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

// Fonctions utilitaires pour le calendrier des réceptions
export const calendrierReceptions = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('calendrier_receptions')
      .select(`
        *,
        hote:membres!hote_membre_id (nom, prenom, photo_url)
      `)
      .order('annee', { ascending: false })
      .order('mois', { ascending: true })
    return { data, error }
  },

  getByAnnee: async (annee: number) => {
    const { data, error } = await supabase
      .from('calendrier_receptions')
      .select(`
        *,
        hote:membres!hote_membre_id (nom, prenom, photo_url)
      `)
      .eq('annee', annee)
      .order('mois', { ascending: true })
    return { data, error }
  },

  create: async (reception: any) => {
    const { data, error } = await supabase
      .from('calendrier_receptions')
      .insert(reception)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('calendrier_receptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

// Fonctions utilitaires pour les fonds de caisse
export const fondsCaisse = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('fonds_caisse')
      .select(`
        *,
        modifie_par_membre:membres!modifie_par (nom, prenom)
      `)
      .order('exercice', { ascending: false })
    return { data, error }
  },

  getByExercice: async (exercice: number) => {
    const { data, error } = await supabase
      .from('fonds_caisse')
      .select('*')
      .eq('exercice', exercice)
      .single()
    return { data, error }
  },

  create: async (fondsCaisse: any) => {
    const { data, error } = await supabase
      .from('fonds_caisse')
      .insert(fondsCaisse)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('fonds_caisse')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

// Fonctions utilitaires pour les fonds d'investissement
export const fondsInvestissement = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('fonds_investissement')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url)
      `)
      .order('annee', { ascending: false })
    return { data, error }
  },

  getByAnnee: async (annee: number) => {
    const { data, error } = await supabase
      .from('fonds_investissement')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url)
      `)
      .eq('annee', annee)
      .order('montant_paye', { ascending: false })
    return { data, error }
  },

  getByMembre: async (membreId: string) => {
    const { data, error } = await supabase
      .from('fonds_investissement')
      .select('*')
      .eq('membre_id', membreId)
      .order('annee', { ascending: false })
    return { data, error }
  },

  create: async (fondsInvestissement: any) => {
    const { data, error } = await supabase
      .from('fonds_investissement')
      .insert(fondsInvestissement)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('fonds_investissement')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

// Fonctions utilitaires pour les transactions financières
export const transactionsFinancieres = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('transactions_financieres')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom),
        saisi_par_membre:membres!saisi_par (nom, prenom)
      `)
      .order('date_transaction', { ascending: false })
    return { data, error }
  },

  getByType: async (typeTransaction: string) => {
    const { data, error } = await supabase
      .from('transactions_financieres')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom),
        saisi_par_membre:membres!saisi_par (nom, prenom)
      `)
      .eq('type_transaction', typeTransaction)
      .order('date_transaction', { ascending: false })
    return { data, error }
  },

  getByMembre: async (membreId: string) => {
    const { data, error } = await supabase
      .from('transactions_financieres')
      .select('*')
      .eq('membre_id', membreId)
      .order('date_transaction', { ascending: false })
    return { data, error }
  },

  create: async (transaction: any) => {
    const { data, error } = await supabase
      .from('transactions_financieres')
      .insert(transaction)
      .select()
      .single()
    return { data, error }
  }
}

// Fonctions utilitaires pour les connexions
export const connexions = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('connexions')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url)
      `)
      .order('date_connexion', { ascending: false })
    return { data, error }
  },

  getByMembre: async (membreId: string) => {
    const { data, error } = await supabase
      .from('connexions')
      .select('*')
      .eq('membre_id', membreId)
      .order('date_connexion', { ascending: false })
    return { data, error }
  },

  create: async (connexion: any) => {
    const { data, error } = await supabase
      .from('connexions')
      .insert(connexion)
      .select()
      .single()
    return { data, error }
  }
}

// Fonctions utilitaires pour les statuts des membres
export const statutsMembres = {
  getByMembre: async (membreId: string) => {
    const { data, error } = await supabase
      .from('statuts_membres')
      .select(`
        *,
        modifie_par_membre:membres!modifie_par (nom, prenom)
      `)
      .eq('membre_id', membreId)
      .order('date_changement', { ascending: false })
    return { data, error }
  },

  create: async (statutMembre: any) => {
    const { data, error } = await supabase
      .from('statuts_membres')
      .insert(statutMembre)
      .select()
      .single()
    return { data, error }
  }
}

// Fonctions utilitaires pour les configurations
export const configurations = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('configurations')
      .select('*')
      .order('categorie', { ascending: true })
    return { data, error }
  },

  getValue: async (cle: string) => {
    const { data, error } = await supabase
      .from('configurations')
      .select('valeur, type_valeur')
      .eq('cle', cle)
      .single()
    
    if (error) return { data: null, error }
    
    // Conversion selon le type
    let valeur = data.valeur
    if (data.type_valeur === 'number') {
      valeur = parseFloat(data.valeur)
    } else if (data.type_valeur === 'boolean') {
      valeur = data.valeur === 'true'
    } else if (data.type_valeur === 'json') {
      valeur = JSON.parse(data.valeur)
    }
    
    return { data: valeur, error: null }
  },

  setValue: async (cle: string, valeur: any) => {
    const { data, error } = await supabase
      .from('configurations')
      .update({ 
        valeur: valeur.toString(),
        updated_at: new Date().toISOString()
      })
      .eq('cle', cle)
      .select()
      .single()
    return { data, error }
  },

  getByCategorie: async (categorie: string) => {
    const { data, error } = await supabase
      .from('configurations')
      .select('*')
      .eq('categorie', categorie)
      .order('cle')
    return { data, error }
  }
}

// Fonctions utilitaires pour vérifier les permissions
export const permissions = {
  hasRole: (userRoles: string[], requiredRole: string): boolean => {
    return userRoles.includes(requiredRole) || userRoles.includes('Président')
  },

  hasPermission: (userRoles: any[], permission: string): boolean => {
    return userRoles.some(role => 
      role.permissions?.[permission] === true || 
      role.permissions?.admin === true
    )
  },

  canManageCotisations: (userRoles: any[]): boolean => {
    return permissions.hasPermission(userRoles, 'cotisations')
  },

  canManageSanctions: (userRoles: any[]): boolean => {
    return permissions.hasPermission(userRoles, 'sanctions')
  },

  canManageSport: (userRoles: any[], typeSport: 'e2d' | 'phoenix'): boolean => {
    return permissions.hasPermission(userRoles, `sport_${typeSport}`)
  },

  canManageRapports: (userRoles: any[]): boolean => {
    return permissions.hasPermission(userRoles, 'rapports')
  },

  isAdmin: (userRoles: any[]): boolean => {
    return permissions.hasPermission(userRoles, 'admin')
  }
}