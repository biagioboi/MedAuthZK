import { agent } from './veramo/setup.js';
import * as fs from 'fs';
import path from 'path'; // Importa il modulo path per la gestione dei percorsi
import { malattieConNumeri } from './utils/malattie.js';
// Funzione per emettere una Verifiable Credential (VC)
async function issueCredential() {
    // Recupera l'identificatore dell'emittente e del client
    const issuerIdentifier = await agent.didManagerGetByAlias({ alias: 'issuer' });
    const clientIdentifier = await agent.didManagerGetByAlias({ alias: 'client' });
    const name = 'Mario Rossi';
    const dateOfBirth = '1990-01-01';
    const healthID = 'RSSMRA90A01H703H';
    // Seleziona la prima malattia
    const malattiaSelezionata = malattieConNumeri[0];
    if (!malattiaSelezionata) {
        throw new Error('Nessuna malattia selezionata.');
    }
    const diagnosisHash = malattiaSelezionata.hash; // Hash della diagnosi
    // Emissione della VC
    const vc = await agent.createVerifiableCredential({
        credential: {
            issuer: { id: issuerIdentifier.did },
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential', 'HealthCredential'],
            issuanceDate: new Date().toISOString(),
            credentialSubject: {
                id: clientIdentifier.did,
                name: name,
                dateOfBirth: dateOfBirth,
                healthID: healthID,
                diagnosi: {
                    hash: diagnosisHash, // Hash della diagnosi
                    hashNumerico: malattiaSelezionata.hashNumerico.toString(), // Hash numerico
                    malattiaID: malattiaSelezionata.id, // ID della malattia
                    malattiaNome: malattiaSelezionata.nome // Nome della malattia
                },
                insuranceProvider: 'National Health Service',
            },
        },
        proofFormat: 'jwt',
    });
    console.log('Nuova credenziale creata');
    // Aggiorna il percorso di salvataggio
    const credentialPath = path.join('outputs', 'credential.json'); // Percorso aggiornato
    fs.writeFileSync(credentialPath, JSON.stringify(vc, null, 2)); // Salva il file nella cartella outputs
    return vc; // Restituisce la credenziale emessa
}
// Esegui la funzione
issueCredential().catch(console.error);
// Esporta la funzione
export { issueCredential };
