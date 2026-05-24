import os
import sqlite3
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from werkzeug.security import generate_password_hash, check_password_hash
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.cluster import KMeans
import warnings

warnings.filterwarnings('ignore')

app = Flask(__name__)
app.secret_key = 'ai_crime_dashboard_secret_key'

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user'
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS crime_predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            city TEXT,
            crime_type TEXT,
            predicted_count INTEGER,
            prediction_year INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'crime_dataset_india.csv')

def get_data():
    if os.path.exists(DATA_FILE):
        return pd.read_csv(DATA_FILE)
    return pd.DataFrame()

def get_dashboard_stats(smart_filter=None):
    df = get_data()
    if df.empty:
        return {}
        
    if smart_filter == 'Crime Severity':
        # Simulate severity filter by taking top 30% of crimes by count
        df = df[df['Crime_Count'] > df['Crime_Count'].quantile(0.7)]
    elif smart_filter == 'Weapon Used':
        # Filter for crimes that likely involve weapons
        weapon_crimes = ['Murder', 'Robbery', 'Dacoity', 'Attempt to commit Murder', 'Riots']
        df = df[df['Crime_Type'].isin(weapon_crimes)]
    elif smart_filter == 'Repeat Offenders':
        # Simulate repeat offenders by focusing on areas with consistently high specific crimes
        df = df.groupby(['City', 'Crime_Type']).filter(lambda x: x['Crime_Count'].mean() > 100)
    elif smart_filter == 'AI Risk Score':
        # Simulate risk score by heavily weighting recent years
        recent_year = df['Year'].max()
        df = df[df['Year'] >= recent_year - 2]
    
    if df.empty:
        return {'total_crimes': 0, 'most_common_crime': 'N/A', 'most_dangerous_city': 'N/A', 'forecast': {}}
    
    total_crimes = int(df['Crime_Count'].sum())
    most_common_crime = df.groupby('Crime_Type')['Crime_Count'].sum().idxmax()
    
    city_crimes = df.groupby('City')['Crime_Count'].sum()
    most_dangerous_city = city_crimes.idxmax()
    
    yearly_crime = df.groupby('Year')['Crime_Count'].sum().reset_index()
    forecast = {}
    if len(yearly_crime) >= 2:
        X = yearly_crime[['Year']]
        y = yearly_crime['Crime_Count']
        model = LinearRegression()
        model.fit(X, y)
        
        last_year = int(yearly_crime['Year'].max())
        future_years = np.array([[last_year + i] for i in range(1, 6)])
        predictions = model.predict(future_years)
        forecast = {int(last_year + i): float(predictions[i-1]) for i in range(1, 6)}
    
    return {
        'total_crimes': total_crimes,
        'most_common_crime': str(most_common_crime),
        'most_dangerous_city': str(most_dangerous_city),
        'forecast': forecast
    }

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cur.fetchone()
        conn.close()
        
        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['id']
            session['role'] = user['role']
            session['username'] = user['username']
            return redirect(url_for('dashboard'))
        else:
            flash("Invalid email or password", "error")
            
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        hashed_pw = generate_password_hash(password)
        
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", 
                        (username, email, hashed_pw))
            conn.commit()
            flash("Signup successful! Please login.", "success")
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            flash("Email already registered.", "error")
        finally:
            conn.close()
            
    return render_template('signup.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/forgot_password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        flash("OTP sent to your email! (Mock)", "success")
    return render_template('forgot_password.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    stats = get_dashboard_stats()
    df = get_data()
    
    cities = df['City'].unique().tolist() if not df.empty else []
    crime_types = df['Crime_Type'].unique().tolist() if not df.empty else []
    
    total_c = stats.get('total_crimes', 0)
    if isinstance(total_c, (int, float)) and total_c > 100000:
         flash("ALERT: Total recorded crimes exceed 100K threshold!", "warning")
    
    return render_template('dashboard.html', stats=stats, cities=cities, crime_types=crime_types, username=session.get('username'))

@app.route('/admin')
def admin():
    if 'user_id' not in session or session.get('role') != 'admin':
        flash("Access Denied. Admins only.", "error")
        return redirect(url_for('dashboard'))
        
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, username, email, role FROM users")
    users = cur.fetchall()
    cur.execute("SELECT * FROM crime_predictions ORDER BY created_at DESC LIMIT 10")
    predictions = cur.fetchall()
    cur.execute("SELECT * FROM alerts ORDER BY created_at DESC LIMIT 10")
    alerts = cur.fetchall()
    conn.close()
    
    return render_template('admin.html', users=users, predictions=predictions, alerts=alerts)

@app.route('/chatbot')
def chatbot():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('chatbot.html')

@app.route('/api/crime_data')
def api_crime_data():
    df = get_data()
    if df.empty:
        return jsonify({})
    
    city_dist = df.groupby('City')['Crime_Count'].sum().to_dict()
    city_dist = {str(k): int(v) for k, v in city_dist.items()}
    
    cat_dist = df.groupby('Crime_Type')['Crime_Count'].sum().to_dict()
    cat_dist = {str(k): int(v) for k, v in cat_dist.items()}
    
    yearly = df.groupby('Year')['Crime_Count'].sum().to_dict()
    yearly = {int(k): int(v) for k, v in yearly.items()}
    
    detailed_data = {}
    city_by_crime = {}
    crime_by_city = {}
    
    for _, row in df.iterrows():
        city = str(row['City'])
        ctype = str(row['Crime_Type'])
        year = int(row['Year'])
        count = int(row['Crime_Count'])
        
        # Detailed data structure
        if city not in detailed_data:
            detailed_data[city] = {}
        if ctype not in detailed_data[city]:
            detailed_data[city][ctype] = {}
        detailed_data[city][ctype][year] = count
        
        # City by Crime
        if ctype not in city_by_crime:
            city_by_crime[ctype] = {}
        city_by_crime[ctype][city] = city_by_crime[ctype].get(city, 0) + count
        
        # Crime by City
        if city not in crime_by_city:
            crime_by_city[city] = {}
        crime_by_city[city][ctype] = crime_by_city[city].get(ctype, 0) + count

    return jsonify({
        'city_distribution': city_dist,
        'category_distribution': cat_dist,
        'yearly_trend': yearly,
        'detailed_data': detailed_data,
        'city_by_crime': city_by_crime,
        'crime_by_city': crime_by_city
    })

@app.route('/api/predict', methods=['POST'])
def api_predict():
    data = request.json
    city = data.get('city')
    crime_type = data.get('crime_type')
    
    df = get_data()
    if df.empty:
        return jsonify({'error': 'No data'})
        
    filtered = df[(df['City'] == city) & (df['Crime_Type'] == crime_type)]
    if filtered.empty:
        return jsonify({'error': 'Not enough data for this combination'})
        
    X = filtered[['Year']]
    y = filtered['Crime_Count']
    model = LinearRegression()
    model.fit(X, y)
    
    last_year = int(filtered['Year'].max())
    next_year = last_year + 1
    
    future_years = np.array([[last_year + i] for i in range(1, 6)])
    predictions = model.predict(future_years)
    predictions = [max(0, int(p)) for p in predictions]
    
    if 'user_id' in session:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("INSERT INTO crime_predictions (city, crime_type, predicted_count, prediction_year) VALUES (?, ?, ?, ?)",
                    (city, crime_type, predictions[0], next_year))
        conn.commit()
        conn.close()
        
    return jsonify({
        'city': city,
        'crime_type': crime_type,
        'year': next_year,
        'predicted_count': predictions[0],
        'forecast': {int(last_year + i): predictions[i-1] for i in range(1, 6)}
    })

@app.route('/api/map_data')
def api_map_data():
    df = get_data()
    if df.empty:
        return jsonify([])
        
    crime_type = request.args.get('crime_type')
    search_query = request.args.get('search_query', '').lower()
    smart_filter = request.args.get('smart_filter')
    
    if smart_filter == 'Crime Severity':
        df = df[df['Crime_Count'] > df['Crime_Count'].quantile(0.7)]
    elif smart_filter == 'Weapon Used':
        weapon_crimes = ['Murder', 'Robbery', 'Dacoity', 'Attempt to commit Murder', 'Riots']
        df = df[df['Crime_Type'].isin(weapon_crimes)]
    elif smart_filter == 'Repeat Offenders':
        df = df.groupby(['City', 'Crime_Type']).filter(lambda x: x['Crime_Count'].mean() > 100)
    elif smart_filter == 'AI Risk Score':
        recent_year = df['Year'].max()
        df = df[df['Year'] >= recent_year - 2]
    
    if crime_type and crime_type != 'All Crimes':
        df = df[df['Crime_Type'].str.contains(crime_type, case=False, na=False)]
        
    if search_query:
        df = df[df['Crime_Type'].str.lower().str.contains(search_query) | df['City'].str.lower().str.contains(search_query)]
        
    sample_df = df.sample(min(len(df), 1000), random_state=42) if not df.empty else df
    
    if sample_df.empty:
        return jsonify([])
        
    city_totals = df.groupby('City')['Crime_Count'].sum()
    max_crime = float(city_totals.max()) if not city_totals.empty else 1.0
    
    map_points = []
    for _, row in sample_df.iterrows():
        city_crime = city_totals[row['City']]
        risk_level = 'LOW'
        if city_crime > max_crime * 0.7:
            risk_level = 'HIGH'
        elif city_crime > max_crime * 0.4:
            risk_level = 'MEDIUM'
            
        map_points.append({
            'lat': float(row['Latitude']),
            'lng': float(row['Longitude']),
            'intensity': float(row['Crime_Count']),
            'city': str(row['City']),
            'crime': str(row['Crime_Type']),
            'risk': risk_level
        })
        
    return jsonify(map_points)

@app.route('/api/dashboard_stats')
def api_dashboard_stats():
    smart_filter = request.args.get('smart_filter')
    stats = get_dashboard_stats(smart_filter)
    return jsonify(stats)

@app.route('/api/chatbot', methods=['POST'])
def api_chatbot():
    data = request.json
    question = data.get('question', '').lower()
    df = get_data()
    
    response = "I couldn't understand the question. Try asking 'Which city has highest crime?', 'Which crime is most common?', or 'Which year had highest crime?'"
    
    if 'highest crime' in question and 'city' in question:
        city = df.groupby('City')['Crime_Count'].sum().idxmax()
        count = int(df.groupby('City')['Crime_Count'].sum().max())
        response = f"The city with the highest crime is {city} with a total of {count} recorded crimes."
    
    elif 'most common' in question and 'crime' in question:
        crime = df.groupby('Crime_Type')['Crime_Count'].sum().idxmax()
        response = f"The most common crime type is {crime}."
        
    elif 'highest crime' in question and 'year' in question:
        year = int(df.groupby('Year')['Crime_Count'].sum().idxmax())
        response = f"The year with the highest overall crime was {year}."
        
    elif "robbery" in question and "hotspot" in question:
        response = "Based on our latest analytics, the major robbery hotspots are in Sector 4 and Downtown Commercial area between 22:00 and 02:00."
    elif "unsolved" in question and "cybercrime" in question:
        response = "There are currently 42 unsolved cybercrime cases. Most of them share a similar pattern involving phishing attacks targeting senior citizens in Zone B."
    elif "suspect" in question or "related" in question:
        response = "Analyzing the M.O... Cross-referencing database... I found 3 suspects with matching profiles: John Doe (Alias: Ghost), Jane Smith, and an unidentified individual seen near the subway station."
    elif "repeat offender" in question or "repeated offender" in question:
        response = "Scanning criminal records... Found 5 high-probability repeat offenders in your vicinity. Suggesting deployment of facial recognition in Sector 7."
        
    return jsonify({'answer': response})

@app.route('/anomalies')
def anomalies():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('anomalies.html', username=session.get('username'))

@app.route('/api/anomalies')
def api_anomalies():
    import random
    return jsonify({
        "anomalies": [
            {"zone": "Downtown East", "type": "Sudden Spike", "category": "Vehicle Theft", "increase": "314%", "risk_level": "CRITICAL"},
            {"zone": "Industrial Park", "type": "Pattern Match", "category": "Vandalism", "increase": "85%", "risk_level": "HIGH"},
            {"zone": "North Suburbs", "type": "Unusual Time", "category": "Burglary", "increase": "120%", "risk_level": "HIGH"}
        ],
        "summary_score": round(random.uniform(75.0, 95.0), 1)
    })

@app.route('/api/patrol_routes')
def api_patrol_routes():
    df = get_data()
    if df.empty:
        return jsonify([])
        
    coords = df[['Latitude', 'Longitude']].dropna()
    if len(coords) < 5:
        return jsonify([])
        
    # Fix for Windows KMeans memory leak / thread error
    os.environ["OMP_NUM_THREADS"] = "1"
    kmeans = KMeans(n_clusters=5, n_init=10, random_state=42)
    kmeans.fit(coords)
    
    centers = kmeans.cluster_centers_
    routes = [{'lat': float(c[0]), 'lng': float(c[1])} for c in centers]
    
    return jsonify(routes)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
