import { agent } from '../veramo/setup.js';
import * as fs from 'fs';
import path from 'path';

// Funzione per verificare la Verifiable Credential
async function verifyCredential() {
  try {
    const startTotalTime = performance.now(); // Inizio misurazione del tempo totale

    // Definisci il percorso del file credential.json nella cartella outputs
    const credentialFilePath = path.join('outputs', 'credential-subcategory.json');
    
    const startFileReadTime = performance.now(); // Inizio misurazione del tempo di lettura del file
    // Leggi e stampa la Verifiable Credential dal file
    const vc = JSON.parse(fs.readFileSync(credentialFilePath, 'utf8'));
    const endFileReadTime = performance.now(); // Fine misurazione del tempo di lettura del file
    console.log('Verifiable Credential:', vc);

    console.log(`Tempo impiegato per leggere il file: ${(endFileReadTime - startFileReadTime).toFixed(2)} ms`);

    // Verifica la Verifiable Credential
    const startVerificationTime = performance.now(); // Inizio misurazione del tempo di verifica
    const result = await agent.verifyCredential({ credential: vc });
    const endVerificationTime = performance.now(); // Fine misurazione del tempo di verifica
    
    console.log("Verificata? :", result.verified);
    console.log(`Tempo impiegato: ${(endVerificationTime - startVerificationTime).toFixed(2)} ms`);
  

    // Controlla se la verifica è andata a buon fine
    if (result.verified) {
      // Salva il risultato solo se la verifica è andata a buon fine
      const verifiedCredentialFilePath = path.join('outputs', 'verifiedCredential-sottocategoria.json');
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
