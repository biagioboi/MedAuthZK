import { agent } from './veramo/setup.js';
import * as fs from 'fs';
import * as path from 'path';
// Funzione per creare un client DID
async function createClientDID() {
    // Misura il tempo di creazione del nuovo identificatore per il client
    const startClientCreation = performance.now(); // Inizia a misurare il tempo
    // Crea un nuovo identificatore per il client
    const clientIdentifier = await agent.didManagerCreate({ alias: 'client' });
    const endClientCreation = performance.now(); // Termina la misurazione del tempo
    const clientCreationDuration = (endClientCreation - startClientCreation).toFixed(2); // Calcola il tempo impiegato in ms
    // Stampa un messaggio di conferma nella console
    console.log('Nuovo identificatore client creato');
    // Stampa il clientIdentifier in formato JSON
    console.log(JSON.stringify(clientIdentifier, null, 2));
    // Percorso della cartella di output
    const outputDir = 'outputs';
    // Controlla se la cartella esiste, altrimenti creala
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
        console.log(`Cartella "${outputDir}" creata.`);
    }
    // Salva il clientIdentifier in un file JSON nella cartella outputs
    const filePath = path.join(outputDir, 'client-did.json');
    fs.writeFileSync(filePath, JSON.stringify(clientIdentifier, null, 2));
    // Stampa un messaggio di conferma dopo il salvataggio
    console.log(`Nuovo DID creato e salvato in ${filePath}`);
    console.log(`Tempo impiegato: ${clientCreationDuration} ms`);
    return clientIdentifier; // Restituisce l'identificatore del client
}
createClientDID().catch(console.error);
export { createClientDID }; // Esporta la funzione per utilizzarla in altri file
