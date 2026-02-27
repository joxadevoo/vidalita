import fs from 'fs';
import path from 'path';

const localesDir = 'c:/Users/joxad/Desktop/vidalita/frontend/src/i18n/locales';
const files = ['uz.json', 'en.json', 'ru.json', 'tr.json'];

function getAllKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            keys = keys.concat(getAllKeys(obj[key], fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

const allLocalesData = {};
files.forEach(file => {
    const content = fs.readFileSync(path.join(localesDir, file), 'utf-8');
    allLocalesData[file] = JSON.parse(content);
});

const keySets = {};
files.forEach(file => {
    keySets[file] = new Set(getAllKeys(allLocalesData[file]));
});

const masterKeys = new Set();
files.forEach(file => {
    keySets[file].forEach(key => masterKeys.add(key));
});

console.log(`Summary of keys:`);
files.forEach(file => {
    console.log(`${file}: ${keySets[file].size} keys`);
});

console.log('\nMissing keys comparison (vs Master Set):');
files.forEach(file => {
    const missing = [];
    masterKeys.forEach(key => {
        if (!keySets[file].has(key)) {
            missing.push(key);
        }
    });
    if (missing.length > 0) {
        console.log(`\n--- ${file} is missing ${missing.length} keys ---`);
        console.log(missing.slice(0, 20).join('\n'));
        if (missing.length > 20) console.log('...');
    } else {
        console.log(`\n--- ${file} has all keys ---`);
    }
});
