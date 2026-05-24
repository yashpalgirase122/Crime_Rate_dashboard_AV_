import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, Crosshair, Users, Activity, FileText, Settings, HelpCircle, ShieldAlert, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Map, label: 'Live Crime Map', path: '/map' },
  { icon: Crosshair, label: 'Predictive Analytics', path: '/predict' },
  { icon: MessageSquare, label: 'AI Investigation Chat', path: '/chat' },
  { icon: Users, label: 'Criminal Network', path: '/network' },
  { icon: ShieldAlert, label: 'Face Detection', path: '/face-detection' },
  { icon: Activity, label: 'Suspicious Activity', path: '/anomalies' },
  { icon: FileText, label: 'AI FIR Generator', path: '/fir-generator' },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-cyber-dark/80 backdrop-blur-xl border-r border-slate-700/50 flex flex-col justify-between z-20">
      <div>
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-cyber-blue/20 flex items-center justify-center border border-cyber-blue/50 neon-border">
            <ShieldAlert className="text-cyber-neon w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-wider text-white">NEXUS<span className="text-cyber-blue">AI</span></h1>
        </div>

        <nav className="mt-6 px-4 space-y-1">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={index} to={item.path} className="block">
                <motion.div
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-cyber-blue/20 text-cyber-neon border border-cyber-blue/30 shadow-[0_0_15px_rgba(14,165,233,0.15)]' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-cyber-neon' : 'text-slate-400'}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 w-1 h-8 bg-cyber-blue rounded-r-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-700/50">
        <button className="flex items-center space-x-3 text-slate-400 hover:text-white w-full px-4 py-2 rounded-lg hover:bg-slate-800/50 transition-colors">
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button className="flex items-center space-x-3 text-slate-400 hover:text-white w-full px-4 py-2 rounded-lg hover:bg-slate-800/50 transition-colors mt-1">
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Support</span>
        </button>
        <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center space-x-3 px-2">
           <img src="https://ui-avatars.com/api/?name=Officer+K&background=0ea5e9&color=fff" alt="User" className="w-9 h-9 rounded-full border border-cyber-blue/50" />
           <div>
             <p className="text-sm font-medium text-white">Officer K.</p>
             <p className="text-xs text-cyber-blue">Cyber Division</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
