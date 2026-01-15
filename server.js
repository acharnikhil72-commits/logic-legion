// ============================================
// LOGIC LEGION - CLOUD-READY SERVER
// Deploy to Render.com (FREE)
// ============================================

const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// MongoDB Connection - Uses environment variable in production
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://acharnikhil72_db_user:vFtlFTq6FnV8RnvG@cluster0.mh9tblw.mongodb.net/?appName=Cluster0";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let db;
let registrationsCollection;

async function connectToMongoDB() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('✅ MongoDB Connected');
        
        db = client.db('logic_legion_db');
        registrationsCollection = db.collection('registrations');
    } catch (error) {
        console.error('❌ MongoDB Error:', error.message);
    }
}

connectToMongoDB();

// Routes
app.get('/', (req, res) => {
    res.send(getRegistrationHTML());
});

app.post('/register', async (req, res) => {
    try {
        if (!db) {
            return res.status(503).json({ success: false, error: 'Database not connected' });
        }

        const { name, section, mobile, email, interest, skills, reason } = req.body;
        
        if (!name || !section || !mobile || !email || !interest || !skills || !reason) {
            return res.status(400).json({ success: false, error: 'All fields required' });
        }

        const registration = {
            name: name.trim(),
            section: section.trim(),
            mobile: mobile.trim(),
            email: email.trim().toLowerCase(),
            interest: interest.trim(),
            skills: skills.trim(),
            reason: reason.trim(),
            registeredAt: new Date(),
            registrationId: `LL${Date.now()}`
        };

        await registrationsCollection.insertOne(registration);
        console.log(`✅ Registration: ${name} - ${registration.registrationId}`);
        
        res.json({ success: true, id: registration.registrationId });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

app.get('/registrations', async (req, res) => {
    try {
        if (!db) {
            return res.status(503).json({ success: false, error: 'Database not connected' });
        }

        const registrations = await registrationsCollection.find({}).sort({ registeredAt: -1 }).toArray();
        res.json({ success: true, count: registrations.length, data: registrations });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch data' });
    }
});

app.get('/admin', (req, res) => {
    res.send(getAdminHTML());
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', mongodb: db ? 'Connected' : 'Disconnected' });
});

function getRegistrationHTML() {
    return \`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logic Legion | Registration Portal</title>
    <style>
        :root {
            --neon-green: #39FF14;
            --deep-space: #0a0a0c;
            --glass-bg: rgba(15, 15, 15, 0.9);
            --input-bg: rgba(255, 255, 255, 0.03);
        }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Orbitron', 'Segoe UI', sans-serif; }
        body {
            background: var(--deep-space);
            background-image: radial-gradient(circle at 20% 30%, rgba(57, 255, 20, 0.08) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(57, 255, 20, 0.08) 0%, transparent 40%);
            color: #fff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .card {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(57, 255, 20, 0.2);
            border-radius: 30px;
            width: 100%;
            max-width: 750px;
            padding: 40px;
            box-shadow: 0 0 50px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(57, 255, 20, 0.05);
            position: relative;
        }
        .card::after {
            content: '';
            position: absolute;
            top: -2px; left: -2px; right: -2px; bottom: -2px;
            background: linear-gradient(45deg, var(--neon-green), transparent, transparent, var(--neon-green));
            border-radius: 30px;
            z-index: -1;
            opacity: 0.3;
        }
        .header { text-align: center; margin-bottom: 35px; }
        .logo {
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
            border-radius: 50%;
            border: 3px solid var(--neon-green);
            box-shadow: 0 0 20px var(--neon-green);
            margin: 0 auto 15px;
            animation: pulse 2s infinite;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
        }
        @keyframes pulse {
            0% { box-shadow: 0 0 10px var(--neon-green); }
            50% { box-shadow: 0 0 25px var(--neon-green); }
            100% { box-shadow: 0 0 10px var(--neon-green); }
        }
        h1 {
            color: var(--neon-green);
            text-transform: uppercase;
            letter-spacing: 5px;
            font-size: 1.8rem;
            text-shadow: 0 0 10px var(--neon-green);
        }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .full-width { grid-column: span 2; }
        label {
            display: block;
            font-size: 0.7rem;
            color: var(--neon-green);
            text-transform: uppercase;
            margin-bottom: 8px;
            letter-spacing: 1.5px;
            font-weight: bold;
        }
        input, textarea {
            width: 100%;
            background: var(--input-bg);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 12px 15px;
            border-radius: 10px;
            color: #fff;
            font-size: 0.95rem;
            transition: 0.3s;
        }
        input:focus, textarea:focus {
            outline: none;
            border-color: var(--neon-green);
            box-shadow: 0 0 10px rgba(57, 255, 20, 0.2);
            background: rgba(57, 255, 20, 0.05);
        }
        textarea { height: 80px; resize: none; }
        button {
            background: transparent;
            color: var(--neon-green);
            border: 2px solid var(--neon-green);
            padding: 15px 40px;
            font-size: 1rem;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 3px;
            border-radius: 50px;
            cursor: pointer;
            transition: 0.4s ease;
            width: 100%;
            margin-top: 30px;
        }
        button:hover {
            background: var(--neon-green);
            color: #000;
            box-shadow: 0 0 30px var(--neon-green);
            transform: scale(1.02);
        }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        .admin-link {
            text-align: center;
            margin-top: 20px;
        }
        .admin-link a {
            color: var(--neon-green);
            text-decoration: none;
            font-size: 0.9rem;
            opacity: 0.7;
            transition: 0.3s;
        }
        .admin-link a:hover {
            opacity: 1;
            text-shadow: 0 0 10px var(--neon-green);
        }
        @media (max-width: 600px) {
            .form-grid { grid-template-columns: 1fr; }
            .full-width { grid-column: span 1; }
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <div class="logo">🚀</div>
            <h1>Logic Legion</h1>
        </div>
        <form id="legionForm">
            <div class="form-grid">
                <div class="field-group">
                    <label>Name</label>
                    <input type="text" id="name" required placeholder="Enter Full Name">
                </div>
                <div class="field-group">
                    <label>Section</label>
                    <input type="text" id="section" required placeholder="e.g. P9,P4,P3">
                </div>
                <div class="field-group">
                    <label>Mobile no</label>
                    <input type="tel" id="mobile" required placeholder="Contact Number">
                </div>
                <div class="field-group">
                    <label>Email id</label>
                    <input type="email" id="email" required placeholder="legion@example.com">
                </div>
                <div class="field-group full-width">
                    <label>At what domain are you interested in?</label>
                    <input type="text" id="interest" required placeholder="social media, designing, iot, tech">
                </div>
                <div class="field-group full-width">
                    <label>Relevant Skills</label>
                    <input type="text" id="skills" required placeholder="Java, Python, Figma...">
                </div>
                <div class="field-group full-width">
                    <label>Why join the Legion?</label>
                    <textarea id="reason" required placeholder="Explain your motivation..."></textarea>
                </div>
            </div>
            <button type="submit" id="submitBtn">Submit Membership</button>
        </form>
        <div class="admin-link">
            <a href="/admin">Admin Dashboard →</a>
        </div>
    </div>
    <script>
        document.getElementById('legionForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
            btn.disabled = true;
            btn.textContent = 'SUBMITTING...';

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: document.getElementById('name').value,
                        section: document.getElementById('section').value,
                        mobile: document.getElementById('mobile').value,
                        email: document.getElementById('email').value,
                        interest: document.getElementById('interest').value,
                        skills: document.getElementById('skills').value,
                        reason: document.getElementById('reason').value
                    })
                });

                const data = await response.json();
                if (data.success) {
                    alert('✅ ACCESS GRANTED!\\n\\nRegistration ID: ' + data.id + '\\n\\nWelcome to Logic Legion!');
                    document.getElementById('legionForm').reset();
                } else {
                    alert('❌ ERROR: ' + data.error);
                }
            } catch (err) {
                alert('⚠️ CONNECTION FAILED!');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Submit Membership';
            }
        });
    </script>
</body>
</html>\`;
}

function getAdminHTML() {
    return \`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logic Legion | Admin Dashboard</title>
    <style>
        :root { --neon-green: #39FF14; --deep-space: #0a0a0c; --glass-bg: rgba(15, 15, 15, 0.9); }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Orbitron', 'Segoe UI', sans-serif; }
        body {
            background: var(--deep-space);
            background-image: radial-gradient(circle at 20% 30%, rgba(57, 255, 20, 0.08) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(57, 255, 20, 0.08) 0%, transparent 40%);
            color: #fff;
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        h1 {
            color: var(--neon-green);
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 5px;
            margin-bottom: 30px;
            text-shadow: 0 0 10px var(--neon-green);
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: var(--glass-bg);
            border: 1px solid rgba(57, 255, 20, 0.3);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
        }
        .stat-number {
            font-size: 2.5rem;
            color: var(--neon-green);
            font-weight: bold;
        }
        .stat-label {
            color: rgba(255, 255, 255, 0.7);
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 2px;
        }
        .controls { text-align: center; margin-bottom: 20px; }
        .btn {
            background: transparent;
            color: var(--neon-green);
            border: 2px solid var(--neon-green);
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-size: 0.8rem;
            margin: 10px 5px;
            transition: 0.3s;
            text-decoration: none;
            display: inline-block;
        }
        .btn:hover {
            background: var(--neon-green);
            color: #000;
            box-shadow: 0 0 20px var(--neon-green);
        }
        .table-container {
            background: var(--glass-bg);
            border: 1px solid rgba(57, 255, 20, 0.3);
            border-radius: 15px;
            padding: 20px;
            overflow-x: auto;
        }
        table { width: 100%; border-collapse: collapse; }
        th {
            background: rgba(57, 255, 20, 0.1);
            color: var(--neon-green);
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 1px;
            padding: 15px 10px;
            text-align: left;
            border-bottom: 2px solid var(--neon-green);
        }
        td {
            padding: 15px 10px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 0.85rem;
        }
        tr:hover { background: rgba(57, 255, 20, 0.05); }
        .loading { text-align: center; padding: 50px; font-size: 1.2rem; color: var(--neon-green); }
        .error {
            background: rgba(255, 0, 0, 0.1);
            border: 1px solid rgba(255, 0, 0, 0.3);
            color: #ff4444;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Admin Dashboard</h1>
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number" id="totalCount">-</div>
                <div class="stat-label">Total Registrations</div>
            </div>
        </div>
        <div class="controls">
            <button class="btn" onclick="loadRegistrations()">🔄 Refresh</button>
            <button class="btn" onclick="exportData()">📥 Export CSV</button>
            <a href="/" class="btn">🏠 Registration Form</a>
        </div>
        <div class="table-container">
            <div id="content">
                <div class="loading">Loading...</div>
            </div>
        </div>
    </div>
    <script>
        async function loadRegistrations() {
            const contentDiv = document.getElementById('content');
            contentDiv.innerHTML = '<div class="loading">Loading...</div>';
            try {
                const response = await fetch('/registrations');
                const result = await response.json();
                if (result.success) {
                    displayRegistrations(result.data);
                    document.getElementById('totalCount').textContent = result.count;
                } else {
                    contentDiv.innerHTML = \\\`<div class="error">\\\${result.error}</div>\\\`;
                }
            } catch (error) {
                contentDiv.innerHTML = '<div class="error">Failed to load data!</div>';
            }
        }

        function displayRegistrations(data) {
            const contentDiv = document.getElementById('content');
            if (data.length === 0) {
                contentDiv.innerHTML = '<div class="loading">No registrations yet! 🎯</div>';
                return;
            }
            let html = \\\`<table><thead><tr><th>ID</th><th>Name</th><th>Section</th><th>Email</th><th>Mobile</th><th>Interest</th><th>Skills</th><th>Date</th></tr></thead><tbody>\\\`;
            data.forEach(reg => {
                const date = new Date(reg.registeredAt).toLocaleString();
                html += \\\`<tr><td>\\\${reg.registrationId}</td><td>\\\${reg.name}</td><td>\\\${reg.section}</td><td>\\\${reg.email}</td><td>\\\${reg.mobile}</td><td>\\\${reg.interest}</td><td>\\\${reg.skills}</td><td>\\\${date}</td></tr>\\\`;
            });
            html += '</tbody></table>';
            contentDiv.innerHTML = html;
        }

        function exportData() {
            fetch('/registrations')
                .then(res => res.json())
                .then(result => {
                    if (result.success) {
                        const headers = ['ID', 'Name', 'Section', 'Email', 'Mobile', 'Interest', 'Skills', 'Reason', 'Date'];
                        const rows = result.data.map(reg => [
                            reg.registrationId, reg.name, reg.section, reg.email, reg.mobile,
                            reg.interest, reg.skills, reg.reason, new Date(reg.registeredAt).toLocaleString()
                        ]);
                        const csv = [headers, ...rows].map(row => row.map(cell => \\\`"\\\${cell}"\\\`).join(',')).join('\\\\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'registrations.csv';
                        a.click();
                    }
                });
        }

        loadRegistrations();
        setInterval(loadRegistrations, 30000);
    </script>
</body>
</html>\`;
}

app.listen(PORT, () => {
    console.log(\\\`
╔════════════════════════════════════════╗
║   LOGIC LEGION SERVER ONLINE 🚀       ║
╠════════════════════════════════════════╣
║  Port: \\\${PORT}                           ║
║  Status: ✅ RUNNING                     ║
╚════════════════════════════════════════╝
    \\\`);
});
