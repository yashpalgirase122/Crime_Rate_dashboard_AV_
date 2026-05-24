import { Search, Bell, Mic, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = () => {
  return (
    <header className="h-20 bg-transparent flex items-center justify-between px-6 z-20">
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-12 py-3 border border-slate-700/50 rounded-xl leading-5 bg-cyber-dark/40 backdrop-blur-md text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyber-blue/50 focus:border-cyber-blue/50 sm:text-sm transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            placeholder="NLP Search: 'Show robbery cases in Mumbai at night involving bikes...'"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button className="text-slate-400 hover:text-cyber-neon transition-colors">
              <Mic className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 bg-cyber-red/10 border border-cyber-red/30 px-4 py-2 rounded-lg text-cyber-red">
          <AlertTriangle className="w-4 h-4 animate-pulse" />
          <span className="text-sm font-semibold tracking-wide">SOS ALERT: ZONE 4</span>
        </div>

        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-cyber-red shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
        </button>

        <div className="text-right hidden md:block">
          <div className="text-xs text-slate-400 uppercase tracking-widest">System Status</div>
          <div className="text-sm font-mono text-cyber-green flex items-center justify-end space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-green"></span>
            </span>
            <span>SECURE.ONLINE</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
