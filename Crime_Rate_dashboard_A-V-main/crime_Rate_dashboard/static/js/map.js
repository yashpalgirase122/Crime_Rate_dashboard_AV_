let globalLayerGroup;
let globalHeatLayer;
let map;

document.addEventListener('DOMContentLoaded', async () => {
    const mapEl = document.getElementById('crimeMap');
    if (!mapEl) return;

    // Center map roughly on India
    map = L.map('crimeMap').setView([20.5937, 78.9629], 5);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    globalLayerGroup = L.layerGroup().addTo(map);

    await loadMapData();
});

let currentSmartFilter = '';

async function loadMapData(crimeType = '', searchQuery = '') {
    try {
        let url = '/api/map_data?';
        if (crimeType) url += `crime_type=${encodeURIComponent(crimeType)}&`;
        if (searchQuery) url += `search_query=${encodeURIComponent(searchQuery)}&`;
        if (currentSmartFilter) url += `smart_filter=${encodeURIComponent(currentSmartFilter)}&`;
        
        const response = await fetch(url);
        const points = await response.json();

        // Clear existing layers
        if (globalLayerGroup) globalLayerGroup.clearLayers();
        if (globalHeatLayer && map) map.removeLayer(globalHeatLayer);

        const heatArray = [];

        points.forEach(p => {
            heatArray.push([p.lat, p.lng, p.intensity]);
            
            let color = '#10b981'; // green
            if (p.risk === 'HIGH') color = '#ef4444'; // red
            else if (p.risk === 'MEDIUM') color = '#f59e0b'; // orange
            
            L.circleMarker([p.lat, p.lng], {
                radius: 4,
                fillColor: color,
                color: color,
                weight: 1,
                opacity: 0.8,
                fillOpacity: 0.5
            }).bindPopup(`<b>${p.city}</b><br>Risk: <span style="color:${color}">${p.risk}</span><br>Crime: ${p.crime}`).addTo(globalLayerGroup);
        });

        if(typeof L.heatLayer !== 'undefined') {
            globalHeatLayer = L.heatLayer(heatArray, {
                radius: 25,
                blur: 15,
                maxZoom: 10,
                gradient: {0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red'}
            }).addTo(map);
        }

        // Only load patrol routes once or if needed, for now just load them if no filter applied
        if (!crimeType && !searchQuery) {
            const patrolRes = await fetch('/api/patrol_routes');
            const routes = await patrolRes.json();
            
            if(routes.length > 0) {
                routes.forEach((r, idx) => {
                    L.marker([r.lat, r.lng], {
                        title: `Patrol Hub ${idx+1}`
                    }).bindPopup(`<b>Optimal Patrol Hub ${idx+1}</b>`).addTo(globalLayerGroup);
                });
                
                const latlngs = routes.map(r => [r.lat, r.lng]);
                latlngs.push([routes[0].lat, routes[0].lng]);
                L.polyline(latlngs, {color: '#3b82f6', dashArray: '5, 5', weight: 3}).addTo(globalLayerGroup);
            }
        }

    } catch(e) {
        console.error('Error loading map data', e);
    }
}

// Triggered by Map Buttons
window.filterMap = function(crimeType, btnElement) {
    // UI update
    const btns = btnElement.parentElement.querySelectorAll('button');
    btns.forEach(b => {
        b.style.background = 'rgba(30,41,59,0.8)';
        b.style.color = '#cbd5e1';
        b.style.borderColor = '#475569';
    });
    btnElement.style.background = 'rgba(14,165,233,0.2)';
    btnElement.style.color = 'var(--accent)';
    btnElement.style.borderColor = 'var(--accent)';

    // Backend call
    loadMapData(crimeType, '');
};

// Triggered by AI Search
window.executeAISearch = function() {
    const query = document.getElementById('aiSearchInput').value;
    if (query) {
        loadMapData('', query);
    } else {
        loadMapData();
    }
};

// Triggered by Smart AI Filters
window.applySmartFilter = async function(filterName, btnElement) {
    // UI Update for buttons
    const btns = btnElement.parentElement.querySelectorAll('button');
    btns.forEach(b => {
        b.style.background = 'rgba(30,41,59,0.8)';
        b.style.color = '#cbd5e1';
        b.style.borderColor = '#475569';
    });
    btnElement.style.background = 'rgba(14,165,233,0.2)';
    btnElement.style.color = 'var(--accent)';
    btnElement.style.borderColor = 'var(--accent)';

    currentSmartFilter = filterName;

    // Update the Map
    loadMapData();

    // Fetch and Update Dashboard Stats
    try {
        const url = filterName ? `/api/dashboard_stats?smart_filter=${encodeURIComponent(filterName)}` : '/api/dashboard_stats';
        const res = await fetch(url);
        const stats = await res.json();
        
        if (stats && Object.keys(stats).length > 0) {
            document.getElementById('stat-total-crimes').innerText = stats.total_crimes;
            document.getElementById('stat-most-common').innerText = stats.most_common_crime;
            document.getElementById('stat-dangerous-city').innerText = stats.most_dangerous_city;
        }
    } catch(e) {
        console.error('Failed to update dashboard stats', e);
    }
};
