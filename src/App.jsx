import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Hospital, Sparkles, AlertTriangle, ShieldCheck, 
  RefreshCw, LogOut, ChevronDown, CheckCircle,
  LayoutDashboard, Package, Users, Bed, UserCheck, 
  Activity, ClipboardList, BarChart3, AlertCircle, 
  MapPin, ShieldAlert, X, Settings
} from 'lucide-react';

import DashboardOverview from './components/DashboardOverview';
import InventoryModule from './components/InventoryModule';
import PatientModule from './components/PatientModule';
import BedsModule from './components/BedsModule';
import DoctorsModule from './components/DoctorsModule';
import DiagnosticsModule from './components/DiagnosticsModule';
import RedistributionModule from './components/RedistributionModule';
import ReportsModule from './components/ReportsModule';
import ChatbotModule from './components/ChatbotModule';
import LoginModule from './components/LoginModule';

import { 
  initialHealthCentres, 
  initialAlerts, 
  INITIAL_TIMELINE, 
  advanceSimulationDay,
  INITIAL_MEDICINES_LIBRARY
} from './utils/mockData';
import { generateAIRecommendations } from './utils/aiEngine';
import { getTranslator } from './utils/i18n';

export default function App() {
  const [language, setLanguage] = useState("en");
  const [role, setRole] = useState("admin");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [centres, setCentres] = useState(initialHealthCentres);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [timeline, setTimeline] = useState(INITIAL_TIMELINE);
  
  const [selectedCentreId, setSelectedCentreId] = useState("all");
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [recommendations, setRecommendations] = useState([]);
  const [executionLog, setExecutionLog] = useState([]);
  const [bannerAlert, setBannerAlert] = useState("");
  const [theme, setTheme] = useState("dark");
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);

  const t = getTranslator(language);

  // Auto-generate AI recommendations whenever clinic state changes
  useEffect(() => {
    const recs = generateAIRecommendations(centres);
    setRecommendations(recs);
  }, [centres]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setRole(user.role);
    setIsAuthenticated(true);
    setSelectedTab("dashboard");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setRole("admin");
  };

  // Toast banner manager
  const showBanner = (msg) => {
    setBannerAlert(msg);
    setTimeout(() => setBannerAlert(""), 4000);
  };

  // Helper to trigger confetti celebration
  const triggerSuccessConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#14b8a6', '#0ea5e9', '#6366f1']
    });
  };

  // 1. ADD / UPDATE INVENTORY STOCK
  const handleUpdateStock = (clinicId, medicineId, qty, expiryDate) => {
    setCentres(prevCentres => prevCentres.map(centre => {
      if (centre.id === clinicId) {
        const updatedMeds = centre.medicines.map(med => {
          if (med.id === medicineId) {
            return {
              ...med,
              stock: med.stock + qty,
              expiryDate: expiryDate || med.expiryDate
            };
          }
          return med;
        });
        return { ...centre, medicines: updatedMeds };
      }
      return centre;
    }));

    const medName = INITIAL_MEDICINES_LIBRARY.find(m => m.id === medicineId)?.name || "Medicine";
    const clinicName = centres.find(c => c.id === clinicId)?.name || "Clinic";
    
    // Log activity
    const newLog = {
      id: `log_add_${Date.now()}`,
      type: "inventory_update",
      message: `Replenished ${qty} units of ${medName} at ${clinicName}.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setExecutionLog(prev => [newLog, ...prev]);
    
    showBanner(`Successfully added ${qty} tablets of ${medName} to ${clinicName}!`);
    triggerSuccessConfetti();
  };

  // 2. EXECUTE AI REDISTRIBUTION RECOMMENDATION
  const handleExecuteRedistribution = (action) => {
    if (!action) return;

    if (action.type === "MEDICINE_TRANSFER") {
      const { sourceId, targetId, medicineId, quantity } = action;
      
      setCentres(prevCentres => prevCentres.map(c => {
        if (c.id === sourceId) {
          const updatedMeds = c.medicines.map(m => {
            if (m.id === medicineId) return { ...m, stock: Math.max(0, m.stock - quantity) };
            return m;
          });
          return { ...c, medicines: updatedMeds };
        }
        if (c.id === targetId) {
          const updatedMeds = c.medicines.map(m => {
            if (m.id === medicineId) return { ...m, stock: m.stock + quantity };
            return m;
          });
          return { ...c, medicines: updatedMeds };
        }
        return c;
      }));

      const medName = INITIAL_MEDICINES_LIBRARY.find(m => m.id === medicineId)?.name || "Medicine";
      const srcName = centres.find(c => c.id === sourceId).name;
      const targetName = centres.find(c => c.id === targetId).name;

      const logMsg = `Transferred ${quantity} units of ${medName} from ${srcName} to ${targetName}.`;
      setExecutionLog(prev => [{
        id: `log_med_${Date.now()}`,
        type: "medicine_transfer",
        message: logMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }, ...prev]);

      showBanner(logMsg);
      triggerSuccessConfetti();
    }

    if (action.type === "DOCTOR_SHIFT") {
      const { sourceId, targetId, doctorId, doctorName } = action;
      
      // Update checkin and location
      setCentres(prevCentres => prevCentres.map(c => {
        if (c.id === sourceId) {
          // Remove doctor temporarily or mark as relocated
          const updatedDocs = c.doctors.map(d => {
            if (d.id === doctorId) return { ...d, status: "On Leave", checkIn: "--" };
            return d;
          });
          return { ...c, doctors: updatedDocs };
        }
        if (c.id === targetId) {
          // Add doctor details
          const newDoc = {
            id: doctorId,
            name: doctorName,
            specialty: "General Medicine (Relocated)",
            status: "Present",
            checkIn: "09:30 AM (Relocated)",
            checkOut: "--",
            attendanceRate: 98,
            absenteeismRisk: "Low",
            shift: "Emergency Shift"
          };
          return { ...c, doctors: [...c.doctors, newDoc] };
        }
        return c;
      }));

      const srcName = centres.find(c => c.id === sourceId).name;
      const targetName = centres.find(c => c.id === targetId).name;

      const logMsg = `Deployed General Physician ${doctorName} from ${srcName} to cover shift at ${targetName}.`;
      setExecutionLog(prev => [{
        id: `log_doc_${Date.now()}`,
        type: "doctor_shift",
        message: logMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }, ...prev]);

      showBanner(logMsg);
      triggerSuccessConfetti();
    }

    if (action.type === "DIAGNOSTIC_REDIRECT") {
      const { sourceId, targetId, testId } = action;

      // Adjust queue size: deduct from failure clinic, shift to active clinic
      setCentres(prevCentres => prevCentres.map(c => {
        if (c.id === sourceId) {
          const updatedDiag = c.diagnostics.map(d => {
            if (d.id === testId) return { ...d, queueSize: 0 };
            return d;
          });
          return { ...c, diagnostics: updatedDiag };
        }
        if (c.id === targetId) {
          const updatedDiag = c.diagnostics.map(d => {
            if (d.id === testId) return { ...d, queueSize: d.queueSize + 4 };
            return d;
          });
          return { ...c, diagnostics: updatedDiag };
        }
        return c;
      }));

      const testName = centres[0].diagnostics.find(d => d.id === testId).name;
      const srcName = centres.find(c => c.id === sourceId).name;
      const targetName = centres.find(c => c.id === targetId).name;

      const logMsg = `Redirected ${testName} patient load from ${srcName} to ${targetName}.`;
      setExecutionLog(prev => [{
        id: `log_diag_${Date.now()}`,
        type: "diagnostic_redirect",
        message: logMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }, ...prev]);

      showBanner(logMsg);
      triggerSuccessConfetti();
    }

    if (action.type === "BED_REDIRECT") {
      const { sourceId, targetId, bedType } = action;

      setCentres(prevCentres => prevCentres.map(c => {
        if (c.id === sourceId) {
          const occ = Math.max(0, c.beds[bedType].occupied - 2);
          return { ...c, beds: { ...c.beds, [bedType]: { ...c.beds[bedType], occupied: occ } } };
        }
        if (c.id === targetId) {
          const occ = Math.min(c.beds[bedType].total, c.beds[bedType].occupied + 2);
          return { ...c, beds: { ...c.beds, [bedType]: { ...c.beds[bedType], occupied: occ } } };
        }
        return c;
      }));

      const srcName = centres.find(c => c.id === sourceId).name;
      const targetName = centres.find(c => c.id === targetId).name;

      const logMsg = `Diverted ${bedType.toUpperCase()} critical care patients from ${srcName} to vacant slots at ${targetName}.`;
      setExecutionLog(prev => [{
        id: `log_bed_${Date.now()}`,
        type: "bed_redirection",
        message: logMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }, ...prev]);

      showBanner(logMsg);
      triggerSuccessConfetti();
    }

    // Clean resolved recommendations from list manually by ID if needed (it triggers auto regeneration anyway)
  };

  // 3. ADVANCE TIMELINE DAY SIMULATION
  const handleAdvanceTimelineDay = () => {
    const nextState = advanceSimulationDay({ centres, alerts, timeline });
    setCentres(nextState.centres);
    setAlerts(nextState.alerts);
    setTimeline(nextState.timeline);
    
    showBanner(`Timeline Advanced! Welcome to Day ${nextState.timeline.day}. Forecast models updated.`);
  };

  // 4. SIMULATE OUTBREAK
  const handleTriggerOutbreak = () => {
    // Pick PHC Khuldabad or PHC Kannad
    const randomClinicId = Math.random() > 0.5 ? "phc_khuldabad" : "phc_kannad";
    
    setCentres(prevCentres => prevCentres.map(c => {
      if (c.id === randomClinicId) {
        // Increase patient count, general/pediatric occupancy, and drain ORS/Paracetamol
        const updatedMeds = c.medicines.map(m => {
          if (m.id === 'med_paracetamol' || m.id === 'med_ors') {
            return { ...m, stock: Math.max(0, m.stock - 60) };
          }
          return m;
        });

        const updatedBeds = {
          ...c.beds,
          general: { ...c.beds.general, occupied: c.beds.general.total },
          pediatric: { ...c.beds.pediatric, occupied: c.beds.pediatric.total }
        };

        return {
          ...c,
          medicines: updatedMeds,
          beds: updatedBeds,
          patients: {
            ...c.patients,
            todayCount: c.patients.todayCount + 80,
            waitingTime: c.patients.waitingTime + 25
          }
        };
      }
      return c;
    }));

    const clinicName = centres.find(c => c.id === randomClinicId).name;

    // Add alert
    const newAlert = {
      id: `outbreak_alert_${Date.now()}`,
      type: "shortage",
      severity: "Emergency",
      centre: clinicName,
      title: "Disease Outbreak Risk: Dengue/Malaria",
      message: `Sudden patient spike (+80) at ${clinicName}. Medicine stocks declining rapidly. ICU full.`,
      time: "Just now"
    };

    setAlerts(prev => [newAlert, ...prev]);
    showBanner(`🚨 Alert: Simulated disease outbreak triggered at ${clinicName}!`);
  };

  // 5. SIMULATE EQUIPMENT FAILURE
  const handleTriggerEquipmentFailure = () => {
    // Break machine at CHC Paithan or CHC Sillod
    const randomClinicId = Math.random() > 0.5 ? "chc_paithan" : "phc_khuldabad";
    
    setCentres(prevCentres => prevCentres.map(c => {
      if (c.id === randomClinicId) {
        const updatedDiag = c.diagnostics.map(d => {
          if (d.id === 'diag_xray' || d.id === 'diag_ultra') {
            return { ...d, status: "Equipment Failure", queueSize: d.queueSize + 8 };
          }
          return d;
        });
        return { ...c, diagnostics: updatedDiag };
      }
      return c;
    }));

    const clinicName = centres.find(c => c.id === randomClinicId).name;
    const testName = randomClinicId === "chc_paithan" ? "X-Ray" : "Ultrasound";

    const newAlert = {
      id: `failure_alert_${Date.now()}`,
      type: "failure",
      severity: "Emergency",
      centre: clinicName,
      title: "Critical Machine Breakdown",
      message: `${testName} scanning component failure. Redirecting active patients.`,
      time: "Just now"
    };

    setAlerts(prev => [newAlert, ...prev]);
    showBanner(`⚠️ Alert: Diagnostic device failure simulated at ${clinicName}!`);
  };

  // 6. RESET SIMULATION DATA
  const handleResetData = () => {
    setCentres(initialHealthCentres);
    setAlerts(initialAlerts);
    setTimeline(INITIAL_TIMELINE);
    setExecutionLog([]);
    setSelectedCentreId("all");
    setSelectedTab("dashboard");
    showBanner("Simulation variables reset to initial state.");
  };

  // Role permissions routing
  const getAllowedTabs = () => {
    switch (role) {
      case 'pharmacist':
        return ['dashboard', 'inventory', 'redistribution', 'reports'];
      case 'doctor':
        return ['dashboard', 'patients', 'beds', 'doctors', 'diagnostics'];
      case 'nurse':
        return ['dashboard', 'patients', 'beds', 'diagnostics'];
      default: // admin
        return ['dashboard', 'inventory', 'patients', 'beds', 'doctors', 'diagnostics', 'redistribution', 'reports'];
    }
  };

  const allowedTabs = getAllowedTabs();

  // Force redirection if role changed and current tab is restricted
  useEffect(() => {
    if (!allowedTabs.includes(selectedTab)) {
      setSelectedTab("dashboard");
    }
  }, [role]);

  // Sidebar navigation mapping
  const sidebarItems = [
    { id: "dashboard", label: t('dashboard'), icon: LayoutDashboard },
    { id: "inventory", label: t('inventory'), icon: Package },
    { id: "patients", label: t('patients'), icon: Users },
    { id: "beds", label: t('beds'), icon: Bed },
    { id: "doctors", label: t('doctors'), icon: UserCheck },
    { id: "diagnostics", label: t('diagnostics'), icon: Activity },
    { id: "redistribution", label: t('redistribution'), icon: Sparkles },
    { id: "reports", label: t('reports'), icon: BarChart3 }
  ].filter(item => allowedTabs.includes(item.id));

  if (!isAuthenticated) {
    return <LoginModule onLogin={handleLogin} theme={theme} />;
  }

  return (
    <div className={`flex min-h-screen font-sans leading-normal antialiased transition-colors duration-300 theme-${theme} ${theme === 'dark' ? 'bg-navy-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Top Banner Alert (Floating Toast Notification) */}
      {bannerAlert && (
        <div className="fixed top-4 right-4 z-50 max-w-sm p-4 bg-teal-500 text-white rounded-2xl shadow-2xl flex items-start gap-3 border border-teal-400/30 animate-in slide-in-from-top-5 duration-300">
          <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">Operational Update</h4>
            <p className="text-xs font-medium mt-1 leading-relaxed">{bannerAlert}</p>
          </div>
        </div>
      )}

      {/* Sidebar Layout */}
      <aside className={`w-64 border-r flex flex-col justify-between shrink-0 h-screen sticky top-0 transition-colors duration-300 ${theme === 'dark' ? 'border-slate-900 bg-navy-950' : 'border-slate-200 bg-white'}`}>
        
        {/* Top Brand Branding */}
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/15">
              <Hospital className="h-5 w-5" />
            </div>
            <div>
              <h1 className={`text-sm font-bold tracking-tight transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{t('appTitle')}</h1>
              <span className="text-[9px] font-medium text-slate-500 block leading-tight">District Control Panel</span>
            </div>
          </div>

          <div className="border-b border-slate-900"></div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = selectedTab === item.id;
              
              return (
                <button
                  key={item.id}
                  id={`nav_${item.id}`}
                  onClick={() => setSelectedTab(item.id)}
                  className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-teal-500/10 text-teal-600 border border-teal-500/20 shadow-inner dark:text-teal-400' 
                      : theme === 'dark' 
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Role Swapper, Theme Toggle & Language Switcher) */}
        <div className="p-4 bg-slate-900/10 border-t border-slate-900 space-y-4">
          
          {/* Authenticated User Profile */}
          <div className="space-y-2">
            <div className={`p-3 rounded-xl border flex items-center justify-between ${theme === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex flex-col">
                <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{currentUser?.name || 'User'}</span>
                <span className="text-[10px] font-semibold text-teal-500 capitalize">{role} Access</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Secure Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Theme selector toggle */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Visual Interface Theme</label>
            <div className="grid grid-cols-2 gap-1 bg-slate-900/80 border border-slate-850 rounded-xl p-0.5">
              <button 
                id="btn_theme_dark"
                onClick={() => setTheme("dark")} 
                className={`py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-colors ${theme === 'dark' ? 'bg-teal-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Dark
              </button>
              <button 
                id="btn_theme_light"
                onClick={() => setTheme("light")} 
                className={`py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-colors ${theme === 'light' ? 'bg-teal-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Light
              </button>
            </div>
          </div>

          {/* Language selector toggle */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{t('langLabel')}</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-900/80 border border-slate-850 rounded-xl p-0.5">
              <button 
                id="btn_lang_en"
                onClick={() => setLanguage("en")} 
                className={`py-1 text-[10px] font-bold rounded-lg cursor-pointer ${language === 'en' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                EN
              </button>
              <button 
                id="btn_lang_hi"
                onClick={() => setLanguage("hi")} 
                className={`py-1 text-[10px] font-bold rounded-lg cursor-pointer ${language === 'hi' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                हिन्दी
              </button>
              <button 
                id="btn_lang_mr"
                onClick={() => setLanguage("mr")} 
                className={`py-1 text-[10px] font-bold rounded-lg cursor-pointer ${language === 'mr' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                मराठी
              </button>
            </div>
          </div>

        </div>

      </aside>

      {/* Main Panel Content Wrap */}
      <main className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto">
        
        {/* Sticky Header */}
        <header className={`sticky top-0 z-20 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b transition-colors duration-300 ${theme === 'dark' ? 'bg-navy-950/80 border-slate-900' : 'bg-white/80 border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <h2 className={`text-sm font-bold transition-colors duration-300 capitalize leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              {centres.find(c => c.id === selectedCentreId)?.name || t('allCentres')}
            </h2>
            <span className="text-slate-700">/</span>
            <span className="text-xs text-slate-400 font-medium capitalize">{selectedTab.replace("_", " ")}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Simulation Sandbox Button */}
            <button
              onClick={() => setIsSandboxOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-850 hover:border-slate-700 text-slate-350 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-55'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Simulation Sandbox</span>
            </button>

            {/* Health Clinic Filter */}
            <div className="relative">
              <select
                id="select_filter_centre"
                value={selectedCentreId}
                onChange={(e) => setSelectedCentreId(e.target.value)}
                className={`border font-semibold rounded-xl pl-3.5 pr-8 py-2 text-xs focus:outline-none focus:border-teal-500 transition-all appearance-none cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border-slate-850 text-slate-300 hover:border-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}
              >
                <option value="all">{t('allCentres')}</option>
                {centres.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </header>

        {/* Content Box */}
        <div className="p-6 flex-1 space-y-6">
          
          {/* Active alerts warning banner for fast diagnosis */}
          {selectedTab !== "dashboard" && alerts.slice(0, 1).map((alert) => (
            <div key={alert.id} className="p-3.5 bg-red-500/5 border border-red-500/25 rounded-2xl flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                <span className="text-slate-400 font-medium">[{alert.centre}]</span>
                <strong className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{alert.title}:</strong>
                <span className="text-slate-350">{alert.message}</span>
              </div>
              <button 
                onClick={() => setSelectedTab("dashboard")} 
                className="text-[10px] text-teal-400 font-bold hover:underline shrink-0"
              >
                Resolve in Dashboard Overview
              </button>
            </div>
          ))}

          {/* Router views matching tabs */}
          {selectedTab === "dashboard" && (
            <DashboardOverview 
              state={{ centres, alerts, timeline, recommendations }}
              onSelectCentre={setSelectedCentreId}
              onExecuteAction={handleExecuteRedistribution}
              onTriggerOutbreak={handleTriggerOutbreak}
              onTriggerFailure={handleTriggerEquipmentFailure}
              onResetData={handleResetData}
              onAdvanceDay={handleAdvanceTimelineDay}
              t={t}
            />
          )}

          {selectedTab === "inventory" && (
            <InventoryModule
              state={{ centres, timeline, recommendations }}
              selectedCentreId={selectedCentreId}
              onUpdateStock={handleUpdateStock}
              onExecuteAction={handleExecuteRedistribution}
              role={role}
              t={t}
            />
          )}

          {selectedTab === "patients" && (
            <PatientModule
              state={{ centres, timeline, recommendations }}
              selectedCentreId={selectedCentreId}
              onExecuteAction={handleExecuteRedistribution}
              t={t}
            />
          )}

          {selectedTab === "beds" && (
            <BedsModule
              state={{ centres, timeline, recommendations }}
              selectedCentreId={selectedCentreId}
              onExecuteAction={handleExecuteRedistribution}
              t={t}
            />
          )}

          {selectedTab === "doctors" && (
            <DoctorsModule
              state={{ centres, recommendations }}
              selectedCentreId={selectedCentreId}
              onExecuteAction={handleExecuteRedistribution}
              t={t}
            />
          )}

          {selectedTab === "diagnostics" && (
            <DiagnosticsModule
              state={{ centres, recommendations }}
              selectedCentreId={selectedCentreId}
              onExecuteAction={handleExecuteRedistribution}
              t={t}
            />
          )}

          {selectedTab === "redistribution" && (
            <RedistributionModule
              state={{ recommendations }}
              onExecuteAction={handleExecuteRedistribution}
              executionLog={executionLog}
              t={t}
            />
          )}

          {selectedTab === "reports" && (
            <ReportsModule
              state={{ centres }}
              t={t}
            />
          )}

        </div>

      </main>

      {/* Floating AI Assistant Chatbot */}
      <ChatbotModule
        state={{ centres, recommendations }}
        onNavigate={setSelectedTab}
        onExecuteAction={handleExecuteRedistribution}
        t={t}
        theme={theme}
      />

      {/* Simulation Sandbox Modal */}
      {isSandboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all duration-300 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-800/40">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-teal-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider">System Simulation Sandbox</h3>
              </div>
              <button 
                onClick={() => setIsSandboxOpen(false)}
                className="p-1 rounded hover:bg-slate-850/20 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Use these developer sandbox controls to simulate real-time hospital administration load scenarios, diagnostic hardware breakdowns, or shift timeline changes.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="border border-slate-800/40 rounded-xl p-3 bg-slate-900/20 text-center flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Epidemic Load</h4>
                    <p className="text-[9px] text-slate-500 mt-1 leading-normal">Simulate sudden spikes in patient traffic due to vector outbreaks.</p>
                  </div>
                  <button
                    onClick={() => { handleTriggerOutbreak(); setIsSandboxOpen(false); }}
                    className="mt-3 w-full py-1.5 text-[10px] font-bold bg-red-950/50 hover:bg-red-500 hover:text-white border border-red-800/30 hover:border-red-500 text-red-400 rounded-lg cursor-pointer transition-all"
                  >
                    Trigger Outbreak
                  </button>
                </div>

                <div className="border border-slate-800/40 rounded-xl p-3 bg-slate-900/20 text-center flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hardware Failure</h4>
                    <p className="text-[9px] text-slate-500 mt-1 leading-normal">Simulate offline status of critical MRI/X-Ray/Ultrasound machines.</p>
                  </div>
                  <button
                    onClick={() => { handleTriggerEquipmentFailure(); setIsSandboxOpen(false); }}
                    className="mt-3 w-full py-1.5 text-[10px] font-bold bg-amber-950/50 hover:bg-amber-500 hover:text-white border border-amber-800/30 hover:border-amber-500 text-amber-400 rounded-lg cursor-pointer transition-all"
                  >
                    Fail Equipment
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-800/40 pt-4 flex gap-2">
                <button
                  onClick={() => { handleResetData(); setIsSandboxOpen(false); showBanner("Simulation data state reset."); }}
                  className="flex-1 py-2 text-[10px] font-bold bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-all"
                >
                  Reset Data Model
                </button>
                <button
                  onClick={() => { handleAdvanceTimelineDay(); setIsSandboxOpen(false); }}
                  className="flex-1 py-2 text-[10px] font-bold bg-teal-500 hover:bg-teal-600 text-white rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="h-3 w-3 animate-spin-slow" />
                  Advance 1 Day
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
