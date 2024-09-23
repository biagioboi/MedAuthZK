import express, { Request, Response } from 'express';
import * as fs from 'fs';

const app = express();
const port = 3000;

app.get('/veramo', async (req: Request, res: Response) => {
    
    try {

        const did = req.query.did as string;

        if (!did) {
            res.status(400).send({ error: 'Missing DID' });
            return;
        }

        const vcData = JSON.parse(fs.readFileSync('verifiedCredential.json', 'utf8'));
        
        const payload = vcData.payload;
        const proof = vcData.verifiableCredential.proof;

        if (!payload || !proof) {
            res.status(404).send({ error: 'Payload or proof not found in the VC' });
            return;
        }

        const response = {
            payload: payload,
            proof: proof
        };

        res.status(200).json(response);

    } catch (error) {

        console.error('Error fetching VC:', error);
        res.status(500).send({ error: 'Internal Server Error' });

    }
});

app.listen(port, () => {

    console.log(`Veramo adapter listening at http://localhost:${port}`);

});

