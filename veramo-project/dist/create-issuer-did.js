import { agent } from './veramo/setup.js';
import * as fs from 'fs';
import * as path from 'path';
// Funzione per creare un nuovo identificatore dell'emittente (issuer)
async function createIssuer() {
    // Crea un nuovo identificatore dell'emittente
    const issuerIdentifier = await agent.didManagerCreate({ alias: 'issuer' });
    console.log('Nuovo identificatore dell\'emittente creato');
    console.log(JSON.stringify(issuerIdentifier, null, 2));
    // Percorso della cartella di output
    const outputDir = 'outputs';
    // Controlla se la cartella esiste, altrimenti creala
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
        console.log(`Cartella "${outputDir}" creata.`);
    }
    // Salva l'identificatore in un file JSON nella cartella outputs
    const filePath = path.join(outputDir, 'issuer-did.json');
    fs.writeFileSync(filePath, JSON.stringify(issuerIdentifier, null, 2));
    console.log(`Nuovo DID creato e salvato in ${filePath}`);
    return issuerIdentifier; // Restituisce l'identificatore dell'emittente
}
createIssuer().catch(console.error);
export { createIssuer }; // Esporta la funzione
