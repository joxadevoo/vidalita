const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testHealth() {
    console.log("Checking backend health...");
    const endpoints = [
        '/products',
        '/products/categories',
        '/inventory/stock',
        '/sales',
        '/appointments',
        '/stats/dashboard'
    ];

    for (const endpoint of endpoints) {
        try {
            const res = await axios.get(`${API_BASE}${endpoint}`);
            console.log(`✅ ${endpoint}: SUCCESS (${res.status})`);
        } catch (err) {
            console.log(`❌ ${endpoint}: FAILED (${err.response?.status || err.message})`);
        }
    }
}

testHealth();
