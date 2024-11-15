import { ethers } from "ethers"; // Importa la libreria ethers
import { providers } from 'ethers'; // Importa i provider da ethers
import { PRIVATE_KEY, DID_REGISTRY_ADDRESS, RPC_URL } from './veramo/setup.js'; // Importa le configurazioni da Veramo
import * as fs from 'fs'; // Importa il modulo fs per la gestione dei file
import path from 'path';

const provider = new providers.JsonRpcProvider(RPC_URL); 
const wallet = new ethers.Wallet(PRIVATE_KEY, provider); 

// Funzione per registrare il DID dell'issuer
async function registerIssuerDID() {
    // Leggi il file issuer-did.json
    const issuerDidPath = path.join('outputs', 'issuer-did.json');

    // Leggi il file issuer-did.json
    const issuerDidData = JSON.parse(fs.readFileSync(issuerDidPath, 'utf8'));

    // Costruisci il DID document
    const didDocument = {
        id: issuerDidData.did,
        verificationMethod: [
            {
                id: `${issuerDidData.did}#controller`,
                type: 'EcdsaSecp256k1VerificationKey2019',
                controller: issuerDidData.did,
                publicKeyHex: issuerDidData.keys[0].publicKeyHex
            }
        ],
        authentication: [`${issuerDidData.did}#controller`],
        assertionMethod: [`${issuerDidData.did}#controller`]
    };

    console.log('Documento DID dell\'issuer:', didDocument); // Mostra il DID document dell'issuer nel log
    
    // Instanzia il contratto per aggiornare il DID document
    const ethrDid = new ethers.Contract(DID_REGISTRY_ADDRESS, 
        [
            'function updateDIDDocument(string memory _did, bytes memory _document) public',
        ], 
        wallet
    );

    // Converte il DID document in bytes
    const documentBytes = ethers.utils.toUtf8Bytes(JSON.stringify(didDocument));

    // Invio della transazione per aggiornare il DID document
    const tx = await ethrDid.updateDIDDocument(issuerDidData.did, documentBytes);
    
    // Aspetta il completamento della transazione
    const receipt = await tx.wait();
    console.log('Hash della transazione:', receipt.transactionHash); // Mostra l'hash della transazione
    
    // Ottieni il gas effettivamente utilizzato dalla transazione confermata
    console.log('Gas usato:', receipt.gasUsed.toString());
}

// Esegui la funzione
registerIssuerDID().catch(console.error); // Esegui la funzione e gestisci eventuali errori

// Esporta la funzione per l'utilizzo in altri moduli
export { registerIssuerDID };
