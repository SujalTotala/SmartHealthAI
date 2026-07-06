import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle, ArrowRight, ShieldCheck, 
  Package, UserCheck, Bed, Activity, ClipboardList 
} from 'lucide-react';

export default function RedistributionModule({ state, onExecuteAction, executionLog, t }) {
  const { recommendations } = state;
  const [filterType, setFilterType] = useState("all");

  const filterTabs = [
    { id: "all", label: "All Recommendations", icon: Sparkles },
    { id: "medicine_transfer", label: "Medicines", icon: Package },
    { id: "doctor_shift", label: "Staff Cover", icon: UserCheck },
    { id: "bed_redirection", label: "Bed Redirection", icon: Bed },
    { id: "diagnostic_redirect", label: "Diagnostic Redirects", icon: Activity }
  ];

  const filteredRecs = filterType === "all"
    ? recommendations
    : recommendations.filter(r => r.type === filterType);

  const getPriorityClass = (priority) => {
    if (priority === 'High') return 'bg-rose-500/10 border-rose-500/35 text-rose-400';
    return 'bg-amber-500/10 border-amber-500/35 text-amber-400';
  };

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'medicine_transfer': return <Package className="h-5 w-5 text-teal-400" />;
      case 'doctor_shift': return <UserCheck className="h-5 w-5 text-sky-400" />;
      case 'bed_redirection': return <Bed className="h-5 w-5 text-indigo-400" />;
      default: return <Activity className="h-5 w-5 text-violet-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">{t('redistribution')}</h2>
        <p className="text-xs text-slate-400">Review automated AI resource reallocation proposals, balance medicine stock outs, and optimize staff distributions.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-900 overflow-x-auto whitespace-nowrap gap-1 pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = filterType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                isActive 
                  ? 'border-teal-500 text-teal-400 bg-teal-500/5' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.id === 'all' ? (
                <span className="ml-1 bg-slate-800 text-slate-350 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {recommendations.length}
                </span>
              ) : (
                recommendations.filter(r => r.type === tab.id).length > 0 && (
                  <span className="ml-1 bg-teal-950 text-teal-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-teal-500/20">
                    {recommendations.filter(r => r.type === tab.id).length}
                  </span>
                )
              )}
            </button>
          );
        })}
      </div>

      {/* Body Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Recommendations List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredRecs.length === 0 ? (
            <div className="glass-panel p-8 text-center flex flex-col items-center justify-center space-y-3 min-h-[300px]">
              <ShieldCheck className="h-10 w-10 text-emerald-500/90" />
              <h3 className="text-sm font-bold text-white">System in Perfect Balance</h3>
              <p className="text-xs text-slate-400 max-w-sm">No deficits, stockouts, absenteeism coverage problems, or diagnostic bottlenecks detected in this category.</p>
            </div>
          ) : (
            filteredRecs.map((rec) => (
              <div 
                key={rec.id} 
                className="glass-panel p-5 space-y-4 hover:border-slate-700/60 transition-all flex flex-col justify-between"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-850">
                      {getCategoryIcon(rec.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{rec.title}</h4>
                      <span className="text-[10px] text-slate-400 capitalize">{rec.type.replace("_", " ")}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${getPriorityClass(rec.priority)}`}>
                    {rec.priority} Priority
                  </span>
                </div>

                <div className="p-3.5 bg-navy-950/70 border border-slate-850 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-teal-400 leading-relaxed">{rec.message}</p>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{rec.details}</p>
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="text-[9px] text-slate-500">
                    Calculated by prediction engine
                  </div>
                  
                  <button
                    id={`btn_hub_execute_${rec.id}`}
                    onClick={() => onExecuteAction(rec.action)}
                    className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 active:scale-98 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-500/10"
                  >
                    <span>{t('approveExecute')}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Side: Execution Log / Audits */}
        <div className="glass-panel p-5 space-y-4 h-fit">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
            <ClipboardList className="h-4.5 w-4.5 text-teal-400" />
            <h3 className="text-sm font-semibold text-white">Redistribution Activity Log</h3>
          </div>

          {executionLog.length === 0 ? (
            <div className="py-8 text-center text-[10px] text-slate-500 italic">
              No actions approved or executed in this session yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {executionLog.map((log) => (
                <div key={log.id} className="p-3 bg-slate-900/50 border border-slate-850 rounded-lg space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="text-[10px] font-bold text-white capitalize">{log.type.replace("_", " ")}</span>
                    <span className="text-[9px] text-slate-500 ml-auto">{log.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-350 leading-relaxed font-medium">{log.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
