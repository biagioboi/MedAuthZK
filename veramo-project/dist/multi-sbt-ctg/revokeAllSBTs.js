import fs from "fs";
import { ethers, providers } from "ethers";
import { PRIVATE_KEY, RPC_URL, SBT_ADDRESS_MULTI_CTG, ADDRESS_ACCOUNT } from "../veramo/setup.js";
import path from 'path';
const provider = new providers.JsonRpcProvider(RPC_URL);
// ABI del contratto SBT
const artifactsPath = path.join('..', 'contracts', 'artifacts', `MedicalRecordSBT_MultiCTGmetadata.json`);
// Leggi l'ABI dal file JSON
const contractArtifact = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
const sbtAbi = contractArtifact.output.abi;
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
// Inizializza il contratto SBT con il wallet
const sbtContract = new ethers.Contract(SBT_ADDRESS_MULTI_CTG, sbtAbi, wallet);
// Funzione per recuperare gli SBTs associati a un indirizzo
// Funzione per recuperare gli SBTs associati a un indirizzo
async function getSBTs() {
    let totalGasUsed = ethers.BigNumber.from(0); // Inizializza il contatore del gas totale
    const startTotalTime = performance.now(); // Inizio misurazione del tempo totale
    const holder = ADDRESS_ACCOUNT;
    try {
        console.log(`Recuperando gli SBTs per l'indirizzo: ${holder}`);
        // Assumiamo che il contratto abbia una funzione getAllSBTsForAddress(holder)
        const sbts = await sbtContract.getAllSBTsForAddress(holder);
        if (sbts.length === 0) {
            console.log(`Nessun SBT trovato per l'indirizzo ${holder}.`);
        }
        else {
            console.log(`Trovati ${sbts.length} SBTs per l'indirizzo ${holder}:`);
            for (let tokenID of sbts) {
                console.log(`\t- Token ID: ${tokenID.toString()}`);
                const startIterationTime = performance.now(); // Inizio misurazione tempo per singola iterazione
                // Esegui la funzione di revoca per ogni tokenID e somma il gas usato
                const gasUsedForTx = await revokeSBT(tokenID);
                totalGasUsed = totalGasUsed.add(gasUsedForTx);
                const endIterationTime = performance.now(); // Fine misurazione tempo per singola iterazione
                console.log(`Tempo impiegato per revocare il Token ID ${tokenID}: ${(endIterationTime - startIterationTime).toFixed(2)} ms.`);
            }
        }
    }
    catch (error) {
        console.error("Errore nel recupero degli SBTs:", error);
    }
    const endTotalTime = performance.now(); // Fine misurazione del tempo totale
    console.log(`Tempo impiegato: ${(endTotalTime - startTotalTime).toFixed(2)} ms`);
    // Alla fine, stampa il gas totale utilizzato
    console.log(`Gas usato: ${totalGasUsed.toString()}`);
}
// Funzione per revocare un SBT
async function revokeSBT(tokenID) {
    try {
        console.log(`Revoca dell'SBT con Token ID ${tokenID} in corso...`);
        // Esegui la vera transazione di revoca
        const tx = await sbtContract.revokeSBT(tokenID); // Passiamo il tokenID alla funzione
        console.log(`Transazione di revoca inviata per il Token ID ${tokenID}:`, tx.hash);
        // Attendi la conferma della transazione
        const receipt = await tx.wait();
        console.log("Transazione confermata nel blocco:", receipt.blockNumber);
        console.log(`SBT con Token ID ${tokenID} revocato con successo.`);
        // Restituiamo il gas usato per questa transazione
        return receipt.gasUsed;
    }
    catch (error) {
        console.error(`Errore durante la revoca dell'SBT con Token ID ${tokenID}:`, error);
        return ethers.BigNumber.from(0); // Se c'è un errore, restituisci 0 gas usato
    }
}
// Eseguiamo la funzione getSBTs passando l'indirizzo del holder // Sostituisci con l'indirizzo dell'utente
getSBTs().catch(console.error);
