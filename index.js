console.time('Startup')
require('colors')
const Nisru = require('./src/Nisru')
const config = require('./config')
const client = new Nisru(config)
client.login()