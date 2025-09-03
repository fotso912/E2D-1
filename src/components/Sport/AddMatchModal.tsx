import { useState } from 'react'
import { X, Upload, Trophy, Target } from 'lucide-react'
import { matchs } from '../../lib/supabase'

interface AddMatchModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  typeSport: 'e2d' | 'phoenix'
}

export function AddMatchModal({ isOpen, onClose, onSuccess, typeSport }: AddMatchModalProps) {
  const [formData, setFormData] = useState({
    date_match: new Date().toISOString().split('T')[0],
    heure_match: '15:00',
    adversaire: '',
    logo_adversaire_url: '',
    lieu: '',
    type_match: 'amical' as 'amical' | 'championnat' | 'coupe' | 'gala',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const typesMatchOptions = [
    { value: 'amical', label: 'Match amical' },
    { value: 'championnat', label: 'Championnat' },
    { value: 'coupe', label: 'Coupe' },
    { value: 'gala', label: 'Match de gala' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.date_match || !formData.adversaire) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const { error } = await matchs.create({
        type_sport: typeSport,
        date_match: formData.date_match,
        heure_match: formData.heure_match || null,
        adversaire: formData.adversaire,
        logo_adversaire_url: formData.logo_adversaire_url || null,
        lieu: formData.lieu || null,
        score_equipe: 0,
        score_adversaire: 0,
        resultat: null,
        type_match: formData.type_match,
        description: formData.description || null
      })
      
      if (error) throw error
      
      onSuccess()
      onClose()
      resetForm()
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la création du match')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      date_match: new Date().toISOString().split('T')[0],
      heure_match: '15:00',
      adversaire: '',
      logo_adversaire_url: '',
      lieu: '',
      type_match: 'amical',
      description: ''
    })
    setError('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Nouveau match - Sport {typeSport === 'e2d' ? 'E2D' : 'Phoenix'}
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
            <Trophy className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <strong>Information :</strong>
              <ul className="mt-1 list-disc list-inside">
                <li>Le score sera saisi après le match</li>
                <li>Les statistiques individuelles seront ajoutées séparément</li>
                <li>Le match de gala nécessite une éligibilité spéciale</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Date du match *</label>
            <input
              type="date"
              required
              className="form-input"
              value={formData.date_match}
              onChange={(e) => setFormData({ ...formData, date_match: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Heure du match</label>
            <input
              type="time"
              className="form-input"
              value={formData.heure_match}
              onChange={(e) => setFormData({ ...formData, heure_match: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Adversaire *</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.adversaire}
              onChange={(e) => setFormData({ ...formData, adversaire: e.target.value })}
              placeholder="Ex: FC Rivaux, Phoenix United..."
            />
          </div>

          <div>
            <label className="form-label">Logo de l'adversaire (URL)</label>
            <div className="flex space-x-2">
              <input
                type="url"
                className="form-input flex-1"
                placeholder="https://exemple.com/logo.png"
                value={formData.logo_adversaire_url}
                onChange={(e) => setFormData({ ...formData, logo_adversaire_url: e.target.value })}
              />
              <button
                type="button"
                className="btn-secondary px-3"
                title="Télécharger un logo"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="form-label">Lieu du match</label>
            <input
              type="text"
              className="form-input"
              value={formData.lieu}
              onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
              placeholder="Ex: Stade municipal, Terrain Phoenix..."
            />
          </div>

          <div>
            <label className="form-label">Type de match *</label>
            <select
              required
              className="form-input"
              value={formData.type_match}
              onChange={(e) => setFormData({ ...formData, type_match: e.target.value as any })}
            >
              {typesMatchOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Contexte du match, enjeux, remarques..."
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
              disabled={loading || !formData.date_match || !formData.adversaire}
            >
              {loading ? 'Création...' : 'Créer le match'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}