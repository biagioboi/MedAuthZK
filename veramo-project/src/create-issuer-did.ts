import { agent } from './veramo/setup.js';
import * as fs from 'fs';
import * as path from 'path';

// Funzione per creare un nuovo identificatore dell'emittente (issuer)
async function createIssuer() {

  // Misura il tempo di creazione del nuovo identificatore per l'issuer
  const startIssuerCreation = performance.now(); // Inizia a misurare il tempo

  // Crea un nuovo identificatore per l'issuer
  const issuerIdentifier = await agent.didManagerCreate({ alias: 'issuer' });

  const endIssuerCreation = performance.now(); // Termina la misurazione del tempo
  const issuerCreationDuration = (endIssuerCreation - startIssuerCreation).toFixed(2); // Calcola il tempo impiegato in ms


  console.log('Nuovo identificatore dell\'emittente creato');
  console.log(JSON.stringify(issuerIdentifier, null, 2));
  console.log(`Tempo impiegato: ${issuerCreationDuration} ms`);

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
