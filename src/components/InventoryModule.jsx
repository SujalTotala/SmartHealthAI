import React, { useState } from 'react';
import { Search, Plus, Calendar, AlertCircle, ArrowUpRight, ArrowRight, ShieldAlert } from 'lucide-react';
import { getPredictions } from '../utils/aiEngine';
import { INITIAL_MEDICINES_LIBRARY } from '../utils/mockData';

export default function InventoryModule({ state, selectedCentreId, onUpdateStock, onExecuteAction, role, t }) {
  const { centres, timeline } = state;
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Add form fields
  const [selectedClinicId, setSelectedClinicId] = useState(selectedCentreId === 'all' ? centres[0].id : selectedCentreId);
  const [selectedMedId, setSelectedMedId] = useState(INITIAL_MEDICINES_LIBRARY[0].id);
  const [addQty, setAddQty] = useState(200);
  const [expiryDate, setExpiryDate] = useState("2027-06-30");

  const canEdit = role === 'admin' || role === 'pharmacist';

  // Filter centers to list
  const activeCentres = selectedCentreId === 'all' 
    ? centres 
    : centres.filter(c => c.id === selectedCentreId);

  // Flatten and query medicine rows across active centers
  const medicineRows = [];
  activeCentres.forEach(centre => {
    // Generate AI predictions for this clinic's medicines
    const predictions = getPredictions(centre, timeline).medicinePredictions;

    centre.medicines.forEach(med => {
      const pred = predictions.find(p => p.medicineId === med.id) || {};
      
      if (
        searchTerm === "" || 
        (med.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (med.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (centre.name || "").toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        medicineRows.push({
          centreId: centre.id,
          centreName: centre.name,
          ...med,
          daysRemaining: pred.daysRemaining,
          daysToExpiry: pred.daysToExpiry,
          forecastStatus: pred.status
        });
      }
    });
  });

  const handleAddStockSubmit = (e) => {
    e.preventDefault();
    if (!canEdit) return;
    
    onUpdateStock(selectedClinicId, selectedMedId, parseInt(addQty), expiryDate);
    setShowAddForm(false);
  };

  const getStatusBadge = (med) => {
    if (med.stock === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-500/10 text-red-400 border border-red-500/25">
          <AlertCircle className="h-3 w-3" />
          {t('statusOut')}
        </span>
      );
    }
    if (med.stock < med.threshold) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
          <AlertCircle className="h-3 w-3" />
          {t('statusLow')}
        </span>
      );
    }
    if (med.daysToExpiry <= 30) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25">
          <Calendar className="h-3 w-3" />
          {t('statusExpiring')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
        {t('statusStable')}
      </span>
    );
  };

  // Find a transfer recommendation if it matches this low stock medicine
  const findTransferRec = (centreId, medId) => {
    return state.recommendations.find(
      r => r.type === 'medicine_transfer' && 
      r.action.targetId === centreId && 
      r.action.medicineId === medId
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">{t('inventory')}</h2>
          <p className="text-xs text-slate-400">Track and manage medicine stocks, monitor AI-predicted stockout rates, and approve replenishment redistributions.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search medicine or clinic..."
              className="w-full sm:w-64 bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          {/* Add Stock Button (Role Controlled) */}
          {canEdit ? (
            <button
              id="btn_add_stock_open"
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 active:scale-98 text-white text-xs font-bold rounded-xl px-4 py-2 transition-all shrink-0"
            >
              <Plus className="h-4 w-4" />
              {t('addMedicine')}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-500 bg-slate-900 border border-slate-850 rounded-xl cursor-not-allowed shrink-0" title="Pharmacist/Admin permissions required">
              <ShieldAlert className="h-4 w-4 text-slate-600" />
              <span>Read-Only</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="glass-panel overflow-hidden border border-slate-800/80">
        <div className="p-4 border-b border-slate-800 bg-slate-900/30">
          <h3 className="text-sm font-semibold text-white">{t('medTableTitle')} ({medicineRows.length} items)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-850 text-slate-400 font-semibold bg-slate-900/20">
                <th className="p-4">{t('medName')}</th>
                {selectedCentreId === 'all' && <th className="p-4">Health Centre</th>}
                <th className="p-4">{t('category')}</th>
                <th className="p-4">{t('stock')}</th>
                <th className="p-4">{t('dailyRate')}</th>
                <th className="p-4">{t('daysRemaining')}</th>
                <th className="p-4">{t('expiryDate')}</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {medicineRows.length === 0 ? (
                <tr>
                  <td colSpan={selectedCentreId === 'all' ? 9 : 8} className="p-8 text-center text-slate-500">
                    No medicines match the active search query or filter.
                  </td>
                </tr>
              ) : (
                medicineRows.map((row, idx) => {
                  const transferRec = findTransferRec(row.centreId, row.id);
                  const isExpiringSoon = row.daysToExpiry <= 30;

                  return (
                    <tr key={`${row.centreId}_${row.id}_${idx}`} className="border-b border-slate-850 hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 font-bold text-white">{row.name}</td>
                      {selectedCentreId === 'all' && (
                        <td className="p-4 text-slate-300 font-medium">{row.centreName}</td>
                      )}
                      <td className="p-4 text-slate-400">{row.category}</td>
                      <td className="p-4 font-semibold text-slate-200">
                        {row.stock} <span className="text-slate-500 text-[10px]">units</span>
                      </td>
                      <td className="p-4 text-slate-400">{row.dailyRate} / day</td>
                      <td className="p-4">
                        {row.stock === 0 ? (
                          <span className="text-rose-500 font-bold">Out of stock</span>
                        ) : (
                          <span className={`font-semibold ${row.daysRemaining <= 5 ? 'text-amber-500' : 'text-slate-350'}`}>
                            {row.daysRemaining} days
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400">
                        <span className={isExpiringSoon ? "text-rose-500 font-medium" : ""}>
                          {row.expiryDate}
                        </span>
                        {isExpiringSoon && (
                          <span className="block text-[9px] text-rose-500/80 font-medium mt-0.5">Expiring in {row.daysToExpiry}d</span>
                        )}
                      </td>
                      <td className="p-4">{getStatusBadge(row)}</td>
                      <td className="p-4 text-right">
                        {transferRec ? (
                          <button
                            id={`btn_table_execute_${transferRec.id}`}
                            onClick={() => onExecuteAction(transferRec.action)}
                            className="inline-flex items-center gap-1 bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500 hover:text-white px-2.5 py-1 rounded text-[10px] font-bold transition-all"
                            title={transferRec.message}
                          >
                            <span>Transfer</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">Balanced</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Overlay Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <h3 className="text-base font-bold text-white">Replenish Medicine Stock</h3>
              <button 
                onClick={() => setShowAddForm(false)} 
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStockSubmit} className="space-y-4 text-xs">
              
              {/* Select Clinic */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">Select Target Health Centre</label>
                <select
                  value={selectedClinicId}
                  onChange={(e) => setSelectedClinicId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                >
                  {centres.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Select Medicine Library Item */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">Select Medicine Item</label>
                <select
                  value={selectedMedId}
                  onChange={(e) => setSelectedMedId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                >
                  {INITIAL_MEDICINES_LIBRARY.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.category})</option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">Quantity to Add (Tablets/Packets)</label>
                <input 
                  type="number"
                  value={addQty}
                  onChange={(e) => setAddQty(Math.max(1, parseInt(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              {/* Expiry Date */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">Expiry Date</label>
                <input 
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-5 py-2 rounded-lg"
                >
                  {t('saveStock')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
