window.dashboardCharts = {};
window.fullCrimeData = {};
window.cityByCrime = {};
window.crimeByCity = {};

const colors = [
    'rgba(59, 130, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(139, 92, 246, 0.8)'
];

function destroyChart(chartId) {
    if (window.dashboardCharts && window.dashboardCharts[chartId]) {
        window.dashboardCharts[chartId].destroy();
        delete window.dashboardCharts[chartId];
    }
}

function updateYearlyTrendChart(city, crimeType) {
    destroyChart('trendChart');
    const ctx = document.getElementById('trendChart');
    if (ctx && window.fullCrimeData && window.fullCrimeData[city] && window.fullCrimeData[city][crimeType]) {
        const trendData = window.fullCrimeData[city][crimeType];
        window.dashboardCharts.trendChart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: Object.keys(trendData),
                datasets: [{
                    label: `${crimeType} Trend in ${city}`,
                    data: Object.values(trendData),
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                }]
            },
            options: { responsive: true, animation: { duration: 800, easing: 'easeInOutQuart' } }
        });
    }
}

function updateCategoryChart(city, crimeType) {
    destroyChart('categoryChart');
    const ctx = document.getElementById('categoryChart');
    if (ctx && window.crimeByCity && window.crimeByCity[city]) {
        const catData = window.crimeByCity[city];
        const labels = Object.keys(catData);
        const data = Object.values(catData);
        
        // Highlight the selected crime type in the pie chart
        const bgColors = labels.map((label, index) => 
            label === crimeType ? 'rgba(239, 68, 68, 1)' : colors[index % colors.length]
        );

        window.dashboardCharts.categoryChart = new Chart(ctx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: bgColors,
                    borderWidth: 0
                }]
            },
            options: { responsive: true, animation: { duration: 800, easing: 'easeInOutQuart' } }
        });
    }
}

function updateCityDistributionChart(city, crimeType) {
    destroyChart('cityChart');
    const ctx = document.getElementById('cityChart');
    if (ctx && window.cityByCrime && window.cityByCrime[crimeType]) {
        const distData = window.cityByCrime[crimeType];
        const labels = Object.keys(distData);
        const data = Object.values(distData);
        
        // Highlight selected city in the bar chart
        const bgColors = labels.map((label, index) => 
            label === city ? 'rgba(239, 68, 68, 1)' : colors[index % colors.length]
        );

        window.dashboardCharts.cityChart = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: `City Distribution for ${crimeType}`,
                    data: data,
                    backgroundColor: bgColors
                }]
            },
            options: { 
                responsive: true, 
                plugins: { legend: { display: false } },
                animation: { duration: 800, easing: 'easeInOutQuart' }
            }
        });
    }
}

function updateForecastChart(city, crimeType, predictedCount, startYear) {
    destroyChart('forecastChart');
    const ctx = document.getElementById('forecastChart');
    if (!ctx) return;
    
    let trendMultiplier = 1.08;
    if (window.fullCrimeData && window.fullCrimeData[city] && window.fullCrimeData[city][crimeType]) {
        const trendData = window.fullCrimeData[city][crimeType];
        const years = Object.keys(trendData).map(Number).sort((a,b) => a - b);
        if (years.length >= 2) {
            const lastCount = trendData[years[years.length-1]];
            const prevCount = trendData[years[years.length-2]];
            if (prevCount > 0) {
                let ratio = lastCount / prevCount;
                if (ratio > 1.2) ratio = 1.2;
                if (ratio < 0.8) ratio = 0.8;
                trendMultiplier = 1 + (ratio - 1) / 2;
            }
        }
    }

    const forecastLabels = [];
    const forecastValues = [];
    let currentVal = predictedCount;

    for (let i = 0; i < 5; i++) {
        forecastLabels.push(startYear + i);
        forecastValues.push(Math.round(currentVal));
        currentVal = currentVal * trendMultiplier;
    }

    window.dashboardCharts.forecastChart = new Chart(ctx.getContext('2d'), {
        type: 'line', 
        data: {
            labels: forecastLabels,
            datasets: [{
                label: `Forecast: ${crimeType} in ${city}`,
                data: forecastValues,
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true, animation: { duration: 800, easing: 'easeInOutQuart' } }
    });
}

function updatePrediction() {
    const city = document.getElementById('predCity').value;
    const crimeType = document.getElementById('predType').value;
    const resBox = document.getElementById('predResult');
    
    resBox.style.display = 'block';
    resBox.innerHTML = 'Analyzing AI Model...';
    
    fetch('/api/predict', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({city: city, crime_type: crimeType})
    })
    .then(res => res.json())
    .then(data => {
        if(data.error) {
            resBox.innerHTML = `<span class="danger-text">${data.error}</span>`;
        } else {
            resBox.innerHTML = `Predicted count for <b>${data.crime_type}</b> in <b>${data.city}</b> for year <b>${data.year}</b> is <span class="warning-text" style="font-size:1.5rem;font-weight:bold;margin-left:10px;">${data.predicted_count}</span>`;
            
            updateYearlyTrendChart(city, crimeType);
            updateCategoryChart(city, crimeType);
            updateCityDistributionChart(city, crimeType);
            updateForecastChart(city, crimeType, data.predicted_count, data.year);
        }
    })
    .catch(e => {
        resBox.innerHTML = `<span class="danger-text">Prediction failed.</span>`;
    });
}

// Initial Data Load & Event Listener
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/crime_data');
        const data = await response.json();
        
        if (Object.keys(data).length > 0) {
            window.fullCrimeData = data.detailed_data || {};
            window.cityByCrime = data.city_by_crime || {};
            window.crimeByCity = data.crime_by_city || {};
            
            // Render initial default charts
            const defaultCity = Object.keys(window.crimeByCity)[0] || 'Mumbai';
            const defaultCrime = Object.keys(window.cityByCrime)[0] || 'Theft';
            
            updateYearlyTrendChart(defaultCity, defaultCrime);
            updateCategoryChart(defaultCity, defaultCrime);
            updateCityDistributionChart(defaultCity, defaultCrime);
        }
        
        // Event Listener on Prediction Button
        const btnPredict = document.getElementById('btnPredict');
        if (btnPredict) {
            // Remove inline onclick if it exists (for clean event handling)
            btnPredict.removeAttribute('onclick');
            btnPredict.addEventListener('click', updatePrediction);
        }
        
    } catch (e) {
        console.error('Error loading chart data', e);
    }
});
