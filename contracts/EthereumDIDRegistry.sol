// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EthereumDIDRegistry {

    mapping(string => bytes) public didDocuments;

    event DIDDocumentUpdated(
        string did,
        bytes document
    );

    event Log(string message);

    function updateDIDDocument(string memory _did, bytes memory _document) public {
        emit Log("Attempting to update DID document");
        require(didDocuments[_did].length > 0, "DID document not found");
        // Logica di aggiornamento
        emit Log("DID document updated successfully");
    }


    function getDIDDocument(string memory _did) public view returns (bytes memory document) {
        return didDocuments[_did];
    }
}
