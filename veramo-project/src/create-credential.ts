import { agent } from './veramo/setup.js';
import * as fs from 'fs';
import { calcolaHash, malattieConNumeri } from './utils/malattie.js';

async function main() {
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
    fs.writeFileSync('credential.json', JSON.stringify(vc, null, 2));
}

main().catch(error => {
    console.error('Errore durante l\'emissione della credenziale:', error);
});
