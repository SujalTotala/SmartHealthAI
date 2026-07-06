import React, { useState } from 'react';
import { Download, TrendingUp, BarChart4, Table, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsModule({ state, t }) {
  const { centres } = state;
  const [activeReport, setActiveReport] = useState("consumption");
  const [downloadMsg, setDownloadMsg] = useState("");

  // Rank clinics by overall occupancy
  const clinicRanks = centres.map(c => {
    const totalBeds = c.beds.general.total + c.beds.icu.total;
    const occupiedBeds = c.beds.general.occupied + c.beds.icu.occupied;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    
    return {
      name: c.name,
      BedsOccupied: occupiedBeds,
      OccupancyRate: occupancyRate,
      Patients: c.patients.todayCount,
      MedicineShortages: c.medicines.filter(m => m.stock < m.threshold).length
    };
  }).sort((a, b) => b.OccupancyRate - a.OccupancyRate);

  // Summarize district-wide medicine consumption
  const medicineTotals = {};
  centres.forEach(c => {
    c.medicines.forEach(m => {
      if (!medicineTotals[m.id]) {
        medicineTotals[m.id] = { name: m.name, category: m.category, totalStock: 0, totalDailyRate: 0, clinicsLow: 0 };
      }
      medicineTotals[m.id].totalStock += m.stock;
      medicineTotals[m.id].totalDailyRate += m.dailyRate;
      if (m.stock < m.threshold) {
        medicineTotals[m.id].clinicsLow++;
      }
    });
  });

  const medicineSummaryList = Object.keys(medicineTotals).map(id => ({
    id,
    ...medicineTotals[id]
  }));

  const triggerDownload = (format) => {
    setDownloadMsg(`Preparing ${format.toUpperCase()} report...`);
    setTimeout(() => {
      setDownloadMsg(`Success! ${format.toUpperCase()} report for District Clinics exported to download folder.`);
      setTimeout(() => setDownloadMsg(""), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">{t('reports')}</h2>
          <p className="text-xs text-slate-400">Generate district performance analyses, medicine consumption summaries, and export regulatory audit files.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => triggerDownload("excel")}
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-350 px-4.5 py-2 rounded-xl text-xs font-semibold transition-all"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>{t('exportExcel')}</span>
          </button>
          <button
            onClick={() => triggerDownload("pdf")}
            className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 text-white px-4.5 py-2 rounded-xl text-xs font-bold transition-all"
          >
            <Download className="h-4 w-4 text-teal-100" />
            <span>{t('exportPDF')}</span>
          </button>
        </div>
      </div>

      {/* Download Alert Toast */}
      {downloadMsg && (
        <div className="p-3 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold rounded-xl animate-pulse">
          {downloadMsg}
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-900 gap-1 pb-1">
        <button
          onClick={() => setActiveReport("consumption")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeReport === 'consumption'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Table className="h-4 w-4" />
          <span>{t('weeklyReport')}</span>
        </button>
        <button
          onClick={() => setActiveReport("performance")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeReport === 'performance'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart4 className="h-4 w-4" />
          <span>{t('monthlyReport')}</span>
        </button>
      </div>

      {/* Report views */}
      {activeReport === "consumption" ? (
        
        /* Table: Medicine totals */
        <div className="glass-panel overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/30">
            <h3 className="text-sm font-semibold text-white">District-Wide Medicine Consolidation Report</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 font-semibold bg-slate-900/20">
                  <th className="p-4">Medicine Item</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Total District Stock</th>
                  <th className="p-4">Total Daily Burn Rate</th>
                  <th className="p-4">Deficit Centers</th>
                  <th className="p-4">Est. District Burnout (Days)</th>
                </tr>
              </thead>
              <tbody>
                {medicineSummaryList.map((med) => {
                  const estDistrictDays = med.totalStock > 0 ? Math.round(med.totalStock / med.totalDailyRate) : 0;
                  
                  return (
                    <tr key={med.id} className="border-b border-slate-850 hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 font-bold text-white">{med.name}</td>
                      <td className="p-4 text-slate-400">{med.category}</td>
                      <td className="p-4 font-semibold text-slate-200">{med.totalStock} units</td>
                      <td className="p-4 text-slate-400">{med.totalDailyRate} units / day</td>
                      <td className="p-4">
                        {med.clinicsLow > 0 ? (
                          <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                            {med.clinicsLow} PHCs in deficit
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400">Balanced</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`font-semibold ${estDistrictDays <= 10 ? 'text-amber-500' : 'text-slate-350'}`}>
                          {estDistrictDays} days
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      ) : (

        /* Chart & Ranks: Performance metrics */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Bed Occupancy ranking chart */}
          <div className="glass-panel p-5 lg:col-span-7 flex flex-col justify-between min-h-[360px]">
            <div>
              <h3 className="text-sm font-semibold text-white">Bed Occupancy Rate Ranking (%)</h3>
              <p className="text-xs text-slate-400">Clinics ranked by active bed utilization.</p>
            </div>

            <div className="h-64 mt-6 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clinicRanks} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="OccupancyRate" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* District ranking stats */}
          <div className="glass-panel p-5 lg:col-span-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">{t('districtComparison')}</h3>
              <p className="text-xs text-slate-400">Overview of operational metrics by health facility.</p>
            </div>

            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {clinicRanks.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-850 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center bg-slate-850 border border-slate-800 text-[10px] text-teal-400 font-bold rounded-lg shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.name}</h4>
                      <p className="text-[9px] text-slate-500 mt-0.5">{item.Patients} daily patients</p>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-[10px] text-slate-400 font-medium block">Occupancy: <strong className="text-white">{item.OccupancyRate}%</strong></span>
                    {item.MedicineShortages > 0 ? (
                      <span className="text-[8px] bg-red-500/10 border border-red-500/20 text-red-400 px-1 py-0.5 rounded font-bold uppercase tracking-wider">
                        {item.MedicineShortages} items short
                      </span>
                    ) : (
                      <span className="text-[8px] text-emerald-400 block font-medium">Stock Stable</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      )}

    </div>
  );
}
