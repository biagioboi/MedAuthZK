import fs from "fs";
import { ethers, providers } from "ethers";
import { PRIVATE_KEY, RPC_URL, SBT_ADDRESS_MULTI_CTG } from "../veramo/setup.js";
import path from "path";
const provider = new providers.JsonRpcProvider(RPC_URL);
// ABI del contratto SBT
const artifactsPath = path.join("..", "contracts", "artifacts", `MedicalRecordSBT_MultiCTGmetadata.json`);
const contractArtifact = JSON.parse(fs.readFileSync(artifactsPath, "utf8"));
const sbtAbi = contractArtifact.output.abi;
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const sbtContract = new ethers.Contract(SBT_ADDRESS_MULTI_CTG, sbtAbi, wallet);
// Funzione principale per emettere l'SBT con il nuovo schema
async function issueSBT() {
    try {
        // Percorso per leggere il file presentation-sottocategoria.json
        const presentationPath = path.join("outputs", "presentation-sottocategoria.json");
        // Leggi il file presentation-sottocategoria.json
        const presentation = JSON.parse(fs.readFileSync(presentationPath, "utf-8"));
        // Validazione dei dati
        if (!presentation.credentialSubject || !presentation.credentialSubject.zkpProof) {
            throw new Error("Dati di presentazione non validi.");
        }
        // Estrarre i campi
        const { id: holder, name, dateOfBirth, healthID, diagnosi, categoria, zkpProof } = presentation.credentialSubject;
        console.log(`Richiesta di mint di SBT per il seguente paziente:\n`);
        console.log(`\t- ID Paziente: ${holder}\n`);
        console.log(`\t- Nome: ${name}\n`);
        console.log(`\t- Data di Nascita: ${dateOfBirth}\n`);
        console.log(`\t- Health ID: ${healthID}\n`);
        console.log(`\t- Diagnosi: ${diagnosi}\n`);
        console.log(`\t- Categoria: ${categoria}\n`);
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
        const tx = await sbtContract.requestSBT(holder, name, dateOfBirth, healthID, diagnosi, categoria, // Nuovo campo "categoria" incluso nella chiamata
        proof, inputs);
        console.log("Transazione inviata:", tx.hash);
        // Aspetta la conferma della transazione
        const receipt = await tx.wait();
        console.log("Transazione confermata nel blocco:", receipt.blockNumber);
        // Calcola il gas utilizzato
        console.log(`Gas usato: ${receipt.gasUsed.toString()}`);
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
        // Stampa il messaggio di errore dalla require
        if (error.reason) {
            console.error("Errore nell'emissione dell'SBT:", error.reason); // Messaggio della require
        }
        else if (error.data && error.data.message) {
            console.error("Errore nell'emissione dell'SBT:", error.data.message); // Messaggio alternativo
        }
        else {
            console.error("Errore generico:", error); // Errore non specificato
        }
    }
}
// Esecuzione della funzione
issueSBT().catch(console.error);
