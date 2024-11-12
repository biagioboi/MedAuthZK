import { execSync } from 'child_process';
import { performance } from 'perf_hooks';

// Funzione per eseguire un comando e catturare l'output
function runCommand(command, testType) {
    const start = performance.now(); // Inizia a misurare il tempo per il comando
    console.log(`Esecuzione comando: ${command}`);

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

    // Misura il tempo per creare la credenziale per le sottocategorie
    console.time('Tempo creazione credenziale per sottocategorie');
    runCommand('node ./dist/trattamento-categoria/create-credential-sottocategoria.js', 'Creazione credenziale sottocategorie');
    console.timeEnd('Tempo creazione credenziale per sottocategorie');
    console.log("\n\n");

    // Misura il tempo per verificare la credenziale per le sottocategorie
    console.time('Tempo verifica credenziale sottocategorie');
    runCommand('node ./dist/trattamento-categoria/verify-credential-sottocategorie.js', 'Verifica credenziale sottocategorie');
    console.timeEnd('Tempo verifica credenziale sottocategorie');
    console.log("\n\n");

    // Misura il tempo per creare la presentazione con Selective Disclosure per le sottocategorie
    console.time('Tempo creazione presentazione per sottocategorie');
    runCommand('node ./dist/trattamento-categoria/create-presentation-sottocategoria.js', 'Creazione presentazione sottocategorie');
    console.timeEnd('Tempo creazione presentazione per sottocategorie');
    
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

    // Misura il tempo per verificare la credenziale per il trattamento singolo
    console.time('Tempo verifica credenziale trattamento singolo');
    runCommand('node ./dist/trattamento-singolo/verify-credential.js', 'Verifica credenziale trattamento singolo');
    console.timeEnd('Tempo verifica credenziale trattamento singolo');

    // Misura il tempo per creare la presentazione per il trattamento singolo
    console.time('Tempo creazione presentazione per trattamento singolo');
    runCommand('node ./dist/trattamento-singolo/create-presentation.js', 'Creazione presentazione trattamento singolo');
    console.timeEnd('Tempo creazione presentazione per trattamento singolo');

    console.log("-----------------------------------------\n");
    console.timeEnd('Tempo totale esecuzione trattamento singolo'); // Termina la misurazione del tempo totale per il trattamento singolo

    console.log("\n\n");

}

// Esegui tutti i comandi
runAllCommands();
