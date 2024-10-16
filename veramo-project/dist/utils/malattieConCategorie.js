import * as crypto from 'crypto';
import * as fs from 'fs';
// Definizione del primo p per i campi di ZoKrates
const p = BigInt('4957');
// Funzione per ottenere un *salt* casuale di lunghezza 16 caratteri
function generaSalt() {
    return crypto.randomBytes(8).toString('hex');
}
// Funzione per ottenere l'hash di una categoria in SHA-256, concatenata con un salt
export function calcolaHashConSalt(categoria, salt) {
    return crypto.createHash('sha256').update(categoria + salt).digest('hex');
}
// Funzione per convertire un hash esadecimale in un numero BigInt e ridurlo modulo p
export function hexToField(hex) {
    const hashNumerico = BigInt(`0x${hex}`);
    return hashNumerico % p; // Riduci il valore modulo p per ZoKrates
}
// Definizione delle categorie con un salt univoco e sottocategorie
const categorie = [
    {
        id: 0,
        nome: 'Cancro',
        salt: generaSalt(),
        sottocategorie: ['Cancro al seno', 'Cancro ai polmoni', 'Melanoma']
    },
    {
        id: 1,
        nome: 'Malattia cardiaca',
        salt: generaSalt(),
        sottocategorie: ['Infarto', 'Insufficienza cardiaca', 'Aritmia']
    },
    {
        id: 2,
        nome: 'Diabete',
        salt: generaSalt(),
        sottocategorie: ['Diabete di tipo 1', 'Diabete di tipo 2']
    },
    {
        id: 3,
        nome: 'Malattia renale',
        salt: generaSalt(),
        sottocategorie: ['Insufficienza renale', 'Malattia renale policistica']
    },
];
// Calcolo degli hash con salt e conversione degli hash in numeri ridotti modulo p
export const categorieConNumeri = categorie.map(categoria => {
    const hash = calcolaHashConSalt(categoria.nome, categoria.salt); // Calcola l'hash con il salt
    const hashNumerico = hexToField(hash).toString(); // Riduci modulo p
    console.log(`Categoria: ${categoria.nome}, Salt: ${categoria.salt}, Hash: ${hash}, Hash Numerico: ${hashNumerico}`);
    // Calcolo degli hash per le sottocategorie
    const sottocategorieConHash = categoria.sottocategorie.map(sottocategoria => {
        const sottocategoriaHash = calcolaHashConSalt(sottocategoria, categoria.salt);
        const sottocategoriaHashNumerico = hexToField(sottocategoriaHash).toString();
        console.log(`  Sottocategoria: ${sottocategoria}, Hash: ${sottocategoriaHash}, Hash Numerico: ${sottocategoriaHashNumerico}`);
        return {
            nome: sottocategoria,
            hash: sottocategoriaHash,
            hashNumerico: sottocategoriaHashNumerico
        };
    });
    return {
        ...categoria,
        hash, // Hash calcolato con salt
        hashNumerico, // Numero ridotto modulo p
        sottocategorie: sottocategorieConHash // Sottocategorie con hash
    };
});
// Funzione per salvare le categorie calcolate in un file JSON
function salvaCategorieInFile() {
    const filePath = './categorieDB.json';
    const datiDaSalvare = JSON.stringify(categorieConNumeri, null, 2); // Converti in stringa JSON formattata
    fs.writeFileSync(filePath, datiDaSalvare, 'utf8');
    console.log(`Dati salvati nel file ${filePath}`);
}
// Salva le categorie nel file categorieDB.json
salvaCategorieInFile();
