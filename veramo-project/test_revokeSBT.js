import { execSync } from 'child_process'; // Importa il modulo child_process per eseguire comandi
import fs from 'fs'; // Per scrivere su un file
import { performance } from 'perf_hooks'; // Per misurare il tempo di esecuzione

// Crea o apre il file CSV per salvare i dati
const logStream = fs.createWriteStream('tempi_di_esecuzione_revokeSBT.csv', { flags: 'w' });
logStream.write("Comando,Tempo di Esecuzione (ms),Gas usato,Costo in €\n"); // Intestazione CSV

// Funzione per eseguire un comando, catturare l'output e cercare la frase "Gas stimato"
function runCommand(command) {
    console.log(`Esecuzione comando: ${command}`);

    // Esegui il comando e cattura l'output
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });

    // Stampa l'output nella console
    console.log(output);

    // Cerca la frase "Gas usato: x" nell'output
    const gasMatch = output.match(/Gas usato: (\d+)/);
    const gasUsed = gasMatch ? parseInt(gasMatch[1]) : 0; // Se trovata, prendi il valore, altrimenti 0

    // Cerca la frase "Tempo impiegato: x ms" nell'output
    const timeMatch = output.match(/Tempo impiegato: (\d+(\.\d{1,2})?) ms/);
    const timeTaken = timeMatch ? parseFloat(timeMatch[1]) : 0; // Usa il valore trovato o quello calcolato

    // Tasso di cambio ETH → EUR
    const ethToEur = 2937.44; // Tasso di cambio 1 ETH = 2937,44 EUR
    const gweiToEth = 1 / 1_000_000_000; // Conversione da Gwei a ETH

    // Quantità di gas usato e gas price in Gwei
    const gasPrice = 13.98;

    // Calcolo del costo in ETH
    const costInEth = (gasUsed * gasPrice) * gweiToEth;

    // Calcolo del costo in EUR
    const costInEur = costInEth * ethToEur;

    // Salva il tempo, il gas e il costo in EUR nel file CSV, ma non l'output
    logStream.write(`${command},${timeTaken.toFixed(2)} ms,${gasUsed},${costInEur.toFixed(2)} EUR\n`);

    // Mostra il risultato
    console.log(`Tempo impiegato: ${timeTaken.toFixed(2)} ms`);
    console.log(`Gas Usato: ${gasUsed} Gwei`);
    console.log(`Costo Gas: €${costInEur.toFixed(2)} EUR`);
}


// Funzione per eseguire solo i comandi di revoca
function runRevokeCommands() {

    runCommand('node ./dist/multi-sbt/revokeAllSBTs.js');

    runCommand('node ./dist/multi-sbt-ctg/revokeAllSBTs.js');

    // Chiude il file CSV
    logStream.end();
}

// Esegui i comandi di revoca
runRevokeCommands();
