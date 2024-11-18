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
async function testCanUserReceiveTreatment(hashedDiagnosis) {
    let canReceiveTreatment;
    const startTime = performance.now(); // Inizio del tempo
    // Chiamata alla funzione canUserReceiveTreatment
    canReceiveTreatment = await sbtContract.canUserReceiveTreatment(ADDRESS_ACCOUNT, hashedDiagnosis);
    const endTime = performance.now(); // Fine del tempo
    const elapsedTime = endTime - startTime; // Calcola il tempo impiegato
    return { canReceiveTreatment, elapsedTime }; // Restituisci il risultato e il tempo
}
const malattieDBPath = path.join("./dist/utils", "categorieDB.json");
// Estrazione del DID e delle malattie
const malattie = getMalattieFromDB(malattieDBPath);
// Imposta il numero di iterazioni variabili
const iterationsArray = Array.from({ length: 5 }, (_, i) => (i + 1) * 20);
// Array per salvare i risultati
const results = [];
// Variabili per calcolare il tempo medio generale
let totalAverageTime = 0; // Somma dei tempi medi
let totalIterations = 0; // Contatore totale di iterazioni
// Esegui il benchmark per le sottocategorie
for (const malattia of malattie) {
    const mainCategoryHash = malattia.hash; // Hash della categoria principale
    const mainCategoryName = malattia.nome; // Nome della categoria principale
    console.log(`Testing malattia: ${malattia.nome}`); // Log per la malattia
    // Itera su ciascuna sottocategoria della malattia
    for (const sottocategoria of malattia.sottocategorie) {
        const subcategoryHash = sottocategoria.hash; // Hash della sottocategoria
        const subcategoryNome = sottocategoria.nome; // Nome della sottocategoria
        console.log(`\nTesting sottocategoria: ${subcategoryNome}`);
        // Esegui il benchmark per ogni numero di iterazioni
        for (const iterations of iterationsArray) {
            let totalElapsedTime = 0; // Tempo totale per le iterazioni
            let eligibleCount = 0; // Contatore per i casi idonei
            let ineligibleCount = 0; // Contatore per i casi non idonei
            // Esegui le iterazioni
            for (let i = 0; i < iterations; i++) {
                const result = await testCanUserReceiveTreatment(subcategoryHash);
                // Controlla se il risultato è null
                if (result !== null) {
                    const { canReceiveTreatment, elapsedTime } = result; // Destruttura solo se il risultato non è null
                    console.log(elapsedTime.toFixed(2));
                    totalElapsedTime += elapsedTime; // Accumula il tempo per ciascuna iterazione
                    // Aggiorna i contatori
                    if (canReceiveTreatment) {
                        eligibleCount++;
                    }
                    else {
                        ineligibleCount++;
                    }
                }
            }
            const averageTime = (totalElapsedTime / iterations).toFixed(2); // Calcola il tempo medio
            console.log(`Media per ${subcategoryNome} con ${iterations} iterazioni: ${averageTime} ms`);
            console.log(`Idonei: ${eligibleCount}, Non idonei: ${ineligibleCount}`);
            // Aggiungi i risultati all'array, includendo la categoria principale
            results.push({
                mainCategory: mainCategoryName, // Aggiungi la categoria principale
                subcategory: subcategoryNome,
                iterations,
                averageTime,
                eligibleCount,
                ineligibleCount
            });
            // Somma il tempo medio per il calcolo finale
            totalAverageTime += parseFloat(averageTime);
            totalIterations += iterations; // Aggiungi le iterazioni per il calcolo medio finale
        }
    }
}
// Calcola il tempo medio generale
const overallAverageTime = (totalAverageTime / results.length).toFixed(2); // Calcola il tempo medio generale
// Salva i risultati in un file CSV
const csvHeader = "Categoria Principale,Sottocategoria,Iterazioni,Tempo Medio (ms),Conteggio Idonei,Conteggio Non Idonei\n";
const csvRows = results.map(result => `${result.mainCategory},${result.subcategory},${result.iterations},${result.averageTime},${result.eligibleCount},${result.ineligibleCount}`).join("\n");
const csvContent = csvHeader + csvRows;
// Scrivi il file CSV
const csvPath = path.join("./outputs", "benchmark_results.csv");
fs.writeFileSync(csvPath, csvContent, "utf8");
console.log(`Risultati salvati in ${csvPath}`);
console.log(`Tempo medio generale tra tutte le medie: ${overallAverageTime} ms`);
