import { useState } from 'react'
import { X, DollarSign, Calendar } from 'lucide-react'
import { epargnes } from '../../lib/supabase'
import { formatCurrency } from '../../lib/utils'

interface AddEpargneModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  membres: any[]
}

export function AddEpargneModal({ isOpen, onClose, onSuccess, membres }: AddEpargneModalProps) {
  const [formData, setFormData] = useState({
    membre_id: '',
    montant: 0,
    date_depot: new Date().toISOString().split('T')[0],
    exercice: new Date().getFullYear()
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.membre_id || formData.montant <= 0) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const { error } = await epargnes.create({
        membre_id: formData.membre_id,
        montant: formData.montant,
        date_depot: formData.date_depot,
        exercice: formData.exercice,
        statut: 'active',
        interets_recus: 0
      })
      
      if (error) throw error
      
      onSuccess()
      onClose()
      resetForm()
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la création de l\'épargne')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      membre_id: '',
      montant: 0,
      date_depot: new Date().toISOString().split('T')[0],
      exercice: new Date().getFullYear()
    })
    setError('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Nouvelle épargne</h2>
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

        <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-4">
          <div className="flex items-start">
            <DollarSign className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <strong>Information :</strong>
              <ul className="mt-1 list-disc list-inside">
                <li>Les épargnes sont remboursées en fin d'exercice</li>
                <li>Les intérêts sont distribués au prorata des montants épargnés</li>
                <li>Les intérêts proviennent des prêts accordés aux membres</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Épargnant *</label>
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

          <div>
            <label className="form-label">Montant de l'épargne (FCFA) *</label>
            <input
              type="number"
              required
              min="1000"
              step="1000"
              className="form-input"
              value={formData.montant}
              onChange={(e) => setFormData({ ...formData, montant: parseInt(e.target.value) || 0 })}
              placeholder="Ex: 100000"
            />
          </div>

          <div>
            <label className="form-label">Date de dépôt *</label>
            <input
              type="date"
              required
              className="form-input"
              value={formData.date_depot}
              onChange={(e) => setFormData({ ...formData, date_depot: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Exercice *</label>
            <select
              required
              className="form-input"
              value={formData.exercice}
              onChange={(e) => setFormData({ ...formData, exercice: parseInt(e.target.value) })}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
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
              disabled={loading || !formData.membre_id || formData.montant <= 0}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer l\'épargne'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}