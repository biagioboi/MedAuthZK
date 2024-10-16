import fs from "fs";
import { ethers, providers } from "ethers";
import { PRIVATE_KEY, RPC_URL, SBT_ADDRESS } from "./veramo/setup.js";
import path from 'path'; 

const provider = new providers.JsonRpcProvider(RPC_URL);

// ABI del contratto SBT
const artifactsPath = path.join('..', 'contracts', 'artifacts', `MedicalRecordSBT_metadata.json`);
const contractArtifact = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
const sbtAbi = contractArtifact.output.abi;

const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Inizializza il contratto SBT con il wallet
const sbtContract = new ethers.Contract(SBT_ADDRESS, sbtAbi, wallet);

// Funzione per leggere il DID dal file verifiableCredential.json
function getDidFromCredential(filePath: string) {
    const credential = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return credential.credentialSubject.id; // Presupponendo che il DID sia in id
}

// Funzione per leggere le malattie dal file malattieDB.json
function getMalattieFromDB(filePath: string) {
    const malattieDB = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return malattieDB; // Presupponendo che il file contenga un array di malattie
}

// Funzione per verificare se un utente può ricevere un trattamento
async function testCanUserReceiveTreatment(did: string, hashedDiagnosis: string) {
    try {
        // Chiamata alla funzione canUserReceiveTreatment
        const canReceiveTreatment = await sbtContract.canUserReceiveTreatment(did, hashedDiagnosis);

        // Log del risultato
        console.log(`L'utente con DID ${did} può ricevere trattamento per la diagnosi ${hashedDiagnosis}: ${canReceiveTreatment}`);
    } catch (error) {
        console.error("Errore durante la verifica:", error);
    }
}

// Esempio di percorsi ai file
const verifiableCredentialPath = path.join("./outputs", "credential.json");
const malattieDBPath = path.join("./dist/utils", "categorieDB.json");
// Estrazione del DID e delle malattie
const didToTest = getDidFromCredential(verifiableCredentialPath);
const malattie = getMalattieFromDB(malattieDBPath);
// Esegui il test solo per le sottocategorie
for (const malattia of malattie) {
    const mainCategoryHash = malattia.hash; // Hash della categoria principale
    // Itera su ciascuna sottocategoria della malattia
    for (const sottocategoria of malattia.sottocategorie) {
        const subcategoryHash = sottocategoria.hash; // Hash della sottocategoria
        const subcategoryNome = sottocategoria.nome; // Nome della sottocategoria
        // Esegui la chiamata alla funzione di test per la sottocategoria
        await testCanUserReceiveTreatment(didToTest, subcategoryHash);
    }
}
