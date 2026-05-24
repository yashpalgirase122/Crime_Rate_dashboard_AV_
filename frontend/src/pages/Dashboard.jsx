import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Activity, Shield, AlertOctagon, TrendingUp, Crosshair, Users, Cpu } from 'lucide-react';

const crimeData = [
  { time: '00:00', total: 45, cyber: 20, violent: 15 },
  { time: '04:00', total: 30, cyber: 18, violent: 5 },
  { time: '08:00', total: 60, cyber: 25, violent: 10 },
  { time: '12:00', total: 85, cyber: 40, violent: 20 },
  { time: '16:00', total: 95, cyber: 45, violent: 30 },
  { time: '20:00', total: 110, cyber: 50, violent: 45 },
  { time: '23:59', total: 70, cyber: 35, violent: 25 },
];

const predictionData = [
  { subject: 'Cyber Fraud', A: 120, fullMark: 150 },
  { subject: 'Assault', A: 98, fullMark: 150 },
  { subject: 'Theft', A: 86, fullMark: 150 },
  { subject: 'Vandalism', A: 99, fullMark: 150 },
  { subject: 'Narcotics', A: 85, fullMark: 150 },
  { subject: 'Extortion', A: 65, fullMark: 150 },
];

const StatCard = ({ title, value, change, icon: Icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="glass-panel p-5 relative overflow-hidden group"
  >
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500`} style={{ backgroundColor: color }}></div>
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white font-mono">{value}</h3>
      </div>
      <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
    </div>
    <div className="flex items-center text-sm">
      <TrendingUp className="w-4 h-4 text-cyber-green mr-1" />
      <span className="text-cyber-green font-medium">+{change}%</span>
      <span className="text-slate-500 ml-2">from last week</span>
    </div>
  </motion.div>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide">COMMAND CENTER</h1>
          <p className="text-cyber-blue mt-1">AI Crime Prediction & Analysis System v2.0</p>
        </div>
        <div className="flex space-x-3 w-1/2">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="AI Search (e.g., 'Show cybercrime cases in Mumbai at night')" 
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue transition-all"
            />
            <button className="absolute right-2 top-1.5 text-cyber-blue hover:text-cyber-neon">
              <Crosshair className="w-5 h-5" />
            </button>
          </div>
          <button className="px-4 py-2 bg-cyber-darker border border-slate-700 rounded-lg text-sm font-medium hover:border-cyber-blue transition-colors flex-shrink-0">Export Report</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Incidents" value="1,248" change="12.5" icon={Activity} color="#ef4444" delay={0.1} />
        <StatCard title="Predicted Threats" value="84" change="5.2" icon={Crosshair} color="#f59e0b" delay={0.2} />
        <StatCard title="AI Confidence Score" value="94.2%" change="2.1" icon={Cpu} color="#10b981" delay={0.3} />
        <StatCard title="Officers Deployed" value="342" change="8.4" icon={Shield} color="#0ea5e9" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2 glass-panel p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white tracking-wide flex items-center">
              <Activity className="w-5 h-5 mr-2 text-cyber-blue" /> Live Crime Frequency Tracker
            </h2>
            <div className="flex space-x-2">
              <span className="flex items-center text-xs text-cyber-blue"><span className="w-2 h-2 rounded-full bg-cyber-blue mr-1"></span> Cyber</span>
              <span className="flex items-center text-xs text-cyber-red"><span className="w-2 h-2 rounded-full bg-cyber-red mr-1"></span> Violent</span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={crimeData}>
                <defs>
                  <linearGradient id="colorCyber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorViolent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="cyber" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorCyber)" />
                <Area type="monotone" dataKey="violent" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorViolent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="glass-panel p-6"
        >
          <h2 className="text-lg font-semibold text-white tracking-wide flex items-center mb-6">
            <AlertOctagon className="w-5 h-5 mr-2 text-cyber-purple" /> AI Risk Assessment
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={predictionData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Threat Level" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', borderRadius: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-cyber-purple/10 border border-cyber-purple/30 rounded-lg">
            <p className="text-xs text-cyber-purple"><strong>AI Insight:</strong> 34% increase in probability of Cyber Fraud attacks in Zone 4 within the next 48 hours based on historical pattern matching.</p>
          </div>
        </motion.div>
      </div>
      
      {/* Advanced AI Filters Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="glass-panel p-6"
      >
        <div className="flex justify-between items-center mb-4 border-b border-slate-700/50 pb-4">
          <h2 className="text-lg font-semibold text-white tracking-wide flex items-center">
             Multi-Layer Dynamic Filtering <span className="ml-3 px-2 py-1 bg-cyber-blue/20 text-cyber-blue text-xs rounded border border-cyber-blue/50">ACTIVE</span>
          </h2>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {['Crime Severity', 'Age Group', 'Weapon Used', 'Repeat Offenders', 'AI Risk Score', 'Pattern Similarity'].map((filter, i) => (
            <button key={i} className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-full text-sm text-slate-300 hover:border-cyber-cyan hover:text-cyber-cyan transition-colors">
              {filter}
            </button>
          ))}
          <button className="px-4 py-2 bg-cyber-blue/10 border border-cyber-blue/50 rounded-full text-sm text-cyber-blue hover:bg-cyber-blue/20 transition-colors shadow-[0_0_10px_rgba(14,165,233,0.2)]">
            + Custom AI Filter
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
