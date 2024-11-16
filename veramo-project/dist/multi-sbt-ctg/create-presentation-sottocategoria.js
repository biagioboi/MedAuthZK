import { agent } from '../veramo/setup.js';
import * as fs from 'fs';
import { initialize } from 'zokrates-js'; // Libreria zokrates-js per la generazione della prova
import path from 'path';
// Il percorso per trovare il circuito di Zokrates
const sourcePath = path.join('.', 'zokrates', 'circuit-sottocategorie', 'circuit.zok');
// Funzione per generare la prova ZKP
async function generateZKP(categoriaHashNumerico, categoriaID, sottocategoriaHash) {
    const zokratesProvider = await initialize(); // Inizializza Zokrates
    // Carica e compila il circuito (file .zok)
    const source = fs.readFileSync(sourcePath, 'utf8');
    const artifacts = await zokratesProvider.compile(source);
    // Calcola il witness
    const inputs = [categoriaHashNumerico, categoriaID, sottocategoriaHash];
    const { witness } = await zokratesProvider.computeWitness(artifacts.program, inputs);
    // Carica la proving key
    const proveKeyPath = path.join('.', 'zokrates', 'circuit-sottocategorie', 'proving.key');
    const provingKey = fs.readFileSync(proveKeyPath); // provingKey: Uint8Array
    // Genera la prova da presentare
    const proof = await zokratesProvider.generateProof(artifacts.program, witness, provingKey);
    return proof;
}
// Funzione per creare una presentazione verificabile
async function createPresentation() {
    const startTotal = performance.now(); // Inizio della misurazione del tempo totale
    // Carica la Verifiable Credential da un file
    const verifiedCredentialFile = JSON.parse(fs.readFileSync('./outputs/verifiedCredential-sottocategoria.json', 'utf8'));
    const verifiedCredential = verifiedCredentialFile.verifiableCredential;
    // Ottieni l'identificatore del client (client DID)
    const clientIdentifier = await agent.didManagerGetByAlias({ alias: 'client' });
    // Estrai i valori sensibili
    const categoriaHashNumerico = verifiedCredential.credentialSubject.diagnosi.categoriaHashNumerico.toString();
    const categoriaID = verifiedCredential.credentialSubject.diagnosi.categoriaID.toString();
    const sottocategoriaHash = verifiedCredential.credentialSubject.diagnosi.diagnosiHashNumerico.toString();
    console.log(categoriaHashNumerico + ", " + categoriaID + ", " + sottocategoriaHash);
    // Genera la prova ZKP per i valori sensibili
    const zkpProof = await generateZKP(categoriaHashNumerico, categoriaID, sottocategoriaHash);
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
                diagnosi: verifiedCredential.credentialSubject.diagnosi.diagnosiHash,
                categoria: verifiedCredential.credentialSubject.diagnosi.categoriaHash,
                zkpProof, // Aggiungi la prova ZKP
            },
        },
        proofFormat: 'jwt', // Formato di firma
    });
    // Verifica la presentazione creata
    const verificationResult = await agent.verifyPresentation({ presentation: vp });
    // Log del risultato della verifica
    console.log('Risultato verifica presentazione:', verificationResult.verified);
    // Tempo totale impiegato
    const endTotal = performance.now(); // Fine della misurazione del tempo totale
    const totalDuration = (endTotal - startTotal).toFixed(2); // Calcola il tempo totale
    console.log(`Tempo impiegato: ${totalDuration} ms`);
    console.log('Sto salvando la presentazione...');
    // Percorso della cartella di output
    const outputDir = 'outputs';
    // Controlla se la cartella esiste, altrimenti creala
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
        console.log(`Cartella "${outputDir}" creata.`);
    }
    // Salva la presentazione in un file JSON nella cartella outputs
    const filePath = path.join(outputDir, 'presentation-sottocategoria.json');
    fs.writeFileSync(filePath, JSON.stringify(vp, null, 2));
    console.log(`Nuova presentazione creata e salvata in ${filePath}`);
}
// Esegui la funzione
createPresentation().catch(console.error);
// Esporta la funzione per l'utilizzo in altri moduli
export { createPresentation };
