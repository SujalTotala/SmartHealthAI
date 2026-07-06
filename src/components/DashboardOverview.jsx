import React from 'react';
import { 
  Users, Bed, AlertTriangle, UserCheck, Flame, 
  MapPin, Settings, AlertCircle, RefreshCw, ArrowRight 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function DashboardOverview({ state, onSelectCentre, onExecuteAction, onTriggerOutbreak, onTriggerFailure, onResetData, onAdvanceDay, t }) {
  const { centres, alerts, timeline } = state;

  // District Calculations
  const totalPatients = centres.reduce((sum, c) => sum + c.patients.todayCount, 0);
  const totalGeneralCapacity = centres.reduce((sum, c) => sum + c.beds.general.total, 0);
  const occupiedGeneralBeds = centres.reduce((sum, c) => sum + c.beds.general.occupied, 0);
  
  const totalICUCapacity = centres.reduce((sum, c) => sum + c.beds.icu.total, 0);
  const occupiedICUBeds = centres.reduce((sum, c) => sum + c.beds.icu.occupied, 0);

  const medicineShortageCount = centres.reduce((sum, c) => {
    return sum + c.medicines.filter(m => m.stock < m.threshold).length;
  }, 0);

  const activeEquipmentFailures = centres.reduce((sum, c) => {
    return sum + c.diagnostics.filter(d => d.status === "Equipment Failure").length;
  }, 0);

  const totalDoctors = centres.reduce((sum, c) => sum + c.doctors.length, 0);
  const presentDoctors = centres.reduce((sum, c) => {
    return sum + c.doctors.filter(d => d.status === "Present").length;
  }, 0);
  const doctorAttendanceRate = Math.round((presentDoctors / totalDoctors) * 100);

  // Chart data
  const clinicPatientData = centres.map(c => ({
    name: c.name,
    Patients: c.patients.todayCount,
    Waiting: c.patients.waitingTime
  }));

  // AI recommendations related to current dashboard context
  const activeRecs = state.recommendations.slice(0, 3);

  // Helper to determine clinic status color (Green/Amber/Red)
  const getClinicStatusClass = (centre) => {
    const hasFailure = centre.diagnostics.some(d => d.status === "Equipment Failure");
    const hasStockout = centre.medicines.some(m => m.stock === 0);
    const icuFull = centre.beds.icu.total > 0 && (centre.beds.icu.occupied === centre.beds.icu.total);
    
    if (hasFailure || hasStockout || icuFull) return { color: "bg-red-500", text: "text-red-400", border: "border-red-500/50", glow: "glow-red" };
    
    const hasLowStock = centre.medicines.some(m => m.stock < m.threshold);
    const highICU = centre.beds.icu.total > 0 && (centre.beds.icu.occupied / centre.beds.icu.total >= 0.85);
    const highGen = centre.beds.general.occupied / centre.beds.general.total >= 0.85;

    if (hasLowStock || highICU || highGen) return { color: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/50", glow: "glow-amber" };
    
    return { color: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/50", glow: "glow-green" };
  };

  return (
    <div className="space-y-6">
      
      {/* Simulation & Environment Status Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gradient-to-r from-teal-950/40 via-slate-900/60 to-navy-950 border border-teal-500/20 rounded-2xl gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-teal-400 uppercase">{t('simulationControls')}</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold text-white">Day {timeline.day}</span>
            <span className="text-slate-500">•</span>
            <span className="text-sm text-slate-300">{timeline.date} ({timeline.season} Season)</span>
            <span className="text-slate-500">•</span>
            <span className="text-xs bg-teal-500/10 border border-teal-500/30 text-teal-400 rounded px-1.5 py-0.5">{timeline.weather}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            id="btn_sim_outbreak"
            onClick={onTriggerOutbreak} 
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-950/40 border border-red-800/40 hover:border-red-500 text-red-400 rounded-xl transition-all"
          >
            <Flame className="h-3.5 w-3.5" />
            {t('triggerOutbreak')}
          </button>
          <button 
            id="btn_sim_failure"
            onClick={onTriggerFailure} 
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-950/40 border border-amber-800/40 hover:border-amber-500 text-amber-400 rounded-xl transition-all"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            {t('triggerFailure')}
          </button>
          <button 
            id="btn_sim_reset"
            onClick={onResetData} 
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-white rounded-xl transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t('resetSimulation')}
          </button>
          
          <button
            id="btn_sim_advance"
            onClick={onAdvanceDay}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-teal-500 hover:bg-teal-600 text-white rounded-xl shadow-lg shadow-teal-500/15 hover:scale-102 active:scale-98 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
            {t('advanceTimeline')}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Card 1: Patients */}
        <div className="glass-panel p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Patients Today</span>
            <Users className="h-5 w-5 text-sky-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">{totalPatients}</h3>
            <p className="text-[10px] text-sky-400/80 font-medium mt-1">District load active</p>
          </div>
        </div>

        {/* Card 2: General Beds */}
        <div className="glass-panel p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">{t('generalBeds')}</span>
            <Bed className="h-5 w-5 text-teal-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">{totalGeneralCapacity - occupiedGeneralBeds} <span className="text-xs text-slate-500">/ {totalGeneralCapacity}</span></h3>
            <p className="text-[10px] text-teal-400/80 font-medium mt-1">Vacant general beds</p>
          </div>
        </div>

        {/* Card 3: ICU Beds */}
        <div className="glass-panel p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">{t('icuBeds')}</span>
            <AlertTriangle className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">{totalICUCapacity - occupiedICUBeds} <span className="text-xs text-slate-500">/ {totalICUCapacity}</span></h3>
            <p className="text-[10px] text-indigo-400/80 font-medium mt-1">Critical care vacancies</p>
          </div>
        </div>

        {/* Card 4: Medicine Shortages */}
        <div className="glass-panel p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">{t('medShortages')}</span>
            <AlertCircle className="h-5 w-5 text-rose-500" />
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-bold ${medicineShortageCount > 0 ? 'text-rose-500' : 'text-white'}`}>{medicineShortageCount}</h3>
            <p className="text-[10px] text-rose-400/80 font-medium mt-1">Deficit inventory warning</p>
          </div>
        </div>

        {/* Card 5: Staff Attendance */}
        <div className="glass-panel p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">{t('staffAttendance')}</span>
            <UserCheck className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">{doctorAttendanceRate}%</h3>
            <p className="text-[10px] text-emerald-400/80 font-medium mt-1">{presentDoctors} doctors active</p>
          </div>
        </div>

        {/* Card 6: Equipment Failures */}
        <div className="glass-panel p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Device Failures</span>
            <Settings className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-bold ${activeEquipmentFailures > 0 ? 'text-amber-500' : 'text-white'}`}>{activeEquipmentFailures}</h3>
            <p className="text-[10px] text-amber-400/80 font-medium mt-1">Diagnostic items offline</p>
          </div>
        </div>

      </div>

      {/* Interactive Map & Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive District Map Node Render */}
        <div className="glass-panel p-5 lg:col-span-7 flex flex-col justify-between min-h-[380px]">
          <div>
            <h3 className="text-base font-semibold text-white">Geographical Clinic Status Map</h3>
            <p className="text-xs text-slate-400">Click a clinic pin to focus dashboard filters. Connector lines highlight AI transfer routes.</p>
          </div>

          <div className="relative flex-1 bg-navy-950/60 rounded-xl border border-slate-800/50 mt-4 overflow-hidden flex items-center justify-center p-4 min-h-[260px] grid-bg">
            
            {/* SVG Visual lines for Medicine Transfer recommendations */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {state.recommendations
                .filter(rec => rec.type === "medicine_transfer")
                .map((rec) => {
                  const srcCentre = centres.find(c => c.id === rec.action.sourceId);
                  const destCentre = centres.find(c => c.id === rec.action.targetId);
                  if (!srcCentre || !destCentre) return null;
                  
                  // Scale coordinates to fitting box
                  const x1 = `${srcCentre.coordinates.x}%`;
                  const y1 = `${srcCentre.coordinates.y}%`;
                  const x2 = `${destCentre.coordinates.x}%`;
                  const y2 = `${destCentre.coordinates.y}%`;

                  return (
                    <g key={rec.id}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        className="stroke-teal-500/40"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                      />
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        className="stroke-teal-400 animate-[pulse-slow_2s_infinite]"
                        strokeWidth="3.5"
                        strokeDasharray="8 6"
                      />
                    </g>
                  );
                })}
            </svg>

            {/* Geographical Nodes */}
            {centres.map(centre => {
              const status = getClinicStatusClass(centre);
              return (
                <button
                  key={centre.id}
                  onClick={() => onSelectCentre(centre.id)}
                  style={{ left: `${centre.coordinates.x}%`, top: `${centre.coordinates.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center z-10"
                >
                  {/* Glowing Node Circle */}
                  <span className={`relative flex h-5 w-5 rounded-full border border-slate-900 ${status.color} ${status.glow} cursor-pointer`}>
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 bg-current`}></span>
                  </span>
                  
                  {/* Floating Hover Card */}
                  <div className="absolute top-6 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg shadow-xl text-left pointer-events-none w-48">
                    <p className="text-xs font-bold text-white">{centre.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{centre.type} • {centre.district}</p>
                    <div className="border-t border-slate-800 mt-1.5 pt-1 space-y-0.5 text-[9px] text-slate-300">
                      <p>Patients: {centre.patients.todayCount} (Wait: {centre.patients.waitingTime}m)</p>
                      <p>ICU Beds: {centre.beds.icu.occupied}/{centre.beds.icu.total}</p>
                      <p>Medicines Low: {centre.medicines.filter(m => m.stock < m.threshold).length}</p>
                    </div>
                  </div>
                  
                  {/* Clinic Abbreviated Label */}
                  <span className="text-[10px] font-bold text-slate-300 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800 mt-1">
                    {centre.name.replace("PHC ", "").replace("CHC ", "")}
                  </span>
                </button>
              );
            })}

            {/* Map Legend */}
            <div className="absolute bottom-2.5 right-2.5 bg-slate-900/90 border border-slate-850 px-2 py-1.5 rounded-lg text-[9px] space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-300">Operational Stable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                <span className="text-slate-300">Warning / Deficits</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                <span className="text-slate-300">Critical / Stockout / Failures</span>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Load Visual Comparison */}
        <div className="glass-panel p-5 lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">District Clinic Comparison</h3>
            <p className="text-xs text-slate-400">Total patients load vs clinic waiting times.</p>
          </div>

          <div className="h-60 mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clinicPatientData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#14b8a6', fontSize: '11px' }}
                />
                <Bar dataKey="Patients" fill="#14b8a6" radius={[4, 4, 0, 0]}>
                  {clinicPatientData.map((entry, index) => {
                    const isCHC = entry.name.includes("CHC");
                    return <Cell key={`cell-${index}`} fill={isCHC ? '#14b8a6' : '#0ea5e9'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-900 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-teal-500"></span>
              <span>CHC (Community Health Centre)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-sky-500"></span>
              <span>PHC (Primary Health Centre)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Top AI Action Recommendations */}
      <div className="glass-panel p-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">{t('aiRecommendations')}</h3>
            <p className="text-xs text-slate-400">AI prediction engine recommendations for district supply optimization.</p>
          </div>
        </div>

        {activeRecs.length === 0 ? (
          <div className="flex items-center justify-center p-6 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
            <p className="text-xs text-slate-500">{t('noRecommendations')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeRecs.map((rec) => (
              <div key={rec.id} className="flex flex-col justify-between p-4 bg-navy-950/70 border border-slate-800/80 rounded-xl hover:border-teal-500/30 transition-colors">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-bold text-white">{rec.title}</h4>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${
                      rec.priority === 'High' 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-xs text-teal-400 font-semibold mt-2 leading-relaxed">{rec.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{rec.details}</p>
                </div>
                
                <button
                  id={`btn_rec_approve_${rec.id}`}
                  onClick={() => onExecuteAction(rec.action)}
                  className="mt-4 flex items-center justify-center gap-1.5 w-full bg-teal-500 hover:bg-teal-600 active:scale-98 text-white text-xs font-bold rounded-lg py-2 transition-all"
                >
                  <span>{t('approveExecute')}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
