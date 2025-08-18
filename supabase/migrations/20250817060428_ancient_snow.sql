/*
  # Configuration initiale - Rôles et Membres

  1. Nouvelles Tables
    - `roles` - Gestion des rôles dans l'association
    - `membres` - Informations des membres
    - `statuts_membres` - Historique des statuts des membres
    - `membres_roles` - Table de jonction membres-rôles
    - `connexions` - Historique des connexions

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Politiques d'accès basées sur les rôles
*/

-- Table des rôles
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text UNIQUE NOT NULL,
  description text,
  permissions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des membres
CREATE TABLE IF NOT EXISTS membres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  nom text NOT NULL,
  prenom text NOT NULL,
  telephone text,
  photo_url text,
  statut text DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'suspendu')),
  montant_cotisation_mensuelle numeric(10,2) DEFAULT 0,
  date_adhesion date DEFAULT CURRENT_DATE,
  mot_de_passe_modifiable boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table historique des statuts
CREATE TABLE IF NOT EXISTS statuts_membres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membre_id uuid REFERENCES membres(id) ON DELETE CASCADE,
  ancien_statut text,
  nouveau_statut text NOT NULL,
  motif text,
  date_changement timestamptz DEFAULT now(),
  modifie_par uuid REFERENCES membres(id)
);

-- Table de jonction membres-rôles
CREATE TABLE IF NOT EXISTS membres_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membre_id uuid REFERENCES membres(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  date_attribution timestamptz DEFAULT now(),
  attribue_par uuid REFERENCES membres(id),
  UNIQUE(membre_id, role_id)
);

-- Table historique des connexions
CREATE TABLE IF NOT EXISTS connexions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membre_id uuid REFERENCES membres(id) ON DELETE CASCADE,
  date_connexion timestamptz DEFAULT now(),
  adresse_ip inet,
  user_agent text,
  succes boolean DEFAULT true
);

-- Insertion des rôles de base
INSERT INTO roles (nom, description, permissions) VALUES
('Président', 'Président de l''association', '{"admin": true, "all_access": true}'),
('Trésorier', 'Gestion financière', '{"cotisations": true, "prêts": true, "épargne": true}'),
('Secrétaire Général', 'Gestion administrative', '{"rapports": true, "membres": true}'),
('Censeur', 'Gestion des sanctions', '{"sanctions": true}'),
('Commissaire aux Comptes', 'Contrôle financier', '{"audit": true, "cotisations": true}'),
('Responsable Sport E2D', 'Gestion Sport E2D', '{"sport_e2d": true}'),
('Responsable Sport Phoenix', 'Gestion Sport Phoenix', '{"sport_phoenix": true}'),
('Membre', 'Membre standard', '{"consultation": true}')
ON CONFLICT (nom) DO NOTHING;

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE membres ENABLE ROW LEVEL SECURITY;
ALTER TABLE statuts_membres ENABLE ROW LEVEL SECURITY;
ALTER TABLE membres_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connexions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Tous peuvent voir les rôles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Membres peuvent voir leurs propres données"
  ON membres FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text OR EXISTS (
    SELECT 1 FROM membres_roles mr
    JOIN roles r ON mr.role_id = r.id
    WHERE mr.membre_id::text = auth.uid()::text
    AND r.permissions->>'admin' = 'true'
  ));

CREATE POLICY "Admins peuvent tout voir sur les membres"
  ON membres FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM membres_roles mr
    JOIN roles r ON mr.role_id = r.id
    WHERE mr.membre_id::text = auth.uid()::text
    AND r.permissions->>'admin' = 'true'
  ));

CREATE POLICY "Voir historique des statuts"
  ON statuts_membres FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Voir les rôles des membres"
  ON membres_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Voir ses propres connexions"
  ON connexions FOR SELECT
  TO authenticated
  USING (membre_id::text = auth.uid()::text);