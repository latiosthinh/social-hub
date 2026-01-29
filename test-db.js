const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(process.cwd(), 'broadcaster.db');
console.log('Testing DB at:', dbPath);

try {
    const db = new Database(dbPath);
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Tables:', tables);

    const email = 'test@example.com';
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    console.log('Existing user:', user);

    if (!user) {
        console.log('Inserting new user...');
        const id = crypto.randomUUID();
        db.prepare('INSERT INTO users (id, email) VALUES (?, ?)').run(id, email);
        console.log('Inserted successfully. ID:', id);
    }
} catch (error) {
    console.error('DB Test Error:', error);
}
