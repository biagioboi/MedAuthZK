import { agent } from '../veramo/setup.js';
import * as fs from 'fs';
import path from 'path';
async function issueCredential() {
    const startTotal = performance.now(); // Tempo di inizio per l'intero processo
    const issuerIdentifier = await agent.didManagerGetByAlias({ alias: 'issuer' });
    const clientIdentifier = await agent.didManagerGetByAlias({ alias: 'client' });
    // Lettura del file JSON
    const malattieFilePath = path.join('.', 'dist/utils', 'categorieDB.json');
    const malattieData = JSON.parse(fs.readFileSync(malattieFilePath, 'utf8')); // Lettura del file JSON
    // Seleziona casualmente una malattia
    const malattiaSelezionataIndex = Math.floor(Math.random() * malattieData.length);
    const malattiaSelezionata = malattieData[malattiaSelezionataIndex]; // Malattia selezionata casualmente
    if (!malattiaSelezionata)
        throw new Error('Nessuna malattia selezionata.');
    // Seleziona casualmente una sottocategoria dalla malattia selezionata
    const sottocategoriaIndex = Math.floor(Math.random() * malattiaSelezionata.sottocategorie.length);
    const sottocategoriaSelezionata = malattiaSelezionata.sottocategorie[sottocategoriaIndex];
    if (!sottocategoriaSelezionata)
        throw new Error('Nessuna sottocategoria selezionata.');
    // Misurazione del tempo per la creazione della credenziale verificabile
    const vc = await agent.createVerifiableCredential({
        credential: {
            issuer: { id: issuerIdentifier.did },
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential', 'HealthCredential'],
            issuanceDate: new Date().toISOString(),
            credentialSubject: {
                id: clientIdentifier.did,
                name: 'Mario Rossi',
                dateOfBirth: '1990-01-01',
                healthID: 'RSSMRA90A01H703H',
                diagnosi: {
                    categoriaHash: malattiaSelezionata.hash,
                    categoriaHashNumerico: malattiaSelezionata.hashNumerico.toString(),
                    categoriaID: malattiaSelezionata.id,
                    categoriaNome: malattiaSelezionata.nome,
                    diagnosiNome: sottocategoriaSelezionata.nome,
                    diagnosiHash: sottocategoriaSelezionata.hash,
                    diagnosiHashNumerico: sottocategoriaSelezionata.hashNumerico.toString(),
                },
                insuranceProvider: 'National Health Service',
            },
        },
        proofFormat: 'jwt',
    });
    // Tempo totale
    const endTotal = performance.now(); // Tempo di fine per l'intero processo
    const totalDuration = (endTotal - startTotal).toFixed(2); // Calcola il tempo totale in millisecondi
    console.log(`Tempo impiegato: ${totalDuration} ms`);
    console.log('Nuova credenziale creata');
    fs.writeFileSync(path.join('outputs', 'credential-subcategory.json'), JSON.stringify(vc, null, 2));
    return vc;
}
issueCredential().catch(console.error);
export { issueCredential };
