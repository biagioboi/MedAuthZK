import { ethers } from "ethers";
import { providers } from 'ethers';
import { PRIVATE_KEY, DID_REGISTRY_ADDRESS } from './veramo/setup.js';
import * as fs from 'fs';

// Usa il provider di Hardhat locale
const provider = new providers.JsonRpcProvider('http://localhost:8545'); 

const wallet = new ethers.Wallet(PRIVATE_KEY, provider);


async function registerIssuerDID() {
    // Leggi il file issuer-did.json
    const issuerDidData = JSON.parse(fs.readFileSync('issuer-did.json', 'utf8'));

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

    console.log('Issuer DID Document:', didDocument);

    // Contratto per aggiornare il DID document
    const ethrDid = new ethers.Contract(DID_REGISTRY_ADDRESS, [
        'function updateDIDDocument(string memory _did, bytes memory _document) public',
    ], wallet);

    // Converte il DID document in bytes
    const documentBytes = ethers.utils.toUtf8Bytes(JSON.stringify(didDocument));

    // Invio della transazione
    const tx = await ethrDid.updateDIDDocument(issuerDidData.did, documentBytes);
    
    // Aspetta il completamento della transazione
    const receipt = await tx.wait();

    console.log('Transaction hash:', receipt.transactionHash);
}

// Esegui la funzione
registerIssuerDID().catch(console.error);
