import mysql from 'mysql2/promise';
const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'swiftmatch1bd', charset: 'utf8mb4', waitForConnections: true, connectionLimit: 1 });

const [profiles] = await pool.query('SELECT id, display_name, name, city, bio FROM user_profiles WHERE id = 2');
console.log('Profile:');
console.log(JSON.stringify(profiles[0], null, 2));
for (const [k, v] of Object.entries(profiles[0])) {
  console.log(`${k}: "${v}" (${typeof v}, length=${String(v).length})`);
}

const [cities] = await pool.query("SELECT DISTINCT city FROM user_profiles WHERE city IS NOT NULL AND city != '' ORDER BY city LIMIT 10");
console.log('\nCities:');
cities.forEach(r => console.log(`  "${r.city}" (${r.city.length} chars)`));

const [cc] = await pool.query('SELECT banned_words, cities FROM content_config WHERE id = 1');
console.log('\nContent config cities field:');
console.log('banned_words type:', typeof cc[0].banned_words, Array.isArray(cc[0].banned_words));
console.log('cities value:', JSON.stringify(cc[0].cities));

await pool.end();
