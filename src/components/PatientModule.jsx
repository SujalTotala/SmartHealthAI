import React from 'react';
import { Users, Clock, Flame, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { getPredictions } from '../utils/aiEngine';

export default function PatientModule({ state, selectedCentreId, onExecuteAction, t }) {
  const { centres, timeline } = state;

  // Filter centres
  const activeCentres = selectedCentreId === 'all' 
    ? centres 
    : centres.filter(c => c.id === selectedCentreId);

  // Aggregated Department Loads
  const deptLoadSum = { General: 0, Pediatrics: 0, Gynecology: 0, Emergency: 0 };
  let totalPatients = 0;
  let totalWaitTime = 0;
  let clinicCount = 0;

  activeCentres.forEach(c => {
    totalPatients += c.patients.todayCount;
    totalWaitTime += c.patients.waitingTime;
    clinicCount++;
    
    // Add department counts
    Object.keys(c.patients.departmentLoad).forEach(dept => {
      deptLoadSum[dept] = (deptLoadSum[dept] || 0) + c.patients.departmentLoad[dept];
    });
  });

  const avgWaitingTime = clinicCount > 0 ? Math.round(totalWaitTime / clinicCount) : 0;

  // Pie chart data
  const pieData = Object.keys(deptLoadSum).map(name => ({
    name,
    value: deptLoadSum[name]
  }));

  const COLORS = ['#0ea5e9', '#14b8a6', '#818cf8', '#f43f5e'];

  // Tomorrow's AI prediction calculations
  let totalPredictedLoad = 0;
  let overcrowdingRiskLevel = "Low";
  let peakHoursStr = "";

  activeCentres.forEach(c => {
    const pred = getPredictions(c, timeline).patientPrediction;
    totalPredictedLoad += pred.tomorrowLoad;
    if (pred.overcrowdingRisk === "High") overcrowdingRiskLevel = "High";
    peakHoursStr = pred.peakHours;
  });

  // Fetch patient redirection recommendations
  const patientRedirections = state.recommendations.filter(
    r => r.type === "bed_redirection" || r.type === "diagnostic_redirect"
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">{t('patients')}</h2>
        <p className="text-xs text-slate-400">Monitor daily patient intake, track clinic wait times, and view AI demand predictions for the next shift.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* KPI 1: Active Patient Load */}
        <div className="glass-panel p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">District Patient Load</span>
            <h3 className="text-xl font-bold text-white mt-0.5">{totalPatients} <span className="text-[10px] text-slate-400 font-normal">active today</span></h3>
          </div>
        </div>

        {/* KPI 2: Avg Waiting Time */}
        <div className="glass-panel p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Average Wait Time</span>
            <h3 className="text-xl font-bold text-white mt-0.5">
              {avgWaitingTime} {t('mins')}
              {avgWaitingTime > 35 && (
                <span className="ml-2 text-[10px] bg-red-500/15 border border-red-500/20 text-red-400 rounded px-1 py-0.5">Delayed</span>
              )}
            </h3>
          </div>
        </div>

        {/* KPI 3: Tomorrow's Load Forecast */}
        <div className="glass-panel p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">AI Forecast Tomorrow</span>
            <h3 className="text-xl font-bold text-white mt-0.5">{totalPredictedLoad} <span className="text-[10px] text-slate-400 font-normal">patients</span></h3>
          </div>
        </div>

        {/* KPI 4: Overcrowding Risk */}
        <div className="glass-panel p-4 flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            overcrowdingRiskLevel === 'High' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
          }`}>
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Overcrowding Threat</span>
            <h3 className={`text-xl font-bold mt-0.5 ${overcrowdingRiskLevel === 'High' ? 'text-rose-500' : 'text-emerald-400'}`}>
              {overcrowdingRiskLevel}
            </h3>
          </div>
        </div>

      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Departmental breakdown pie chart */}
        <div className="glass-panel p-5 lg:col-span-5 flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="text-sm font-semibold text-white">Department-Wise Patient Distribution</h3>
            <p className="text-xs text-slate-400">Load shares across primary departments.</p>
          </div>

          <div className="h-48 mt-4 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center label */}
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-bold text-white">{totalPatients}</span>
              <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Total</span>
            </div>
          </div>

          {/* Custom legend */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px]">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx] }}></span>
                <span className="text-slate-350">{item.name}:</span>
                <span className="text-white font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prediction parameters & overcrowding suggestions */}
        <div className="glass-panel p-5 lg:col-span-7 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">AI Patient Load Prediction Details</h3>
            <p className="text-xs text-slate-400">Predictive analysis accounts for weather, local outbreak risks, and seasonality.</p>
          </div>

          <div className="mt-4 p-4 bg-slate-900/40 border border-slate-850 rounded-xl space-y-3.5 text-xs text-slate-300">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Timeline / Date:</span>
              <span className="font-semibold text-white">Tomorrow, Day {timeline.day + 1}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Season Influence Multiplier:</span>
              <span className="font-semibold text-teal-400">
                {timeline.season === 'Monsoon' ? 'Monsoon Risk Factor (+25% Load)' : 'Stable Load (1.0x)'}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Estimated Peak Intake Hours:</span>
              <span className="font-semibold text-white">{peakHoursStr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Overcrowding Verdict:</span>
              <span className={`font-bold ${overcrowdingRiskLevel === 'High' ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                {overcrowdingRiskLevel === 'High' ? 'High Risk - Divert Admissions Recommended' : 'Nominal Waiting Queue'}
              </span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-900">
            <h4 className="text-xs font-semibold text-slate-400 mb-3">Redistribution Action Suggestions:</h4>
            {patientRedirections.length === 0 ? (
              <div className="p-3.5 text-center text-slate-500 bg-slate-900/20 border border-dashed border-slate-800 rounded-lg">
                No patient transfers or diversions are currently recommended.
              </div>
            ) : (
              <div className="space-y-2">
                {patientRedirections.slice(0, 2).map((rec) => (
                  <div key={rec.id} className="flex justify-between items-center p-3 bg-navy-950 border border-slate-850 rounded-lg">
                    <div>
                      <p className="text-[11px] font-bold text-white">{rec.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{rec.message}</p>
                    </div>
                    <button
                      onClick={() => onExecuteAction(rec.action)}
                      className="flex items-center gap-1 bg-teal-500/10 border border-teal-500/30 hover:bg-teal-500 hover:text-white text-teal-400 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shrink-0 ml-4"
                    >
                      <span>Approve</span>
                      <ArrowRight className="h-3 w-3" />
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
