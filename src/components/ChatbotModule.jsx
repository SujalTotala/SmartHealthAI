import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { queryAIChatbot } from '../utils/aiEngine';

export default function ChatbotModule({ state, onNavigate, onExecuteAction, t, theme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "**SmartHealth AI Operations Assistant**\n\nWelcome to the District Informatics Control Panel. I have analyzed all facility logs in real-time. Please query me regarding inventory, staffing levels, bed occupancies, or equipment diagnostic states.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    // 1. Add user message
    const userMsg = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue("");

    // Simulate AI thinking typing delay
    setTimeout(() => {
      // 2. Query Local AI NLP Engine
      const aiResult = queryAIChatbot(text, state);
      
      const botMsg = {
        id: `bot_${Date.now()}`,
        sender: "bot",
        text: aiResult.text,
        suggestions: aiResult.suggestions || [],
        action: aiResult.action || null,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleActionClick = (action) => {
    if (action.type === "NAVIGATE") {
      onNavigate(action.tab);
    } else if (action.type === "MEDICINE_TRANSFER" || action.type === "DOCTOR_SHIFT" || action.type === "DIAGNOSTIC_REDIRECT") {
      onExecuteAction(action);
    }
  };

  // Convert simple markdown strings like **bold** to JSX
  const formatMessageText = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let currentTable = null;

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index].trim();

      if (line.startsWith('|')) {
        const cells = line.split('|').map(c => c.trim()).filter((c, i, a) => i > 0 && i < a.length - 1);

        if (!currentTable) {
          currentTable = { headers: null, rows: [] };
        }

        if (line.includes('---')) {
          continue;
        }

        if (!currentTable.headers) {
          currentTable.headers = cells;
        } else {
          currentTable.rows.push(cells);
        }

        const nextLine = lines[index + 1] ? lines[index + 1].trim() : '';
        if (!nextLine.startsWith('|')) {
          const tableKey = `table-${index}`;
          elements.push(
            <div key={tableKey} className="overflow-x-auto my-2.5 border border-slate-800/80 rounded-xl">
              <table className="min-w-full divide-y divide-slate-800/60 text-[10px]">
                <thead className="bg-slate-900/50">
                  <tr>
                    {currentTable.headers.map((h, i) => (
                      <th key={i} className="px-3 py-2 text-left font-semibold text-teal-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {currentTable.rows.map((row, ri) => (
                    <tr key={ri} className="hover:bg-slate-900/20">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-1.5 text-slate-300 font-medium whitespace-nowrap">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          currentTable = null;
        }
        continue;
      }

      if (line.startsWith('### ')) {
        elements.push(<h4 key={index} className="text-xs font-bold text-teal-400 mt-3 mb-1 border-b border-slate-800/30 pb-1">{line.replace('### ', '')}</h4>);
        continue;
      }

      let isBullet = false;
      let displayLine = line;
      if (line.startsWith('- ') || line.startsWith('* ')) {
        isBullet = true;
        displayLine = line.substring(2);
      }

      const parts = displayLine.split(/\*\*([^*]+)\*\*/g);
      const renderedLine = parts.map((part, i) => {
        if (i % 2 === 1) return <strong key={i} className="text-teal-300 font-bold">{part}</strong>;
        return part;
      });

      const italicParts = [];
      renderedLine.forEach(node => {
        if (typeof node === 'string') {
          const subParts = node.split(/\*([^*]+)\*/g);
          subParts.forEach((sp, subI) => {
            if (subI % 2 === 1) italicParts.push(<em key={`${index}-${subI}`} className="text-slate-300 italic">{sp}</em>);
            else italicParts.push(sp);
          });
        } else {
          italicParts.push(node);
        }
      });

      if (isBullet) {
        elements.push(<li key={index} className="ml-4 list-disc text-xs text-slate-350 leading-relaxed mb-0.5">{italicParts}</li>);
      } else if (line.trim() !== '') {
        elements.push(<p key={index} className="text-xs text-slate-200 leading-relaxed mb-1">{italicParts}</p>);
      }
    }

    return elements;
  };

  const presetQueries = [
    { text: "Check medicine shortages", label: "📦 Stock shortages" },
    { text: "Show bed occupancy", label: "🏥 Bed levels" },
    { text: "Show active equipment failures", label: "🔬 Device errors" },
    { text: "Any doctors absent today?", label: "👩‍⚕️ Absent staff" }
  ];

  return (
    <>
      {/* Floating Toggle Icon */}
      {!isOpen && (
        <button
          id="btn_chatbot_open"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/20 hover:scale-110 active:scale-95 transition-all duration-300 animate-bounce-slow"
        >
          <Sparkles className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white items-center justify-center">AI</span>
          </span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          id="chat_window_container"
          className={`fixed bottom-6 right-6 z-50 flex h-[500px] w-96 flex-col overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-lg animate-in slide-in-from-bottom-5 duration-300 ${
            theme === 'dark'
              ? 'border-slate-800 bg-slate-950/95 text-white'
              : 'border-slate-200 bg-white/95 text-slate-800'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-teal-900/60 to-cyan-900/60 border-slate-800'
              : 'bg-slate-100 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Gemini Operations Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] text-emerald-400 font-medium">District AI Engine Active</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-teal-600 text-white rounded-tr-none'
                      : theme === 'dark'
                        ? 'bg-slate-900 border border-slate-800 rounded-tl-none'
                        : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <div className="space-y-1">
                    {formatMessageText(msg.text)}
                  </div>

                  {/* Render inline action buttons inside the AI response if applicable */}
                  {msg.action && (
                    <button
                      onClick={() => handleActionClick(msg.action)}
                      className="mt-3 flex items-center justify-between gap-2 w-full rounded-lg bg-teal-500/10 border border-teal-500/30 px-3 py-1.5 text-[11px] font-semibold text-teal-400 hover:bg-teal-500 hover:text-white transition-all duration-200"
                    >
                      {msg.action.type === "NAVIGATE" ? (
                        <>
                          <span>Go to {msg.action.tab.toUpperCase()} Module</span>
                          <ArrowRight className="h-3 w-3" />
                        </>
                      ) : (
                        <>
                          <span>Approve Recommended Action</span>
                          <ArrowRight className="h-3 w-3" />
                        </>
                      )}
                    </button>
                  )}

                  {/* Render inline suggestion chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/50 flex flex-wrap gap-1">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(sug)}
                          className="text-[10px] bg-slate-950 hover:bg-teal-950 border border-slate-800 hover:border-teal-500/30 text-teal-400 rounded-md px-2 py-0.5 transition-colors duration-150"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick-reply templates (shown when user is starting or at bottom) */}
          <div className={`px-4 py-2 border-t overflow-x-auto flex gap-1.5 whitespace-nowrap scrollbar-none ${
            theme === 'dark' ? 'border-slate-900 bg-slate-950/40' : 'border-slate-200 bg-slate-50/40'
          }`}>
            {presetQueries.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.text)}
                className={`text-[10px] border rounded-full px-3 py-1 transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-teal-500/40 hover:text-teal-400'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-teal-500/40 hover:text-teal-500'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-slate-900 bg-slate-950 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask AI coordinates, transfer recommendations..."
              className={`flex-1 border rounded-xl px-3 py-2 text-xs transition-all ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-teal-500'
                  : 'bg-slate-100 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-teal-500'
              }`}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500 text-white shadow-md hover:bg-teal-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
