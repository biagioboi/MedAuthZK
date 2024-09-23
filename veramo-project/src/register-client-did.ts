import { ethers } from "ethers";
import { providers } from 'ethers';
import { agent, PRIVATE_KEY, DID_REGISTRY_ADDRESS } from './veramo/setup.js';
import * as fs from 'fs';

// Utilizza il provider di Hardhat locale
const provider = new providers.JsonRpcProvider('http://127.0.0.1:8545'); // Nodo Hardhat locale
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

async function registerDID() {
  // Leggi il file verifiedCredential.json
  const vcData = JSON.parse(fs.readFileSync('verifiedCredential.json', 'utf8'));
  
  // Estrai il DID document
  const didDocument = vcData.didResolutionResult.didDocument;
  const did = didDocument.id;

  console.log('DID Document:', didDocument);

  // Instanzia il contratto `EthereumDIDRegistry` distribuito su Hardhat locale
  const ethrDid = new ethers.Contract(
    DID_REGISTRY_ADDRESS,
    [
      'function updateDIDDocument(string memory _did, bytes memory _document) public',
    ],
    wallet
  );

  // Converti il DID document in bytes
  const documentBytes = ethers.utils.toUtf8Bytes(JSON.stringify(didDocument));
  console.log(documentBytes);
  

  // Invia la transazione per aggiornare il DID document
  const tx = await ethrDid.updateDIDDocument(did, documentBytes);
  const receipt = await tx.wait();

  console.log('Transaction hash:', receipt.transactionHash);
}

// Esegui la funzione
registerDID().catch(console.error);
