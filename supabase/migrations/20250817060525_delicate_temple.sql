/*
  # Gestion des activités sportives E2D et Phoenix

  1. Nouvelles Tables
    - `adherents_phoenix` - Adhérents Sport Phoenix (pas forcément membres)
    - `seances_entrainement` - Séances d'entraînement
    - `presences_entrainement` - Présences aux entraînements
    - `matchs` - Matchs joués
    - `statistiques_joueurs` - Stats individuelles (buts, cartons, etc.)
    - `dons_sport` - Dons reçus pour l'activité sportive
    - `depenses_sport` - Dépenses liées au sport

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Accès selon les responsables sport
*/

-- Table des adhérents Phoenix (peuvent ne pas être membres de l'association)
CREATE TABLE IF NOT EXISTS adherents_phoenix (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membre_id uuid REFERENCES membres(id) ON DELETE SET NULL, -- NULL si pas membre de l'association
  nom text NOT NULL,
  prenom text NOT NULL,
  telephone text,
  email text,
  photo_url text,
  statut text DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'suspendu')),
  date_adhesion date DEFAULT CURRENT_DATE,
  montant_adhesion numeric(10,2) DEFAULT 0,
  adhesion_payee boolean DEFAULT false,
  date_limite_paiement date,
  fond_souverain_paye boolean DEFAULT false,
  montant_fond_souverain numeric(10,2) DEFAULT 0,
  est_comite_organisation boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Table des séances d'entraînement
CREATE TABLE IF NOT EXISTS seances_entrainement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_sport text NOT NULL CHECK (type_sport IN ('e2d', 'phoenix')),
  date_seance date NOT NULL,
  heure_debut time,
  heure_fin time,
  lieu text,
  description text,
  annulee boolean DEFAULT false,
  motif_annulation text,
  created_at timestamptz DEFAULT now()
);

-- Table des présences aux entraînements
CREATE TABLE IF NOT EXISTS presences_entrainement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seance_id uuid REFERENCES seances_entrainement(id) ON DELETE CASCADE,
  membre_id uuid REFERENCES membres(id) ON DELETE CASCADE, -- Pour E2D
  adherent_phoenix_id uuid REFERENCES adherents_phoenix(id) ON DELETE CASCADE, -- Pour Phoenix
  present boolean DEFAULT true,
  retard_minutes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CHECK ((membre_id IS NOT NULL AND adherent_phoenix_id IS NULL) OR (membre_id IS NULL AND adherent_phoenix_id IS NOT NULL))
);

-- Table des matchs
CREATE TABLE IF NOT EXISTS matchs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_sport text NOT NULL CHECK (type_sport IN ('e2d', 'phoenix')),
  date_match date NOT NULL,
  heure_match time,
  adversaire text NOT NULL,
  logo_adversaire_url text,
  lieu text,
  score_equipe integer DEFAULT 0,
  score_adversaire integer DEFAULT 0,
  resultat text CHECK (resultat IN ('victoire', 'defaite', 'nul')),
  type_match text DEFAULT 'amical' CHECK (type_match IN ('amical', 'championnat', 'coupe', 'gala')),
  description text,
  created_at timestamptz DEFAULT now()
);

-- Table des statistiques joueurs
CREATE TABLE IF NOT EXISTS statistiques_joueurs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matchs(id) ON DELETE CASCADE,
  membre_id uuid REFERENCES membres(id) ON DELETE CASCADE, -- Pour E2D
  adherent_phoenix_id uuid REFERENCES adherents_phoenix(id) ON DELETE CASCADE, -- Pour Phoenix
  buts integer DEFAULT 0,
  passes_decisives integer DEFAULT 0,
  cartons_jaunes integer DEFAULT 0,
  cartons_rouges integer DEFAULT 0,
  minutes_jouees integer DEFAULT 0,
  note_performance numeric(3,1) CHECK (note_performance BETWEEN 0 AND 10),
  commentaire text,
  created_at timestamptz DEFAULT now(),
  CHECK ((membre_id IS NOT NULL AND adherent_phoenix_id IS NULL) OR (membre_id IS NULL AND adherent_phoenix_id IS NOT NULL))
);

-- Table des dons pour le sport
CREATE TABLE IF NOT EXISTS dons_sport (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_sport text NOT NULL CHECK (type_sport IN ('e2d', 'phoenix')),
  donateur_nom text NOT NULL,
  donateur_contact text,
  montant numeric(10,2),
  nature_don text, -- Si don en nature
  date_don date DEFAULT CURRENT_DATE,
  description text,
  recu_url text,
  created_at timestamptz DEFAULT now()
);

-- Table des dépenses sport
CREATE TABLE IF NOT EXISTS depenses_sport (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_sport text NOT NULL CHECK (type_sport IN ('e2d', 'phoenix')),
  libelle text NOT NULL,
  montant numeric(10,2) NOT NULL,
  date_depense date DEFAULT CURRENT_DATE,
  categorie text CHECK (categorie IN ('equipement', 'transport', 'arbitrage', 'medical', 'autre')),
  justificatif_url text,
  approuve_par uuid REFERENCES membres(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE adherents_phoenix ENABLE ROW LEVEL SECURITY;
ALTER TABLE seances_entrainement ENABLE ROW LEVEL SECURITY;
ALTER TABLE presences_entrainement ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchs ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistiques_joueurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dons_sport ENABLE ROW LEVEL SECURITY;
ALTER TABLE depenses_sport ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Consultation adhérents Phoenix"
  ON adherents_phoenix FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Responsables sport gèrent adhérents Phoenix"
  ON adherents_phoenix FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM membres_roles mr
    JOIN roles r ON mr.role_id = r.id
    WHERE mr.membre_id::text = auth.uid()::text
    AND (r.permissions->>'sport_phoenix' = 'true' OR r.permissions->>'admin' = 'true')
  ));

CREATE POLICY "Consultation séances"
  ON seances_entrainement FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Consultation présences"
  ON presences_entrainement FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Consultation matchs"
  ON matchs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Consultation statistiques"
  ON statistiques_joueurs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Consultation dons"
  ON dons_sport FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Consultation dépenses"
  ON depenses_sport FOR SELECT
  TO authenticated
  USING (true);