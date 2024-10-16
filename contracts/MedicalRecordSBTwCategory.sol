// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./verifier-category.sol"; // Importa il contratto Verifier.sol generato da ZoKrates

contract MedicalRecordSBT is ERC721 {
    address private _owner;
    Verifier private verifier; // Istanza del contratto Verifier

    uint256 private _tokenCounter;

    struct MedicalRecord {
        uint256 tokenID;
        string id; // DID
        string name; // Nome
        string dateOfBirth; // Data di nascita
        string healthID; // ID sanitario
        mapping(string => bool) authorizedTreatment; // Mappatura delle diagnosi e permessi di trattamento
        mapping(string => bool) authorizedCategory; // Mappatura delle categorie e permessi di trattamento
        string[] treatmentKeys; // Lista delle diagnosi per eliminazione
        string[] categoryKeys;  // Lista delle categorie per eliminazione
        bool authenticated; // Utente autenticato con la malattia
    }


    mapping(address => MedicalRecord) private tokensIssued;
    mapping(string => address) private didToAddress; // Mappa il DID all'indirizzo dell'utente
    mapping(address => Verifier.Proof) private userProofs; // Mappa che associa un indirizzo alla sua prova ZKP

    event SBTIssued(address indexed requester, uint256 tokenID);
    event SBTRevoked(address indexed requester);

    modifier onlyOwner() {
        require(msg.sender == _owner, "Solo il proprietario puo chiamare questa funzione");
        _;
    }

    constructor(address verifierAddress) ERC721("SBT", "SBT") {
        _owner = msg.sender;
        verifier = Verifier(verifierAddress); // Inizializza l'istanza del Verifier
        _tokenCounter = 0;
    }

    function requestSBT(
        string memory id, // DID
        string memory name, // Nome
        string memory dateOfBirth, // Data di nascita
        string memory healthID, // ID sanitario
        string memory diagnosis, // Diagnosi (hash della malattia)
        string memory category, // Categoria (hash della categoria)
        Verifier.Proof memory zkpProof, // Prova ZKP in formato struct
        uint256[1] memory inputs // Input per la verifica
    ) public {
        // Verifica della prova ZKP
        require(isProofEmpty(userProofs[msg.sender]), "Prova gia' utilizzata per questo utente");
        bool proofValid = verifier.verifyTx(zkpProof, inputs);
        require(proofValid, "Prova ZKP non valida");

        // Se la categoria non è autorizzata, emetti un nuovo SBT e aggiorna diagnosi e categoria
        require(tokensIssued[msg.sender].tokenID == 0, "Token gia emesso per questo indirizzo");

        _tokenCounter++;
        _safeMint(msg.sender, _tokenCounter);

        // Salva la prova nella mappatura
        userProofs[msg.sender] = zkpProof;

        // Inizializza la struttura MedicalRecord per la prima volta
        MedicalRecord storage record = tokensIssued[msg.sender];
        record.tokenID = _tokenCounter;
        record.id = id;
        record.name = name;
        record.dateOfBirth = dateOfBirth;
        record.healthID = healthID;
        record.authenticated = true;

        record.authorizedTreatment[diagnosis] = true;
        record.treatmentKeys.push(diagnosis); // Salva la diagnosi

        record.authorizedCategory[category] = true;
        record.categoryKeys.push(category); // Salva la categoria


        // Mappa il DID all'indirizzo dell'utente
        didToAddress[id] = msg.sender;

        emit SBTIssued(msg.sender, _tokenCounter);
    }
    

    function revokeSBT() public {
    require(tokensIssued[msg.sender].tokenID != 0, "Nessun SBT da revocare");

        MedicalRecord storage record = tokensIssued[msg.sender];
        uint256 tokenID = record.tokenID;

        // Brucia il token
        _burn(tokenID);

        // Rimuove l'associazione DID
        string memory userDID = record.id;
        delete didToAddress[userDID];

        // Cancella le diagnosi autorizzate
        for (uint256 i = 0; i < record.treatmentKeys.length; i++) {
            string memory diagnosis = record.treatmentKeys[i];
            delete record.authorizedTreatment[diagnosis];
        }

        // Cancella le categorie autorizzate
        for (uint256 i = 0; i < record.categoryKeys.length; i++) {
            string memory category = record.categoryKeys[i];
            delete record.authorizedCategory[category];
        }

        // Cancella gli array di chiavi
        delete record.treatmentKeys;
        delete record.categoryKeys;

        // Infine, cancella il record medico completo e la prova ZKP associata
        delete tokensIssued[msg.sender];
        delete userProofs[msg.sender]; // Elimina la prova dell'utente

        emit SBTRevoked(msg.sender);
    }


    function getMedicalRecord(address owner) public view returns (
        uint256 tokenID,
        string memory id,
        string memory name,
        string memory dateOfBirth,
        string memory healthID,
        bool authenticated
    ) {
        MedicalRecord storage record = tokensIssued[owner];
        return (
            record.tokenID,
            record.id,
            record.name,
            record.dateOfBirth,
            record.healthID,
            record.authenticated
        );
    }

    function getUserProof(address user) public view returns (Verifier.Proof memory) {
        return userProofs[user]; // Restituisce la prova associata all'utente
    }

    function canUserReceiveTreatment(string memory did, string memory categoryHash) public view returns (bool) {
        address userAddress = didToAddress[did];
        require(userAddress != address(0), "Nessun utente associato a questo DID");

        // Recupera il record medico associato all'utente e verifica il permesso per la categoria specifica
        return tokensIssued[userAddress].authorizedCategory[categoryHash];
    }

    // Funzione per verificare se una prova è vuota
    function isProofEmpty(Verifier.Proof memory proof) internal pure returns (bool) {
        return (
            proof.a.X == 0 && proof.a.Y == 0 && 
            proof.b.X[0] == 0 && proof.b.X[1] == 0 && 
            proof.b.Y[0] == 0 && proof.b.Y[1] == 0 && 
            proof.c.X == 0 && proof.c.Y == 0
        );
    }
}
