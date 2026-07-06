import React, { useState } from 'react';
import { Hospital, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

const MOCK_USERS = {
  'admin@smarthealth.ai': { role: 'admin', name: 'District Admin' },
  'doctor@smarthealth.ai': { role: 'doctor', name: 'Dr. Sarah Smith' },
  'nurse@smarthealth.ai': { role: 'nurse', name: 'Nurse Joy' },
  'pharmacist@smarthealth.ai': { role: 'pharmacist', name: 'Pharm. John Doe' }
};

export default function LoginModule({ onLogin, theme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate secure network delay
    setTimeout(() => {
      const user = MOCK_USERS[email.toLowerCase()];
      if (user && password === 'password') {
        onLogin(user);
      } else {
        setError('Invalid credentials. Please check your email and password.');
        setIsLoading(false);
      }
    }, 1500);
  };

  // Preset quick login
  const handleQuickLogin = (presetEmail) => {
    setEmail(presetEmail);
    setPassword('password');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-navy-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-blue-500/10 rounded-full blur-[80px] mix-blend-screen"></div>

      <div className={`relative z-10 w-full max-w-md p-8 rounded-3xl border shadow-2xl backdrop-blur-xl transition-all duration-300 ${theme === 'dark' ? 'bg-navy-900/60 border-slate-800 shadow-teal-900/20' : 'bg-white/80 border-slate-200 shadow-teal-500/10'}`}>
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 mb-5 transform transition-transform hover:scale-105 duration-300">
            <Hospital className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">SmartHealth<span className="text-teal-500">AI</span></h1>
          <p className={`text-sm mt-2 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Secure District Control Panel
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-500 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Work Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className={`h-4.5 w-4.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@smarthealth.ai"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
                  theme === 'dark' 
                    ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-600 focus:bg-slate-900' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white'
                }`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-wider flex justify-between ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              <span>Password</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className={`h-4.5 w-4.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
                  theme === 'dark' 
                    ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-600 focus:bg-slate-900' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className={`w-full py-3.5 px-4 flex items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
              isLoading || !email || !password
                ? 'bg-teal-500/50 cursor-not-allowed' 
                : 'bg-gradient-to-r from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40'
            }`}
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5" />
                <span>Secure Authentication</span>
                <ArrowRight className="h-4 w-4 ml-1 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Login Options */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <p className={`text-[10px] font-bold uppercase tracking-wider text-center mb-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
            Multi-Level Permission Demo
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(MOCK_USERS).map(([demoEmail, details]) => (
              <button
                key={demoEmail}
                onClick={() => handleQuickLogin(demoEmail)}
                className={`px-3 py-2 rounded-lg text-[10px] font-semibold flex flex-col items-start transition-colors border ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-teal-500/50 hover:bg-slate-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-teal-500/50 hover:bg-slate-100'
                }`}
              >
                <span className="capitalize text-teal-500">{details.role} Access</span>
                <span className="opacity-70 mt-0.5">{demoEmail}</span>
              </button>
            ))}
            <div className={`col-span-2 text-center text-[9px] mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
              Password for all demo accounts: <span className="font-mono bg-slate-800/50 px-1 py-0.5 rounded">password</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Compliance Footer */}
      <div className={`absolute bottom-6 text-[10px] font-medium tracking-wide ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
        HIPAA Compliant &bull; End-to-End Encrypted &bull; SmartHealthAI © 2026
      </div>
    </div>
  );
}
