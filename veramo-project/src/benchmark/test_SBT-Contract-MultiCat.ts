import fs from "fs";
import { ethers, providers } from "ethers";
import { ADDRESS_ACCOUNT, PRIVATE_KEY, RPC_URL, SBT_ADDRESS_MULTI_CTG } from "../veramo/setup.js";
import path from 'path';

const provider = new providers.JsonRpcProvider(RPC_URL);

// ABI del contratto SBT
const artifactsPath = path.join('..', 'contracts', 'artifacts', `MedicalRecordSBT-category_metadata.json`);
const contractArtifact = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
const sbtAbi = contractArtifact.output.abi;

const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Inizializza il contratto SBT con il wallet
const sbtContract = new ethers.Contract(SBT_ADDRESS_MULTI_CTG, sbtAbi, wallet);

// Funzione per leggere il DID dal file verifiableCredential.json
function getDidFromCredential(filePath:string) {
    const credential = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return credential.credentialSubject.id; // Presupponendo che il DID sia in id
}

// Funzione per leggere le malattie dal file malattieDB.json
function getMalattieFromDB(filePath:string) {
    const malattieDB = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return malattieDB; // Presupponendo che il file contenga un array di malattie
}

// Funzione per verificare se un utente può ricevere un trattamento per una categoria
async function testCanUserReceiveTreatment(mainCategoryHash:string) {
    try {
        // Chiamata alla funzione canUserReceiveTreatment con l'hash principale della malattia
        const canReceiveTreatment = await sbtContract.canUserReceiveTreatment(ADDRESS_ACCOUNT, mainCategoryHash);
        return canReceiveTreatment; // Restituisce il risultato
    } catch (error) {
        console.error("Errore durante la verifica:", error);
        return null; // Gestione dell'errore
    }
}

// Esempio di percorsi ai file
const malattieDBPath = path.join("./dist/utils", "categorieDB.json");

// Estrazione del DID e delle malattie
const malattie = getMalattieFromDB(malattieDBPath);

// Imposta il numero di iterazioni variabili
const iterationsArray = Array.from({ length: 5 }, (_, i) => (i + 1) * 20); // [5, 10, 15, ..., 100]

// Array per salvare i risultati
const results = [];

// Variabili per calcolare il tempo medio generale
let totalAverageTime = 0; // Somma dei tempi medi
let totalResultsCount = 0; // Contatore totale dei risultati

// Esegui il test solo per le sottocategorie
for (const malattia of malattie) {
    const mainCategoryHash = malattia.hash; // Hash della categoria principale
    const mainCategoryName = malattia.nome; // Nome della categoria principale

    console.log(`Testing malattia: ${mainCategoryName}`); // Log della categoria principale

    // Itera su ciascuna sottocategoria della malattia
    for (const sottocategoria of malattia.sottocategorie) {
        const subcategoryNome = sottocategoria.nome; // Nome della sottocategoria

        console.log(`\nTesting subcategory: ${subcategoryNome}`); // Log della sottocategoria

        // Esegui il benchmark per ogni numero di iterazioni
        for (const iterations of iterationsArray) {
            let totalEligibleCount = 0; // Contatore per i casi idonei
            let totalIneligibleCount = 0; // Contatore per i casi non idonei
            let totalElapsedTime = 0; // Tempo totale per le iterazioni

            // Esegui le iterazioni
            for (let i = 0; i < iterations; i++) {
                const startTime = performance.now(); // Inizio del tempo
                const canReceiveTreatment = await testCanUserReceiveTreatment(mainCategoryHash);
                const endTime = performance.now(); // Fine del tempo

                const elapsedTime = endTime - startTime; // Calcola il tempo impiegato
                totalElapsedTime += elapsedTime; // Accumula il tempo per ciascuna iterazione

                // Aggiorna i contatori
                if (canReceiveTreatment) {
                    totalEligibleCount++;
                } else if (canReceiveTreatment === false) {
                    totalIneligibleCount++;
                }
            }

            const averageTime = (totalElapsedTime / iterations).toFixed(2); // Calcola il tempo medio

            // Log dei risultati per ogni iterazione
            console.log(`Media per ${subcategoryNome} con ${iterations} iterazioni: ${averageTime} ms`);
            console.log(`Idonei: ${totalEligibleCount}, Non idonei: ${totalIneligibleCount}`);

            // Aggiungi i risultati all'array
            results.push({
                mainCategory: mainCategoryName,
                subcategory: subcategoryNome,
                iterations,
                averageTime,
                eligibleCount: totalEligibleCount,
                ineligibleCount: totalIneligibleCount,
            });

            // Somma il tempo medio per il calcolo finale
            totalAverageTime += parseFloat(averageTime);
            totalResultsCount++; // Incrementa il contatore dei risultati
        }
    }
}

// Calcola il tempo medio generale
const overallAverageTime = (totalAverageTime / totalResultsCount).toFixed(2); // Calcola il tempo medio generale

// Salva i risultati in un file CSV
const csvHeader = "Categoria Principale,Sottocategoria,Iterazioni,Tempo Medio (ms),Conteggio Idonei,Conteggio Non Idonei\n";
const csvRows = results.map(result => `${result.mainCategory},${result.subcategory},${result.iterations},${result.averageTime},${result.eligibleCount},${result.ineligibleCount}`).join("\n");
const csvContent = csvHeader + csvRows;

// Scrivi il file CSV
const csvPath = path.join("./outputs", "benchmark_results_multiple_categories.csv");
fs.writeFileSync(csvPath, csvContent, "utf8");

console.log(`Risultati salvati in ${csvPath}`);
console.log(`Tempo medio generale tra tutte le medie: ${overallAverageTime} ms`);
