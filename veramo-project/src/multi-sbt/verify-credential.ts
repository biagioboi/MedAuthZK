import { agent } from '../veramo/setup.js';
import * as fs from 'fs';
import path from 'path';

// Funzione per verificare la Verifiable Credential
async function verifyCredential() {
  try {
    // Definisci il percorso del file credential.json nella cartella outputs
    const credentialFilePath = path.join('outputs', 'credential.json');
    
    // Leggi e stampa la Verifiable Credential dal file
    const vc = JSON.parse(fs.readFileSync(credentialFilePath, 'utf8'));
    console.log('Verifiable Credential:', vc);

    // Verifica la Verifiable Credential
    const result = await agent.verifyCredential({ credential: vc });
    console.log("Verificata? :" + result.verified);

    // Controlla se la verifica è andata a buon fine
    if (result.verified) {
      // Salva il risultato solo se la verifica è andata a buon fine
      const verifiedCredentialFilePath = path.join('outputs', 'verifiedCredential.json');
      fs.writeFileSync(verifiedCredentialFilePath, JSON.stringify(result, null, 2));
      console.log('Credenziale verificata e salvata in verifiedCredential.json');
    } else {
      // Gestisci il caso in cui la verifica non è riuscita
      console.error('La verifica della credenziale è fallita:', result.error);
      console.error('Risultato dettagliato:', result);
    }
  } catch (error) {
    // Gestisci gli errori generali (es. errori di lettura/scrittura file o errori di rete)
    console.error('Si è verificato un errore:', error);
  }
}

// Esegui la funzione
verifyCredential().catch(console.error);

// Esporta la funzione per essere utilizzata in altri moduli
export { verifyCredential };
