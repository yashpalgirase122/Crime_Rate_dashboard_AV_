import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertOctagon, TrendingUp, ShieldAlert, Activity } from 'lucide-react';

const Anomalies = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/anomalies');
        const data = await res.json();
        setAnomalies(data.anomalies || []);
        setScore(data.summary_score || 0);
      } catch (err) {
        console.error("Failed to fetch anomalies", err);
      }
    };
    fetchAnomalies();
  }, []);

  const chartData = [
    { time: 'Week 1', normal: 40, spike: 42 },
    { time: 'Week 2', normal: 38, spike: 89 },
    { time: 'Week 3', normal: 45, spike: 46 },
    { time: 'Week 4', normal: 42, spike: 120 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide flex items-center">
            <AlertOctagon className="w-8 h-8 mr-3 text-cyber-red animate-pulse" />
            SUSPICIOUS ACTIVITY
          </h1>
          <p className="text-cyber-red mt-1">AI Anomaly Detection System</p>
        </div>
        <div className="flex space-x-3">
          <div className="px-4 py-2 bg-cyber-red/10 border border-cyber-red/50 text-cyber-red rounded-lg text-sm font-bold flex items-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            SYSTEM THREAT LEVEL: HIGH
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 border-t-2 border-cyber-red">
          <p className="text-slate-400 text-sm font-medium uppercase mb-1">Detected Spikes</p>
          <h3 className="text-4xl font-bold text-white font-mono flex items-end">
            3 <span className="text-base text-cyber-red ml-2 font-sans mb-1 flex items-center"><TrendingUp className="w-4 h-4 mr-1"/> +200%</span>
          </h3>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 border-t-2 border-cyber-purple">
          <p className="text-slate-400 text-sm font-medium uppercase mb-1">Most Suspicious Area</p>
          <h3 className="text-2xl font-bold text-white tracking-wide mt-2">
            Downtown East
          </h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6 border-t-2 border-cyber-green">
          <p className="text-slate-400 text-sm font-medium uppercase mb-1">System Confidence</p>
          <h3 className="text-4xl font-bold text-white font-mono text-cyber-green">
            {score}%
          </h3>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="glass-panel p-6">
          <h2 className="text-lg font-semibold text-white tracking-wide flex items-center mb-6">
            <Activity className="w-5 h-5 mr-2 text-cyber-red" /> 30-Day Activity Deviation
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSpike" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="normal" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorNormal)" />
                <Area type="step" dataKey="spike" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorSpike)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="glass-panel p-6 overflow-y-auto max-h-[350px]">
          <h2 className="text-lg font-semibold text-white tracking-wide flex items-center mb-6">
            <ShieldAlert className="w-5 h-5 mr-2 text-cyber-neon" /> AI Generated Warning Alerts
          </h2>
          <div className="space-y-4">
            {anomalies.map((anom, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 relative overflow-hidden group">
                <div className={`absolute left-0 top-0 w-1 h-full ${anom.risk_level === 'CRITICAL' ? 'bg-cyber-red shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-cyber-purple'}`}></div>
                <div className="pl-3">
                  <div className="flex justify-between items-start">
                    <h4 className="text-white font-medium">{anom.type}: {anom.category}</h4>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${anom.risk_level === 'CRITICAL' ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/50' : 'bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/50'}`}>{anom.risk_level}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">Location: <span className="text-slate-200">{anom.zone}</span></p>
                  <p className="text-sm text-slate-400">Increase: <span className={anom.risk_level === 'CRITICAL' ? 'text-cyber-red font-bold' : 'text-cyber-purple font-bold'}>{anom.increase}</span> vs historical average</p>
                </div>
              </div>
            ))}
            {anomalies.length === 0 && <p className="text-slate-500">No recent anomalies detected.</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Anomalies;
