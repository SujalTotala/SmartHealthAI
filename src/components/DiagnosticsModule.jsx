import React from 'react';
import { Activity, ShieldAlert, ArrowRight, ShieldCheck, Clock, Users } from 'lucide-react';

export default function DiagnosticsModule({ state, selectedCentreId, onExecuteAction, t }) {
  const { centres } = state;

  // Filter centres
  const activeCentres = selectedCentreId === 'all' 
    ? centres 
    : centres.filter(c => c.id === selectedCentreId);

  // Flatten diagnostic tests
  const testList = [];
  activeCentres.forEach(centre => {
    centre.diagnostics.forEach(test => {
      testList.push({
        centreId: centre.id,
        centreName: centre.name,
        ...test
      });
    });
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Operational': return 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400';
      case 'Equipment Failure': return 'bg-rose-500/10 border-rose-500/25 text-rose-400 animate-pulse';
      default: return 'bg-slate-900 border-slate-800 text-slate-500';
    }
  };

  // Find redirections recommended by AI for this test and clinic
  const findRedirectionRec = (centreId, testId) => {
    return state.recommendations.find(
      r => r.type === "diagnostic_redirect" && 
      r.action.sourceId === centreId && 
      r.action.testId === testId
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">{t('diagnostics')}</h2>
        <p className="text-xs text-slate-400">Track diagnostic test machines, monitor device health indices, and redirect patient testing queues during device breakages.</p>
      </div>

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {testList.length === 0 ? (
          <div className="col-span-3 p-8 text-center text-slate-500 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl">
            No diagnostic services active for the selected health center.
          </div>
        ) : (
          testList.map((test, idx) => {
            const rec = findRedirectionRec(test.centreId, test.id);
            const isDown = test.status === "Equipment Failure";
            const isUnavailable = test.status === "Unavailable";
            
            return (
              <div 
                key={`${test.centreId}_${test.id}_${idx}`}
                className="glass-panel p-5 space-y-4 hover:border-slate-700/60 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white">{test.name}</h3>
                      {selectedCentreId === 'all' && (
                        <span className="inline-block text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded mt-1.5">
                          {test.centreName}
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${getStatusBadgeClass(test.status)}`}>
                      {test.status === 'Operational' ? t('operational') : test.status === 'Equipment Failure' ? t('failure') : t('unavailable')}
                    </span>
                  </div>

                  <div className="border-t border-slate-850"></div>

                  {/* Operational stats */}
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="flex items-center gap-1.5 p-2 bg-slate-900/40 border border-slate-850/80 rounded-lg">
                      <Users className="h-3.5 w-3.5 text-slate-500" />
                      <div>
                        <span className="text-slate-500 block">Queue Size</span>
                        <span className="font-bold text-slate-200">{isDown || isUnavailable ? '--' : `${test.queueSize} patients`}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 p-2 bg-slate-900/40 border border-slate-850/80 rounded-lg">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      <div>
                        <span className="text-slate-500 block">Average Turnaround</span>
                        <span className="font-bold text-slate-200">{test.averageTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Redirect Button */}
                {rec && (
                  <div className="mt-4 pt-3 border-t border-slate-900/40">
                    <p className="text-[10px] text-teal-400 font-semibold mb-2">{rec.message}</p>
                    <button
                      id={`btn_diag_redirect_${rec.id}`}
                      onClick={() => onExecuteAction(rec.action)}
                      className="flex items-center justify-between w-full bg-teal-500/10 border border-teal-500/20 text-teal-400 hover:bg-teal-500 hover:text-white text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all"
                    >
                      <span>{t('redirectTest')}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
