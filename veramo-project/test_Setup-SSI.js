import { execSync } from 'child_process'; // Importa il modulo child_process per eseguire comandi

// Funzione per eseguire un comando e stampare l'output
function runCommand(command) {
    console.time(command); // Inizia a misurare il tempo per il comando
    console.log(`Esecuzione comando: ${command}`);

    execSync(command, { stdio: 'inherit' }); // Esegui il comando

    console.timeEnd(command); // Termina la misurazione del tempo per il comando
}

// Esegui i comandi in ordine
function runAllCommands() {
    console.time('Tempo totale di esecuzione'); // Inizio misurazione tempo totale
    console.log("-----------------------------------------\n")
    runCommand('node ./dist/veramo/setup.js'); // Comando per creare un issuer
    runCommand('node ./dist/create-issuer-did.js'); // Comando per creare un issuer
    runCommand('node ./dist/register-issuer-did.js'); // Comando per registrare un issuer
    runCommand('node ./dist/create-client-did.js'); // Comando per creare un client
    runCommand('node ./dist/create-credential.js'); // Comando per creare una credenziale
    runCommand('node ./dist/create-credential-sottocategoria.js'); // Comando per creare una credenziale
    runCommand('node ./dist/verify-credential.js'); // Comando per verificare una credenziale
    runCommand('node ./dist/verify-credential-sottocategorie.js'); // Comando per verificare una credenziale
    runCommand('node ./dist/register-client-did.js'); // Comando per registrare un client
    console.log("-----------------------------------------\n")
    console.timeEnd('Tempo totale di esecuzione'); // Termina la misurazione del tempo totale
}

// Esegui tutti i comandi
runAllCommands();
