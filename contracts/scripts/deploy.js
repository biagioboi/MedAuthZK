const hre = require("hardhat");

async function main() {
  // Ottieni il signers (account) che distribuisce il contratto
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());

  // Ottieni il factory del contratto
  const EthereumDIDRegistry = await ethers.getContractFactory("contracts/EthereumDIDRegistry.sol:EthereumDIDRegistry");
  
  // Distribuisci il contratto
  const ethereumDIDRegistry = await EthereumDIDRegistry.deploy();
  
  // Attendi che il contratto sia distribuito
  await ethereumDIDRegistry.waitForDeployment();
  
  console.log("EthereumDIDRegistry deployed to:", ethereumDIDRegistry.target);
}

// Esegui la funzione main e gestisci gli errori
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
