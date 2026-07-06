import React from 'react';
import { Bed, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getPredictions } from '../utils/aiEngine';

export default function BedsModule({ state, selectedCentreId, onExecuteAction, t }) {
  const { centres, timeline } = state;

  // Filter centres
  const activeCentres = selectedCentreId === 'all' 
    ? centres 
    : centres.filter(c => c.id === selectedCentreId);

  // Aggregate bed capacity
  const bedsAgg = {
    general: { occupied: 0, total: 0 },
    icu: { occupied: 0, total: 0 },
    pediatric: { occupied: 0, total: 0 },
    emergency: { occupied: 0, total: 0 }
  };

  activeCentres.forEach(c => {
    Object.keys(bedsAgg).forEach(type => {
      bedsAgg[type].occupied += c.beds[type].occupied;
      bedsAgg[type].total += c.beds[type].total;
    });
  });

  // Calculate 3-day occupancy forecast (aggregated)
  const forecastTimeline = [
    { name: 'Today', General: 0, ICU: 0 },
    { name: 'Tomorrow', General: 0, ICU: 0 },
    { name: 'Day +2', General: 0, ICU: 0 }
  ];

  activeCentres.forEach(c => {
    const pred = getPredictions(c, timeline).bedOccupancyHistory;
    // Map data
    forecastTimeline[0].General += pred[0].general;
    forecastTimeline[0].ICU += pred[0].icu;
    forecastTimeline[1].General += pred[1].general;
    forecastTimeline[1].ICU += pred[1].icu;
    forecastTimeline[2].General += pred[2].general;
    forecastTimeline[2].ICU += pred[2].icu;
  });

  // Find active bed recommendations
  const activeBedRecs = state.recommendations.filter(r => r.type === "bed_redirection");

  // Determine severity class for indicators
  const getOccColorClass = (occ, total) => {
    if (total === 0) return 'text-slate-500 bg-slate-900 border-slate-800';
    const rate = occ / total;
    if (rate === 1.0) return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
    if (rate >= 0.85) return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">{t('beds')}</h2>
        <p className="text-xs text-slate-400">Monitor bed occupancy rates, identify capacity critical nodes, and allocate admissions to nearby facilities.</p>
      </div>

      {/* Bed Type Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.keys(bedsAgg).map((bedType) => {
          const item = bedsAgg[bedType];
          const rate = item.total > 0 ? Math.round((item.occupied / item.total) * 100) : 0;
          const statusClass = getOccColorClass(item.occupied, item.total);
          
          return (
            <div key={bedType} className="glass-panel p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white capitalize">{bedType} Care</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${statusClass}`}>
                  {rate}% Occupied
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full rounded-full ${
                      rate === 100 ? 'bg-rose-500' : rate >= 85 ? 'bg-amber-500' : 'bg-teal-500'
                    }`} 
                    style={{ width: `${rate}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>{item.occupied} Occupied</span>
                  <span>{item.total} Total Beds</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Occupancy forecasts and redistribution options */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Occupancy Forecast AreaChart */}
        <div className="glass-panel p-5 lg:col-span-7 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">{t('bedOccupancyForecast')}</h3>
            <p className="text-xs text-slate-400">AI prediction model mapping estimated occupancy values for the next 48 hours.</p>
          </div>

          <div className="h-60 mt-6 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastTimeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGeneral" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorICU" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="General" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorGeneral)" />
                <Area type="monotone" dataKey="ICU" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorICU)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI redistribution options */}
        <div className="glass-panel p-5 lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">{t('redistributeBeds')}</h3>
            <p className="text-xs text-slate-400">Active AI-suggested patient rerouting plans due to localized high capacities.</p>
          </div>

          <div className="mt-4 space-y-3.5 flex-1 flex flex-col justify-center">
            {activeBedRecs.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 bg-slate-900/20 border border-dashed border-slate-800 rounded-xl">
                <ShieldCheck className="h-8 w-8 text-emerald-500/80 mb-2" />
                <p className="text-xs font-semibold text-slate-350">Capacity Stable</p>
                <p className="text-[10px] text-slate-500 mt-0.5">All clinics reporting adequate bed availability.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeBedRecs.map((rec) => (
                  <div key={rec.id} className="p-4 bg-rose-500/5 border border-rose-500/25 rounded-xl space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[9px] bg-rose-500/20 border border-rose-500/30 text-rose-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Critical Occupancy</span>
                        <h4 className="text-xs font-bold text-white mt-1.5">{rec.title}</h4>
                      </div>
                      <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                    </div>
                    
                    <p className="text-xs text-slate-300 leading-relaxed">{rec.message}</p>
                    <p className="text-[10px] text-slate-400">{rec.details}</p>

                    <button
                      onClick={() => onExecuteAction(rec.action)}
                      className="flex items-center justify-center gap-1.5 w-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                    >
                      <span>Redirect ICU Admissions</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
