/*
  # Gestion des sanctions et aides sociales

  1. Nouvelles Tables
    - `types_sanctions` - Types de sanctions configurables
    - `sanctions` - Sanctions appliquées aux membres
    - `types_aides` - Types d'aides sociales
    - `aides_sociales` - Aides accordées aux membres
    - `dettes_fond_souverain` - Dettes liées aux aides

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Accès selon les rôles (censeur pour sanctions)
*/

-- Table des types de sanctions
CREATE TABLE IF NOT EXISTS types_sanctions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text UNIQUE NOT NULL,
  categorie text NOT NULL CHECK (categorie IN ('reunion', 'sport_e2d', 'sport_phoenix', 'disciplinaire')),
  montant_defaut numeric(10,2) DEFAULT 0,
  description text,
  actif boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Table des sanctions
CREATE TABLE IF NOT EXISTS sanctions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membre_id uuid REFERENCES membres(id) ON DELETE CASCADE,
  type_sanction_id uuid REFERENCES types_sanctions(id),
  montant numeric(10,2) NOT NULL,
  motif text,
  date_sanction date DEFAULT CURRENT_DATE,
  statut text DEFAULT 'impayee' CHECK (statut IN ('impayee', 'payee', 'annulee')),
  date_paiement date,
  automatique boolean DEFAULT false,
  saisi_par uuid REFERENCES membres(id),
  created_at timestamptz DEFAULT now()
);

-- Table des types d'aides
CREATE TABLE IF NOT EXISTS types_aides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text UNIQUE NOT NULL,
  montant_defaut numeric(10,2) NOT NULL,
  delai_remboursement_mois integer DEFAULT 6,
  description text,
  actif boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Table des aides sociales
CREATE TABLE IF NOT EXISTS aides_sociales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiaire_id uuid REFERENCES membres(id) ON DELETE CASCADE,
  type_aide_id uuid REFERENCES types_aides(id),
  montant numeric(10,2) NOT NULL,
  date_aide date DEFAULT CURRENT_DATE,
  date_limite_remboursement date,
  motif text,
  justificatif_url text,
  statut text DEFAULT 'accordee' CHECK (statut IN ('accordee', 'remboursee')),
  accorde_par uuid REFERENCES membres(id),
  created_at timestamptz DEFAULT now()
);

-- Table des dettes de fond souverain
CREATE TABLE IF NOT EXISTS dettes_fond_souverain (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membre_id uuid REFERENCES membres(id) ON DELETE CASCADE,
  aide_sociale_id uuid REFERENCES aides_sociales(id),
  montant_dette numeric(10,2) NOT NULL,
  montant_paye numeric(10,2) DEFAULT 0,
  montant_restant numeric(10,2) GENERATED ALWAYS AS (montant_dette - montant_paye) STORED,
  date_echeance date NOT NULL,
  statut text DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'soldee', 'en_retard')),
  created_at timestamptz DEFAULT now()
);

-- Insertion des types de sanctions de base
INSERT INTO types_sanctions (nom, categorie, montant_defaut, description) VALUES
('Retard réunion', 'reunion', 500, 'Retard à la réunion mensuelle'),
('Absence réunion', 'reunion', 1000, 'Absence non justifiée à la réunion'),
('Trouble réunion', 'reunion', 2000, 'Comportement perturbateur en réunion'),
('Échec cotisation', 'reunion', 1500, 'Non-paiement de la cotisation'),
('Carton jaune', 'sport_e2d', 1000, 'Carton jaune en match'),
('Carton rouge', 'sport_e2d', 2000, 'Carton rouge en match'),
('Carton jaune Phoenix', 'sport_phoenix', 1000, 'Carton jaune Sport Phoenix'),
('Carton rouge Phoenix', 'sport_phoenix', 2000, 'Carton rouge Sport Phoenix'),
('Sanction disciplinaire', 'disciplinaire', 0, 'Sanction disciplinaire variable')
ON CONFLICT (nom) DO NOTHING;

-- Insertion des types d'aides de base
INSERT INTO types_aides (nom, montant_defaut, delai_remboursement_mois, description) VALUES
('Aide maladie', 50000, 6, 'Aide en cas d''hospitalisation'),
('Aide mariage', 100000, 6, 'Aide pour le mariage d''un membre'),
('Aide décès', 75000, 6, 'Aide en cas de décès dans la famille'),
('Aide urgence', 25000, 3, 'Aide d''urgence exceptionnelle')
ON CONFLICT (nom) DO NOTHING;

-- Enable RLS
ALTER TABLE types_sanctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE types_aides ENABLE ROW LEVEL SECURITY;
ALTER TABLE aides_sociales ENABLE ROW LEVEL SECURITY;
ALTER TABLE dettes_fond_souverain ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Tous peuvent voir les types de sanctions"
  ON types_sanctions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Censeurs gèrent les sanctions"
  ON sanctions FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM membres_roles mr
    JOIN roles r ON mr.role_id = r.id
    WHERE mr.membre_id::text = auth.uid()::text
    AND (r.permissions->>'sanctions' = 'true' OR r.permissions->>'admin' = 'true')
  ));

CREATE POLICY "Membres voient leurs sanctions"
  ON sanctions FOR SELECT
  TO authenticated
  USING (membre_id::text = auth.uid()::text OR EXISTS (
    SELECT 1 FROM membres_roles mr
    JOIN roles r ON mr.role_id = r.id
    WHERE mr.membre_id::text = auth.uid()::text
    AND (r.permissions->>'sanctions' = 'true' OR r.permissions->>'admin' = 'true')
  ));

CREATE POLICY "Consultation types d'aides"
  ON types_aides FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Consultation aides sociales"
  ON aides_sociales FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Consultation dettes fond souverain"
  ON dettes_fond_souverain FOR SELECT
  TO authenticated
  USING (true);