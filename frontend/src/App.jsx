import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import InvestigationChatbot from './pages/InvestigationChatbot';
import LiveMap from './pages/LiveMap';
import Anomalies from './pages/Anomalies';

function App() {
  return (
    <div className="flex h-screen bg-cyber-darker text-slate-300">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Cyberpunk ambient background glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyber-blue/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-cyber-purple/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6 z-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/map" element={<LiveMap />} />
            <Route path="/anomalies" element={<Anomalies />} />
            <Route path="/chat" element={<InvestigationChatbot />} />
            {/* Add more routes here for other features */}
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App;
