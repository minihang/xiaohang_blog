import 'dotenv/config'
import { initSchema } from './db.js'
import { runSeed } from './seed.js'

initSchema()
await runSeed()
console.log('[seed] 完毕')
process.exit(0)
