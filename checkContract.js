import { ethers } from "ethers";

// Configura il provider
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Configura il wallet con la chiave privata
const privateKey = "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3"; // Sostituisci con la tua chiave privata
const wallet = new ethers.Wallet(privateKey, provider);

// ABI del contratto
const abi = [
  "function updateDIDDocument(string memory _did, bytes memory _document) public",
  "function getDIDDocument(string memory _did) public view returns (bytes memory document)",
];

// Indirizzo del contratto
const DID_REGISTRY_ADDRESS = "0xbaaa2a3237035a2c7fa2a33c76b44a8c6fe18e87";

// Crea un'istanza del contratto
const contract = new ethers.Contract(DID_REGISTRY_ADDRESS, abi, wallet);

async function testContract() {
  try {
    // Esegui una chiamata di prova
    const did = "did:example:123";
    const document = ethers.toUtf8Bytes("Test Document");

    // Chiamata alla funzione updateDIDDocument
    const tx = await contract.updateDIDDocument(did, document);
    await tx.wait();

    console.log(`DID Document updated successfully`);

    // Verifica il documento
    const fetchedDocument = await contract.getDIDDocument(did);
    console.log(`Fetched Document: ${ethers.toUtf8String(fetchedDocument)}`);

  } catch (error) {
    console.error('Error interacting with the contract:', error);
  }
}

testContract();
