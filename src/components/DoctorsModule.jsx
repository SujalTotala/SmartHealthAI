import React from 'react';
import { UserCheck, ShieldAlert, ArrowRight, Star, Clock } from 'lucide-react';

export default function DoctorsModule({ state, selectedCentreId, onExecuteAction, t }) {
  const { centres } = state;

  // Filter centers
  const activeCentres = selectedCentreId === 'all' 
    ? centres 
    : centres.filter(c => c.id === selectedCentreId);

  // Flatten doctor list
  const doctorRoster = [];
  activeCentres.forEach(centre => {
    centre.doctors.forEach(doc => {
      doctorRoster.push({
        centreId: centre.id,
        centreName: centre.name,
        ...doc
      });
    });
  });

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'Present': return 'bg-emerald-500 text-emerald-400 border-emerald-500/30';
      case 'On Leave': return 'bg-amber-500 text-amber-400 border-amber-500/30';
      default: return 'bg-red-500 text-red-400 border-red-500/30';
    }
  };

  const getRiskColorClass = (risk) => {
    switch (risk) {
      case 'High': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'Medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  // Find active staff shift recommendations for this doctor's clinic
  const findStaffRecommendation = (centreId) => {
    return state.recommendations.find(
      r => r.type === "doctor_shift" && r.action.targetId === centreId
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">{t('doctors')}</h2>
        <p className="text-xs text-slate-400">Track doctor shift check-ins, analyze attendance percentages, and review AI absenteeism predictions.</p>
      </div>

      {/* Staff Redistribution alerts */}
      {selectedCentreId !== 'all' && (
        (() => {
          const rec = findStaffRecommendation(selectedCentreId);
          if (!rec) return null;
          return (
            <div className="p-4 bg-teal-500/5 border border-teal-500/25 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[9px] bg-teal-500/20 border border-teal-500/30 text-teal-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{t('staffReallocation')}</span>
                <h4 className="text-xs font-bold text-white mt-1.5">{rec.title}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{rec.message}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{rec.details}</p>
              </div>
              <button
                id={`btn_doc_realloc_approve_${rec.id}`}
                onClick={() => onExecuteAction(rec.action)}
                className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0"
              >
                <span>Deploy Staff Coverage</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          );
        })()
      )}

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {doctorRoster.length === 0 ? (
          <div className="col-span-3 p-8 text-center text-slate-500 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl">
            No doctors registered in the selected centers.
          </div>
        ) : (
          doctorRoster.map((doc) => {
            const hasRec = findStaffRecommendation(doc.centreId) && doc.status === 'Absent';
            
            return (
              <div 
                key={doc.id} 
                className="glass-panel p-5 space-y-4 hover:border-slate-700/60 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Name and Clinic */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white">{doc.name}</h3>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{doc.specialty}</p>
                      {selectedCentreId === 'all' && (
                        <span className="inline-block text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded mt-1.5">
                          {doc.centreName}
                        </span>
                      )}
                    </div>

                    {/* Status Circle Badge */}
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${getStatusColorClass(doc.status)}`}></span>
                      <span className="text-[10px] font-bold text-slate-350">{doc.status}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-850 my-2"></div>

                  {/* Attendance Stats */}
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="space-y-1">
                      <span className="text-slate-500 block">Attendance Rate</span>
                      <div className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500/10" />
                        <span className="font-bold text-white">{doc.attendanceRate}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 block">{t('absentRisk')}</span>
                      <span className={`inline-block px-1.5 py-0.5 rounded font-bold border ${getRiskColorClass(doc.absenteeismRisk)}`}>
                        {doc.absenteeismRisk}
                      </span>
                    </div>
                  </div>

                  {/* Shift details */}
                  <div className="flex items-center gap-2 mt-4 p-2 bg-slate-900/40 border border-slate-850 rounded-lg text-[10px] text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span>Check-In: <strong className="text-slate-200 font-semibold">{doc.checkIn}</strong> • Shift: <strong className="text-slate-200 font-semibold">{doc.shift}</strong></span>
                  </div>
                </div>

                {/* Cover staff helper button for absent doctors */}
                {hasRec && (
                  <button
                    onClick={() => onExecuteAction(findStaffRecommendation(doc.centreId).action)}
                    className="mt-4 flex items-center justify-between bg-teal-500/10 border border-teal-500/20 text-teal-400 hover:bg-teal-500 hover:text-white text-[10px] font-bold py-1.5 px-3 rounded-lg transition-colors"
                  >
                    <span>Request AI Staff Cover</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
