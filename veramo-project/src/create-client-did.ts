import { agent } from './veramo/setup.js'
import * as fs from 'fs'

async function main() {
  const clientIdentifier = await agent.didManagerCreate({ alias: 'client' })
  console.log('New client identifier created')
  console.log(JSON.stringify(clientIdentifier, null, 2))

  fs.writeFileSync('client-did.json', JSON.stringify(clientIdentifier, null, 2))

  console.log('New did created and saved to client-did.json')
}

main().catch(console.error)
