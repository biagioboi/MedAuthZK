import { agent } from './veramo/setup.js'
import * as fs from 'fs'

async function main() {
  const issuerIdentifier = await agent.didManagerCreate({ alias: 'issuer' })
  console.log('New issuer identifier created')
  console.log(JSON.stringify(issuerIdentifier, null, 2))

  fs.writeFileSync('issuer-did.json', JSON.stringify(issuerIdentifier, null, 2))

  console.log('New did created and saved to issuer-did.json')
}

main().catch(console.error)
