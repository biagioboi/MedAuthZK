import fs from "fs";
import { ethers, providers } from "ethers";
import { PRIVATE_KEY, RPC_URL, SBT_ADDRESS } from "./veramo/setup.js";
import path from 'path';
const provider = new providers.JsonRpcProvider(RPC_URL);
const verifierAddress = "0x8f1a69555d18587277937d06a6df3c07459d1da9";
// ABI del contratto SBT
const sbtAbi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "verifierAddress",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "ERC721IncorrectOwner",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "operator",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "ERC721InsufficientApproval",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "approver",
                type: "address",
            },
        ],
        name: "ERC721InvalidApprover",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "operator",
                type: "address",
            },
        ],
        name: "ERC721InvalidOperator",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "ERC721InvalidOwner",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "receiver",
                type: "address",
            },
        ],
        name: "ERC721InvalidReceiver",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "sender",
                type: "address",
            },
        ],
        name: "ERC721InvalidSender",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "ERC721NonexistentToken",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "approved",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "Approval",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "operator",
                type: "address",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "approved",
                type: "bool",
            },
        ],
        name: "ApprovalForAll",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "requester",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "tokenID",
                type: "uint256",
            },
        ],
        name: "SBTIssued",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "requester",
                type: "address",
            },
        ],
        name: "SBTRevoked",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "Transfer",
        type: "event",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "approve",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "balanceOf",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "canUserReceiveTreatment",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "getApproved",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "getMedicalRecord",
        outputs: [
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "tokenID",
                        type: "uint256",
                    },
                    {
                        internalType: "string",
                        name: "id",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "name",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "dateOfBirth",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "healthID",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "diagnosis",
                        type: "string",
                    },
                    {
                        internalType: "bool",
                        name: "authenticated",
                        type: "bool",
                    },
                    {
                        internalType: "bool",
                        name: "canReceiveTreatment",
                        type: "bool",
                    },
                ],
                internalType: "struct MedicalRecordSBT.MedicalRecord",
                name: "",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "getUserProof",
        outputs: [
            {
                components: [
                    {
                        components: [
                            {
                                internalType: "uint256",
                                name: "X",
                                type: "uint256",
                            },
                            {
                                internalType: "uint256",
                                name: "Y",
                                type: "uint256",
                            },
                        ],
                        internalType: "struct Pairing.G1Point",
                        name: "a",
                        type: "tuple",
                    },
                    {
                        components: [
                            {
                                internalType: "uint256[2]",
                                name: "X",
                                type: "uint256[2]",
                            },
                            {
                                internalType: "uint256[2]",
                                name: "Y",
                                type: "uint256[2]",
                            },
                        ],
                        internalType: "struct Pairing.G2Point",
                        name: "b",
                        type: "tuple",
                    },
                    {
                        components: [
                            {
                                internalType: "uint256",
                                name: "X",
                                type: "uint256",
                            },
                            {
                                internalType: "uint256",
                                name: "Y",
                                type: "uint256",
                            },
                        ],
                        internalType: "struct Pairing.G1Point",
                        name: "c",
                        type: "tuple",
                    },
                ],
                internalType: "struct Verifier.Proof",
                name: "",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                internalType: "address",
                name: "operator",
                type: "address",
            },
        ],
        name: "isApprovedForAll",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "name",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "ownerOf",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "id",
                type: "string",
            },
            {
                internalType: "string",
                name: "name",
                type: "string",
            },
            {
                internalType: "string",
                name: "dateOfBirth",
                type: "string",
            },
            {
                internalType: "string",
                name: "healthID",
                type: "string",
            },
            {
                internalType: "string",
                name: "diagnosis",
                type: "string",
            },
            {
                components: [
                    {
                        components: [
                            {
                                internalType: "uint256",
                                name: "X",
                                type: "uint256",
                            },
                            {
                                internalType: "uint256",
                                name: "Y",
                                type: "uint256",
                            },
                        ],
                        internalType: "struct Pairing.G1Point",
                        name: "a",
                        type: "tuple",
                    },
                    {
                        components: [
                            {
                                internalType: "uint256[2]",
                                name: "X",
                                type: "uint256[2]",
                            },
                            {
                                internalType: "uint256[2]",
                                name: "Y",
                                type: "uint256[2]",
                            },
                        ],
                        internalType: "struct Pairing.G2Point",
                        name: "b",
                        type: "tuple",
                    },
                    {
                        components: [
                            {
                                internalType: "uint256",
                                name: "X",
                                type: "uint256",
                            },
                            {
                                internalType: "uint256",
                                name: "Y",
                                type: "uint256",
                            },
                        ],
                        internalType: "struct Pairing.G1Point",
                        name: "c",
                        type: "tuple",
                    },
                ],
                internalType: "struct Verifier.Proof",
                name: "zkpProof",
                type: "tuple",
            },
            {
                internalType: "uint256[1]",
                name: "inputs",
                type: "uint256[1]",
            },
        ],
        name: "requestSBT",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "revokeSBT",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                internalType: "bytes",
                name: "data",
                type: "bytes",
            },
        ],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "operator",
                type: "address",
            },
            {
                internalType: "bool",
                name: "approved",
                type: "bool",
            },
        ],
        name: "setApprovalForAll",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes4",
                name: "interfaceId",
                type: "bytes4",
            },
        ],
        name: "supportsInterface",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "symbol",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "tokenURI",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "transferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
// Inizializza il contratto SBT con il wallet
const sbtContract = new ethers.Contract(SBT_ADDRESS, sbtAbi, wallet);
// Funzione principale per emettere l'SBT
async function issueSBT() {
    try {
        // Percorso per leggere il file presentation.json dalla cartella outputs
        const presentationPath = path.join("outputs", "presentation.json");
        // Leggi il file presentation.json
        const presentation = JSON.parse(fs.readFileSync(presentationPath, "utf-8"));
        // Validazione dei dati
        if (!presentation.credentialSubject ||
            !presentation.credentialSubject.zkpProof) {
            throw new Error("Dati di presentazione non validi.");
        }
        // Estrarre i campi
        const { id: holder, name, dateOfBirth, healthID, diagnosis, zkpProof, } = presentation.credentialSubject;
        console.log(`Richiesta di mint di SBT per il seguente paziente:\n`);
        console.log(`\t- ID Paziente: ${holder}\n`);
        console.log(`\t- Nome: ${name}\n`);
        console.log(`\t- Data di Nascita: ${dateOfBirth}\n`);
        console.log(`\t- Health ID: ${healthID}\n`);
        console.log(`\t- Diagnosi: ${diagnosis}\n`);
        // Estrarre i dati ZKP
        const { proof: zkpProofData, inputs } = zkpProof;
        console.log("Inputs:", inputs);
        if (!inputs || inputs.length === 0) {
            throw new Error("Gli inputs sono indefiniti o vuoti.");
        }
        const proof = [
            [zkpProofData.a[0], zkpProofData.a[1]],
            [
                [zkpProofData.b[0][0], zkpProofData.b[0][1]],
                [zkpProofData.b[1][0], zkpProofData.b[1][1]],
            ],
            [zkpProofData.c[0], zkpProofData.c[1]],
        ];
        // Chiamata alla funzione requestSBT con i nuovi dati
        const tx = await sbtContract.requestSBT(holder, name, dateOfBirth, healthID, diagnosis, proof, inputs);
        console.log("Transazione inviata:", tx.hash);
        // Aspetta la conferma della transazione
        const receipt = await tx.wait();
        console.log("Transazione confermata nel blocco:", receipt.blockNumber);
        // Calcola il gas utilizzato
        console.log(`Gas Usato: ${receipt.gasUsed.toString()}`);
        // Cattura l'evento SBTIssued
        const filter = sbtContract.filters.SBTIssued();
        const events = await sbtContract.queryFilter(filter, receipt.blockNumber);
        if (events.length > 0 && events[0].args?.tokenID) {
            const tokenID = events[0].args.tokenID;
            console.log(`SBT emesso con successo con Token ID: ${tokenID.toString()}`);
        }
        else {
            console.log("Evento SBTIssued non trovato nella ricevuta della transazione.");
        }
    }
    catch (error) {
        console.error("Errore nell'emissione dell'SBT:", error);
    }
}
// Esecuzione della funzione
issueSBT().catch(console.error);
