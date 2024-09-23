import fs from 'fs';
import path from 'path';
import { initialize } from 'zokrates-js';
// Define paths for the files
const vcPresentationPath = path.join('.', 'presentation.json');
const verificationKeyPath = path.join('.', 'zokrates', 'verification.key');
const verificationKey = JSON.parse(fs.readFileSync(verificationKeyPath, 'utf8'));
console.log(verificationKey);
// Load and parse the VC presentation file
const vcPresentation = JSON.parse(fs.readFileSync(vcPresentationPath, 'utf8')).credentialSubject.zkpProof;
console.log(vcPresentation);
async function verifyZKP() {
    const zokratesProvider = await initialize();
    const isVerified = await zokratesProvider.verify(verificationKey, vcPresentation);
    // Log results
    console.log('Verification Result:', isVerified);
}
// Execute the function
verifyZKP().catch(console.error);
