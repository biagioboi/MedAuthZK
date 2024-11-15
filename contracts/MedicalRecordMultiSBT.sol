// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./verifier.sol"; // Importa il contratto Verifier.sol generato da ZoKrates

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
        string[] diagnosisKeys; // Lista delle diagnosi per eliminazione
        bool authenticated; // Utente autenticato con la malattia
        Verifier.Proof zkpProof; // Prova ZKP associata al record medico
    }

    mapping(address => uint256[]) private userTokens; // Mappa indirizzo -> lista di tokenID
    mapping(uint256 => MedicalRecord) private tokenToRecord; // Mappa tokenID -> record medico
    mapping(string => address) private didToAddress; // Mappa il DID all'indirizzo dell'utente

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
        Verifier.Proof memory zkpProof, // Prova ZKP in formato struct
        uint256[1] memory inputs // Input per la verifica
    ) public {
        // Verifica se l'utente ha già un SBT per questa diagnosi
        uint256[] memory existingTokens = getSBTForDiagnosis(diagnosis);
        require(existingTokens.length == 0, "L'utente ha gia' un SBT per questa diagnosi.");

        // Verifica della prova ZKP
        bool proofValid = verifier.verifyTx(zkpProof, inputs);
        require(proofValid, "Prova ZKP non valida");

        // Emissione del nuovo token
        _tokenCounter++;
        _safeMint(msg.sender, _tokenCounter);

        // Crea un nuovo record medico
        MedicalRecord storage record = tokenToRecord[_tokenCounter];
        record.tokenID = _tokenCounter;
        record.id = id;
        record.name = name;
        record.dateOfBirth = dateOfBirth;
        record.healthID = healthID;
        record.authenticated = true;

        // Salva la prova ZKP nel record medico
        record.zkpProof = zkpProof;

        // Salva la diagnosi e autorizza il trattamento per essa
        record.authorizedTreatment[diagnosis] = true;
        record.diagnosisKeys.push(diagnosis); // Salva la diagnosi per eliminazione futura

        // Mappa il DID all'indirizzo dell'utente
        didToAddress[id] = msg.sender;

        // Aggiungi il tokenID alla lista di token emessi per l'indirizzo
        userTokens[msg.sender].push(_tokenCounter);

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

        // Cancella tutte le diagnosi autorizzate
        for (uint256 i = 0; i < record.diagnosisKeys.length; i++) {
            string memory diagnosis = record.diagnosisKeys[i];
            delete record.authorizedTreatment[diagnosis];
        }

        // Cancella l'array di diagnosi
        delete record.diagnosisKeys;

        // Cancella il record medico completo
        delete tokenToRecord[tokenID];

        // Rimuovi il token dalla lista di tokens dell'utente
        _removeTokenFromList(owner, tokenID);

        emit SBTRevoked(owner);
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

    function getMedicalRecord(uint256 tokenID) public view returns (
        uint256 tokenID_,
        string memory id,
        string memory name,
        string memory dateOfBirth,
        string memory healthID,
        bool authenticated,
        Verifier.Proof memory zkpProof
    ) {
        MedicalRecord storage record = tokenToRecord[tokenID];
        return (
            record.tokenID,
            record.id,
            record.name,
            record.dateOfBirth,
            record.healthID,
            record.authenticated,
            record.zkpProof // Restituisci anche la prova ZKP
        );
    }

    // Funzione che restituisce il tokenID per una determinata diagnosi (hash della malattia)
    function getSBTForDiagnosis(string memory hashedDiagnosis) public view returns (uint256[] memory) {
        uint256[] memory tokens = new uint256[](userTokens[msg.sender].length);
        uint256 count = 0;

        // Itera su tutti i token dell'indirizzo
        for (uint256 i = 0; i < userTokens[msg.sender].length; i++) {
            uint256 tokenID = userTokens[msg.sender][i];
            MedicalRecord storage record = tokenToRecord[tokenID];

            // Se la diagnosi è autorizzata, aggiungi il tokenID alla lista
            if (record.authorizedTreatment[hashedDiagnosis]) {
                tokens[count] = tokenID;
                count++;
            }
        }

        // Ridimensiona l'array per restituire solo i token validi
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = tokens[i];
        }

        return result;
    }

    // Nuova funzione per ottenere tutti gli SBT di un dato address
    function getAllSBTsForAddress(address user) public view returns (uint256[] memory) {
        return userTokens[user]; // Restituisce la lista di tokenIDs associati all'indirizzo
    }

    function canUserReceiveTreatment(string memory did, string memory hashedDiagnosis) public view returns (bool) {
        address userAddress = didToAddress[did];
        require(userAddress != address(0), "Nessun utente associato a questo DID");

        // Itera su tutti i token dell'utente e verifica se uno ha il permesso per la diagnosi
        uint256[] memory tokens = userTokens[userAddress];
        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 tokenID = tokens[i];
            MedicalRecord storage record = tokenToRecord[tokenID];

            // Se il trattamento per la diagnosi è autorizzato, restituisci true
            if (record.authorizedTreatment[hashedDiagnosis]) {
                return true;
            }
        }

        // Se nessun token ha il permesso per la diagnosi, restituisci false
        return false;
    }
}
