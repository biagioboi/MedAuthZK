import { execSync } from 'child_process'; // Importa il modulo child_process per eseguire comandi
import fs from 'fs'; // Per scrivere su un file
import { performance } from 'perf_hooks'; // Per misurare il tempo di esecuzione

// Crea o apre il file CSV per salvare i dati
const logStream = fs.createWriteStream('tempi_di_esecuzione_revokeSBT.csv', { flags: 'w' });
logStream.write("Comando,Tempo di Esecuzione (ms),Gas usato,Costo in €\n"); // Intestazione CSV

// Funzione per eseguire un comando, catturare l'output e cercare la frase "Gas stimato"
// Funzione per eseguire un comando, catturare l'output e cercare la frase "Gas stimato"
function runCommand(command) {
    const start = performance.now(); // Inizia a misurare il tempo per il comando
    console.log(`Esecuzione comando: ${command}`);

    // Esegui il comando e cattura l'output
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });

    // Stampa l'output nella console
    console.log(output);

    const end = performance.now(); // Termina la misurazione del tempo
    const durationInMilliseconds = ((end - start)).toFixed(2); // Calcola la durata in millisecondi e arrotonda a 2 decimali

    // Cerca la frase "Gas usato: x" nell'output
    const gasMatch = output.match(/Gas usato: (\d+)/);
    const gasUsed = gasMatch ? parseInt(gasMatch[1]) : 0; // Se trovata, prendi il valore, altrimenti 0

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
    logStream.write(`${command},${durationInMilliseconds} ms,${gasUsed},${costInEur.toFixed(2)}\n`);

    // Mostra il risultato
    console.log(`Gas Usato: ${gasUsed} Gwei`);
    console.log(`Costo Gas: €${costInEur.toFixed(2)} EUR`);
}

// Funzione per eseguire solo i comandi di revoca
function runRevokeCommands() {
    console.time('Tempo totale di esecuzione revoca'); // Inizio misurazione tempo totale
    console.log("-----------------------------------------\n");

    // Misura distintamente il tempo per ogni comando di revoca
    console.time('Tempo revoca SBT singolo');
    runCommand('node ./dist/trattamento-singolo/revokeSBT.js');
    console.timeEnd('Tempo revoca SBT singolo');

    console.time('Tempo revoca SBT con categorie');
    runCommand('node ./dist/trattamento-categoria/revokeSBT-category.js');
    console.timeEnd('Tempo revoca SBT con categorie');

    console.time('Tempo revoca SBT singolo');
    runCommand('node ./dist/multi-sbt/revokeAllSBTs.js');
    console.timeEnd('Tempo revoca SBT singolo');

    console.time('Tempo revoca SBT con categorie');
    runCommand('node ./dist/multi-sbt-ctg/revokeAllSBTs.js');
    console.timeEnd('Tempo revoca SBT con categorie');

    console.log("-----------------------------------------\n");
    console.timeEnd('Tempo totale di esecuzione revoca'); // Termina la misurazione del tempo totale
    console.log("-----------------------------------------\n");

    // Chiude il file CSV
    logStream.end();
}

// Esegui i comandi di revoca
runRevokeCommands();
