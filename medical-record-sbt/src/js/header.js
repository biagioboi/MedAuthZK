const userAddress = localStorage.getItem("userAddress");
document.getElementById("userAddress").textContent = userAddress;

const networkIdElement = document.getElementById("networkId");
const userBalanceElement = document.getElementById("userBalance");

async function fetchNetworkAndBalance() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    const balance = await provider.getBalance(userAddress);
    const balanceInEth = ethers.utils.formatEther(balance).toString();

    // Ora puoi usare toFixed() senza errori
    let formattedBalance = parseFloat(balanceInEth).toFixed(2);

    networkIdElement.textContent = network.chainId;
    userBalanceElement.textContent = formattedBalance;
}
window.onload = fetchNetworkAndBalance;

