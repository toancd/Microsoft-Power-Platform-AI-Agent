import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Chat } from '@google/genai';
import { Send, Menu, Sparkles } from 'lucide-react';

import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import { AssistantConfig, Message } from './types';
import { DEFAULT_CONFIG } from './constants';
import { createChatSession, sendMessageStream } from './services/geminiService';

const App: React.FC = () => {
  const [config, setConfig] = useState<AssistantConfig>(DEFAULT_CONFIG);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs to manage chat session and auto-scroll
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize Chat
  useEffect(() => {
    startNewChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startNewChat = () => {
    chatSessionRef.current = createChatSession(config.model, config.systemInstruction);
    setMessages([
      {
        id: uuidv4(),
        role: 'model',
        content: `Hello! I am **${config.name}**. How can I help you today?`,
        timestamp: Date.now(),
      }
    ]);
  };

  const handleConfigUpdate = (newConfig: AssistantConfig) => {
    setConfig(newConfig);
  };

  const handleResetChat = () => {
    startNewChat();
    // On mobile, close sidebar after applying settings
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || !chatSessionRef.current) return;

    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      content: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // Reset textarea height
    if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
    }

    // Placeholder for stream
    const botMsgId = uuidv4();
    const botMsg: Message = {
      id: botMsgId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
      isLoading: true
    };
    
    setMessages(prev => [...prev, botMsg]);

    try {
      await sendMessageStream(
        chatSessionRef.current,
        userMsg.content,
        (streamedText) => {
          setMessages(prev => prev.map(msg => 
            msg.id === botMsgId 
              ? { ...msg, content: streamedText, isLoading: false } 
              : msg
          ));
        }
      );
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId 
          ? { ...msg, content: "Sorry, I encountered an error connecting to Gemini. Please check your API key and connection.", isLoading: false } 
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-200">
      
      {/* Sidebar Configuration */}
      <Sidebar 
        config={config} 
        setConfig={handleConfigUpdate} 
        onResetChat={handleResetChat} 
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative w-full h-full">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h2 className="font-semibold text-white flex items-center gap-2">
                {config.name}
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-mono border border-indigo-500/20">
                  {config.model.replace('gemini-', '')}
                </span>
              </h2>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Online
              </span>
            </div>
          </div>
        </header>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
              <div className="bg-slate-900 p-4 rounded-full">
                <Sparkles size={32} className="text-indigo-500" />
              </div>
              <p>Configure your assistant and start chatting!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                assistantName={config.name} 
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 lg:p-6 bg-slate-950 border-t border-slate-800">
          <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-slate-900 border border-slate-700 rounded-xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all shadow-lg">
            <textarea
              ref={textAreaRef}
              value={inputText}
              onChange={handleInputResize}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${config.name}...`}
              rows={1}
              className="w-full bg-transparent text-white placeholder-slate-500 text-sm resize-none focus:outline-none py-3 px-3 max-h-[150px] overflow-y-auto"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputText.trim()}
              className={`
                p-3 rounded-lg flex-shrink-0 mb-0.5
                ${inputText.trim() && !isLoading 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-900/20' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }
                transition-all duration-200 ease-in-out
              `}
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-center text-xs text-slate-600 mt-3">
            Gemini can make mistakes. Please check important information.
          </p>
        </div>

      </div>
    </div>
  );
};

export default App;
