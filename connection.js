const pg = require('pg');
const conString = "postgres://postgres:rafaelikram7@localhost:5432/web_chat";

const client = new pg.Client(conString);
client.connect();
// alternative - new ES7 syntax with 'await':
// await db.one('SELECT name FROM users WHERE id = $1', [123]);

module.exports = client;