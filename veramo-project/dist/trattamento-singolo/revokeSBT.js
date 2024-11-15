import fs from "fs";
import { providers, Contract, Wallet } from "ethers";
import { PRIVATE_KEY, RPC_URL, SBT_ADDRESS } from "../veramo/setup.js";
import path from "path";
const provider = new providers.JsonRpcProvider(RPC_URL);
// Carica l'ABI del contratto SBT
const artifactsPath = path.join("..", "contracts", "artifacts", `MedicalRecordSBT-category_metadata.json`);
const contractArtifact = JSON.parse(fs.readFileSync(artifactsPath, "utf8"));
const sbtAbi = contractArtifact.output.abi;
// Configura il wallet e il contratto
const wallet = new Wallet(PRIVATE_KEY, provider);
const sbtContract = new Contract(SBT_ADDRESS, sbtAbi, wallet);
/**
 * Funzione per revocare un SBT
 */
async function revokeSBT() {
    try {
        console.log("Revoca dell'SBT in corso...");
        // Esegui la vera transazione di revoca
        const tx = await sbtContract.revokeSBT();
        console.log("Transazione di revoca inviata:", tx.hash);
        // Attendi la conferma della transazione
        const receipt = await tx.wait();
        console.log("Transazione confermata nel blocco:", receipt.blockNumber);
        console.log(`Gas usato: ${receipt.gasUsed.toString()}`);
        console.log("SBT revocato con successo.");
    }
    catch (error) {
        console.error("Errore durante la revoca dell'SBT:", error);
    }
}
// Esempio di esecuzione della funzione
revokeSBT().catch(console.error);
