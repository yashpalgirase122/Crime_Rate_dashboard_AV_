import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Bot, User, ShieldAlert, Activity } from 'lucide-react';

const InvestigationChatbot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Nexus AI Chatbot initialized. How can I assist your investigation today, Officer?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text })
      });
      const data = await res.json();
      
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now(), text: data.reply || data.answer || "Connection error.", sender: 'bot' }]);
        setIsTyping(false);
      }, 800); // Simulate network/thinking delay
      
    } catch (err) {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now(), text: "System offline. Unable to reach AI core.", sender: 'bot' }]);
        setIsTyping(false);
      }, 500);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col glass-panel overflow-hidden relative">
      <div className="p-4 border-b border-slate-700/50 bg-cyber-dark/80 backdrop-blur flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-cyber-blue/20 flex items-center justify-center border border-cyber-blue/50 neon-border">
            <Bot className="text-cyber-neon w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">Nexus Investigation Assistant</h2>
            <p className="text-xs text-cyber-blue flex items-center">
              <span className="w-2 h-2 rounded-full bg-cyber-green mr-2 animate-pulse"></span> Online
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-cyber-neon hover:bg-slate-700 transition-colors">
            <ShieldAlert className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-cyber-neon hover:bg-slate-700 transition-colors">
            <Activity className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10">
        {messages.map((msg) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-cyber-purple/20 border-cyber-purple ml-3' : 'bg-cyber-blue/20 border-cyber-blue mr-3'} border`}>
                {msg.sender === 'user' ? <User className="w-4 h-4 text-cyber-purple" /> : <Bot className="w-4 h-4 text-cyber-blue" />}
              </div>
              <div className={`p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-cyber-purple/20 text-white rounded-tr-none border border-cyber-purple/30' : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-700/50 shadow-[0_0_15px_rgba(14,165,233,0.1)]'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex items-center space-x-2 bg-slate-800/80 p-4 rounded-2xl rounded-tl-none border border-slate-700/50">
              <span className="w-2 h-2 bg-cyber-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-cyber-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-cyber-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-700/50 bg-cyber-dark/80 backdrop-blur z-10">
        <div className="flex items-center space-x-2">
          <button className="p-3 rounded-xl bg-slate-800/50 text-slate-400 hover:text-cyber-neon hover:bg-slate-700 transition-colors">
            <Mic className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your query... (e.g. 'Show robbery hotspots')"
            className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue transition-all"
          />
          <button
            onClick={handleSend}
            className="p-3 rounded-xl bg-cyber-blue/20 text-cyber-neon border border-cyber-blue/50 hover:bg-cyber-blue/30 transition-all shadow-[0_0_10px_rgba(14,165,233,0.2)]"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvestigationChatbot;
