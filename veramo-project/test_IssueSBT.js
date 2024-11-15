import { execSync } from 'child_process'; // Importa il modulo child_process per eseguire comandi
import fs from 'fs'; // Per scrivere su un file
import { performance } from 'perf_hooks'; // Per misurare il tempo di esecuzione

// Crea o apre il file CSV per salvare i dati
const logStream = fs.createWriteStream('tempi_di_esecuzione-ISSUE_SBT.csv', { flags: 'w' });
logStream.write("Comando,Tempo di Esecuzione (ms),Gas usato,Costo in €\n"); // Intestazione CSV

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

    // Prezzo di 1 ETH in Gwei = 1,000,000,000 Gwei
    const gweiToEth = 1 / 1_000_000_000;

    // Calcolo del costo in EUR
    const costInEur = gasUsed * gweiToEth * ethToEur;

    // Salva il tempo, il gas e il costo in EUR nel file CSV, ma non l'output
    logStream.write(`${command},${durationInMilliseconds} ms,${gasUsed},${costInEur.toFixed(2)}\n`);

    // Mostra il risultato
    console.log(`Gas Usato: ${gasUsed} Gwei`);
    console.log(`Costo Gas: €${costInEur.toFixed(2)} EUR`);
}


// Funzione per eseguire tutti i comandi
function runAllCommands() {
    console.time('Tempo totale di esecuzione'); // Inizio misurazione tempo totale
    console.log("-----------------------------------------\n");

    // Misura distintamente il tempo per ogni comando
    runCommand('node ./dist/veramo/setup.js'); // Comando per creare un issuer

    
    console.time('Tempo creazione verifica credenziale - singolo trattamento');
    runCommand('node ./dist/trattamento-singolo/verify-credential.js');
    console.timeEnd('Tempo creazione verifica credenziale - singolo trattamento');

    console.time('Tempo creazione presentazione singolo trattamento');
    runCommand('node ./dist/trattamento-singolo/create-presentation.js'); // Comando per creare una presentazione con Selective Disclosure (senza categorie)
    console.timeEnd('Tempo creazione presentazione singolo trattamento');

    // Misura il tempo per richiedere l'SBT
    console.time('Tempo richiesta SBT');
    runCommand('node ./dist/trattamento-singolo/requestSBT.js'); // Comando per richiedere un SBT (singola malattia)
    console.timeEnd('Tempo richiesta SBT');

    // Misura il tempo per canUserReceiveTreatment
    console.time('Tempo canUserReceiveTreatment');
    runCommand('node ./dist/trattamento-singolo/canUserReceiveTreatment.js');
    console.timeEnd('Tempo canUserReceiveTreatment');

    console.log("-----------------------------------------\n");
       
    console.time('Tempo creazione verifica credenziale - categoria trattamento');
    runCommand('node ./dist/trattamento-categoria/verify-credential-sottocategorie.js');
    console.timeEnd('Tempo creazione verifica credenziale - categoria trattamento');

    console.time('Tempo creazione presentazione con sottocategorie');
    runCommand('node ./dist/trattamento-categoria/create-presentation-sottocategoria.js'); // Comando per creare una presentazione con Selective Disclosure (con categorie)
    console.timeEnd('Tempo creazione presentazione con sottocategorie');

    // Misura il tempo per richiedere l'SBT con categorie
    console.time('Tempo richiesta SBT con categorie');
    runCommand('node ./dist/trattamento-categoria/requestSBT-category.js'); // Comando per richiedere un SBT (con categorie)
    console.timeEnd('Tempo richiesta SBT con categorie');
    
    // Misura il tempo per canUserReceiveTreatmentCategory
    console.time('Tempo canUserReceiveTreatmentCategory');
    runCommand('node ./dist/trattamento-categoria/canUserReceiveTreatmentCategory.js');
    console.timeEnd('Tempo canUserReceiveTreatmentCategory');

    console.log("-----------------------------------------\n");
    console.timeEnd('Tempo totale di esecuzione'); // Termina la misurazione del tempo totale
    console.log("-----------------------------------------\n");

    // Chiude il file CSV
    logStream.end();
}

// Esegui tutti i comandi
runAllCommands();
