const userAddress = localStorage.getItem("userAddress");
document.getElementById("userAddress").textContent = userAddress;

const viewSbtButton = document.getElementById("viewSbtButton");
const logoutButton = document.getElementById("logoutButton");
const sbtInfo = document.getElementById("sbtInfo");
const detailsDiv = document.getElementById("details");
const treatmentsDiv = document.getElementById("treatments"); // Sezione per i trattamenti
const networkIdElement = document.getElementById("networkId");
const userBalanceElement = document.getElementById("userBalance");
const loadingIndicator = document.getElementById("loading");

async function fetchNetworkAndBalance() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const network = await provider.getNetwork();
  const balance = await provider.getBalance(userAddress);
  const balanceInEth = ethers.utils.formatEther(balance);

  networkIdElement.textContent = network.chainId;
  userBalanceElement.textContent = balanceInEth;
}

viewSbtButton.addEventListener("click", async () => {
  if (userAddress) {
    loadingIndicator.style.display = "block"; // Mostra l'indicatore di caricamento
    await fetchSBT(userAddress);
    loadingIndicator.style.display = "none"; // Nascondi l'indicatore di caricamento
  } else {
    Swal.fire({
      icon: "error",
      title: "Errore!",
      text: "Indirizzo MetaMask non trovato!",
    });
  }
});

viewSbtMultiButton.addEventListener("click", async () => {
  if (userAddress) {
    loadingIndicator.style.display = "block";
    await fetchSBTMulti(userAddress); // Fetch SBT Multicategoria
    loadingIndicator.style.display = "none";
  } else {
    Swal.fire({
      icon: "error",
      title: "Errore!",
      text: "Indirizzo MetaMask non trovato!",
    });
  }
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("userAddress");
  window.location = "index.html";
});

async function fetchSBT(address) {
  const contractAddress = "0x1a9777470649a5cf4b89bc865dfcd123422c76a1"; //rimpiazza con l'indirizzo del contratto SBT
  const sbtAbi = [
    "function getMedicalRecord(address owner) view returns (uint256 tokenID, string memory id, string memory name, string memory dateOfBirth, string memory healthID, bool authenticated)",
    "function canUserReceiveTreatment(string memory did, string memory hashedDiagnosis) view returns (bool)",
    "function revokeToken(uint256 tokenId) public", // Added ABI for revoke function
  ];

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const sbtContract = new ethers.Contract(
    contractAddress,
    sbtAbi,
    provider
  );

  try {
    console.log("Fetching SBT for address:", address);
    const sbtDetails = await sbtContract.getMedicalRecord(address);
    console.log("SBT Details:", sbtDetails);

    const [tokenID, id, name, dateOfBirth, healthID, authenticated] =
      sbtDetails;
    detailsDiv.innerHTML = "";
    const timingResult = document.getElementById("timingResult");
    timingResult.textContent = "-"

    if (tokenID == 0) {
      // Caso in cui non esiste un SBT
      detailsDiv.innerHTML = `
          <div class="alert alert-warning" role="alert">
              <strong>Attenzione!</strong> Non esiste un SBT associato a questo utente.
          </div>
      `;
         // Pulisci il contenitore delle categorie prima di aggiungere nuovi elementi
      treatmentsDiv.innerHTML = "";
      sbtInfo.style.display = "block";
      return
    }

    // Visualizza i dettagli SBT
    detailsDiv.innerHTML = `
      <div class="mb-2"><strong>Token ID:</strong> ${tokenID.toString()}</div>
      <div class="mb-2"><strong>DID:</strong> ${id}</div>
      <div class="mb-2"><strong>Nome:</strong> ${name}</div>
      <div class="mb-2"><strong>Data di Nascita:</strong> ${dateOfBirth}</div>
      <div class="mb-2"><strong>Health ID:</strong> ${healthID}</div>
      <div class="mb-2"><strong>Autenticato:</strong> ${authenticated ? "Sì" : "No"}</div>
      
      <div class="mb-2 text-muted">
        <em>Nota: Questo SBT è valido per una singola diagnosi di una particolare categoria.</em>
      </div>
      
      <button id="revokeSbtButton" class="btn btn-danger mt-2">
        <span class="revoke-text"><i class="fas fa-ban"></i> Revoca SBT</span>
        <span class="loading-icon" style="display: none;">
          <i class="fas fa-spinner fa-spin"></i> Caricamento...
        </span>
      </button>
    `;

    // Carica le categorie dal JSON
    const response = await fetch(
      "../utils/categorieDB.json"
    );
    if (!response.ok) {
      throw new Error("Impossibile caricare le categorie.");
    }
    const categories = await response.json();
    console.log(categories);

    // Pulisci il contenitore delle categorie prima di aggiungere nuovi elementi
    treatmentsDiv.innerHTML = "";

    // Crea un menu a discesa per le sottocategorie con classi Bootstrap
    const subcategorySelect = document.createElement("select");
    subcategorySelect.className = "form-select mb-3"; // Aggiunta della classe Bootstrap
    subcategorySelect.innerHTML = `<option value="" disabled selected>Seleziona una sottocategoria</option>`;

    // Itera sulle categorie e aggiungi le sottocategorie al menu a discesa
    categories.forEach((category) => {
      category.sottocategorie.forEach((subcategory) => {
        const option = document.createElement("option");
        option.value = subcategory.hash; // Usare hash della categoria per la verifica
        option.textContent = subcategory.nome + " (" + category.nome + ")";
        subcategorySelect.appendChild(option);
      });
    });

    // Aggiungi il menu a discesa al contenitore
    treatmentsDiv.appendChild(subcategorySelect);

    // Aggiungi un listener per il cambio di selezione
    subcategorySelect.addEventListener("change", async (event) => {
      const selectedHash = event.target.value;

      // Rimuovi eventuali risultati precedenti
      const existingResult = document.getElementById("treatment-result");
      if (existingResult) {
        existingResult.remove();
      }

      if (!selectedHash) return; // Se non è selezionata alcuna sottocategoria


      try {
        // Start timing
        const startTime = performance.now();
    
        // Check if the user is eligible for treatment
        const eligible = await sbtContract.canUserReceiveTreatment(id, selectedHash);
    
        // End timing
        const endTime = performance.now();
        const timeTaken = Math.round(endTime - startTime);
    
        console.log(eligible);
    
        // Create a result div
        const resultDiv = document.createElement("div");
        resultDiv.id = "treatment-result";
        resultDiv.textContent = eligible
            ? "Sei idoneo per ricevere il trattamento!"
            : "Non sei idoneo per ricevere il trattamento.";
    
        // Set result color based on eligibility
        resultDiv.style.color = eligible ? "green" : "red";
    
        // Add the result to the treatments container
        treatmentsDiv.appendChild(resultDiv);
    
        // Update the timing result in the timing section
        const timingResult = document.getElementById("timingResult");
        if (timingResult) {
            timingResult.textContent = `${timeTaken} ms`;
        }
    
        // Display sbtInfo if it's hidden
        document.getElementById("sbtInfo").style.display = "block";
    
    } catch (error) {
        console.error("Error checking treatment eligibility:", error);
        Swal.fire({
            icon: "error",
            title: "Errore!",
            text: "Impossibile verificare la tua idoneità al trattamento.",
        });
    }
    
    });

    // Aggiungi listener per il pulsante di revoca
    const revokeSbtButton = document.getElementById("revokeSbtButton");

    const revokeText = revokeSbtButton.querySelector(".revoke-text");
    const loadingIcon = revokeSbtButton.querySelector(".loading-icon");

    revokeSbtButton.addEventListener("click", async () => {
      // Mostra l'icona di caricamento e nasconde il testo
      revokeText.style.display = "none";
      loadingIcon.style.display = "block"; // Mostra l'icona di caricamento

      await revokeSBT(contractAddress); // Chiama la funzione di revoca

      // Nascondi l'icona di caricamento e mostra il testo di nuovo
      loadingIcon.style.display = "none";
      revokeText.style.display = "block";
      location.reload()
    });

    sbtInfo.style.display = "block";
  } catch (error) {
    console.error("Errore nel recupero dei dati:", error);
    Swal.fire({
      icon: "error",
      title: "Errore!",
      text: error.message || "Impossibile recuperare i dettagli SBT.",
    });
  }
}

async function revokeSBT(contrAdd) {
  const contractAddress = contrAdd; // Replace with the actual contract address
  const sbtAbi = ["function revokeSBT() public"];

  // Initialize provider and signer
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  // Initialize contract instance
  const sbtContract = new ethers.Contract(
    contractAddress,
    sbtAbi,
    signer
  );

  try {
    console.log("Verifying the function with callStatic...");

    // Simulate the revokeSBT function
    await sbtContract.callStatic.revokeSBT();

    // Proceed with the actual transaction
    console.log("Revoking SBT...");
    const tx = await sbtContract.revokeSBT();
    await tx.wait();

    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "SBT revocato con successo!",
    });
  } catch (error) {
    console.error("Error during SBT revocation:", error);
    Swal.fire({
      icon: "error",
      title: "Error!",
      text: "Un errore è stato riscontrato durante la revoca dell'SBT. Controlla la console!.",
    });
  }
}


async function fetchSBTMulti(address) {
  const contractAddress = "0x04f5ae8fb847690cde2b62dd1be5c20653658bf3"; // Indirizzo del contratto
  const sbtMultiAbi = [
    "function getMedicalRecord(address owner) view returns (uint256 tokenID, string memory id, string memory name, string memory dateOfBirth, string memory healthID, bool authenticated)",
    "function canUserReceiveTreatment(string memory did, string memory categoryHash) view returns (bool)"
  ];

  // Controllo della connessione a Ethereum
  if (!window.ethereum) {
    Swal.fire({
      icon: "error",
      title: "Errore!",
      text: "Si prega di installare MetaMask o un altro wallet Ethereum.",
    });
    return;
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const sbtMultiContract = new ethers.Contract(
    contractAddress,
    sbtMultiAbi,
    provider
  );

  try {
    console.log("Fetching SBT for address:", address);

    // Validazione dell'indirizzo
    if (!ethers.utils.isAddress(address)) {
      Swal.fire({
        icon: "error",
        title: "Errore!",
        text: "Indirizzo Ethereum non valido.",
      });
      return;
    }

    // Recupera i dettagli SBT
    const sbtDetails = await sbtMultiContract.getMedicalRecord(address);
    console.log("SBT Details:", sbtDetails);

    const [tokenID, id, name, dateOfBirth, healthID, authenticated] =
      sbtDetails;
    detailsDiv.innerHTML = "";
    const timingResult = document.getElementById("timingResult");
    timingResult.textContent = "-"

    if (tokenID == 0) {
      // Caso in cui non esiste un SBT
      detailsDiv.innerHTML = `
          <div class="alert alert-warning" role="alert">
              <strong>Attenzione!</strong> Non esiste un SBT associato a questo utente.
          </div>
      `;
      treatmentsDiv.innerHTML = "";
      sbtInfo.style.display = "block";
      return;
    }

    detailsDiv.innerHTML = `
          <div class="mb-2"><strong>Token ID:</strong> ${tokenID.toString()}</div>
          <div class="mb-2"><strong>DID:</strong> ${id}</div>
          <div class="mb-2"><strong>Nome:</strong> ${name}</div>
          <div class="mb-2"><strong>Data di Nascita:</strong> ${dateOfBirth}</div>
          <div class="mb-2"><strong>Health ID:</strong> ${healthID}</div>
          <div class="mb-2"><strong>Autenticato:</strong> ${authenticated ? "Sì" : "No"}</div>
          
          <div class="mb-2 text-muted">
            <em>Nota: Questo SBT è valido per tutte le diagnosi della categoria.</em>
          </div>
          
          <button id="revokeSbtButton" class="btn btn-danger mt-2">
            <span class="revoke-text"><i class="fas fa-ban"></i> Revoca SBT</span>
            <span class="loading-icon" style="display: none;">
              <i class="fas fa-spinner fa-spin"></i> Caricamento...
            </span>
          </button>
        `;


    
    // Carica le categorie dal JSON
    const response = await fetch("../utils/categorieDB.json");

    if (!response.ok) {
      throw new Error("Impossibile caricare le categorie.");
    }
    const categories = await response.json();
    console.log(categories);

    // Pulisci il contenitore delle categorie prima di aggiungere nuovi elementi
    treatmentsDiv.innerHTML = "";

    // Crea un menu a discesa per le sottocategorie con classi Bootstrap
    const subcategorySelect = document.createElement("select");
    subcategorySelect.className = "form-select mb-3"; // Aggiunta della classe Bootstrap
    subcategorySelect.innerHTML = `<option value="" disabled selected>Seleziona una sottocategoria</option>`;

    // Itera sulle categorie e aggiungi le sottocategorie al menu a discesa
    categories.forEach((category) => {
      category.sottocategorie.forEach((subcategory) => {
        const option = document.createElement("option");
        option.value = category.hash; // Usare hash della categoria per la verifica
        option.textContent = subcategory.nome + " (" + category.nome + ")";
        subcategorySelect.appendChild(option);
      });
    });

    // Aggiungi il menu a discesa al contenitore
    treatmentsDiv.appendChild(subcategorySelect);

    // Aggiungi un listener per il cambio di selezione
    subcategorySelect.addEventListener("change", async (event) => {
      const selectedHash = event.target.value;

      // Rimuovi eventuali risultati precedenti
      const existingResult = document.getElementById("treatment-result");
      if (existingResult) {
        existingResult.remove();
      }

      if (!selectedHash) return; // Se non è selezionata alcuna sottocategoria

      try {
        // Start timing
        const startTime = performance.now();
    
        // Check if the user is eligible for treatment
        const eligible = await sbtMultiContract.canUserReceiveTreatment(id, selectedHash);
    
        // End timing
        const endTime = performance.now();
        const timeTaken = Math.round(endTime - startTime);
    
        console.log(eligible);
    
        // Create a result div
        const resultDiv = document.createElement("div");
        resultDiv.id = "treatment-result";
        resultDiv.textContent = eligible
            ? "Sei idoneo per ricevere il trattamento!"
            : "Non sei idoneo per ricevere il trattamento.";
    
        // Set result color based on eligibility
        resultDiv.style.color = eligible ? "green" : "red";
    
        // Add the result to the treatments container
        treatmentsDiv.appendChild(resultDiv);
    
        // Update the timing result in the timing section
        timingResult.textContent = `${timeTaken} ms`;
        
    
        // Display sbtInfo if it's hidden
        document.getElementById("sbtInfo").style.display = "block";
    
    } catch (error) {
        console.error("Error checking treatment eligibility:", error);
        Swal.fire({
            icon: "error",
            title: "Errore!",
            text: "Impossibile verificare la tua idoneità al trattamento.",
        });
    }
    
    });

    // Aggiungi listener per il pulsante di revoca
    const revokeSbtButton = document.getElementById("revokeSbtButton");
    const revokeText = revokeSbtButton.querySelector(".revoke-text");
    const loadingIcon = revokeSbtButton.querySelector(".loading-icon");

    revokeSbtButton.addEventListener("click", async () => {
      // Mostra l'icona di caricamento e nasconde il testo
      revokeText.style.display = "none";
      loadingIcon.style.display = "block"; // Mostra l'icona di caricamento

      await revokeSBT(contractAddress); // Chiama la funzione di revoca

      // Nascondi l'icona di caricamento e mostra il testo di nuovo
      loadingIcon.style.display = "none";
      revokeText.style.display = "block";
      location.reload()
    });
    sbtInfo.style.display = "block";

  } catch (error) {
    console.error("Errore nel recupero dei dati dell'SBT:", error);
    Swal.fire({
      icon: "error",
      title: "Errore!",
      text: error.message || "Impossibile recuperare i dettagli SBT.",
    });
  }
}

window.onload = fetchNetworkAndBalance;