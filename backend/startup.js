import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Config path
const CONFIG_FILE = path.join(path.dirname(process.execPath), 'app-config.json');

// Interface to read user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => {
    return new Promise((resolve) => rl.question(query, resolve));
};

async function setup() {
    console.log('--- Vidalita Setup ---');

    if (fs.existsSync(CONFIG_FILE)) {
        console.log('✅ Configuration found. Starting server...');
        return;
    }

    console.log('First time setup: Please specify where to store the database.');

    const defaultPath = path.join(path.dirname(process.execPath), 'db');
    const answer = await askQuestion(`Enter database folder path (default: ${defaultPath}): `);

    const dbDir = answer.trim() || defaultPath;

    // Create config object
    const config = {
        dbPath: path.resolve(dbDir)
    };

    try {
        // Ensure directory exists
        if (!fs.existsSync(config.dbPath)) {
            console.log(`Creating directory: ${config.dbPath}`);
            fs.mkdirSync(config.dbPath, { recursive: true });
        }

        // Write config
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        console.log(`✅ Configuration saved to ${CONFIG_FILE}`);
    } catch (err) {
        console.error('Error saving configuration:', err.message);
        process.exit(1);
    }
}

// Global exception handler to prevent instant close
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
    console.log('Press any key to exit...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 1));
});

(async () => {
    await setup();
    rl.close();

    // Now import the main server
    // Using dynamic import to ensure setup runs first
    console.log('🚀 Launching application...');
    await import('./server.js');
})();
