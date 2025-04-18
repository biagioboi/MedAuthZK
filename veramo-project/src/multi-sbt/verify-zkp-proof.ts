import fs from 'fs'; // Importa il modulo fs per la gestione dei file
import path from 'path'; // Importa il modulo path per la gestione dei percorsi
import { initialize, ZoKratesProvider } from 'zokrates-js'; // Importa ZoKrates

// Definisci i percorsi per i file
const vcPresentationPath = path.join('outputs', 'presentation.json'); // Percorso della presentazione VC
const verificationKeyPath = path.join('.', 'zokrates', 'circuit-trattamentosingolo', 'verification.key'); // Percorso della chiave di verifica
const verificationKey = JSON.parse(fs.readFileSync(verificationKeyPath, 'utf8')); // Leggi e analizza la chiave di verifica

console.log(verificationKey); // Mostra la chiave di verifica nel log

// Carica e analizza il file di presentazione VC
const vcPresentation = JSON.parse(fs.readFileSync(vcPresentationPath, 'utf8')).credentialSubject.zkpProof; // Estrai la prova ZKP
console.log(vcPresentation); // Mostra la prova ZKP nel log

// Funzione per verificare la ZKP
async function verifyZKP() {
    const zokratesProvider: ZoKratesProvider = await initialize(); // Inizializza ZoKrates

    // Verifica la prova ZKP utilizzando la chiave di verifica
    const isVerified = await zokratesProvider.verify(verificationKey, vcPresentation);

    // Log del risultato della verifica
    console.log('Risultato verifica:', isVerified); // Mostra il risultato della verifica nel log

    // Salva il risultato della verifica in un file
    const verificationResultPath = path.join('outputs', 'verificationResult.json');
    fs.writeFileSync(verificationResultPath, JSON.stringify({ verified: isVerified }, null, 2));
    console.log('Risultato della verifica salvato in verificationResult.json');
}

// Esegui la funzione
verifyZKP().catch(console.error); // Esegui la funzione e gestisci eventuali errori

// Esporta la funzione per l'utilizzo in altri moduli
export { verifyZKP };
