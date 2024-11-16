import { agent } from '../veramo/setup.js';
import * as fs from 'fs';
import path from 'path';

async function issueCredential() {
    console.log("Inizio processo di creazione della Verifiable Credential...");
    const start = performance.now(); // Inizio misurazione del tempo

    // Recupera i DID di emittente e cliente
    const issuerIdentifier = await agent.didManagerGetByAlias({ alias: 'issuer' });
    const clientIdentifier = await agent.didManagerGetByAlias({ alias: 'client' });

    // Leggi il file delle categorie di malattie
    const malattieFilePath = path.join('.', 'dist/utils', 'categorieDB.json');
    const malattieData = JSON.parse(fs.readFileSync(malattieFilePath, 'utf8'));

    // Seleziona una malattia casualmente
    const malattiaSelezionata = malattieData[Math.floor(Math.random() * malattieData.length)];
    if (!malattiaSelezionata) throw new Error('Nessuna malattia selezionata.');

    // Seleziona una sottocategoria casualmente
    const sottocategoriaSelezionata = malattiaSelezionata.sottocategorie[
      Math.floor(Math.random() * malattiaSelezionata.sottocategorie.length)
    ];
    if (!sottocategoriaSelezionata) throw new Error('Nessuna sottocategoria selezionata.');

    // Creazione della Verifiable Credential
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
            hash: sottocategoriaSelezionata.hash,
            hashNumerico: sottocategoriaSelezionata.hashNumerico.toString(),
            malattiaID: malattiaSelezionata.id,
            malattiaNome: sottocategoriaSelezionata.nome,
          },
          insuranceProvider: 'National Health Service',
        },
      },
      proofFormat: 'jwt',
    });

    const end = performance.now(); // Fine misurazione del tempo
    console.log(`Tempo impiegato: ${(end - start).toFixed(2)} ms.`);

    console.log('Nuova credenziale creata');
    fs.writeFileSync(path.join('outputs', 'credential.json'), JSON.stringify(vc, null, 2));

    return vc;
}

issueCredential().catch(console.error);
export { issueCredential };
