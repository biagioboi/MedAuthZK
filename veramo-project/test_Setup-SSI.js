import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Crea o apre il file CSV per salvare i dati
const logStream = fs.createWriteStream('tempi_di_esecuzione-SETUP-SSI.csv', { flags: 'w' });
logStream.write("Comando,Tempo di Esecuzione (ms),Gas usato,Costo in €\n"); // Intestazione CSV

// Funzione per eseguire un comando, catturare l'output, cercare la frase "Gas stimato" e registrare il risultato
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



function runAllCommands() {

    runCommand('node ./dist/veramo/setup.js', 'Creazione e registrazione issuer'); // Crea e registra un issuer
    runCommand('node ./dist/create-issuer-did.js', 'Creazione e registrazione issuer'); // Crea un DID per l'issuer
    runCommand('node ./dist/register-issuer-did.js', 'Registrazione issuer'); // Registra l'issuer
    runCommand('node ./dist/create-client-did.js', 'Creazione e registrazione client'); // Crea un DID per il client
    runCommand('node ./dist/register-client-did.js', 'Registrazione client'); // Registra il client

    runCommand('node ./dist/multi-sbt-ctg/create-credential-sottocategoria.js', 'Creazione credenziale sottocategorie');
    runCommand('node ./dist/multi-sbt/create-credential.js', 'Creazione credenziale trattamento singolo');

}

// Esegui tutti i comandi
runAllCommands();
