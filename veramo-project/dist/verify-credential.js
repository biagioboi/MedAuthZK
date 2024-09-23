import { agent } from './veramo/setup.js';
import * as fs from 'fs';
async function main() {
    try {
        // Leggi e stampa la Verifiable Credential
        const vc = JSON.parse(fs.readFileSync('credential.json', 'utf8'));
        console.log('Verifiable Credential:', vc);
        // Verifica la Verifiable Credential
        const result = await agent.verifyCredential({ credential: vc });
        console.log("Verified? :" + result.verified);
        // Controlla se la verifica è andata a buon fine
        if (result.verified) {
            // Salva il risultato solo se la verifica è andata a buon fine
            fs.writeFileSync('VCredential.json', JSON.stringify(result, null, 2));
            console.log('Credential verified and saved to verifiedCredential.json');
        }
        else {
            // Gestisci il caso in cui la verifica non è riuscita
            console.error('Credential verification failed:', result.error);
            console.error('Detailed result:', result);
        }
    }
    catch (error) {
        // Gestisci gli errori generali (es. errori di lettura/scrittura file o errori di rete)
        console.error('An error occurred:', error);
    }
}
main().catch(console.error);
