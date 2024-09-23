import { agent } from './veramo/setup.js';
import * as fs from 'fs';
import { initialize } from 'zokrates-js'; // Importa la funzione per generare la prova
import path from 'path';

// Define the path to the ZoKrates source file
const sourcePath = path.join('.', 'zokrates', 'circuit.zok');


async function generateZKP(diagnosisHashBreve : Int16Array, malattiaID: Int16Array) {
  const zokratesProvider = await initialize();

  // Load and compile the ZoKrates source code
  const source = fs.readFileSync(sourcePath, 'utf8');
  const artifacts = await zokratesProvider.compile(source);

  // Compute witness
  const inputs = [diagnosisHashBreve, malattiaID];
  const { witness } = await zokratesProvider.computeWitness(artifacts.program, inputs);

  const proveKeyPath = path.join('.', 'zokrates', 'proving.key');
  const provingKey = fs.readFileSync(proveKeyPath); //provingKey: Uint8Array,
  // Generate proof
  const proof = await zokratesProvider.generateProof(artifacts.program, witness, provingKey);

  return proof
}

async function createPresentation() {
  // Carica la Verifiable Credential da un file
  // Load and parse the verifiedCredential.json file
  const verifiedCredentialFile = JSON.parse(fs.readFileSync('VCredential.json', 'utf8'));
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
      holder: clientIdentifier.did,
      verifiableCredential: [verifiedCredential], // Usa la credenziale completa
      credentialSubject: {
        id: clientIdentifier.did,
        name: verifiedCredential.credentialSubject.name, // Nome non sensibile
        dateOfBirth: verifiedCredential.credentialSubject.dateOfBirth, // Data di nascita non sensibile
        healthID: verifiedCredential.healthID, // Codice fiscale
        zkpProof, // Aggiungi la prova ZKP
      },
    },
    proofFormat: 'jwt',
  });

  console.log('Nuova presentazione creata con campi selezionati');
  fs.writeFileSync('presentation.json', JSON.stringify(vp, null, 2));
}

createPresentation().catch(console.error);
