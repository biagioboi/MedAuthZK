import fs from "fs";
import { ethers, providers } from "ethers";
import { PRIVATE_KEY, RPC_URL, SBT_ADDRESS } from "../veramo/setup.js";
import path from 'path';
const provider = new providers.JsonRpcProvider(RPC_URL);
// ABI del contratto SBT
//Attenzione: le abi sono prese da Remix online
const artifactsPath = path.join('..', 'contracts', 'artifacts', `MedicalRecordSBT_metadata.json`);
// Leggi l'ABI dal file JSON
const contractArtifact = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
const sbtAbi = contractArtifact.output.abi;
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
        console.log(`Gas stimato: ${receipt.gasUsed.toString()}`);
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
