# Application de Gestion Association E2D

Application web moderne pour la gestion complète de l'association E2D, incluant les cotisations, prêts, sanctions, activités sportives et bien plus.

## 🚀 Fonctionnalités Principales

### 👥 Gestion des Membres
- Enregistrement complet des membres (photo, contact, rôles)
- Système de rôles et permissions
- Historique des statuts et connexions
- Authentification sécurisée

### 💰 Gestion Financière
- Cotisations mensuelles variables
- Système de prêts avec intérêts (5%, 2 mois)
- Épargnes avec redistribution des intérêts
- Fonds de caisse et d'investissement
- Suivi des transactions

### 🏥 Aides Sociales
- Aide maladie, mariage, décès
- Gestion des dettes de fond souverain
- Justificatifs et suivi des remboursements

### ⚖️ Sanctions
- Sanctions réunion (retards, absences, troubles)
- Sanctions sportives (cartons)
- Sanctions disciplinaires
- Calcul automatique et suspension

### ⚽ Activités Sportives
- **Sport E2D** : Réservé aux membres de l'association
- **Sport E2D-Phoenix** : Ouvert à d'autres adhérents
- Gestion des entraînements et présences
- Statistiques individuelles (buts, cartons, etc.)
- Matchs et compétitions
- Dons et dépenses sportives

### 📋 Rapports et Administration
- Rapports de séances mensuelles
- Points à l'ordre du jour et résolutions
- Calendrier des réceptions
- États financiers et sportifs
- Configuration flexible

## 🛠️ Technologies Utilisées

- **Frontend** : React 18 + TypeScript + Vite
- **UI** : Tailwind CSS + Lucide Icons
- **Backend** : Supabase (PostgreSQL + Auth + Storage)
- **Déploiement** : Compatible web/mobile

## 📦 Installation

1. **Cloner le projet**
   ```bash
   git clone [url-du-repo]
   cd association-e2d
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer Supabase**
   - Créer un projet Supabase
   - Copier `.env.example` vers `.env`
   - Renseigner les variables d'environnement

4. **Appliquer les migrations**
   - Les fichiers SQL sont dans `supabase/migrations/`
   - Les exécuter dans l'ordre dans l'éditeur SQL Supabase

5. **Lancer l'application**
   ```bash
   npm run dev
   ```

## 🗄️ Structure de la Base de Données

### Tables Principales
- `membres` - Informations des membres
- `roles` - Rôles et permissions
- `cotisations` - Cotisations mensuelles
- `prets` - Gestion des prêts
- `sanctions` - Sanctions appliquées
- `aides_sociales` - Aides accordées
- `adherents_phoenix` - Adhérents Sport Phoenix
- `matchs` - Matchs joués
- `rapports_seances` - Rapports de réunions
- `configurations` - Paramètres de l'app

### Sécurité
- Row Level Security (RLS) activé
- Politiques d'accès basées sur les rôles
- Authentification Supabase intégrée

## 👤 Rôles et Permissions

- **Président** : Accès complet
- **Trésorier** : Gestion financière
- **Secrétaire Général** : Rapports et administration
- **Censeur** : Gestion des sanctions
- **Commissaire aux Comptes** : Contrôle financier
- **Responsable Sport** : Gestion des activités sportives
- **Membre** : Consultation des états

## 🔧 Configuration

L'application utilise un système de configuration flexible via la table `configurations` :

- Montants des aides et sanctions
- Paramètres des prêts et cotisations
- Seuils de suspension
- Délais de notification
- Paramètres sportifs

## 📱 Fonctionnalités Avancées

### Notifications Automatiques
- Rappel des réunions (7 jours avant)
- Échéances des prêts
- Retards de paiement d'adhésion

### Rapports et États
- États financiers par membre
- Statistiques sportives
- Historiques complets
- Export des données

### Gestion Sportive
- Éligibilité au match de gala
- Suivi des performances
- Gestion des équipements
- Dons et sponsors

## 🚀 Déploiement

L'application est conçue pour être déployée facilement :
- Compatible avec Vercel, Netlify
- Base de données Supabase hébergée
- Authentification intégrée
- Accès web et mobile

## 📞 Support

Pour toute question ou assistance, contacter l'équipe de développement.

---

**Association E2D** - Gestion moderne et efficace pour votre association