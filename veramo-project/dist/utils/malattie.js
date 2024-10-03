import * as crypto from 'crypto';
import * as fs from 'fs';
// Definizione del primo p per i campi di ZoKrates
const p = BigInt('19');
// Funzione per ottenere un *salt* casuale di lunghezza 16 caratteri
function generaSalt() {
    return crypto.randomBytes(8).toString('hex');
}
// Funzione per ottenere l'hash di una malattia in SHA-256, concatenata con un salt
export function calcolaHashConSalt(malattia, salt) {
    return crypto.createHash('sha256').update(malattia + salt).digest('hex');
}
// Funzione per convertire un hash esadecimale in un numero BigInt e ridurlo modulo p
export function hexToField(hex) {
    const hashNumerico = BigInt(`0x${hex}`);
    return hashNumerico % p; // Riduci il valore modulo p per ZoKrates
}
// Definizione delle malattie con un salt univoco
const malattie = [
    { id: 0, nome: 'cancro', salt: generaSalt() },
    { id: 1, nome: 'malattia cardiaca', salt: generaSalt() },
    { id: 2, nome: 'diabete', salt: generaSalt() },
    { id: 3, nome: 'malattia renale', salt: generaSalt() },
];
// Calcolo degli hash con salt e conversione degli hash in numeri ridotti modulo p
export const malattieConNumeri = malattie.map(malattia => {
    const hash = calcolaHashConSalt(malattia.nome, malattia.salt); // Calcola l'hash con il salt
    const hashNumerico = hexToField(hash).toString(); // Riduci modulo p
    console.log(`Malattia: ${malattia.nome}, Salt: ${malattia.salt}, Hash: ${hash}, Hash Numerico: ${hashNumerico}`);
    return {
        ...malattia,
        hash, // Hash calcolato con salt
        hashNumerico // Numero ridotto modulo p
    };
});
// Funzione per salvare le malattie calcolate in un file JSON
function salvaMalattieInFile() {
    const filePath = './malattieDB.json';
    const datiDaSalvare = JSON.stringify(malattieConNumeri, null, 2); // Converti in stringa JSON formattata
    fs.writeFileSync(filePath, datiDaSalvare, 'utf8');
    console.log(`Dati salvati nel file ${filePath}`);
}
// Salva le malattie nel file malattieDB.json
salvaMalattieInFile();
