const fs = require('fs')
const dotenv = require('dotenv')
const envConfig = dotenv.parse(fs.readFileSync('tests/.env'))
for (const k in envConfig) {
  process.env[k] = envConfig[k]
}
