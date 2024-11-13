import { execSync } from 'child_process'; // Importa il modulo child_process per eseguire comandi
import fs from 'fs'; // Per scrivere su un file
import { performance } from 'perf_hooks'; // Per misurare il tempo di esecuzione

// Crea o apre il file CSV per salvare i dati
const logStream = fs.createWriteStream('tempi_di_esecuzione-SETUP-SSI.csv', { flags: 'w' });
logStream.write("Comando,Tempo di Esecuzione (s),Gas stimato (x)\n"); // Intestazione CSV

// Funzione per eseguire un comando, catturare l'output, cercare la frase "Gas stimato" e registrare il risultato
function runCommand(command, testType = 'Test') {
    const start = performance.now(); // Inizia a misurare il tempo per il comando
    console.log(`Esecuzione comando: ${command}`);

    try {
        // Esegui il comando e cattura l'output
        const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });

        const end = performance.now(); // Termina la misurazione del tempo
        const durationInSeconds = ((end - start) / 1000).toFixed(2); // Calcola la durata in secondi e arrotonda a 2 decimali

        // Cerca la frase "Gas stimato: x" nell'output
        const gasMatch = output.match(/Gas stimato: (\d+)/);
        const gasStimated = gasMatch ? gasMatch[1] : 0; // Se trovata, prendi il valore, altrimenti 0

        // Mostra il risultato a schermo
        console.log(`Tipo di test: ${testType}`);
        console.log(`Comando: ${command}`);
        console.log(`Tempo di esecuzione: ${durationInSeconds} s`);
        console.log(`Gas stimato: ${gasStimated}\n`);

        // Salva il tempo e il gas nel file CSV, ma non l'output
        logStream.write(`${command},${durationInSeconds} s,${gasStimated}\n`);

    } catch (error) {
        console.error(`Errore nell'esecuzione del comando: ${command}`);
        console.error(error.message);
    }
}

// Esegui i comandi in ordine
function runAllCommands() {
    console.time('Tempo totale di esecuzione'); // Inizio misurazione tempo totale
    console.log("-----------------------------------------\n");

    // Prima sezione: Creazione e registrazione dell'Issuer (emittente)
    console.time('Tempo creazione e registrazione issuer');
    runCommand('node ./dist/veramo/setup.js', 'Creazione e registrazione issuer'); // Crea e registra un issuer
    runCommand('node ./dist/create-issuer-did.js', 'Creazione e registrazione issuer'); // Crea un DID per l'issuer
    runCommand('node ./dist/register-issuer-did.js', 'Registrazione issuer'); // Registra l'issuer
    console.timeEnd('Tempo creazione e registrazione issuer');

    console.log("\n\n");

    // Seconda sezione: Creazione e registrazione del Client (cliente)
    console.time('Tempo creazione e registrazione client');
    runCommand('node ./dist/create-client-did.js', 'Creazione e registrazione client'); // Crea un DID per il client
    runCommand('node ./dist/register-client-did.js', 'Registrazione client'); // Registra il client
    console.timeEnd('Tempo creazione e registrazione client');
    console.log("-----------------------------------------\n");
    console.timeEnd('Tempo totale di esecuzione'); // Termina la misurazione del tempo totale

    console.log("\n\n");

    // Terza sezione: Trattamenti per più malattie (Sottocategorie)
    console.time('Tempo totale esecuzione sottocategorie'); // Inizio misurazione tempo totale per le sottocategorie
    console.log("-----------------------------------------\n");

    console.time('Tempo creazione credenziale per sottocategorie');
    runCommand('node ./dist/trattamento-categoria/create-credential-sottocategoria.js', 'Creazione credenziale sottocategorie');
    console.timeEnd('Tempo creazione credenziale per sottocategorie');
    console.log("\n\n");
    console.log("-----------------------------------------\n");
    console.timeEnd('Tempo totale esecuzione sottocategorie'); // Termina la misurazione del tempo totale per le sottocategorie
    console.log("\n\n");

    // Quarta sezione: Trattamento per una singola malattia
    console.time('Tempo totale esecuzione trattamento singolo'); // Inizio misurazione tempo totale per il trattamento singolo
    console.log("-----------------------------------------\n");
    // Misura il tempo per creare la credenziale per il trattamento singolo
    console.time('Tempo creazione credenziale per trattamento singolo');
    runCommand('node ./dist/trattamento-singolo/create-credential.js', 'Creazione credenziale trattamento singolo');
    console.timeEnd('Tempo creazione credenziale per trattamento singolo');
    console.log("-----------------------------------------\n");
    console.timeEnd('Tempo totale esecuzione trattamento singolo'); // Termina la misurazione del tempo totale per il trattamento singolo

    console.log("\n\n");

}

// Esegui tutti i comandi
runAllCommands();
