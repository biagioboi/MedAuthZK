import fs from "fs";
import { ethers, providers } from "ethers";
import { PRIVATE_KEY, RPC_URL, SBT_ADDRESS_MULTI } from "../veramo/setup.js";
import path from 'path';
const provider = new providers.JsonRpcProvider(RPC_URL);
// ABI del contratto SBT
const artifactsPath = path.join('..', 'contracts', 'artifacts', `MedicalRecordMultiSBT_metadata.json`);
// Leggi l'ABI dal file JSON
const contractArtifact = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
const sbtAbi = contractArtifact.output.abi;
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
// Inizializza il contratto SBT con il wallet
const sbtContract = new ethers.Contract(SBT_ADDRESS_MULTI, sbtAbi, wallet);
// Funzione per recuperare gli SBTs associati a un indirizzo
async function getSBTs(holder) {
    try {
        console.log(`Recuperando gli SBTs per l'indirizzo: ${holder}`);
        // Assumendo che il contratto abbia una funzione getSBTs(address) che ritorni gli SBTs
        // Per esempio, supponiamo che la funzione `getSBTs` restituisca un array di token ID
        const sbts = await sbtContract.getAllSBTsForAddress(holder);
        if (sbts.length === 0) {
            console.log(`Nessun SBT trovato per l'indirizzo ${holder}.`);
        }
        else {
            console.log(`Trovati ${sbts.length} SBTs per l'indirizzo ${holder}:`);
            for (let tokenID of sbts) {
                console.log(`\t- Token ID: ${tokenID.toString()}`);
                // Recupera il MedicalRecord per il tokenID
                const medicalRecord = await sbtContract.getMedicalRecord(tokenID);
                // Stampa i dettagli della diagnosi
                if (medicalRecord) {
                    console.log(medicalRecord);
                }
                else {
                    console.log(`\t\t- Nessun record medico trovato per il Token ID: ${tokenID}`);
                }
            }
        }
    }
    catch (error) {
        console.error("Errore nel recupero degli SBTs:", error);
    }
}
// Eseguiamo la funzione getSBTs passando l'indirizzo del holder
const holderAddress = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57"; // Sostituisci con l'indirizzo dell'utente
getSBTs(holderAddress).catch(console.error);
