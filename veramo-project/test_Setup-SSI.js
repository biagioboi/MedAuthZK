import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Crea o apre il file CSV per salvare i dati
const logStream = fs.createWriteStream('tempi_di_esecuzione-SETUP-SSI.csv', { flags: 'w' });
logStream.write("Comando,Tempo di Esecuzione (ms),Gas usato,Costo in €\n"); // Intestazione CSV

// Scrivi l'intestazione del CSV, se il file è vuoto
logStream.write('Comando,Tempo di esecuzione,Gas usato\n');

// Funzione per eseguire un comando, catturare l'output, cercare la frase "Gas stimato" e registrare il risultato
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


function runAllCommands() {
    console.time('Tempo totale di esecuzione'); // Inizio misurazione tempo totale
    console.log("-----------------------------------------\n");

    runCommand('node ./dist/veramo/setup.js', 'Creazione e registrazione issuer'); // Crea e registra un issuer
    console.log("\n-----------------------------------------\n");

    console.log("Sezione 1: Creazione e registrazione dell'Issuer");
    console.time('Tempo creazione e registrazione issuer');
    runCommand('node ./dist/create-issuer-did.js', 'Creazione e registrazione issuer'); // Crea un DID per l'issuer
    runCommand('node ./dist/register-issuer-did.js', 'Registrazione issuer'); // Registra l'issuer
    console.timeEnd('Tempo creazione e registrazione issuer');

    console.log("\n-----------------------------------------\n");

  
    console.log("Sezione 2: Creazione e registrazione dell'Holder");
    console.time('Tempo creazione e registrazione client');
    runCommand('node ./dist/create-client-did.js', 'Creazione e registrazione client'); // Crea un DID per il client
    runCommand('node ./dist/register-client-did.js', 'Registrazione client'); // Registra il client
    console.timeEnd('Tempo creazione e registrazione client');
    console.log("-----------------------------------------\n");

    
    console.log("Sezione 3:  Creazione Verifiable Credential (VC) per il trattamento per categoria");
    console.time('Tempo creazione credenziale per sottocategorie');
    runCommand('node ./dist/trattamento-categoria/create-credential-sottocategoria.js', 'Creazione credenziale sottocategorie');
    console.timeEnd('Tempo creazione credenziale per sottocategorie');
    console.log("\n-----------------------------------------\n");

    console.log("Sezione 4: Creazione Verifiable Credential (VC) per il trattamento Singolo");
    console.time('Tempo totale esecuzione creazione VC trattamento singolo');
    runCommand('node ./dist/trattamento-singolo/create-credential.js', 'Creazione credenziale trattamento singolo');
    console.timeEnd('Tempo totale esecuzione creazione VC trattamento singolo');
    console.log("\n-----------------------------------------\n");

    console.timeEnd('Tempo totale di esecuzione'); // Termina la misurazione del tempo totale
    console.log("\n-----------------------------------------\n");
}

// Esegui tutti i comandi
runAllCommands();
