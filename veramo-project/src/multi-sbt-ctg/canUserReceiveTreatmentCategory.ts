import fs from "fs";
import { ethers, providers } from "ethers";
import { PRIVATE_KEY, RPC_URL, SBT_ADDRESS_MULTI_CTG, ADDRESS_ACCOUNT } from "../veramo/setup.js";
import path from 'path';

const provider = new providers.JsonRpcProvider(RPC_URL);

// ABI del contratto SBT
const artifactsPath = path.join('..', 'contracts', 'artifacts', `MedicalRecordSBT_MultiCTGmetadata.json`);
const contractArtifact = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
const sbtAbi = contractArtifact.output.abi;

const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Inizializza il contratto SBT con il wallet
const sbtContract = new ethers.Contract(SBT_ADDRESS_MULTI_CTG, sbtAbi, wallet);

// Funzione per leggere le malattie dal file malattieDB.json
function getMalattieFromDB(filePath: string): any[] {
    const malattieDB = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return malattieDB; // Presupponendo che il file contenga un array di malattie
}

// Funzione per verificare se un utente può ricevere un trattamento per una sottocategoria
async function testCanUserReceiveTreatment(mainCategoryHash: string, subcategoryNome: string) {
    const start = performance.now(); // Inizia a misurare il tempo per la funzione
    try {
        // Chiamata alla funzione canUserReceiveTreatment con l'hash principale della malattia
        const canReceiveTreatment = await sbtContract.canUserReceiveTreatment(ADDRESS_ACCOUNT, mainCategoryHash);

        // Log del risultato con il nome della sottocategoria
        if (canReceiveTreatment) {
            console.log(`L'utente con indirizzo ${ADDRESS_ACCOUNT} può ricevere trattamento per la sottocategoria "${subcategoryNome}".`);
        } else {
            console.log(`L'utente con indirizzo ${ADDRESS_ACCOUNT} NON può ricevere trattamento per la sottocategoria "${subcategoryNome}".`);
        }

    } catch (error) {
        console.error("Errore durante la verifica:", error);
    }
    const end = performance.now(); // Termina la misurazione del tempo

    const durationInMilliseconds = (end - start).toFixed(2); // Calcola la durata in millisecondi e arrotonda a 2 decimali

    // Stampa il tempo impiegato
    console.log(`Tempo impiegato: ${durationInMilliseconds} ms`);
}

// Esempio di percorsi ai file
const verifiableCredentialPath = path.join("./outputs", "credential-subcategory.json");
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
        await testCanUserReceiveTreatment(mainCategoryHash, subcategoryNome);
    }
}
