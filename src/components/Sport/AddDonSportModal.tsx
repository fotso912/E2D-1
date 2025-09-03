import { useState } from 'react'
import { X, Upload, Gift } from 'lucide-react'
import { donsSport } from '../../lib/supabase'
import { formatCurrency } from '../../lib/utils'

interface AddDonSportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  typeSport: 'e2d' | 'phoenix'
}

export function AddDonSportModal({ isOpen, onClose, onSuccess, typeSport }: AddDonSportModalProps) {
  const [formData, setFormData] = useState({
    donateur_nom: '',
    donateur_contact: '',
    montant: 0,
    nature_don: '',
    description: '',
    recu_url: '',
    est_don_nature: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.donateur_nom || (!formData.montant && !formData.nature_don)) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const { error } = await donsSport.create({
        type_sport: typeSport,
        donateur_nom: formData.donateur_nom,
        donateur_contact: formData.donateur_contact || null,
        montant: formData.est_don_nature ? null : formData.montant,
        nature_don: formData.est_don_nature ? formData.nature_don : null,
        date_don: new Date().toISOString().split('T')[0],
        description: formData.description || null,
        recu_url: formData.recu_url || null
      })
      
      if (error) throw error
      
      onSuccess()
      onClose()
      resetForm()
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'enregistrement du don')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      donateur_nom: '',
      donateur_contact: '',
      montant: 0,
      nature_don: '',
      description: '',
      recu_url: '',
      est_don_nature: false
    })
    setError('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Nouveau don - Sport {typeSport === 'e2d' ? 'E2D' : 'Phoenix'}
          </h2>
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

        <div className="bg-green-50 border border-green-200 p-3 rounded mb-4">
          <div className="flex items-start">
            <Gift className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <strong>Information :</strong>
              <ul className="mt-1 list-disc list-inside">
                <li>Les dons peuvent être en espèces ou en nature</li>
                <li>Un reçu peut être joint comme justificatif</li>
                <li>Les dons contribuent au financement des activités sportives</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Nom du donateur *</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.donateur_nom}
              onChange={(e) => setFormData({ ...formData, donateur_nom: e.target.value })}
              placeholder="Nom de la personne ou organisation"
            />
          </div>

          <div>
            <label className="form-label">Contact du donateur</label>
            <input
              type="text"
              className="form-input"
              value={formData.donateur_contact}
              onChange={(e) => setFormData({ ...formData, donateur_contact: e.target.value })}
              placeholder="Téléphone ou email"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="est_don_nature"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={formData.est_don_nature}
              onChange={(e) => setFormData({ ...formData, est_don_nature: e.target.checked })}
            />
            <label htmlFor="est_don_nature" className="ml-2 block text-sm text-gray-900">
              Don en nature (équipements, matériel, etc.)
            </label>
          </div>

          {formData.est_don_nature ? (
            <div>
              <label className="form-label">Nature du don *</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.nature_don}
                onChange={(e) => setFormData({ ...formData, nature_don: e.target.value })}
                placeholder="Ex: Ballons de football, maillots, etc."
              />
            </div>
          ) : (
            <div>
              <label className="form-label">Montant du don (FCFA) *</label>
              <input
                type="number"
                required
                min="1000"
                step="1000"
                className="form-input"
                value={formData.montant}
                onChange={(e) => setFormData({ ...formData, montant: parseInt(e.target.value) || 0 })}
                placeholder="Ex: 50000"
              />
            </div>
          )}

          <div>
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Précisions sur le don, utilisation prévue..."
            />
          </div>

          <div>
            <label className="form-label">Reçu ou justificatif (URL)</label>
            <div className="flex space-x-2">
              <input
                type="url"
                className="form-input flex-1"
                placeholder="https://exemple.com/recu.pdf"
                value={formData.recu_url}
                onChange={(e) => setFormData({ ...formData, recu_url: e.target.value })}
              />
              <button
                type="button"
                className="btn-secondary px-3"
                title="Télécharger un reçu"
              >
                <Upload className="w-4 h-4" />
              </button>
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
              {loading ? 'Enregistrement...' : 'Enregistrer le don'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}