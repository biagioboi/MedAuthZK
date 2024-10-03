import { execSync } from 'child_process'; // Importa il modulo child_process per eseguire comandi

// Funzione per eseguire un comando e stampare l'output
function runCommand(command) {
    console.time(command); // Inizia a misurare il tempo per il comando
    console.log(`Esecuzione comando: ${command}`);

    execSync(command, { stdio: 'inherit' }); // Esegui il comando

    console.timeEnd(command); // Termina la misurazione del tempo per il comando
}

function runAllCommands() {
    console.time('Tempo totale di esecuzione'); // Inizio misurazione tempo totale
    console.log("-----------------------------------------\n");
    
    // Esegue i comandi
    runCommand('node ./dist/create-presentation.js'); // Comando per creare una presentazione con Selective Disclosure
    runCommand('node ./dist/requestSBT.js'); // Comando per richiedere un SBT
    
    console.log("-----------------------------------------\n");
    console.timeEnd('Tempo totale di esecuzione'); // Termina la misurazione del tempo totale

    
}

// Esegui tutti i comandi
runAllCommands();
