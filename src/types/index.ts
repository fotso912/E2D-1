// Types de base pour l'application E2D

export interface Membre {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  photo?: string;
  statut: 'actif' | 'inactif';
  date_creation: string;
  date_modification?: string;
}

export interface Role {
  id: string;
  nom: string;
  description: string;
  permissions: string[];
}

export interface MembreRole {
  membre_id: string;
  role_id: string;
  date_attribution: string;
  actif: boolean;
}

export interface StatutMembre {
  id: string;
  membre_id: string;
  ancien_statut: string;
  nouveau_statut: string;
  date_changement: string;
  motif?: string;
}

export interface Cotisation {
  id: string;
  membre_id: string;
  montant_configure: number;
  montant_paye: number;
  mois: string;
  annee: number;
  date_paiement?: string;
  statut: 'en_attente' | 'paye' | 'partiel' | 'echec';
}

export interface Pret {
  id: string;
  membre_id: string;
  montant: number;
  taux_interet: number;
  date_pret: string;
  date_echeance: string;
  statut: 'actif' | 'rembourse' | 'reconduit';
  reconnaissance_dette?: string; // URL du document
}

export interface Sanction {
  id: string;
  membre_id: string;
  type: 'reunion' | 'sport_e2d' | 'sport_phoenix';
  categorie: string; // retard, absence, carton_jaune, etc.
  montant: number;
  date_sanction: string;
  date_paiement?: string;
  statut: 'impayee' | 'payee';
  description?: string;
}

export interface Aide {
  id: string;
  membre_id: string;
  type: 'maladie' | 'mariage' | 'autre';
  montant: number;
  date_aide: string;
  justificatif?: string; // URL du document
  statut: 'allouee' | 'remboursee';
}

export interface FondsCaisse {
  id: string;
  membre_id: string;
  montant: number;
  exercice: string;
  date_paiement?: string;
  statut: 'du' | 'paye';
}

export interface Epargne {
  id: string;
  membre_id: string;
  montant: number;
  date_depot: string;
  exercice: string;
  interets_calcules?: number;
}

export interface ActiviteSport {
  id: string;
  type: 'e2d' | 'phoenix';
  nom: string;
  description?: string;
}

export interface ParticipantSport {
  id: string;
  activite_id: string;
  membre_id?: string; // null si adhérent externe pour Phoenix
  nom?: string; // pour adhérents externes
  prenom?: string;
  telephone?: string;
  date_adhesion: string;
  statut: 'actif' | 'inactif';
}

export interface SeanceSport {
  id: string;
  activite_id: string;
  date_seance: string;
  lieu?: string;
  type: 'entrainement' | 'match';
}

export interface PresenceSport {
  id: string;
  seance_id: string;
  participant_id: string;
  present: boolean;
}

export interface StatistiqueSport {
  id: string;
  participant_id: string;
  seance_id: string;
  buts: number;
  passes_decisives: number;
  carton_jaune: number;
  carton_rouge: number;
}

export interface Match {
  id: string;
  activite_id: string;
  date_match: string;
  adversaire: string;
  logo_adversaire?: string;
  score_e2d: number;
  score_adversaire: number;
  lieu: string;
}

export interface RapportSeance {
  id: string;
  date_seance: string;
  lieu: string;
  hote_id: string;
  points_debattus: PointDebattu[];
  statuts_pdf?: string; // URL du PDF
}

export interface PointDebattu {
  id: string;
  rapport_id: string;
  sujet: string;
  resolution: string;
  ordre: number;
}

export interface Connexion {
  id: string;
  membre_id: string;
  date_connexion: string;
  ip_address?: string;
  user_agent?: string;
}

export interface Configuration {
  id: string;
  cle: string;
  valeur: string;
  description?: string;
  type: 'number' | 'string' | 'boolean';
}