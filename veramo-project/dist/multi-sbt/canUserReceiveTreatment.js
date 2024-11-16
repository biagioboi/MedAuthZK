import fs from "fs";
import { ethers, providers } from "ethers";
import { PRIVATE_KEY, RPC_URL, SBT_ADDRESS_MULTI, ADDRESS_ACCOUNT } from "../veramo/setup.js";
import path from 'path';
const provider = new providers.JsonRpcProvider(RPC_URL);
// ABI del contratto SBT
const artifactsPath = path.join('..', 'contracts', 'artifacts', `MedicalRecordMultiSBT_metadata.json`);
const contractArtifact = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
const sbtAbi = contractArtifact.output.abi;
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
// Inizializza il contratto SBT con il wallet
const sbtContract = new ethers.Contract(SBT_ADDRESS_MULTI, sbtAbi, wallet);
// Funzione per leggere le malattie dal file malattieDB.json
function getMalattieFromDB(filePath) {
    const malattieDB = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return malattieDB; // Presupponendo che il file contenga un array di malattie
}
// Funzione per verificare se un utente può ricevere un trattamento
async function testCanUserReceiveTreatment(hashedDiagnosis, subcategoryNome) {
    const address_account = ADDRESS_ACCOUNT;
    try {
        const start = performance.now(); // Inizio misurazione del tempo
        // Chiamata alla funzione canUserReceiveTreatment
        const canReceiveTreatment = await sbtContract.canUserReceiveTreatment(address_account, hashedDiagnosis);
        const end = performance.now(); // Fine misurazione del tempo
        console.log(`L'utente con indirizzo ${address_account} può ricevere trattamento per la diagnosi ${subcategoryNome}: ${canReceiveTreatment}`);
        console.log(`Tempo impiegato: ${(end - start).toFixed(2)} ms.`);
    }
    catch (error) {
        console.error("Errore durante la verifica:", error);
    }
}
// Esempio di percorsi ai file
const verifiableCredentialPath = path.join("./outputs", "credential.json");
const malattieDBPath = path.join("./dist/utils", "categorieDB.json");
const malattie = getMalattieFromDB(malattieDBPath);
// Esegui il test solo per le sottocategorie
for (const malattia of malattie) {
    const mainCategoryHash = malattia.hash; // Hash della categoria principale
    // Itera su ciascuna sottocategoria della malattia
    for (const sottocategoria of malattia.sottocategorie) {
        const subcategoryHash = sottocategoria.hash; // Hash della sottocategoria
        const subcategoryNome = sottocategoria.nome; // Nome della sottocategoria
        // Esegui la chiamata alla funzione di test per la sottocategoria
        await testCanUserReceiveTreatment(subcategoryHash, subcategoryNome);
    }
}
