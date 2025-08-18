/*
  # Gestion financière - Cotisations, Prêts, Épargnes

  1. Nouvelles Tables
    - `cotisations` - Cotisations mensuelles des membres
    - `prets` - Gestion des prêts entre membres
    - `epargnes` - Épargnes volontaires des membres
    - `fonds_caisse` - Évolution du fonds de caisse
    - `fonds_investissement` - Contributions annuelles d'investissement
    - `transactions_financieres` - Journal de toutes les transactions

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Accès restreint selon les rôles
*/

-- Table des cotisations
CREATE TABLE IF NOT EXISTS cotisations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membre_id uuid REFERENCES membres(id) ON DELETE CASCADE,
  mois integer NOT NULL CHECK (mois BETWEEN 1 AND 12),
  annee integer NOT NULL,
  montant_attendu numeric(10,2) NOT NULL,
  montant_paye numeric(10,2) DEFAULT 0,
  huile_paye boolean DEFAULT false,
  savon_paye boolean DEFAULT false,
  fond_sport_paye boolean DEFAULT false,
  montant_fond_sport numeric(10,2) DEFAULT 0,
  date_paiement timestamptz,
  saisi_par uuid REFERENCES membres(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(membre_id, mois, annee)
);

-- Table des prêts
CREATE TABLE IF NOT EXISTS prets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emprunteur_id uuid REFERENCES membres(id) ON DELETE CASCADE,
  montant_principal numeric(10,2) NOT NULL,
  taux_interet numeric(5,2) DEFAULT 5.00,
  montant_interet numeric(10,2) GENERATED ALWAYS AS (montant_principal * taux_interet / 100) STORED,
  date_pret date NOT NULL,
  date_echeance date NOT NULL,
  statut text DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'rembourse', 'reconduit', 'en_retard')),
  nombre_reconductions integer DEFAULT 0,
  document_url text,
  accorde_par uuid REFERENCES membres(id),
  created_at timestamptz DEFAULT now()
);

-- Table des épargnes
CREATE TABLE IF NOT EXISTS epargnes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membre_id uuid REFERENCES membres(id) ON DELETE CASCADE,
  montant numeric(10,2) NOT NULL,
  date_depot date NOT NULL,
  exercice integer NOT NULL,
  statut text DEFAULT 'active' CHECK (statut IN ('active', 'remboursee')),
  date_remboursement date,
  interets_recus numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Table du fonds de caisse
CREATE TABLE IF NOT EXISTS fonds_caisse (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercice integer NOT NULL,
  montant_base numeric(10,2) NOT NULL,
  augmentation numeric(10,2) DEFAULT 5000,
  montant_total numeric(10,2) GENERATED ALWAYS AS (montant_base + augmentation) STORED,
  date_mise_a_jour date DEFAULT CURRENT_DATE,
  modifie_par uuid REFERENCES membres(id),
  created_at timestamptz DEFAULT now()
);

-- Table du fonds d'investissement
CREATE TABLE IF NOT EXISTS fonds_investissement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membre_id uuid REFERENCES membres(id) ON DELETE CASCADE,
  annee integer NOT NULL,
  montant_attendu numeric(10,2) NOT NULL,
  montant_paye numeric(10,2) DEFAULT 0,
  date_paiement date,
  created_at timestamptz DEFAULT now(),
  UNIQUE(membre_id, annee)
);

-- Table des transactions financières (journal)
CREATE TABLE IF NOT EXISTS transactions_financieres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_transaction text NOT NULL CHECK (type_transaction IN ('cotisation', 'pret', 'remboursement', 'epargne', 'sanction', 'aide', 'fond_sport', 'autre')),
  membre_id uuid REFERENCES membres(id),
  montant numeric(10,2) NOT NULL,
  description text NOT NULL,
  reference_id uuid, -- ID de la transaction liée (prêt, cotisation, etc.)
  date_transaction date DEFAULT CURRENT_DATE,
  saisi_par uuid REFERENCES membres(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cotisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prets ENABLE ROW LEVEL SECURITY;
ALTER TABLE epargnes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fonds_caisse ENABLE ROW LEVEL SECURITY;
ALTER TABLE fonds_investissement ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions_financieres ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour cotisations
CREATE POLICY "Trésoriers peuvent gérer les cotisations"
  ON cotisations FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM membres_roles mr
    JOIN roles r ON mr.role_id = r.id
    WHERE mr.membre_id::text = auth.uid()::text
    AND (r.permissions->>'cotisations' = 'true' OR r.permissions->>'admin' = 'true')
  ));

CREATE POLICY "Membres peuvent voir leurs cotisations"
  ON cotisations FOR SELECT
  TO authenticated
  USING (membre_id::text = auth.uid()::text);

-- Politiques RLS pour prêts
CREATE POLICY "Voir les prêts autorisés"
  ON prets FOR SELECT
  TO authenticated
  USING (emprunteur_id::text = auth.uid()::text OR EXISTS (
    SELECT 1 FROM membres_roles mr
    JOIN roles r ON mr.role_id = r.id
    WHERE mr.membre_id::text = auth.uid()::text
    AND (r.permissions->>'prêts' = 'true' OR r.permissions->>'admin' = 'true')
  ));

-- Politiques RLS pour épargnes
CREATE POLICY "Membres voient leurs épargnes"
  ON epargnes FOR SELECT
  TO authenticated
  USING (membre_id::text = auth.uid()::text);

CREATE POLICY "Trésoriers gèrent les épargnes"
  ON epargnes FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM membres_roles mr
    JOIN roles r ON mr.role_id = r.id
    WHERE mr.membre_id::text = auth.uid()::text
    AND (r.permissions->>'épargne' = 'true' OR r.permissions->>'admin' = 'true')
  ));

-- Politiques pour les autres tables
CREATE POLICY "Consultation fonds de caisse"
  ON fonds_caisse FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Consultation fonds investissement"
  ON fonds_investissement FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Consultation transactions"
  ON transactions_financieres FOR SELECT
  TO authenticated
  USING (true);