const sbtInfo = document.getElementById("sbtInfo");
const detailsDiv = document.getElementById("details");
const treatmentsDiv = document.getElementById("treatments"); // Sezione per i trattamenti

// Inizializza l'indirizzo del contratto e l'ABI
const contractAddress = "0x345ca3e014aaf5dca488057592ee47305d9b3e10"; // Sostituisci con l'indirizzo del contratto SBT
const sbtAbi = [
    "function getAllSBTsForAddress(address user) view returns (uint256[] memory)",
    "function getMedicalRecord(uint256 tokenID) view returns (\
        uint256 tokenID_,\
        string memory id,\
        string memory name,\
        string memory dateOfBirth,\
        string memory healthID,\
        bool authenticated,\
        string memory diagnosis\
    ) ",
    "function canUserReceiveTreatment(address userAddress, string memory hashedDiagnosis) public view returns (bool)",
    "function revokeSBT(uint256 tokenID) public"
];
  
// Inizializza il provider MetaMask
const provider = new ethers.providers.Web3Provider(window.ethereum);
const sbtContract = new ethers.Contract(contractAddress, sbtAbi, provider.getSigner());

/// Funzione per recuperare tutti gli SBT associati all'utente
async function getAllSbts() {
    const sbtsElement = document.getElementById('sbts');
    const loadingIndicator = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');

    const userAddress = localStorage.getItem("userAddress"); // Ottieni l'indirizzo dell'utente
    console.log(userAddress);

    try {
        // Mostra l'indicatore di caricamento
        loadingIndicator.style.display = "block";
        sbtsElement.innerHTML = ""; // Pulisce il contenuto precedente

        // Recupera tutti gli SBT associati all'indirizzo dell'utente
        const sbts = await sbtContract.getAllSBTsForAddress(userAddress);

        // Se non ci sono SBT per l'indirizzo, mostra un messaggio di errore
        if (sbts.length === 0) {
            errorMessage.style.display = "none";
            loadingIndicator.style.display = "none";
            sbtsElement.innerHTML = `
                <div class="alert alert-info d-flex flex-column align-items-center" role="alert" style="font-size: 1.2rem; text-align: center;">
                    <!-- Icona -->
                    <div style="font-size: 10rem; padding-bottom: 20px;">
                    <i class="fas fa-exclamation-triangle text-warning" style="animation: bounce 1s infinite;"></i>
                    </div>

                    <!-- Messaggio -->
                    <div>
                    <strong>Oh no!</strong><br> Non c'è nessun SBT per l'indirizzo: <strong>${userAddress}</strong>.
                    Ma non preoccuparti, c'è sempre una soluzione!
                    </div>
                </div>

                <style>
                    @keyframes bounce {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                    }
                </style>
                `;

        } else {
            loadingIndicator.style.display = "none";

            // Itera attraverso tutti gli SBT per l'indirizzo e recupera il record medico per ciascuno
            for (let tokenID of sbts) {
                const medicalRecord = await sbtContract.getMedicalRecord(tokenID);
                console.log(medicalRecord)
                // Creazione di un nuovo contenitore per ogni SBT
                const sbtContainer = document.createElement("div");
                sbtContainer.className = "card mb-3 shadow-sm rounded";
                sbtContainer.style.borderLeft = "5px solid #007bff";

                // Aggiungi i dettagli dell'SBT e l'icona del certificato
                sbtContainer.innerHTML = `
                    <div class="card-body d-flex">
                        <!-- Colonna per l'icona -->
                        <div class="col-2 d-flex justify-content-center align-items-center">
                            <i class="fas fa-award fa-5x text-primary"></i>
                        </div>
                        
                        <!-- Colonna per i dettagli -->
                        <div class="col-10">
                            <h5 class="card-title">SBT ID: ${medicalRecord.tokenID_.toString()}</h5>
                            <p><strong>Did di riferimento:</strong> ${medicalRecord.id}</p>
                            <p><strong>Nome:</strong> ${medicalRecord.name}</p>
                            <p><strong>Data di Nascita:</strong> ${medicalRecord.dateOfBirth}</p>
                            <p><strong>Codice Fiscale ID:</strong> ${medicalRecord.healthID}</p>
                            <p><strong>Diagnosi:</strong> ${medicalRecord.diagnosis}</p>

                            <!-- Nota sul trattamento -->
                            <div class="mb-2 text-muted">
                                <em>Nota: Questo SBT è valido per una singola diagnosi di una particolare categoria.</em>
                            </div>

                            <!-- Trattamenti -->
                            <div class="mt-3" id="treatment-info-${tokenID}">
                                <!-- Menu per la selezione della sottocategoria -->
                                <select class="form-select mt-3" aria-label="Seleziona una sottocategoria">
                                    <option value="" disabled selected>Seleziona una sottocategoria</option>
                                </select>
                            </div>

                            <!-- Pulsante di revoca -->
                            <button id="revokeSbtButton${tokenID}" class="btn btn-danger mt-2">
                                <span class="revoke-text"><i class="fas fa-ban"></i> Revoca SBT</span>
                                <span class="loading-icon" style="display: none;">
                                    <i class="fas fa-spinner fa-spin"></i> Caricamento...
                                </span>
                            </button>
                        </div>
                    </div>
                `;

                // Aggiungi il contenitore dell'SBT al contenitore principale
                sbtsElement.appendChild(sbtContainer);

                // Aggiungi il menu a discesa con le categorie
                const treatmentsDiv = document.getElementById(`treatment-info-${tokenID}`);

                // Carica le categorie dal JSON per la selezione del trattamento
                const response = await fetch("../utils/categorieDB.json");
                if (!response.ok) {
                    throw new Error("Impossibile caricare le categorie.");
                }
                const categories = await response.json();

                // Trova il menu a discesa creato e aggiungi le opzioni dinamicamente
                const subcategorySelect = treatmentsDiv.querySelector("select");

                // Itera sulle categorie e aggiungi le sottocategorie al menu a discesa
                categories.forEach((category) => {
                    category.sottocategorie.forEach((subcategory) => {
                        const option = document.createElement("option");
                        option.value = subcategory.hash; // Usare hash della categoria per la verifica
                        option.textContent = subcategory.nome + " (" + category.nome + ")";
                        subcategorySelect.appendChild(option);
                    });
                });

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
                        // Verifica se l'utente è idoneo al trattamento
                        const eligible = await sbtContract.canUserReceiveTreatment(userAddress, selectedHash);

                        // Crea un div per il risultato
                        const resultDiv = document.createElement("div");
                        resultDiv.id = "treatment-result";
                        resultDiv.textContent = eligible
                            ? "Sei idoneo per ricevere il trattamento!"
                            : "Non sei idoneo per ricevere il trattamento.";

                        // Imposta il colore del risultato in base all'idoneità
                        resultDiv.style.color = eligible ? "green" : "red";

                        // Aggiungi il risultato al contenitore del trattamento
                        treatmentsDiv.appendChild(resultDiv);
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
                const revokeSbtButton = document.getElementById(`revokeSbtButton${tokenID}`);

                const revokeText = revokeSbtButton.querySelector(".revoke-text");
                const loadingIcon = revokeSbtButton.querySelector(".loading-icon");

                revokeSbtButton.addEventListener("click", async () => {
                    // Mostra l'icona di caricamento e nasconde il testo
                    revokeText.style.display = "none";
                    loadingIcon.style.display = "block"; // Mostra l'icona di caricamento

                    await revokeSBT(contractAddress, tokenID); // Chiama la funzione di revoca

                    // Nascondi l'icona di caricamento e mostra il testo di nuovo
                    loadingIcon.style.display = "none";
                    revokeText.style.display = "block";
                    location.reload();
                });
            }
        }
    } catch (error) {
        loadingIndicator.style.display = "none";
        errorMessage.style.display = "block";
        console.error("Errore nel recupero dei dati:", error);
    }
}


async function revokeSBT(contractAddress, tokenId) {
    const sbtAbi = ["function revokeSBT(uint256 tokenId) public"];

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
    
        // Proceed with the actual transaction
        console.log("Revoking SBT with tokenId:", tokenId);
        const tx = await sbtContract.revokeSBT(tokenId);
        await tx.wait();

        Swal.fire({
            icon: "success",
            title: "Success!",
            text: `SBT con Token ID ${tokenId} revocato con successo!`,
        });
    } catch (error) {
        console.error("Error during SBT revocation:", error);
        Swal.fire({
            icon: "error",
            title: "Error!",
            text: "Un errore è stato riscontrato durante la revoca dell'SBT. Controlla la console!",
        });
    }
}


getAllSbts();
  