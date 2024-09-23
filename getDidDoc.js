const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider("http://localhost:8545"); // Cambia l'URL se necessario
const DID_REGISTRY_ADDRESS = "0xbaaa2a3237035a2c7fa2a33c76b44a8c6fe18e87";

// ABI del contratto
const abi = [
  "function getDIDDocument(string memory _did) public view returns (bytes memory)"
];

const contract = new ethers.Contract(DID_REGISTRY_ADDRESS, abi, provider);

async function getDIDDocument(did) {
  try {
    const document = await contract.getDIDDocument(did);
    console.log("DID Document:", document);
  } catch (error) {
    console.error(`Error fetching DID document for ${did}:`, error);
  }
}

getDIDDocument("did:ethr:private:0x0242d6c1f38c4e088a532585acfd7ffbf24092b1fc8c8c5076eb929be1d1b723c9").catch(console.error);
