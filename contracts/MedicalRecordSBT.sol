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
        string diagnosis; // Diagnosi
        bool authenticated; // Utente autenticato con la malattia
        bool canReceiveTreatment; // Utente autorizzato a ricevere cure
    }

    mapping(address => MedicalRecord) private tokensIssued;
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
        string memory diagnosis, // Diagnosi
        Verifier.Proof memory zkpProof, // Prova ZKP in formato struct
        uint256[1] memory inputs // Input per la verifica
    ) public {

        // Controlla che l'utente non abbia già utilizzato questa prova
        require(isProofEmpty(userProofs[msg.sender]), "Prova gia' utilizzata per questo utente");

        // Verifica della prova ZKP
        bool proofValid = verifier.verifyTx(zkpProof, inputs);
        require(proofValid, "Prova ZKP non valida");

        // Verifica che l'utente non abbia già un token emesso
        require(tokensIssued[msg.sender].tokenID == 0, "Token gia emesso per questo indirizzo");

  
        // Se la verifica è riuscita, emetti l'SBT e memorizza la prova
        _tokenCounter++;
        _safeMint(msg.sender, _tokenCounter);

        // Salva la prova nella mappatura
        userProofs[msg.sender] = zkpProof;

        tokensIssued[msg.sender] = MedicalRecord({
            id: id,
            tokenID: _tokenCounter,
            name: name,
            dateOfBirth: dateOfBirth,
            healthID: healthID,
            diagnosis: diagnosis,
            authenticated: true, // Imposta autenticato a true
            canReceiveTreatment: true // Imposta autorizzato a ricevere cure a true
        });

        emit SBTIssued(msg.sender, _tokenCounter);
    }

    function revokeSBT() public {
        require(tokensIssued[msg.sender].tokenID != 0, "Nessun SBT da revocare");
        uint256 tokenID = tokensIssued[msg.sender].tokenID;
        _burn(tokenID);
        delete tokensIssued[msg.sender];
        delete userProofs[msg.sender]; // Elimina la prova dell'utente

        emit SBTRevoked(msg.sender);
    }

    function getMedicalRecord(address owner) public view returns (MedicalRecord memory) {
        return tokensIssued[owner];
    }

    function getUserProof(address user) public view returns (Verifier.Proof memory) {
        return userProofs[user]; // Restituisce la prova associata all'utente
    }

    function canUserReceiveTreatment(address user) public view returns (bool) {
        return tokensIssued[user].canReceiveTreatment; // Restituisce se l'utente può ricevere cure
    }

    // Funzione per verificare se una prova è vuota
    function isProofEmpty(Verifier.Proof memory proof) internal pure returns (bool) {
        return (proof.a.X == 0 && proof.a.Y == 0 && proof.b.X[0] == 0 && proof.b.X[1] == 0 && proof.b.Y[0] == 0 && proof.b.Y[1] == 0 && proof.c.X == 0 && proof.c.Y == 0);
    }
}
