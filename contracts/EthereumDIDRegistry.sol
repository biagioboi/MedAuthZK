// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EthereumDIDRegistry {

    mapping(string => bytes) public didDocuments;

    event DIDDocumentUpdated(
        string did,
        bytes document
    );

    function updateDIDDocument(string memory _did, bytes memory _document) public {
        require(bytes(_did).length > 0, "Invalid DID");
        require(_document.length > 0, "Empty document");

        didDocuments[_did] = _document;

        emit DIDDocumentUpdated(_did, _document);
    }

    function getDIDDocument(string memory _did) public view returns (bytes memory document) {
        return didDocuments[_did];
    }
}