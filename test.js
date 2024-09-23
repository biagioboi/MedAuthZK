const { ethers } = require('ethers');

// Configura il provider e il contratto
const provider = new ethers.JsonRpcProvider('http://localhost:8545');
console.log(provider);
// Set up the signer (ensure the account is unlocked)
const signer = provider.getSigner();
console.log("CIAO +", signer.target);

const contractAddress = '0xbaAA2a3237035a2c7fa2a33c76b44a8c6fe18e87'; // L'indirizzo del tuo contratto
const abi = [
  "function updateDIDDocument(string memory _did, bytes memory _document) public",
  "function getDIDDocument(string memory _did) public view returns (bytes memory)",
];

// Crea una nuova istanza del contratto
const contract = new ethers.Contract(contractAddress, abi, provider);

// Funzione per convertire un oggetto JSON in bytes
function toBytes(json) {
  return ethers.toUtf8Bytes(JSON.stringify(json));
}

async function updateDIDDocument(did, document) {
  const signer = provider.getSigner();
  console.log(signer);
  
  const contractWithSigner = contract.connect(signer);

  try {
    const tx = await contractWithSigner.updateDIDDocument(did, document);
    await tx.wait();
    console.log('DID document updated');
  } catch (error) {
    console.error('Error updating DID document:', error);
  }
}

async function getDIDDocument(did) {
  try {
    const document = await contract.getDIDDocument(did);
    console.log('DID document:', ethers.toUtf8String(document));
  } catch (error) {
    console.error('Error getting DID document:', error);
  }
}

// Esempio di utilizzo
(async () => {
  const vc = {
    "credentialSubject": {
      "name": "Mario Rossi",
      "dateOfBirth": "1990-01-01",
      "healthID": "RSSMRA90A01H703H",
      "insuranceProvider": "National Health Service",
      "id": "did:ethr:private:0x0242d6c1f38c4e088a532585acfd7ffbf24092b1fc8c8c5076eb929be1d1b723c9"
    },
    "issuer": {
      "id": "did:ethr:private:0x03c708d2d72e12b3b4d950265f5b8ba2d04aeae137f8d7acf08dd40aa5f62cf42c"
    },
    "type": [
      "VerifiableCredential",
      "HealthCredential"
    ],
    "@context": [
      "https://www.w3.org/2018/credentials/v1"
    ],
    "issuanceDate": "2024-09-19T16:49:48.000Z",
    "proof": {
      "type": "JwtProof2020",
      "jwt": "eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiSGVhbHRoQ3JlZGVudGlhbCJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJuYW1lIjoiTWFyaW8gUm9zc2kiLCJkYXRlT2ZCaXJ0aCI6IjE5OTAtMDEtMDEiLCJoZWFsdGhJRCI6IlJTU01SQTkwQTAxSDcwM0giLCJpbnN1cmFuY2VQcm92aWRlciI6Ik5hdGlvbmFsIEhlYWx0aCBTZXJ2aWNlIn19LCJzdWIiOiJkaWQ6ZXRocjpwcml2YXRlOjB4MDI0MmQ2YzFmMzhjNGUwODhhNTMyNTg1YWNmZDdmZmJmMjQwOTJiMWZjOGM4YzUwNzZlYjkyOWJlMWQxYjcyM2M5IiwibmJmIjoxNzI2NzY0NTg4LCJpc3MiOiJkaWQ6ZXRocjpwcml2YXRlOjB4MDNjNzA4ZDJkNzJlMTJiM2I0ZDk1MDI2NWY1YjhiYTJkMDRhZWFlMTM3ZjhkN2FjZjA4ZGQ0MGFhNWY2MmNmNDJjIn0.yTj7Zj1WA0iCPxya2BLqGJhjvIEaDklvwaddcun8_aFOKzpszjYZJxIcspakW1X8sRJBma8ecL-Wy50MvPNiYA"
    }
  };

  const did = "did:ethr:private:0x0242d6c1f38c4e088a532585acfd7ffbf24092b1fc8c8c5076eb929be1d1b723c9";
  const document = toBytes(vc);

  await updateDIDDocument(did, document);
  await getDIDDocument(did);
})();
