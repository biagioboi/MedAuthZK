import { ethers } from "ethers"; // Importa la libreria ethers
import { providers } from 'ethers'; // Importa i provider da ethers
import { RPC_URL, PRIVATE_KEY, DID_REGISTRY_ADDRESS } from './veramo/setup.js'; // Importa le configurazioni da Veramo
import * as fs from 'fs'; // Importa il modulo fs per la gestione dei file
import path from 'path';

// Utilizza il provider JsonRPC
const provider = new providers.JsonRpcProvider(RPC_URL); // Nodo Hardhat locale
const wallet = new ethers.Wallet(PRIVATE_KEY, provider); // Crea un wallet utilizzando la chiave privata

// Funzione per registrare il DID
async function registerClientDID() {
  const vcDataPath = path.join('outputs', 'verifiedCredential.json'); // Percorso del file della credenziale verificata

  // Leggi e analizza la Verifiable Credential dal file
  const vcData = JSON.parse(fs.readFileSync(vcDataPath, 'utf8'));
  
  // Estrai il DID document
  const didDocument = vcData.didResolutionResult.didDocument;
  const did = didDocument.id;

  console.log('Documento DID:', didDocument); // Mostra il DID document nel log

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
  console.log(documentBytes); // Mostra i bytes del documento nel log
  
  // Stima il gas necessario per la transazione
  const estimatedGas = await ethrDid.estimateGas.updateDIDDocument(did, documentBytes);
  console.log('Gas stimato:', estimatedGas.toString()); // Mostra il gas stimato

  // Invia la transazione per aggiornare il DID document
  const tx = await ethrDid.updateDIDDocument(did, documentBytes);
  const receipt = await tx.wait(); // Aspetta che la transazione venga confermata

  console.log('Transaction hash:', receipt.transactionHash); // Mostra l'hash della transazione
}

// Esegui la funzione
registerClientDID().catch(console.error); // Esegui la funzione e gestisci eventuali errori

// Esporta la funzione per l'utilizzo in altri moduli
export { registerClientDID };
