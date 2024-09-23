import { createAgent } from '@veramo/core';
import { DIDManager } from '@veramo/did-manager';
import { KeyManager } from '@veramo/key-manager';
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { Resolver } from 'did-resolver';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { getResolver as ethrDidResolver } from 'ethr-did-resolver';
import { KeyStore, DIDStore, PrivateKeyStore } from '@veramo/data-store';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { DataSource } from 'typeorm';
import { Entities, migrations } from '@veramo/data-store';
// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();
export const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
export const DID_REGISTRY_ADDRESS = process.env.DID_REGISTRY_ADDRESS || '';
export const KMS_SECRET_KEY = process.env.KMS_SECRET_KEY || '';
export const RPC_URL = process.env.RPC_URL || '';
export const DATABASE_FILE = process.env.DATABASE_FILE || '';
const dbConnection = new DataSource({
    type: 'sqlite',
    database: DATABASE_FILE,
    synchronize: false,
    migrations,
    migrationsRun: true,
    logging: ['error', 'info', 'warn'],
    entities: Entities,
}).initialize();
const agent = createAgent({
    plugins: [
        new KeyManager({
            store: new KeyStore(dbConnection),
            kms: {
                local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(KMS_SECRET_KEY))),
            },
        }),
        new DIDManager({
            store: new DIDStore(dbConnection),
            defaultProvider: 'did:ethr:private',
            providers: {
                'did:ethr:private': new EthrDIDProvider({
                    defaultKms: 'local',
                    network: 'private', // This network must match your DID network name
                    rpcUrl: RPC_URL, // Local Besu RPC URL
                    registry: DID_REGISTRY_ADDRESS, // Your registry contract address on the Besu network
                }),
            },
        }),
        new DIDResolverPlugin({
            resolver: new Resolver({
                ...ethrDidResolver({
                    networks: [
                        {
                            name: 'private', // Network name should match what you provided in the provider config
                            rpcUrl: RPC_URL, // Your Besu RPC URL
                            registry: DID_REGISTRY_ADDRESS, // The registry contract address on the Besu network
                        },
                    ],
                }),
            }),
        }),
        new CredentialPlugin(),
    ],
});
export { agent };
