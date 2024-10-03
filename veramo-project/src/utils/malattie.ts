import * as crypto from 'crypto';

// Definizione del primo p per i campi di ZoKrates
const p = BigInt('19');

// Funzione per ottenere l'hash di una malattia in SHA-256
export function calcolaHash(malattia: string): string {
    return crypto.createHash('sha256').update(malattia).digest('hex');
}

// Funzione per convertire un hash esadecimale in un numero BigInt e ridurlo modulo p
export function hexToField(hex: string): bigint {
    const hashNumerico = BigInt(`0x${hex}`);
    return hashNumerico % p;  // Riduci il valore modulo p per ZoKrates
}

// Definizione delle malattie
const malattie = [
    { id: 0, nome: 'cancro', hash: calcolaHash('cancro') },
    { id: 1, nome: 'malattia cardiaca', hash: calcolaHash('malattia cardiaca') },
    { id: 2, nome: 'diabete', hash: calcolaHash('diabete') },
    { id: 3, nome: 'malattia renale', hash: calcolaHash('malattia renale') },
];

// Conversione degli hash in numeri e riduzione modulo p
export const malattieConNumeri = malattie.map(malattia => {
    const hashNumerico = hexToField(malattia.hash);
    console.log(`Malattia: ${malattia.nome}, Hash: ${malattia.hash}, Hash Numerico: ${hashNumerico}`);
    return {
        ...malattia,
        hashNumerico  // Passa il numero ridotto modulo p
    };
});
