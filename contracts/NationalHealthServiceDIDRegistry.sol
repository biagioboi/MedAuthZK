// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NationalHealthServiceDIDRegistry {
    mapping(string => mapping(string => bool)) public didPermissions;
    mapping(address => bool) public owners;

    string[] public validPermissions = ["issueCredential", "revokeCredential", "updateCredential"];

    event DIDAuthorized(string did, string permission);
    event DIDRevoked(string did, string permission);
    event OwnerAdded(address newOwner);
    event OwnerRemoved(address owner);

    modifier onlyOwner() {
        require(owners[msg.sender], "Caller is not an owner");
        _;
    }

    constructor() {
        owners[msg.sender] = true; 
    }

    function addOwner(address _newOwner) public onlyOwner {
        require(!owners[_newOwner], "Address is already an owner");
        owners[_newOwner] = true;
        emit OwnerAdded(_newOwner);
    }

    function removeOwner(address _owner) public onlyOwner {
        require(owners[_owner], "Address is not an owner");
        owners[_owner] = false;
        emit OwnerRemoved(_owner);
    }

    function authorizeDID(string memory _did, string memory _permission) public onlyOwner {
        require(isValidPermission(_permission), "Invalid permission");
        require(!didPermissions[_did][_permission], "Permission is already authorized for this DID");

        didPermissions[_did][_permission] = true;

        emit DIDAuthorized(_did, _permission);
    }

    function revokeDID(string memory _did, string memory _permission) public onlyOwner {
        require(isValidPermission(_permission), "Invalid permission");
        require(didPermissions[_did][_permission], "Permission is not authorized for this DID");

        didPermissions[_did][_permission] = false;

        emit DIDRevoked(_did, _permission);
    }

    function isDIDAuthorized(string memory _did, string memory _permission) public view returns (bool) {
        return didPermissions[_did][_permission];
    }

    function isValidPermission(string memory _permission) internal view returns (bool) {
        for (uint256 i = 0; i < validPermissions.length; i++) {
            if (keccak256(abi.encodePacked(validPermissions[i])) == keccak256(abi.encodePacked(_permission))) {
                return true;
            }
        }
        return false;
    }

    receive() external payable {
        revert("This contract does not accept ether");
    }
}


