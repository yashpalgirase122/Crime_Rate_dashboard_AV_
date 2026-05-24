import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Circle } from 'react-leaflet';
import { Layers, Crosshair, AlertTriangle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons not showing in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow
});
L.Marker.prototype.options.icon = DefaultIcon;

const LiveMap = () => {
  const [mapData, setMapData] = useState([]);
  const [activeLayer, setActiveLayer] = useState('All');
  const [radiusFilter, setRadiusFilter] = useState(0); // in km
  const defaultCenter = [19.0760, 72.8777]; // Mumbai center

  useEffect(() => {
    // Fetch mock map data from backend
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/map-data');
        const data = await res.json();
        setMapData(data);
      } catch (err) {
        console.error('Failed to fetch map data', err);
      }
    };
    fetchData();
  }, []);

  const filteredData = mapData.filter(d => activeLayer === 'All' || d.type === activeLayer);

  const getIntensityColor = (intensity) => {
    if (intensity > 0.8) return '#ef4444'; // Cyber Red
    if (intensity > 0.5) return '#f59e0b'; // Amber
    return '#0ea5e9'; // Cyber Blue
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Map Filter Controls */}
      <div className="w-72 glass-panel p-6 flex flex-col z-10">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <Layers className="w-5 h-5 mr-2 text-cyber-blue" />
          Map Filters
        </h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Heatmap Layers</h3>
            <div className="space-y-2">
              {['All', 'Theft', 'Cybercrime', 'Murder', 'Women Safety'].map(layer => (
                <button
                  key={layer}
                  onClick={() => setActiveLayer(layer)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
                    activeLayer === layer 
                      ? 'bg-cyber-blue/20 text-cyber-neon border border-cyber-blue/50 shadow-[0_0_10px_rgba(14,165,233,0.2)]'
                      : 'text-slate-300 hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  {layer}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider flex items-center">
              <Crosshair className="w-4 h-4 mr-2" /> Radius Filter
            </h3>
            <input 
              type="range" 
              min="0" max="10" step="1"
              value={radiusFilter}
              onChange={(e) => setRadiusFilter(parseInt(e.target.value))}
              className="w-full accent-cyber-blue"
            />
            <div className="flex justify-between mt-2 text-xs text-cyber-blue">
              <span>Off</span>
              <span>{radiusFilter > 0 ? `${radiusFilter} KM` : ''}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-cyber-purple" /> Sensitive Areas
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Schools', 'Hospitals', 'Stations'].map(area => (
                <button key={area} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300 hover:border-cyber-purple hover:text-cyber-purple transition-all">
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map Display */}
      <div className="flex-1 glass-panel overflow-hidden border border-cyber-blue/20 relative z-10">
        <MapContainer center={defaultCenter} zoom={11} className="w-full h-full bg-slate-900">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          />
          {radiusFilter > 0 && (
            <Circle center={defaultCenter} radius={radiusFilter * 1000} pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.1 }} />
          )}
          {filteredData.map(point => (
            <CircleMarker
              key={point.id}
              center={[point.lat, point.lng]}
              radius={point.intensity * 20}
              pathOptions={{
                color: getIntensityColor(point.intensity),
                fillColor: getIntensityColor(point.intensity),
                fillOpacity: 0.4
              }}
            >
              <Popup className="cyber-popup">
                <div className="text-sm p-1">
                  <strong className="text-cyber-neon block border-b border-slate-700 pb-1 mb-1">{point.type}</strong>
                  <span className="text-slate-400 block mt-1">Intensity: {Math.round(point.intensity * 100)}%</span>
                  <span className="text-slate-400 block">Risk: HIGH</span>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
        
        {/* Overlay HUD elements */}
        <div className="absolute top-4 right-4 bg-cyber-dark/80 backdrop-blur border border-slate-700 p-3 rounded-lg z-[400] pointer-events-none">
           <h4 className="text-xs text-slate-400 uppercase tracking-widest mb-2">Live Status</h4>
           <div className="flex items-center text-xs text-cyber-green">
             <span className="w-2 h-2 rounded-full bg-cyber-green mr-2 animate-pulse"></span> Network Active
           </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
