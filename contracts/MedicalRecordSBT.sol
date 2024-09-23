// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

interface NationalHealthServiceDIDRegistry {
    function isDIDAuthorized(string memory _did, string memory _permission) external view returns (bool);
}

interface EthereumDIDRegistry {
    function getDIDDocument(string memory _did) external view returns (bytes memory document);
}

contract MedicalRecordSBT is ERC721, ChainlinkClient {
    using Chainlink for Chainlink.Request;

    address private _owner;

    address private ORACLE_ADDRESS = 0x1e75AD9D57BC130CF742A450e5Dd3b4c2e88cB01;
    address private TOKEN_ADDRESS = 0x779877A7B0D9E8603169DdbD7836e478b4624789;
    string private JOB_ID; 

    address private NATIONAL_HEALTH_SERVICE_DID_REGISTRY_ADDRESS; 
    address private ETHEREUM_DID_REGISTRY_ADDRESS; 
    //address private SEPOLIA_DID_REGISTRY_ADDRESS = 0x03d5003bf0e79C5F5223588F347ebA39AfbC3818;

    uint256 private _tokenCounter;
    uint256 private _totalTokens;

    struct MedicalRecord {
        uint256 tokenID;
        string fiscalCode;
        string issuerDID;
    }

    mapping(bytes32 => address) private requests;
    mapping(address => MedicalRecord) private tokensIssued;

    event SBTIssued(address indexed requester, uint256 tokenID);
    event SBTRevoked(address indexed requester);

    modifier onlyOwner() {
        require(msg.sender == _owner, "Only owner can call this function");
        _;
    }

    constructor(string memory name, string memory symbol, address _ethereum_did_registry, address _nhs_did_registry, string memory _jobID) ERC721(name, symbol) {
        _setChainlinkToken(TOKEN_ADDRESS);
        _setChainlinkOracle(ORACLE_ADDRESS);
        JOB_ID = _jobID;

        ETHEREUM_DID_REGISTRY_ADDRESS = _ethereum_did_registry;
        NATIONAL_HEALTH_SERVICE_DID_REGISTRY_ADDRESS = _nhs_did_registry;

        _owner = msg.sender;

        _tokenCounter = 0;
        _totalTokens = 0;
    }

    function requestSBT(string memory _did) public {
        require(bytes(JOB_ID).length > 0, "Job ID has not been set");
        require(tokensIssued[msg.sender].tokenID == 0, "Token already issued for this address");
        Chainlink.Request memory request = _buildChainlinkRequest(stringToBytes32(JOB_ID), address(this), this.fulfill.selector);
        request._add("did", _did); 
        uint256 paymentAmount = 1 * LINK_DIVISIBILITY; // 1 LINK
        bytes32 requestID = _sendChainlinkRequest(request, paymentAmount);
        requests[requestID] = msg.sender;
    }

    function fulfill(bytes32 _requestID, string memory _vc) public recordChainlinkFulfillment(_requestID) {
        // Logica per gestire il risultato ottenuto dall'oracolo
        
        string memory _issuerDID = extractFieldValue(_vc, "iss");
    
        bool isAuthorized = NationalHealthServiceDIDRegistry(NATIONAL_HEALTH_SERVICE_DID_REGISTRY_ADDRESS).isDIDAuthorized(_issuerDID, "issueCredential");
        require(isAuthorized, "Permission denied");

        bytes memory issuerDIDDocument = EthereumDIDRegistry(ETHEREUM_DID_REGISTRY_ADDRESS).getDIDDocument(_issuerDID);
        string memory publicKeyHex = extractFieldValue(string(issuerDIDDocument), "publicKeyHex");

        string memory jwt = extractFieldValue(_vc, "jwt");
        require(verifySignature(jwt, publicKeyHex), "Signature verification failed");

        address requester = requests[_requestID];

        string memory fiscal_code = extractFieldValue(_vc, "healthID");
        _tokenCounter++;
        _totalTokens++;
        _safeMint(requester, _tokenCounter);
        tokensIssued[requester] = MedicalRecord({
            fiscalCode: fiscal_code,
            tokenID: _tokenCounter,
            issuerDID: _issuerDID
        });

        emit SBTIssued(requester, _tokenCounter);
    }

    function revokeSBT() public {
        require(tokensIssued[msg.sender].tokenID != 0, "No SBT to revoke");
        uint256 tokenID = tokensIssued[msg.sender].tokenID;
        _burn(tokenID);
        delete tokensIssued[msg.sender];
        _totalTokens--;
        emit SBTRevoked(msg.sender);
    }

    function revokeSBT(address tokenOwner) public onlyOwner {
        require(tokensIssued[tokenOwner].tokenID != 0, "Token not issued");
        uint256 tokenID = tokensIssued[tokenOwner].tokenID;
        _burn(tokenID);
        delete tokensIssued[tokenOwner];
        _totalTokens--;
        emit SBTRevoked(tokenOwner);
    }

    function revokeAllTokensByIssuer(string memory issuerDID) public onlyOwner {
        for (uint256 i = 1; i <= _totalTokens; i++) {
            address tokenOwner = ownerOf(i);
            if (keccak256(bytes(tokensIssued[tokenOwner].issuerDID)) == keccak256(bytes(issuerDID))) {
                _burn(i);
                delete tokensIssued[tokenOwner];
                _totalTokens--;
                emit SBTRevoked(tokenOwner);
            }
        }
    }

    function stringToBytes32(
        string memory source
    ) private pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            // solhint-disable-line no-inline-assembly
            result := mload(add(source, 32))
        }
    }

    function extractFieldValue(string memory json, string memory field) internal pure returns (string memory) {
        bytes memory jsonBytes = bytes(json);
        bytes memory fieldBytes = bytes(string(abi.encodePacked('"', field, '":"')));
        uint256 fieldLength = fieldBytes.length;

        for (uint256 i = 0; i < jsonBytes.length - fieldLength; i++) {
            bool isMatch = true;
            for (uint256 j = 0; j < fieldLength; j++) {
                if (jsonBytes[i + j] != fieldBytes[j]) {
                    isMatch = false;
                    break;
                }
            }

            if (isMatch) {
                uint256 start = i + fieldLength;
                uint256 end = start;
                while (end < jsonBytes.length && jsonBytes[end] != '"') {
                    end++;
                }

                bytes memory fieldValue = new bytes(end - start);
                for (uint256 k = start; k < end; k++) {
                    fieldValue[k - start] = jsonBytes[k];
                }

                return string(fieldValue);
            }
        }

        return "";
    }

    function verifySignature(string memory jwt, string memory publicKeyHex) internal pure returns (bool) {
        // ECDSA signature verification
        return true;
    }

    function setJobID(string memory _jobID) public onlyOwner {
        JOB_ID = _jobID;
    }

    function setOracleAddress(address _oracle_address) public onlyOwner {
        _setChainlinkOracle(_oracle_address);
        ORACLE_ADDRESS = _oracle_address;
    }

    function setTokenAddress(address _token_address) public onlyOwner {
        _setChainlinkToken(_token_address);
        TOKEN_ADDRESS = _token_address;
    }

    function setEthereumDIDRegistryAddress(address _ethereum_address) public onlyOwner {
        ETHEREUM_DID_REGISTRY_ADDRESS = _ethereum_address;
    }

    function setNationalHealthServiceDIDRegistryAddress(address _nhs_address) public onlyOwner {
        NATIONAL_HEALTH_SERVICE_DID_REGISTRY_ADDRESS = _nhs_address;
    }

    receive() external payable {
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function withdraw() public {
        require(msg.sender == _owner, "Only the owner can withdraw");
        uint balance = address(this).balance;
        require(balance > 0, "Contract balance is zero");
        payable(_owner).transfer(balance);
    }
}

