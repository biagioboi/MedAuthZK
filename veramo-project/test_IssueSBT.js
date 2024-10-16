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
    runCommand('node ./dist/veramo/setup.js'); // Comando per creare un issuer
    runCommand('node ./dist/create-presentation.js'); // Comando per creare una presentazione con Selective Disclosure (senza categorie)
    runCommand('node ./dist/create-presentation-sottocategoria.js'); // Comando per creare una presentazione con Selective Disclosure (con categorie)
    runCommand('node ./dist/requestSBT.js'); // Comando per richiedere un SBT (senza categorie)
    runCommand('node ./dist/requestSBT-category.js'); // Comando per richiedere un SBT (senza categorie)
    console.log("-----------------------------------------\n");
    console.timeEnd('Tempo totale di esecuzione'); // Termina la misurazione del tempo totale
    console.log("-----------------------------------------\n");
    runCommand('node ./dist/canUserReceiveTreatment.js')
    runCommand('node ./dist/canUserReceiveTreatmentCategory.js')

    
}

// Esegui tutti i comandi
runAllCommands();
