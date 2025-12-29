import React from 'react';
import { AssistantConfig } from '../types';
import { AVAILABLE_MODELS } from '../constants';
import { Settings, Save, RefreshCw, Bot, FileText, Cpu } from 'lucide-react';

interface SidebarProps {
  config: AssistantConfig;
  setConfig: (config: AssistantConfig) => void;
  onResetChat: () => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ config, setConfig, onResetChat, isOpen, toggleSidebar }) => {
  
  const handleInputChange = (field: keyof AssistantConfig, value: string) => {
    setConfig({ ...config, [field]: value });
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Content */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-80 bg-slate-900 border-r border-slate-700 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white leading-tight">Assistant Builder</h1>
            <p className="text-xs text-slate-400">Powered by Gemini</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Name Config */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Bot size={16} />
              Assistant Name
            </label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="e.g. Coding Wizard"
            />
          </div>

          {/* Model Config */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Cpu size={16} />
              Model
            </label>
            <select
              value={config.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* System Instructions Config */}
          <div className="space-y-2 flex-1 flex flex-col">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <FileText size={16} />
              System Instructions
            </label>
            <p className="text-xs text-slate-500">
              Define the persona, tone, and rules. This is how you "program" the assistant's behavior.
            </p>
            <textarea
              value={config.systemInstruction}
              onChange={(e) => handleInputChange('systemInstruction', e.target.value)}
              className="w-full h-64 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none leading-relaxed"
              placeholder="You are a helpful assistant..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <button
            onClick={onResetChat}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} />
            Apply & Restart Chat
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
