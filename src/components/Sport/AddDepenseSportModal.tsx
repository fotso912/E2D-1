import { useState } from 'react'
import { X, Upload, Receipt } from 'lucide-react'
import { depensesSport } from '../../lib/supabase'
import { formatCurrency } from '../../lib/utils'

interface AddDepenseSportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  typeSport: 'e2d' | 'phoenix'
  currentUser?: any
}

export function AddDepenseSportModal({ isOpen, onClose, onSuccess, typeSport, currentUser }: AddDepenseSportModalProps) {
  const [formData, setFormData] = useState({
    libelle: '',
    montant: 0,
    date_depense: new Date().toISOString().split('T')[0],
    categorie: 'autre' as 'equipement' | 'transport' | 'arbitrage' | 'medical' | 'autre',
    justificatif_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categoriesOptions = [
    { value: 'equipement', label: 'Équipement sportif' },
    { value: 'transport', label: 'Transport' },
    { value: 'arbitrage', label: 'Arbitrage' },
    { value: 'medical', label: 'Médical' },
    { value: 'autre', label: 'Autre' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.libelle || formData.montant <= 0) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const { error } = await depensesSport.create({
        type_sport: typeSport,
        libelle: formData.libelle,
        montant: formData.montant,
        date_depense: formData.date_depense,
        categorie: formData.categorie,
        justificatif_url: formData.justificatif_url || null,
        approuve_par: currentUser?.id || null
      })
      
      if (error) throw error
      
      onSuccess()
      onClose()
      resetForm()
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'enregistrement de la dépense')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      libelle: '',
      montant: 0,
      date_depense: new Date().toISOString().split('T')[0],
      categorie: 'autre',
      justificatif_url: ''
    })
    setError('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Nouvelle dépense - Sport {typeSport === 'e2d' ? 'E2D' : 'Phoenix'}
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

        <div className="bg-orange-50 border border-orange-200 p-3 rounded mb-4">
          <div className="flex items-start">
            <Receipt className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-800">
              <strong>Information :</strong>
              <ul className="mt-1 list-disc list-inside">
                <li>Toutes les dépenses doivent être justifiées</li>
                <li>Les dépenses sont approuvées par les responsables sport</li>
                <li>Un justificatif (facture, reçu) est recommandé</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Libellé de la dépense *</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.libelle}
              onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
              placeholder="Ex: Achat de ballons de football"
            />
          </div>

          <div>
            <label className="form-label">Montant (FCFA) *</label>
            <input
              type="number"
              required
              min="100"
              step="100"
              className="form-input"
              value={formData.montant}
              onChange={(e) => setFormData({ ...formData, montant: parseInt(e.target.value) || 0 })}
              placeholder="Ex: 25000"
            />
          </div>

          <div>
            <label className="form-label">Date de la dépense *</label>
            <input
              type="date"
              required
              className="form-input"
              value={formData.date_depense}
              onChange={(e) => setFormData({ ...formData, date_depense: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Catégorie *</label>
            <select
              required
              className="form-input"
              value={formData.categorie}
              onChange={(e) => setFormData({ ...formData, categorie: e.target.value as any })}
            >
              {categoriesOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Justificatif (URL)</label>
            <div className="flex space-x-2">
              <input
                type="url"
                className="form-input flex-1"
                placeholder="https://exemple.com/facture.pdf"
                value={formData.justificatif_url}
                onChange={(e) => setFormData({ ...formData, justificatif_url: e.target.value })}
              />
              <button
                type="button"
                className="btn-secondary px-3"
                title="Télécharger un justificatif"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Facture, reçu ou tout autre justificatif de la dépense
            </p>
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
              disabled={loading || !formData.libelle || formData.montant <= 0}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer la dépense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}