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
        string diagnosisHash; // Hash della diagnosi
        string categoryHash; // Hash della categoria
        bool authenticated; // Utente autenticato
    }

    mapping(uint256 => MedicalRecord) private tokenToRecord; // Token ID -> MedicalRecord
    mapping(address => uint256[]) private userTokens; // Un utente può avere più token
    mapping(string => address) private didToAddress; // Mappa il DID all'indirizzo dell'utente
    mapping(address => Verifier.Proof) private userProofs; // Mappa che associa un indirizzo alla sua prova ZKP

    event SBTIssued(address indexed requester, uint256 tokenID);
    event SBTRevoked(address indexed requester, uint256 tokenID);

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

        // Controlla se l'utente ha già un SBT per questa diagnosi e categoria
        require(
            !hasSBTForCategory(msg.sender, category),
            "SBT gia emesso per questa diagnosi e categoria"
        );

        // Verifica della prova ZKP
        bool proofValid = verifier.verifyTx(zkpProof, inputs);
        require(proofValid, "Prova ZKP non valida");

      
        // Crea un nuovo SBT
        _tokenCounter++;
        _safeMint(msg.sender, _tokenCounter);

        // Salva la prova nella mappatura
        userProofs[msg.sender] = zkpProof;

        // Inizializza la struttura MedicalRecord
        MedicalRecord storage newRecord = tokenToRecord[_tokenCounter];
        newRecord.tokenID = _tokenCounter;
        newRecord.id = id;
        newRecord.name = name;
        newRecord.dateOfBirth = dateOfBirth;
        newRecord.healthID = healthID;
        newRecord.authenticated = true;

        // Salva gli hash della diagnosi e della categoria
        newRecord.diagnosisHash = diagnosis;
        newRecord.categoryHash = category;

        // Aggiungi il token all'utente
        userTokens[msg.sender].push(_tokenCounter);

        // Mappa il DID all'indirizzo dell'utente (opzionale, utile per ricerche)
        didToAddress[id] = msg.sender;

        emit SBTIssued(msg.sender, _tokenCounter);
    }

    function revokeSBT(uint256 tokenID) public {
        MedicalRecord storage record = tokenToRecord[tokenID];
        address owner = ownerOf(tokenID);

        // Brucia il token
        _burn(tokenID);

        // Rimuove l'associazione DID
        string memory userDID = record.id;
        delete didToAddress[userDID];

        // Rimuovi la diagnosi dal record medico
        delete record.diagnosisHash; 
        delete record.categoryHash; 

        // Cancella il record medico completo
        delete tokenToRecord[tokenID];

        // Rimuovi il token dalla lista di tokens dell'utente
        _removeTokenFromList(owner, tokenID);

        emit SBTRevoked(owner, tokenID);
    }


    function canUserReceiveTreatment(address userAddress, string memory category) public view returns (bool) {
        // Verifica che l'indirizzo non sia zero
        require(userAddress != address(0), "Indirizzo non valido");

        // Scansiona i token dell'utente
        for (uint256 i = 0; i < userTokens[userAddress].length; i++) {
            uint256 tokenID = userTokens[userAddress][i];
            MedicalRecord storage record = tokenToRecord[tokenID];

            // Verifica se la categoria corrisponde (solo la categoria)
            if (keccak256(abi.encodePacked(record.categoryHash)) == keccak256(abi.encodePacked(category))) {
                return true;  // Se trova un match nella categoria, l'utente può ricevere il trattamento
            }
        }

        return false;  // Nessun match trovato, l'utente non può ricevere il trattamento
    }



    function _removeTokenFromList(address user, uint256 tokenID) internal {
        uint256[] storage tokens = userTokens[user];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenID) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }
    }

    // Nuova funzione per ottenere tutti gli SBT di un dato address
    function getAllSBTsForAddress(address user) public view returns (uint256[] memory) {
        return userTokens[user]; // Restituisce la lista di tokenIDs associati all'indirizzo
    }

    function getMedicalRecord(uint256 tokenID) public view returns (
        uint256 tokenID_,
        string memory id,
        string memory name,
        string memory dateOfBirth,
        string memory healthID,
        bool authenticated,
        string memory diagnosisHash, // L'hash della diagnosi
        string memory categoryHash // L'hash della categoria
    ) {
        MedicalRecord storage record = tokenToRecord[tokenID];
        return (
            record.tokenID,
            record.id,
            record.name,
            record.dateOfBirth,
            record.healthID,
            record.authenticated,
            record.diagnosisHash,
            record.categoryHash
        );
    }

    // Verifica se l'utente ha già un SBT per una specifica diagnosi e categoria
    function hasSBTForCategory(
        address user,
        string memory category
    ) public view returns (bool) {
        uint256[] storage tokens = userTokens[user];
        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 tokenID = tokens[i];
            MedicalRecord storage record = tokenToRecord[tokenID];

            // Verifica solo la categoria
            if (keccak256(abi.encodePacked(record.categoryHash)) == keccak256(abi.encodePacked(category))) {
                return true;  // Se trova un match nella categoria, restituisce true
            }
        }
        return false;  // Se non trova un match, restituisce false
    }


}
