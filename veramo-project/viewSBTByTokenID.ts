import { ethers, providers } from "ethers";
import {RPC_URL} from "../veramo-project/dist/veramo/setup.js"

// Inizializza il provider e l'indirizzo del contratto SBT
const provider = new providers.JsonRpcProvider(RPC_URL);
const SBT_ADDRESS = "0x057d2360abbe75f9fdf142f2cfe68cfc9a74ec12";

// ABI del contratto SBT (deve essere riempito con l'ABI reale)
const sbtAbi: ethers.ContractInterface = [
  // Aggiungi qui le definizioni delle funzioni e degli eventi del contratto SBT
];

// Inizializza il contratto SBT
const sbtContract = new ethers.Contract(SBT_ADDRESS, sbtAbi, provider);

// Funzione per leggere i dati del SBT
async function readSBTData(tokenId: number, ownerAddress: string): Promise<void> {
    try {
        // Esempio 1: Verifica chi è il proprietario del token
        const owner: string = await sbtContract.ownerOf(tokenId);
        console.log(`Il proprietario del token ${tokenId} è: ${owner}`);

        // Esempio 2: Leggere il record medico (specifico per il tuo contratto)
        const medicalRecord: string = await sbtContract.getMedicalRecord(owner);
        console.log("Medical Record:", medicalRecord);

    } catch (error) {
        console.error("Errore nella lettura dei dati del SBT:", error);
    }
}

// Inserisci l'ID del token e l'indirizzo del proprietario che desideri leggere
const tokenId: number = 2; // Cambia con il tokenId desiderato
const ownerAddress: string = "0xInserisciQuiLIndirizzoDelProprietario"; // Inserisci qui l'indirizzo del proprietario

readSBTData(tokenId, ownerAddress).catch(console.error);
