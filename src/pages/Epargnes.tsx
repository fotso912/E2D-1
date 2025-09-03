import { useState, useEffect } from 'react'
import { Plus, Search, DollarSign, Calendar, TrendingUp, Eye, Edit, Trash2, Download } from 'lucide-react'
import { epargnes, membres, configurations } from '../lib/supabase'
import { formatCurrency, formatDate } from '../lib/utils'

interface Epargne {
  id: string
  membre_id: string
  montant: number
  date_depot: string
  exercice: number
  statut: 'active' | 'remboursee'
  date_remboursement: string | null
  interets_recus: number
  created_at: string
  membre?: {
    nom: string
    prenom: string
    photo_url: string | null
  }
}

export function Epargnes() {
  const [epargnessData, setEpargnesData] = useState<Epargne[]>([])
  const [membresData, setMembresData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [exerciceFilter, setExerciceFilter] = useState<number>(new Date().getFullYear())
  const [statusFilter, setStatusFilter] = useState<'tous' | 'active' | 'remboursee'>('tous')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedEpargne, setSelectedEpargne] = useState<Epargne | null>(null)

  useEffect(() => {
    loadData()
  }, [exerciceFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Charger les membres actifs
      const { data: membresResult, error: membresError } = await membres.getAll()
      if (membresError) throw membresError
      setMembresData(membresResult?.filter(m => m.statut === 'actif') || [])

      // Charger les épargnes par exercice
      const { data: epargnessResult, error: epargnessError } = await epargnes.getByExercice(exerciceFilter)
      if (epargnessError) throw epargnessError
      setEpargnesData(epargnessResult || [])
      
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatutBadge = (statut: string) => {
    const styles = {
      active: 'bg-blue-100 text-blue-800',
      remboursee: 'bg-green-100 text-green-800'
    }
    const labels = {
      active: 'Active',
      remboursee: 'Remboursée'
    }
    return { 
      style: styles[statut as keyof typeof styles] || styles.active, 
      label: labels[statut as keyof typeof labels] || statut 
    }
  }

  const handleRembourser = async (epargneId: string) => {
    try {
      const { error } = await epargnes.update(epargneId, { 
        statut: 'remboursee',
        date_remboursement: new Date().toISOString().split('T')[0]
      })
      if (error) throw error
      loadData()
    } catch (error) {
      console.error('Erreur lors du remboursement:', error)
    }
  }

  const filteredEpargnes = epargnessData.filter(epargne => {
    const matchesSearch = epargne.membre ? 
      epargne.membre.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      epargne.membre.prenom.toLowerCase().includes(searchTerm.toLowerCase())
      : true
    
    const matchesStatus = statusFilter === 'tous' || epargne.statut === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: epargnessData.length,
    actives: epargnessData.filter(e => e.statut === 'active').length,
    remboursees: epargnessData.filter(e => e.statut === 'remboursee').length,
    montantTotal: epargnessData.filter(e => e.statut === 'active').reduce((sum, e) => sum + e.montant, 0),
    interetsDistribues: epargnessData.reduce((sum, e) => sum + e.interets_recus, 0)
  }

  const exercicesDisponibles = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Épargnes</h1>
          <p className="text-gray-600 mt-1">
            Exercice {exerciceFilter} • {stats.total} épargne{stats.total > 1 ? 's' : ''} • {stats.actives} active{stats.actives > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle épargne</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.actives}</div>
          <div className="text-sm text-gray-600">Épargnes actives</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{stats.remboursees}</div>
          <div className="text-sm text-gray-600">Épargnes remboursées</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(stats.montantTotal)}
          </div>
          <div className="text-sm text-gray-600">Capital total actif</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(stats.interetsDistribues)}
          </div>
          <div className="text-sm text-gray-600">Intérêts distribués</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Rechercher un membre</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Nom ou prénom..."
                className="form-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="form-label">Exercice</label>
            <select
              className="form-input"
              value={exerciceFilter}
              onChange={(e) => setExerciceFilter(parseInt(e.target.value))}
            >
              {exercicesDisponibles.map(exercice => (
                <option key={exercice} value={exercice}>{exercice}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="form-label">Statut</label>
            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="tous">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="remboursee">Remboursées</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadData}
              className="btn-secondary flex items-center space-x-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Actualiser</span>
            </button>
          </div>
        </div>
      </div>

      {/* Liste des épargnes */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Épargnant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant épargné
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de dépôt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Intérêts reçus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date remboursement
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEpargnes.map((epargne) => {
                const badge = getStatutBadge(epargne.statut)
                
                return (
                  <tr key={epargne.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {epargne.membre?.photo_url ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={epargne.membre.photo_url}
                              alt={`${epargne.membre.prenom} ${epargne.membre.nom}`}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {epargne.membre?.prenom?.[0]}{epargne.membre?.nom?.[0]}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {epargne.membre?.prenom} {epargne.membre?.nom}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(epargne.montant)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(epargne.date_depot)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(epargne.interets_recus)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badge.style}`}>
                        {badge.label}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {epargne.date_remboursement ? formatDate(epargne.date_remboursement) : '-'}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {epargne.statut === 'active' && (
                          <button
                            onClick={() => handleRembourser(epargne.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Rembourser"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedEpargne(epargne)
                            setShowEditModal(true)
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          {filteredEpargnes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {searchTerm || statusFilter !== 'tous'
                  ? 'Aucune épargne ne correspond aux critères'
                  : `Aucune épargne pour l'exercice ${exerciceFilter}`
                }
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Résumé par membre */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Résumé par épargnant - Exercice {exerciceFilter}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {membresData
            .filter(membre => epargnessData.some(e => e.membre_id === membre.id))
            .map(membre => {
              const epargnessMemb = epargnessData.filter(e => e.membre_id === membre.id)
              const montantTotal = epargnessMemb.reduce((sum, e) => sum + e.montant, 0)
              const interetsTotal = epargnessMemb.reduce((sum, e) => sum + e.interets_recus, 0)
              
              return (
                <div key={membre.id} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900 mb-1">
                    {membre.prenom} {membre.nom}
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(montantTotal)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Intérêts: {formatCurrency(interetsTotal)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {epargnessMemb.length} dépôt{epargnessMemb.length > 1 ? 's' : ''}
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* Calcul de redistribution des intérêts */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Calcul de redistribution des intérêts - Exercice {exerciceFilter}
        </h3>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-blue-900">Capital total épargné</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats.montantTotal)}
              </div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-900">Intérêts des prêts</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(0)} {/* À calculer depuis les prêts */}
              </div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-900">Intérêts distribués</div>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(stats.interetsDistribues)}
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button className="btn-primary">
              Calculer et distribuer les intérêts
            </button>
          </div>
        </div>
      </div>

      {/* Actions d'export */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Actions et rapports
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-secondary flex items-center justify-center space-x-2 p-4">
            <Download className="w-5 h-5" />
            <span>État des épargnes</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2 p-4">
            <Download className="w-5 h-5" />
            <span>Calcul des intérêts</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2 p-4">
            <Download className="w-5 h-5" />
            <span>Historique des remboursements</span>
          </button>
        </div>
      </div>
    </div>
  )
}