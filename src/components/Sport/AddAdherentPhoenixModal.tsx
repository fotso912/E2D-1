import { useState } from 'react'
import { X, Upload, Users, DollarSign } from 'lucide-react'
import { adherentsPhoenix, configurations } from '../../lib/supabase'
import { formatCurrency } from '../../lib/utils'

interface AddAdherentPhoenixModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  membres: any[]
}

export function AddAdherentPhoenixModal({ isOpen, onClose, onSuccess, membres }: AddAdherentPhoenixModalProps) {
  const [formData, setFormData] = useState({
    membre_id: '',
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    photo_url: '',
    montant_adhesion: 0,
    montant_fond_souverain: 0,
    est_comite_organisation: false,
    est_membre_association: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation selon le type d'adhérent
    if (formData.est_membre_association) {
      if (!formData.membre_id) {
        setError('Veuillez sélectionner un membre de l\'association')
        return
      }
    } else {
      if (!formData.nom || !formData.prenom) {
        setError('Veuillez remplir le nom et prénom pour un adhérent externe')
        return
      }
    }
    
    setLoading(true)
    setError('')

    try {
      // Charger les montants configurés
      const { data: montantAdhesion } = await configurations.getValue('montant_adhesion_phoenix')
      const { data: montantFondSouverain } = await configurations.getValue('montant_fond_souverain_phoenix')
      
      // Calculer la date limite de paiement (30 jours par défaut)
      const dateLimite = new Date()
      dateLimite.setDate(dateLimite.getDate() + 30)

      const adherentData: any = {
        membre_id: formData.est_membre_association ? formData.membre_id : null,
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone || null,
        email: formData.email || null,
        photo_url: formData.photo_url || null,
        statut: 'actif',
        date_adhesion: new Date().toISOString().split('T')[0],
        montant_adhesion: montantAdhesion || 10000,
        adhesion_payee: false,
        date_limite_paiement: dateLimite.toISOString().split('T')[0],
        fond_souverain_paye: false,
        montant_fond_souverain: formData.est_comite_organisation ? (montantFondSouverain || 5000) : 0,
        est_comite_organisation: formData.est_comite_organisation
      }

      // Si c'est un membre de l'association, récupérer ses infos
      if (formData.est_membre_association && formData.membre_id) {
        const membre = membres.find(m => m.id === formData.membre_id)
        if (membre) {
          adherentData.nom = membre.nom
          adherentData.prenom = membre.prenom
          adherentData.email = membre.email
          adherentData.telephone = membre.telephone
          adherentData.photo_url = membre.photo_url
        }
      }

      const { error } = await adherentsPhoenix.create(adherentData)
      
      if (error) throw error
      
      onSuccess()
      onClose()
      resetForm()
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la création de l\'adhérent')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      membre_id: '',
      nom: '',
      prenom: '',
      telephone: '',
      email: '',
      photo_url: '',
      montant_adhesion: 0,
      montant_fond_souverain: 0,
      est_comite_organisation: false,
      est_membre_association: false
    })
    setError('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Nouvel adhérent Phoenix</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-purple-50 border border-purple-200 p-3 rounded mb-4">
          <div className="flex items-start">
            <Users className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-purple-800">
              <strong>Sport E2D-Phoenix :</strong>
              <ul className="mt-1 list-disc list-inside">
                <li>Ouvert aux membres de l'association et aux externes</li>
                <li>Adhésion obligatoire pour tous</li>
                <li>Fond souverain pour le comité d'organisation uniquement</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="est_membre_association"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={formData.est_membre_association}
              onChange={(e) => setFormData({ ...formData, est_membre_association: e.target.checked })}
            />
            <label htmlFor="est_membre_association" className="ml-2 block text-sm text-gray-900">
              Membre de l'association E2D
            </label>
          </div>

          {formData.est_membre_association ? (
            <div>
              <label className="form-label">Membre de l'association *</label>
              <select
                required
                className="form-input"
                value={formData.membre_id}
                onChange={(e) => setFormData({ ...formData, membre_id: e.target.value })}
              >
                <option value="">Sélectionner un membre</option>
                {membres.map((membre) => (
                  <option key={membre.id} value={membre.id}>
                    {membre.prenom} {membre.nom}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Prénom *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Nom *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Téléphone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Photo (URL)</label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    className="form-input flex-1"
                    placeholder="https://exemple.com/photo.jpg"
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  />
                  <button
                    type="button"
                    className="btn-secondary px-3"
                    title="Télécharger une photo"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="est_comite_organisation"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={formData.est_comite_organisation}
              onChange={(e) => setFormData({ ...formData, est_comite_organisation: e.target.checked })}
            />
            <label htmlFor="est_comite_organisation" className="ml-2 block text-sm text-gray-900">
              Membre du comité d'organisation
            </label>
          </div>

          {formData.est_comite_organisation && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
              <div className="text-sm text-yellow-800">
                <strong>Comité d'organisation :</strong><br />
                En plus de l'adhésion standard, ce membre devra payer le fond souverain.
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-medium text-gray-900 mb-2">Contributions à payer :</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <div className="flex justify-between">
                <span>Adhésion Phoenix :</span>
                <span className="font-medium">10 000 FCFA</span>
              </div>
              {formData.est_comite_organisation && (
                <div className="flex justify-between">
                  <span>Fond souverain :</span>
                  <span className="font-medium">5 000 FCFA</span>
                </div>
              )}
              <hr className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total :</span>
                <span>{formatCurrency(10000 + (formData.est_comite_organisation ? 5000 : 0))}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer l\'adhérent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}