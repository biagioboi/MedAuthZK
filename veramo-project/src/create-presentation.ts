import { agent } from './veramo/setup.js';
import * as fs from 'fs';
import { initialize } from 'zokrates-js'; // Libreria zokrates-js per la generazione della prova
import path from 'path';

// Il percorso per trovare il circuito di Zokrates
const sourcePath = path.join('.', 'zokrates', 'circuit.zok');

// Funzione per generare la prova ZKP
async function generateZKP(diagnosisHashBreve: Int16Array, malattiaID: Int16Array) {
  const zokratesProvider = await initialize(); // Inizializza Zokrates

  // Carica e compila il circuito (file .zok)
  const source = fs.readFileSync(sourcePath, 'utf8');
  const artifacts = await zokratesProvider.compile(source);

  // Calcola il witness
  const inputs = [diagnosisHashBreve, malattiaID];
  const { witness } = await zokratesProvider.computeWitness(artifacts.program, inputs);

  // Carica la proving key
  const proveKeyPath = path.join('.', 'zokrates', 'proving.key');
  const provingKey = fs.readFileSync(proveKeyPath); // provingKey: Uint8Array

  // Genera la prova da presentare
  const proof = await zokratesProvider.generateProof(artifacts.program, witness, provingKey);

  return proof; 
}

// Funzione per creare una presentazione verificabile
async function createPresentation() {
  // Carica la Verifiable Credential da un file
  const verifiedCredentialFile = JSON.parse(fs.readFileSync('./outputs/verifiedCredential.json', 'utf8'));
  const verifiedCredential = verifiedCredentialFile.verifiableCredential;

  // Ottieni l'identificatore del client (client DID)
  const clientIdentifier = await agent.didManagerGetByAlias({ alias: 'client' });

  // Estrai i valori sensibili
  const diagnosisHashBreve = verifiedCredential.credentialSubject.diagnosi.hashNumerico.toString();
  const malattiaID = verifiedCredential.credentialSubject.diagnosi.malattiaID.toString(); 

  // Genera la prova ZKP per i valori sensibili
  const zkpProof = await generateZKP(diagnosisHashBreve, malattiaID);
  console.log(zkpProof);
  
  // Crea la Verifiable Presentation con i campi selezionati e la prova ZKP
  const vp = await agent.createVerifiablePresentation({
    presentation: {
      holder: clientIdentifier.did, // Usa l'identificatore del cliente
      credentialSubject: {
        id: clientIdentifier.did,
        name: verifiedCredential.credentialSubject.name, // Nome non sensibile
        dateOfBirth: verifiedCredential.credentialSubject.dateOfBirth, // Data di nascita non sensibile
        healthID: verifiedCredential.credentialSubject.healthID, // Codice fiscale
        diagnosis: verifiedCredential.credentialSubject.diagnosi.hash,
        zkpProof, // Aggiungi la prova ZKP
      },
    },
    proofFormat: 'jwt', // Formato di firma
  });

  // Verifica la presentazione creata
  const verificationResult = await agent.verifyPresentation({ presentation: vp });

  // Log del risultato della verifica
  console.log('Risultato verifica presentazione:', verificationResult.verified);
  console.log('Sto salvando la presentazione...');
  
  // Percorso della cartella di output
  const outputDir = 'outputs';
  
  // Controlla se la cartella esiste, altrimenti creala
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
    console.log(`Cartella "${outputDir}" creata.`);
  }

  // Salva la presentazione in un file JSON nella cartella outputs
  const filePath = path.join(outputDir, 'presentation.json');
  fs.writeFileSync(filePath, JSON.stringify(vp, null, 2));
  console.log(`Nuova presentazione creata e salvata in ${filePath}`);
}

// Esegui la funzione
createPresentation().catch(console.error);

// Esporta la funzione per l'utilizzo in altri moduli
export { createPresentation };
