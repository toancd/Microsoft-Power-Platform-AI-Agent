import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { User, Bot, Copy, Check } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  assistantName: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, assistantName }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
          ${isUser ? 'bg-slate-600' : 'bg-indigo-600'}
        `}>
          {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
        </div>

        {/* Content Bubble */}
        <div className={`
          flex flex-col
          ${isUser ? 'items-end' : 'items-start'}
        `}>
          <span className="text-xs text-slate-400 mb-1 px-1">
            {isUser ? 'You' : assistantName}
          </span>
          
          <div className={`
            relative group rounded-2xl px-4 py-3 text-sm leading-relaxed
            ${isUser 
              ? 'bg-indigo-600 text-white rounded-tr-sm' 
              : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700/50'
            }
          `}>
            {message.isLoading ? (
               <div className="flex gap-1 items-center h-5">
                 <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
               </div>
            ) : (
              <div className="markdown-body">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            )}

            {!isUser && !message.isLoading && (
              <button 
                onClick={handleCopy}
                className="absolute -bottom-6 right-0 p-1.5 text-slate-500 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Copy text"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
