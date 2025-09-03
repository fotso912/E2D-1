import { useState } from 'react'
import { X, Calendar, MapPin } from 'lucide-react'
import { seancesEntrainement } from '../../lib/supabase'

interface AddSeanceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  typeSport: 'e2d' | 'phoenix'
}

export function AddSeanceModal({ isOpen, onClose, onSuccess, typeSport }: AddSeanceModalProps) {
  const [formData, setFormData] = useState({
    date_seance: new Date().toISOString().split('T')[0],
    heure_debut: '18:00',
    heure_fin: '20:00',
    lieu: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.date_seance) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const { error } = await seancesEntrainement.create({
        type_sport: typeSport,
        date_seance: formData.date_seance,
        heure_debut: formData.heure_debut || null,
        heure_fin: formData.heure_fin || null,
        lieu: formData.lieu || null,
        description: formData.description || null,
        annulee: false
      })
      
      if (error) throw error
      
      onSuccess()
      onClose()
      resetForm()
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la création de la séance')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      date_seance: new Date().toISOString().split('T')[0],
      heure_debut: '18:00',
      heure_fin: '20:00',
      lieu: '',
      description: ''
    })
    setError('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Nouvelle séance - Sport {typeSport === 'e2d' ? 'E2D' : 'Phoenix'}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Date de la séance *</label>
            <input
              type="date"
              required
              className="form-input"
              value={formData.date_seance}
              onChange={(e) => setFormData({ ...formData, date_seance: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Heure de début</label>
              <input
                type="time"
                className="form-input"
                value={formData.heure_debut}
                onChange={(e) => setFormData({ ...formData, heure_debut: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Heure de fin</label>
              <input
                type="time"
                className="form-input"
                value={formData.heure_fin}
                onChange={(e) => setFormData({ ...formData, heure_fin: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Lieu</label>
            <input
              type="text"
              className="form-input"
              value={formData.lieu}
              onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
              placeholder="Ex: Terrain municipal, Stade Phoenix..."
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Type d'entraînement, objectifs, remarques..."
            />
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
              disabled={loading || !formData.date_seance}
            >
              {loading ? 'Création...' : 'Créer la séance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}