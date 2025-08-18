/*
  # Rapports de séances et configuration

  1. Nouvelles Tables
    - `rapports_seances` - Rapports des réunions mensuelles
    - `points_ordre_jour` - Points à l'ordre du jour
    - `resolutions` - Résolutions prises en séance
    - `calendrier_receptions` - Planning des réceptions
    - `configurations` - Paramètres configurables de l'application

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Accès selon les rôles (secrétariat pour rapports)
*/

-- Table des rapports de séances
CREATE TABLE IF NOT EXISTS rapports_seances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_seance date NOT NULL,
  lieu text NOT NULL,
  hote_membre_id uuid REFERENCES membres(id),
  heure_debut time,
  heure_fin time,
  nombre_presents integer DEFAULT 0,
  nombre_absents integer DEFAULT 0,
  statut text DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'finalise', 'approuve')),
  document_pdf_url text,
  redige_par uuid REFERENCES membres(id),
  created_at timestamptz DEFAULT now()
);

-- Table des points à l'ordre du jour
CREATE TABLE IF NOT EXISTS points_ordre_jour (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rapport_seance_id uuid REFERENCES rapports_seances(id) ON DELETE CASCADE,
  numero_point integer NOT NULL,
  titre text NOT NULL,
  description text,
  type_point text DEFAULT 'discussion' CHECK (type_point IN ('discussion', 'decision', 'information', 'vote')),
  created_at timestamptz DEFAULT now()
);

-- Table des résolutions
CREATE TABLE IF NOT EXISTS resolutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  point_ordre_jour_id uuid REFERENCES points_ordre_jour(id) ON DELETE CASCADE,
  resolution text NOT NULL,
  type_resolution text DEFAULT 'decision' CHECK (type_resolution IN ('decision', 'recommandation', 'action')),
  responsable_membre_id uuid REFERENCES membres(id),
  date_limite date,
  statut text DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'terminee', 'reportee', 'annulee')),
  created_at timestamptz DEFAULT now()
);

-- Table du calendrier des réceptions
CREATE TABLE IF NOT EXISTS calendrier_receptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mois integer NOT NULL CHECK (mois BETWEEN 1 AND 12),
  annee integer NOT NULL,
  hote_membre_id uuid REFERENCES membres(id) NOT NULL,
  lieu text,
  date_prevue date,
  date_effective date,
  statut text DEFAULT 'planifiee' CHECK (statut IN ('planifiee', 'confirmee', 'reportee', 'annulee')),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(mois, annee)
);

-- Table des configurations
CREATE TABLE IF NOT EXISTS configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cle text UNIQUE NOT NULL,
  valeur text NOT NULL,
  type_valeur text DEFAULT 'text' CHECK (type_valeur IN ('text', 'number', 'boolean', 'json')),
  description text,
  categorie text DEFAULT 'general' CHECK (categorie IN ('general', 'financier', 'sport', 'sanctions', 'notifications')),
  modifiable boolean DEFAULT true,
  modifie_par uuid REFERENCES membres(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insertion des configurations de base
INSERT INTO configurations (cle, valeur, type_valeur, description, categorie) VALUES
('montant_fond_caisse_base', '50000', 'number', 'Montant de base du fonds de caisse', 'financier'),
('augmentation_fond_caisse', '5000', 'number', 'Augmentation annuelle du fonds de caisse', 'financier'),
('taux_interet_pret', '5', 'number', 'Taux d''intérêt des prêts (%)', 'financier'),
('duree_pret_mois', '2', 'number', 'Durée standard des prêts (mois)', 'financier'),
('montant_aide_maladie', '50000', 'number', 'Montant standard aide maladie', 'financier'),
('montant_aide_mariage', '100000', 'number', 'Montant standard aide mariage', 'financier'),
('delai_remboursement_aide', '6', 'number', 'Délai de remboursement des aides (mois)', 'financier'),
('montant_carton_jaune_e2d', '1000', 'number', 'Montant sanction carton jaune E2D', 'sport'),
('montant_carton_rouge_e2d', '2000', 'number', 'Montant sanction carton rouge E2D', 'sport'),
('montant_carton_jaune_phoenix', '1000', 'number', 'Montant sanction carton jaune Phoenix', 'sport'),
('montant_carton_rouge_phoenix', '2000', 'number', 'Montant sanction carton rouge Phoenix', 'sport'),
('seances_minimum_gala', '10', 'number', 'Nombre minimum de séances pour le match de gala', 'sport'),
('montant_adhesion_phoenix', '10000', 'number', 'Montant adhésion Sport Phoenix', 'sport'),
('delai_paiement_adhesion', '30', 'number', 'Délai de paiement adhésion (jours)', 'sport'),
('notification_reunion_jours', '7', 'number', 'Notification réunion (jours avant)', 'notifications'),
('notification_pret_jours', '3', 'number', 'Notification échéance prêt (jours avant)', 'notifications'),
('sanctions_max_avant_suspension', '3', 'number', 'Nombre max de sanctions avant suspension', 'sanctions')
ON CONFLICT (cle) DO NOTHING;

-- Enable RLS
ALTER TABLE rapports_seances ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_ordre_jour ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendrier_receptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE configurations ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Tous peuvent consulter les rapports"
  ON rapports_seances FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Secrétariat gère les rapports"
  ON rapports_seances FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM membres_roles mr
    JOIN roles r ON mr.role_id = r.id
    WHERE mr.membre_id::text = auth.uid()::text
    AND (r.permissions->>'rapports' = 'true' OR r.permissions->>'admin' = 'true')
  ));

CREATE POLICY "Consultation points ordre du jour"
  ON points_ordre_jour FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Consultation résolutions"
  ON resolutions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Consultation calendrier"
  ON calendrier_receptions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Consultation configurations"
  ON configurations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins modifient configurations"
  ON configurations FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM membres_roles mr
    JOIN roles r ON mr.role_id = r.id
    WHERE mr.membre_id::text = auth.uid()::text
    AND r.permissions->>'admin' = 'true'
  ));