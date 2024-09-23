const { ethers } = require("ethers");

// Configura il provider per la tua rete Besu
const provider = new ethers.JsonRpcProvider("http://localhost:8545"); // Cambia l'URL se necessario

async function checkAccounts() {
  const accounts = [
    "0xfe3b557e8fb62b89f4916b721be55ceb828dbd73",
    "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
    "0xf17f52151EbEF6C7334FAD080c5704D77216b732"
  ];

  for (const account of accounts) {
    try {
      const balance = await provider.getBalance(account);
      console.log(`Account: ${account}`);
      console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
    } catch (error) {
      console.error(`Error fetching balance for account ${account}:`, error);
    }
  }
}

checkAccounts().catch(console.error);
