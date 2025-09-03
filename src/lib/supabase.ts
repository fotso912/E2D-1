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
  },

  create: async (role: any) => {
    const { data, error } = await supabase
      .from('roles')
      .insert(role)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('roles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
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

  getByEmail: async (email: string) => {
    const { data, error } = await supabase
      .from('membres')
      .select(`
        *,
        membres_roles (
          roles (*)
        )
      `)
      .eq('email', email)
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
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
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
  },

  changeStatus: async (membreId: string, nouveauStatut: string, motif?: string, modifieParId?: string) => {
    // Récupérer l'ancien statut
    const { data: membre } = await supabase
      .from('membres')
      .select('statut')
      .eq('id', membreId)
      .single()

    if (membre) {
      // Enregistrer le changement de statut dans l'historique
      await supabase
        .from('statuts_membres')
        .insert({
          membre_id: membreId,
          ancien_statut: membre.statut,
          nouveau_statut: nouveauStatut,
          motif: motif || null,
          modifie_par: modifieParId || null
        })
    }

    // Mettre à jour le statut du membre
    const { data, error } = await supabase
      .from('membres')
      .update({ 
        statut: nouveauStatut,
        updated_at: new Date().toISOString()
      })
      .eq('id', membreId)
      .select()
      .single()
    
    return { data, error }
  }
}

// Fonctions utilitaires pour les cotisations
export const cotisations = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('cotisations')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url)
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

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
  },

  getStatsByPeriod: async (mois: number, annee: number) => {
    const { data, error } = await supabase
      .from('cotisations')
      .select('montant_attendu, montant_paye, fond_sport_paye, montant_fond_sport')
      .eq('mois', mois)
      .eq('annee', annee)
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

  getEnCours: async () => {
    const { data, error } = await supabase
      .from('prets')
      .select(`
        *,
        emprunteur:membres!emprunteur_id (nom, prenom, photo_url)
      `)
      .in('statut', ['en_cours', 'reconduit'])
      .order('date_echeance', { ascending: true })
    return { data, error }
  },

  getEnRetard: async () => {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('prets')
      .select(`
        *,
        emprunteur:membres!emprunteur_id (nom, prenom, photo_url)
      `)
      .in('statut', ['en_cours', 'reconduit'])
      .lt('date_echeance', today)
      .order('date_echeance', { ascending: true })
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
  },

  reconduire: async (id: string) => {
    const nouvelleEcheance = new Date()
    nouvelleEcheance.setMonth(nouvelleEcheance.getMonth() + 2)

    const { data: pret } = await supabase
      .from('prets')
      .select('nombre_reconductions')
      .eq('id', id)
      .single()

    const { data, error } = await supabase
      .from('prets')
      .update({
        statut: 'reconduit',
        date_echeance: nouvelleEcheance.toISOString().split('T')[0],
        nombre_reconductions: (pret?.nombre_reconductions || 0) + 1
      })
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

  getActives: async () => {
    const { data, error } = await supabase
      .from('epargnes')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url)
      `)
      .eq('statut', 'active')
      .order('date_depot', { ascending: false })
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
  },

  rembourser: async (id: string, interetsRecus: number = 0) => {
    const { data, error } = await supabase
      .from('epargnes')
      .update({
        statut: 'remboursee',
        date_remboursement: new Date().toISOString().split('T')[0],
        interets_recus: interetsRecus
      })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  getStatsByExercice: async (exercice: number) => {
    const { data, error } = await supabase
      .from('epargnes')
      .select('montant, interets_recus, statut')
      .eq('exercice', exercice)
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

  getImpayees: async () => {
    const { data, error } = await supabase
      .from('sanctions')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url),
        type_sanction:types_sanctions!type_sanction_id (nom, categorie, description)
      `)
      .eq('statut', 'impayee')
      .order('date_sanction', { ascending: false })
    return { data, error }
  },

  getByCategorie: async (categorie: string) => {
    const { data, error } = await supabase
      .from('sanctions')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url),
        type_sanction:types_sanctions!type_sanction_id (nom, categorie, description)
      `)
      .eq('type_sanction.categorie', categorie)
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
  },

  marquerPayee: async (id: string) => {
    const { data, error } = await supabase
      .from('sanctions')
      .update({
        statut: 'payee',
        date_paiement: new Date().toISOString().split('T')[0]
      })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  annuler: async (id: string) => {
    const { data, error } = await supabase
      .from('sanctions')
      .update({ statut: 'annulee' })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  getSanctionsImpayeesParMembre: async (membreId: string) => {
    const { data, error } = await supabase
      .from('sanctions')
      .select('*')
      .eq('membre_id', membreId)
      .eq('statut', 'impayee')
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

  getAccordees: async () => {
    const { data, error } = await supabase
      .from('aides_sociales')
      .select(`
        *,
        beneficiaire:membres!beneficiaire_id (nom, prenom, photo_url),
        type_aide:types_aides!type_aide_id (nom, montant_defaut, delai_remboursement_mois, description)
      `)
      .eq('statut', 'accordee')
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
  },

  marquerRemboursee: async (id: string) => {
    const { data, error } = await supabase
      .from('aides_sociales')
      .update({ statut: 'remboursee' })
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

  getEnCours: async () => {
    const { data, error } = await supabase
      .from('dettes_fond_souverain')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url)
      `)
      .eq('statut', 'en_cours')
      .order('date_echeance', { ascending: true })
    return { data, error }
  },

  getEnRetard: async () => {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('dettes_fond_souverain')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url)
      `)
      .eq('statut', 'en_cours')
      .lt('date_echeance', today)
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
  },

  enregistrerPaiement: async (id: string, montantPaye: number) => {
    const { data: dette } = await supabase
      .from('dettes_fond_souverain')
      .select('montant_paye, montant_dette')
      .eq('id', id)
      .single()

    if (dette) {
      const nouveauMontantPaye = dette.montant_paye + montantPaye
      const montantRestant = dette.montant_dette - nouveauMontantPaye
      const nouveauStatut = montantRestant <= 0 ? 'soldee' : 'en_cours'

      const { data, error } = await supabase
        .from('dettes_fond_souverain')
        .update({
          montant_paye: nouveauMontantPaye,
          statut: nouveauStatut
        })
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    }
    return { data: null, error: new Error('Dette non trouvée') }
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

  getComiteOrganisation: async () => {
    const { data, error } = await supabase
      .from('adherents_phoenix')
      .select('*')
      .eq('est_comite_organisation', true)
      .eq('statut', 'actif')
      .order('nom')
    return { data, error }
  },

  getAdhesionsImpayees: async () => {
    const { data, error } = await supabase
      .from('adherents_phoenix')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url)
      `)
      .eq('adhesion_payee', false)
      .eq('statut', 'actif')
      .order('date_limite_paiement', { ascending: true })
    return { data, error }
  },

  getFondSouverainImpaye: async () => {
    const { data, error } = await supabase
      .from('adherents_phoenix')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url)
      `)
      .eq('fond_souverain_paye', false)
      .eq('est_comite_organisation', true)
      .eq('statut', 'actif')
      .order('date_adhesion', { ascending: true })
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
  },

  marquerAdhesionPayee: async (id: string) => {
    const { data, error } = await supabase
      .from('adherents_phoenix')
      .update({ 
        adhesion_payee: true,
        date_limite_paiement: null
      })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  marquerFondSouverainPaye: async (id: string) => {
    const { data, error } = await supabase
      .from('adherents_phoenix')
      .update({ fond_souverain_paye: true })
      .eq('id', id)
      .select()
      .single()
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

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('seances_entrainement')
      .select('*')
      .eq('id', id)
      .single()
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

  getByPeriod: async (dateDebut: string, dateFin: string, typeSport?: 'e2d' | 'phoenix') => {
    let query = supabase
      .from('seances_entrainement')
      .select('*')
      .gte('date_seance', dateDebut)
      .lte('date_seance', dateFin)

    if (typeSport) {
      query = query.eq('type_sport', typeSport)
    }

    const { data, error } = await query.order('date_seance', { ascending: false })
    return { data, error }
  },

  getProchaines: async (typeSport?: 'e2d' | 'phoenix') => {
    const today = new Date().toISOString().split('T')[0]
    let query = supabase
      .from('seances_entrainement')
      .select('*')
      .gte('date_seance', today)
      .eq('annulee', false)

    if (typeSport) {
      query = query.eq('type_sport', typeSport)
    }

    const { data, error } = await query.order('date_seance', { ascending: true })
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
  },

  annuler: async (id: string, motif: string) => {
    const { data, error } = await supabase
      .from('seances_entrainement')
      .update({
        annulee: true,
        motif_annulation: motif
      })
      .eq('id', id)
      .select()
      .single()
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

  getByMembre: async (membreId: string, dateDebut?: string, dateFin?: string) => {
    let query = supabase
      .from('presences_entrainement')
      .select(`
        *,
        seance:seances_entrainement!seance_id (date_seance, type_sport, lieu)
      `)
      .eq('membre_id', membreId)

    if (dateDebut) query = query.gte('seance.date_seance', dateDebut)
    if (dateFin) query = query.lte('seance.date_seance', dateFin)

    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },

  getByAdherentPhoenix: async (adherentId: string, dateDebut?: string, dateFin?: string) => {
    let query = supabase
      .from('presences_entrainement')
      .select(`
        *,
        seance:seances_entrainement!seance_id (date_seance, type_sport, lieu)
      `)
      .eq('adherent_phoenix_id', adherentId)

    if (dateDebut) query = query.gte('seance.date_seance', dateDebut)
    if (dateFin) query = query.lte('seance.date_seance', dateFin)

    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },

  getStatsPresence: async (membreId?: string, adherentPhoenixId?: string, typeSport?: 'e2d' | 'phoenix') => {
    let query = supabase
      .from('presences_entrainement')
      .select(`
        present,
        seance:seances_entrainement!seance_id (type_sport, date_seance)
      `)

    if (membreId) query = query.eq('membre_id', membreId)
    if (adherentPhoenixId) query = query.eq('adherent_phoenix_id', adherentPhoenixId)
    if (typeSport) query = query.eq('seance.type_sport', typeSport)

    const { data, error } = await query
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
  },

  marquerPresence: async (seanceId: string, membreId?: string, adherentPhoenixId?: string, present: boolean = true, retardMinutes: number = 0) => {
    const presenceData: any = {
      seance_id: seanceId,
      present,
      retard_minutes: retardMinutes
    }

    if (membreId) presenceData.membre_id = membreId
    if (adherentPhoenixId) presenceData.adherent_phoenix_id = adherentPhoenixId

    const { data, error } = await supabase
      .from('presences_entrainement')
      .upsert(presenceData)
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

  getByTypeMatch: async (typeMatch: string, typeSport?: 'e2d' | 'phoenix') => {
    let query = supabase
      .from('matchs')
      .select('*')
      .eq('type_match', typeMatch)

    if (typeSport) query = query.eq('type_sport', typeSport)

    const { data, error } = await query.order('date_match', { ascending: false })
    return { data, error }
  },

  getProchains: async (typeSport?: 'e2d' | 'phoenix') => {
    const today = new Date().toISOString().split('T')[0]
    let query = supabase
      .from('matchs')
      .select('*')
      .gte('date_match', today)
      .is('resultat', null)

    if (typeSport) query = query.eq('type_sport', typeSport)

    const { data, error } = await query.order('date_match', { ascending: true })
    return { data, error }
  },

  getJoues: async (typeSport?: 'e2d' | 'phoenix') => {
    let query = supabase
      .from('matchs')
      .select('*')
      .not('resultat', 'is', null)

    if (typeSport) query = query.eq('type_sport', typeSport)

    const { data, error } = await query.order('date_match', { ascending: false })
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
  },

  saisirResultat: async (id: string, scoreEquipe: number, scoreAdversaire: number) => {
    let resultat: 'victoire' | 'defaite' | 'nul'
    if (scoreEquipe > scoreAdversaire) resultat = 'victoire'
    else if (scoreEquipe < scoreAdversaire) resultat = 'defaite'
    else resultat = 'nul'

    const { data, error } = await supabase
      .from('matchs')
      .update({
        score_equipe: scoreEquipe,
        score_adversaire: scoreAdversaire,
        resultat
      })
      .eq('id', id)
      .select()
      .single()
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

  getByMembre: async (membreId: string, typeSport?: 'e2d' | 'phoenix') => {
    let query = supabase
      .from('statistiques_joueurs')
      .select(`
        *,
        match:matchs!match_id (date_match, adversaire, type_sport)
      `)
      .eq('membre_id', membreId)

    if (typeSport) {
      query = query.eq('match.type_sport', typeSport)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
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

  getStatistiquesGlobales: async (membreId?: string, adherentPhoenixId?: string, typeSport?: 'e2d' | 'phoenix', annee?: number) => {
    let query = supabase
      .from('statistiques_joueurs')
      .select(`
        buts,
        passes_decisives,
        cartons_jaunes,
        cartons_rouges,
        minutes_jouees,
        match:matchs!match_id (type_sport, date_match)
      `)

    if (membreId) query = query.eq('membre_id', membreId)
    if (adherentPhoenixId) query = query.eq('adherent_phoenix_id', adherentPhoenixId)
    if (typeSport) query = query.eq('match.type_sport', typeSport)
    if (annee) {
      const debutAnnee = `${annee}-01-01`
      const finAnnee = `${annee}-12-31`
      query = query.gte('match.date_match', debutAnnee).lte('match.date_match', finAnnee)
    }

    const { data, error } = await query
    return { data, error }
  },

  getClassementButeurs: async (typeSport?: 'e2d' | 'phoenix', annee?: number) => {
    let query = supabase
      .from('statistiques_joueurs')
      .select(`
        buts,
        membre:membres!membre_id (nom, prenom, photo_url),
        adherent_phoenix:adherents_phoenix!adherent_phoenix_id (nom, prenom, photo_url),
        match:matchs!match_id (type_sport, date_match)
      `)

    if (typeSport) query = query.eq('match.type_sport', typeSport)
    if (annee) {
      const debutAnnee = `${annee}-01-01`
      const finAnnee = `${annee}-12-31`
      query = query.gte('match.date_match', debutAnnee).lte('match.date_match', finAnnee)
    }

    const { data, error } = await query.order('buts', { ascending: false })
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
  },

  ajouterCarton: async (matchId: string, membreId?: string, adherentPhoenixId?: string, typeCarton: 'jaune' | 'rouge') => {
    // Récupérer les statistiques existantes ou créer une nouvelle entrée
    let query = supabase
      .from('statistiques_joueurs')
      .select('*')
      .eq('match_id', matchId)

    if (membreId) query = query.eq('membre_id', membreId)
    if (adherentPhoenixId) query = query.eq('adherent_phoenix_id', adherentPhoenixId)

    const { data: existing } = await query.single()

    const updates: any = {}
    if (typeCarton === 'jaune') {
      updates.cartons_jaunes = (existing?.cartons_jaunes || 0) + 1
    } else {
      updates.cartons_rouges = (existing?.cartons_rouges || 0) + 1
    }

    if (existing) {
      const { data, error } = await supabase
        .from('statistiques_joueurs')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single()
      return { data, error }
    } else {
      const newStats = {
        match_id: matchId,
        membre_id: membreId || null,
        adherent_phoenix_id: adherentPhoenixId || null,
        buts: 0,
        passes_decisives: 0,
        cartons_jaunes: typeCarton === 'jaune' ? 1 : 0,
        cartons_rouges: typeCarton === 'rouge' ? 1 : 0,
        minutes_jouees: 0
      }
      const { data, error } = await supabase
        .from('statistiques_joueurs')
        .insert(newStats)
        .select()
        .single()
      return { data, error }
    }
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

  getByAnnee: async (annee: number, typeSport?: 'e2d' | 'phoenix') => {
    const debutAnnee = `${annee}-01-01`
    const finAnnee = `${annee}-12-31`
    
    let query = supabase
      .from('dons_sport')
      .select('*')
      .gte('date_don', debutAnnee)
      .lte('date_don', finAnnee)

    if (typeSport) query = query.eq('type_sport', typeSport)

    const { data, error } = await query.order('date_don', { ascending: false })
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
  },

  getStatsByType: async (typeSport: 'e2d' | 'phoenix', annee?: number) => {
    let query = supabase
      .from('dons_sport')
      .select('montant')
      .eq('type_sport', typeSport)
      .not('montant', 'is', null)

    if (annee) {
      const debutAnnee = `${annee}-01-01`
      const finAnnee = `${annee}-12-31`
      query = query.gte('date_don', debutAnnee).lte('date_don', finAnnee)
    }

    const { data, error } = await query
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

  getByCategorie: async (categorie: string, typeSport?: 'e2d' | 'phoenix') => {
    let query = supabase
      .from('depenses_sport')
      .select('*')
      .eq('categorie', categorie)

    if (typeSport) query = query.eq('type_sport', typeSport)

    const { data, error } = await query.order('date_depense', { ascending: false })
    return { data, error }
  },

  getByAnnee: async (annee: number, typeSport?: 'e2d' | 'phoenix') => {
    const debutAnnee = `${annee}-01-01`
    const finAnnee = `${annee}-12-31`
    
    let query = supabase
      .from('depenses_sport')
      .select(`
        *,
        approuve_par_membre:membres!approuve_par (nom, prenom)
      `)
      .gte('date_depense', debutAnnee)
      .lte('date_depense', finAnnee)

    if (typeSport) query = query.eq('type_sport', typeSport)

    const { data, error } = await query.order('date_depense', { ascending: false })
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
  },

  getStatsByType: async (typeSport: 'e2d' | 'phoenix', annee?: number) => {
    let query = supabase
      .from('depenses_sport')
      .select('montant, categorie')
      .eq('type_sport', typeSport)

    if (annee) {
      const debutAnnee = `${annee}-01-01`
      const finAnnee = `${annee}-12-31`
      query = query.gte('date_depense', debutAnnee).lte('date_depense', finAnnee)
    }

    const { data, error } = await query
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

  getByAnnee: async (annee: number) => {
    const debutAnnee = `${annee}-01-01`
    const finAnnee = `${annee}-12-31`
    
    const { data, error } = await supabase
      .from('rapports_seances')
      .select(`
        *,
        hote:membres!hote_membre_id (nom, prenom, photo_url),
        redige_par_membre:membres!redige_par (nom, prenom)
      `)
      .gte('date_seance', debutAnnee)
      .lte('date_seance', finAnnee)
      .order('date_seance', { ascending: false })
    return { data, error }
  },

  getByStatut: async (statut: string) => {
    const { data, error } = await supabase
      .from('rapports_seances')
      .select(`
        *,
        hote:membres!hote_membre_id (nom, prenom, photo_url),
        redige_par_membre:membres!redige_par (nom, prenom)
      `)
      .eq('statut', statut)
      .order('date_seance', { ascending: false })
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
  },

  finaliser: async (id: string) => {
    const { data, error } = await supabase
      .from('rapports_seances')
      .update({ statut: 'finalise' })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  approuver: async (id: string) => {
    const { data, error } = await supabase
      .from('rapports_seances')
      .update({ statut: 'approuve' })
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
  },

  delete: async (id: string) => {
    const { data, error } = await supabase
      .from('points_ordre_jour')
      .delete()
      .eq('id', id)
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

  getEnCours: async () => {
    const { data, error } = await supabase
      .from('resolutions')
      .select(`
        *,
        responsable:membres!responsable_membre_id (nom, prenom),
        point_ordre_jour:points_ordre_jour!point_ordre_jour_id (
          titre,
          rapport_seance:rapports_seances!rapport_seance_id (date_seance)
        )
      `)
      .eq('statut', 'en_cours')
      .order('date_limite', { ascending: true })
    return { data, error }
  },

  getByResponsable: async (responsableId: string) => {
    const { data, error } = await supabase
      .from('resolutions')
      .select(`
        *,
        point_ordre_jour:points_ordre_jour!point_ordre_jour_id (
          titre,
          rapport_seance:rapports_seances!rapport_seance_id (date_seance)
        )
      `)
      .eq('responsable_membre_id', responsableId)
      .order('date_limite', { ascending: true })
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
  },

  marquerTerminee: async (id: string) => {
    const { data, error } = await supabase
      .from('resolutions')
      .update({ statut: 'terminee' })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  reporter: async (id: string, nouvelleDateLimite: string) => {
    const { data, error } = await supabase
      .from('resolutions')
      .update({
        statut: 'reportee',
        date_limite: nouvelleDateLimite
      })
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

  getProchaines: async () => {
    const today = new Date()
    const moisActuel = today.getMonth() + 1
    const anneeActuelle = today.getFullYear()

    const { data, error } = await supabase
      .from('calendrier_receptions')
      .select(`
        *,
        hote:membres!hote_membre_id (nom, prenom, photo_url)
      `)
      .or(`and(annee.eq.${anneeActuelle},mois.gte.${moisActuel}),annee.gt.${anneeActuelle}`)
      .in('statut', ['planifiee', 'confirmee'])
      .order('annee', { ascending: true })
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
  },

  confirmer: async (id: string, dateEffective: string, lieu?: string) => {
    const { data, error } = await supabase
      .from('calendrier_receptions')
      .update({
        statut: 'confirmee',
        date_effective: dateEffective,
        lieu: lieu || undefined
      })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  reporter: async (id: string, nouvelleDatePrevue: string, motif?: string) => {
    const { data, error } = await supabase
      .from('calendrier_receptions')
      .update({
        statut: 'reportee',
        date_prevue: nouvelleDatePrevue,
        notes: motif || undefined
      })
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

  getCurrent: async () => {
    const exerciceActuel = new Date().getFullYear()
    return fondsCaisse.getByExercice(exerciceActuel)
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
      .update({
        ...updates,
        date_mise_a_jour: new Date().toISOString().split('T')[0]
      })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  augmenterFonds: async (exercice: number, augmentation: number, modifieParId?: string) => {
    const { data: existing } = await fondsCaisse.getByExercice(exercice)
    
    if (existing) {
      const { data, error } = await supabase
        .from('fonds_caisse')
        .update({
          augmentation: existing.augmentation + augmentation,
          modifie_par: modifieParId || null,
          date_mise_a_jour: new Date().toISOString().split('T')[0]
        })
        .eq('id', existing.id)
        .select()
        .single()
      return { data, error }
    } else {
      return fondsCaisse.create({
        exercice,
        montant_base: 50000, // Valeur par défaut
        augmentation,
        modifie_par: modifieParId || null
      })
    }
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

  getImpayees: async (annee?: number) => {
    let query = supabase
      .from('fonds_investissement')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url)
      `)
      .lt('montant_paye', supabase.raw('montant_attendu'))

    if (annee) query = query.eq('annee', annee)

    const { data, error } = await query.order('annee', { ascending: false })
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
  },

  enregistrerPaiement: async (membreId: string, annee: number, montantPaye: number) => {
    const { data, error } = await supabase
      .from('fonds_investissement')
      .update({
        montant_paye: montantPaye,
        date_paiement: new Date().toISOString().split('T')[0]
      })
      .eq('membre_id', membreId)
      .eq('annee', annee)
      .select()
      .single()
    return { data, error }
  },

  initierExercice: async (annee: number, montantAttendu: number) => {
    // Récupérer tous les membres actifs
    const { data: membresActifs } = await membres.getAll()
    const membresActifsFiltered = membresActifs?.filter(m => m.statut === 'actif') || []

    // Créer une entrée pour chaque membre
    const fondsData = membresActifsFiltered.map(membre => ({
      membre_id: membre.id,
      annee,
      montant_attendu: montantAttendu,
      montant_paye: 0
    }))

    const { data, error } = await supabase
      .from('fonds_investissement')
      .insert(fondsData)
      .select()
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

  getByPeriod: async (dateDebut: string, dateFin: string) => {
    const { data, error } = await supabase
      .from('transactions_financieres')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom),
        saisi_par_membre:membres!saisi_par (nom, prenom)
      `)
      .gte('date_transaction', dateDebut)
      .lte('date_transaction', dateFin)
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
  },

  getStatsByType: async (dateDebut?: string, dateFin?: string) => {
    let query = supabase
      .from('transactions_financieres')
      .select('type_transaction, montant')

    if (dateDebut) query = query.gte('date_transaction', dateDebut)
    if (dateFin) query = query.lte('date_transaction', dateFin)

    const { data, error } = await query
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

  getByMembre: async (membreId: string, limit?: number) => {
    let query = supabase
      .from('connexions')
      .select('*')
      .eq('membre_id', membreId)
      .order('date_connexion', { ascending: false })

    if (limit) query = query.limit(limit)

    const { data, error } = await query
    return { data, error }
  },

  getRecentes: async (limit: number = 50) => {
    const { data, error } = await supabase
      .from('connexions')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url)
      `)
      .order('date_connexion', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  create: async (connexion: any) => {
    const { data, error } = await supabase
      .from('connexions')
      .insert(connexion)
      .select()
      .single()
    return { data, error }
  },

  enregistrerConnexion: async (membreId: string, adresseIp?: string, userAgent?: string) => {
    const { data, error } = await supabase
      .from('connexions')
      .insert({
        membre_id: membreId,
        adresse_ip: adresseIp || null,
        user_agent: userAgent || null,
        succes: true
      })
      .select()
      .single()
    return { data, error }
  },

  enregistrerEchecConnexion: async (membreId: string, adresseIp?: string, userAgent?: string) => {
    const { data, error } = await supabase
      .from('connexions')
      .insert({
        membre_id: membreId,
        adresse_ip: adresseIp || null,
        user_agent: userAgent || null,
        succes: false
      })
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

  getRecents: async (limit: number = 20) => {
    const { data, error } = await supabase
      .from('statuts_membres')
      .select(`
        *,
        membre:membres!membre_id (nom, prenom, photo_url),
        modifie_par_membre:membres!modifie_par (nom, prenom)
      `)
      .order('date_changement', { ascending: false })
      .limit(limit)
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
      .order('cle', { ascending: true })
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
      try {
        valeur = JSON.parse(data.valeur)
      } catch {
        valeur = data.valeur
      }
    }
    
    return { data: valeur, error: null }
  },

  getMultipleValues: async (cles: string[]) => {
    const { data, error } = await supabase
      .from('configurations')
      .select('cle, valeur, type_valeur')
      .in('cle', cles)
    
    if (error) return { data: null, error }
    
    const result: Record<string, any> = {}
    data.forEach(config => {
      let valeur = config.valeur
      if (config.type_valeur === 'number') {
        valeur = parseFloat(config.valeur)
      } else if (config.type_valeur === 'boolean') {
        valeur = config.valeur === 'true'
      } else if (config.type_valeur === 'json') {
        try {
          valeur = JSON.parse(config.valeur)
        } catch {
          valeur = config.valeur
        }
      }
      result[config.cle] = valeur
    })
    
    return { data: result, error: null }
  },

  setValue: async (cle: string, valeur: any, modifieParId?: string) => {
    const { data, error } = await supabase
      .from('configurations')
      .update({ 
        valeur: valeur.toString(),
        modifie_par: modifieParId || null,
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
  },

  getConfigurationsFinancieres: async () => {
    return configurations.getByCategorie('financier')
  },

  getConfigurationsSport: async () => {
    return configurations.getByCategorie('sport')
  },

  getConfigurationsSanctions: async () => {
    return configurations.getByCategorie('sanctions')
  },

  getConfigurationsNotifications: async () => {
    return configurations.getByCategorie('notifications')
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

  canManageEpargnes: (userRoles: any[]): boolean => {
    return permissions.hasPermission(userRoles, 'épargne')
  },

  canManageAides: (userRoles: any[]): boolean => {
    return permissions.hasPermission(userRoles, 'aides')
  },

  canManagePrets: (userRoles: any[]): boolean => {
    return permissions.hasPermission(userRoles, 'prêts')
  },

  canViewEpargnesDetails: (userRoles: any[]): boolean => {
    // Seuls les trésoriers et admins peuvent voir les détails des épargnes par personne
    return permissions.hasPermission(userRoles, 'épargne') || permissions.hasPermission(userRoles, 'admin')
  },

  isAdmin: (userRoles: any[]): boolean => {
    return permissions.hasPermission(userRoles, 'admin')
  },

  isTresorier: (userRoles: any[]): boolean => {
    return userRoles.some(role => role.nom === 'Trésorier') || permissions.isAdmin(userRoles)
  },

  isCenseur: (userRoles: any[]): boolean => {
    return userRoles.some(role => role.nom === 'Censeur') || permissions.isAdmin(userRoles)
  },

  isSecretaire: (userRoles: any[]): boolean => {
    return userRoles.some(role => role.nom === 'Secrétaire Général') || permissions.isAdmin(userRoles)
  },

  isResponsableSport: (userRoles: any[], typeSport?: 'e2d' | 'phoenix'): boolean => {
    if (permissions.isAdmin(userRoles)) return true
    
    if (typeSport) {
      return userRoles.some(role => 
        role.nom === `Responsable Sport ${typeSport.toUpperCase()}` ||
        role.nom === 'Responsable Sport E2D' ||
        role.nom === 'Responsable Sport Phoenix'
      )
    }
    
    return userRoles.some(role => 
      role.nom.includes('Responsable Sport')
    )
  }
}

// Fonctions utilitaires pour les notifications et alertes
export const notifications = {
  getPretsEcheanceProche: async (joursAvant: number = 7) => {
    const dateLimite = new Date()
    dateLimite.setDate(dateLimite.getDate() + joursAvant)
    const dateLimiteStr = dateLimite.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('prets')
      .select(`
        *,
        emprunteur:membres!emprunteur_id (nom, prenom, email, telephone)
      `)
      .in('statut', ['en_cours', 'reconduit'])
      .lte('date_echeance', dateLimiteStr)
      .order('date_echeance', { ascending: true })
    return { data, error }
  },

  getAdhesionsEcheanceProche: async (joursAvant: number = 7) => {
    const dateLimite = new Date()
    dateLimite.setDate(dateLimite.getDate() + joursAvant)
    const dateLimiteStr = dateLimite.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('adherents_phoenix')
      .select('*')
      .eq('adhesion_payee', false)
      .lte('date_limite_paiement', dateLimiteStr)
      .order('date_limite_paiement', { ascending: true })
    return { data, error }
  },

  getProchainReunion: async () => {
    const today = new Date()
    const moisActuel = today.getMonth() + 1
    const anneeActuelle = today.getFullYear()

    const { data, error } = await supabase
      .from('calendrier_receptions')
      .select(`
        *,
        hote:membres!hote_membre_id (nom, prenom, email, telephone)
      `)
      .or(`and(annee.eq.${anneeActuelle},mois.gte.${moisActuel}),annee.gt.${anneeActuelle}`)
      .in('statut', ['planifiee', 'confirmee'])
      .order('annee', { ascending: true })
      .order('mois', { ascending: true })
      .limit(1)
      .single()
    return { data, error }
  },

  getMembresAvecSanctionsCumulees: async (seuilSuspension: number = 3) => {
    const { data, error } = await supabase
      .from('sanctions')
      .select(`
        membre_id,
        membre:membres!membre_id (nom, prenom, email, telephone, statut)
      `)
      .eq('statut', 'impayee')

    if (error) return { data: null, error }

    // Grouper par membre et compter les sanctions
    const sanctionsParMembre = data.reduce((acc: Record<string, any>, sanction) => {
      const membreId = sanction.membre_id
      if (!acc[membreId]) {
        acc[membreId] = {
          membre: sanction.membre,
          nombreSanctions: 0
        }
      }
      acc[membreId].nombreSanctions++
      return acc
    }, {})

    // Filtrer les membres avec trop de sanctions
    const membresASuspendre = Object.values(sanctionsParMembre)
      .filter((item: any) => item.nombreSanctions >= seuilSuspension)

    return { data: membresASuspendre, error: null }
  }
}

// Fonctions utilitaires pour les statistiques et tableaux de bord
export const dashboard = {
  getStatsGenerales: async () => {
    try {
      // Statistiques des membres
      const { data: membresStats } = await supabase
        .from('membres')
        .select('statut')

      // Statistiques des cotisations du mois actuel
      const moisActuel = new Date().getMonth() + 1
      const anneeActuelle = new Date().getFullYear()
      const { data: cotisationsStats } = await supabase
        .from('cotisations')
        .select('montant_attendu, montant_paye')
        .eq('mois', moisActuel)
        .eq('annee', anneeActuelle)

      // Statistiques des prêts
      const { data: pretsStats } = await supabase
        .from('prets')
        .select('statut, montant_principal')

      // Statistiques des sanctions
      const { data: sanctionsStats } = await supabase
        .from('sanctions')
        .select('statut, montant')

      // Statistiques des aides
      const { data: aidesStats } = await supabase
        .from('aides_sociales')
        .select('statut, montant')

      // Fonds de caisse actuel
      const { data: fondsCaisseActuel } = await fondsCaisse.getCurrent()

      return {
        data: {
          membres: {
            total: membresStats?.length || 0,
            actifs: membresStats?.filter(m => m.statut === 'actif').length || 0,
            inactifs: membresStats?.filter(m => m.statut === 'inactif').length || 0,
            suspendus: membresStats?.filter(m => m.statut === 'suspendu').length || 0
          },
          cotisations: {
            montantAttendu: cotisationsStats?.reduce((sum, c) => sum + c.montant_attendu, 0) || 0,
            montantCollecte: cotisationsStats?.reduce((sum, c) => sum + c.montant_paye, 0) || 0,
            nombrePaiements: cotisationsStats?.length || 0
          },
          prets: {
            total: pretsStats?.length || 0,
            enCours: pretsStats?.filter(p => p.statut === 'en_cours').length || 0,
            rembourses: pretsStats?.filter(p => p.statut === 'rembourse').length || 0,
            montantEnCours: pretsStats?.filter(p => p.statut === 'en_cours').reduce((sum, p) => sum + p.montant_principal, 0) || 0
          },
          sanctions: {
            total: sanctionsStats?.length || 0,
            impayees: sanctionsStats?.filter(s => s.statut === 'impayee').length || 0,
            montantImpaye: sanctionsStats?.filter(s => s.statut === 'impayee').reduce((sum, s) => sum + s.montant, 0) || 0
          },
          aides: {
            total: aidesStats?.length || 0,
            accordees: aidesStats?.filter(a => a.statut === 'accordee').length || 0,
            montantAccorde: aidesStats?.filter(a => a.statut === 'accordee').reduce((sum, a) => sum + a.montant, 0) || 0
          },
          fondsCaisse: {
            montantActuel: fondsCaisseActuel?.montant_total || 0,
            exercice: fondsCaisseActuel?.exercice || anneeActuelle
          }
        },
        error: null
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  getActivitesRecentes: async (limit: number = 10) => {
    try {
      // Récupérer les dernières transactions
      const { data: transactions } = await transactionsFinancieres.getAll()
      
      // Récupérer les dernières connexions
      const { data: dernieresConnexions } = await connexions.getRecentes(5)
      
      // Récupérer les derniers changements de statut
      const { data: changementsStatut } = await statutsMembres.getRecents(5)

      return {
        data: {
          transactions: transactions?.slice(0, limit) || [],
          connexions: dernieresConnexions || [],
          changementsStatut: changementsStatut || []
        },
        error: null
      }
    } catch (error) {
      return { data: null, error }
    }
  }
}