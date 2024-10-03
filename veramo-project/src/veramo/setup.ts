import { createAgent, IDIDManager, IKeyManager, IDataStore, IDataStoreORM, IResolver, ICredentialPlugin } from '@veramo/core';
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
export const SBT_ADDRESS = process.env.SBT_ADDRESS || '';

// Inizializza una connessione a un database SQLite per Veramo,
// utilizzato per archiviare identità e credenziali. Gestisce
// le migrazioni, attiva il logging e specifica le entità 
// per interagire con il database.
const dbConnection = new DataSource({
  type: 'sqlite',
  database: DATABASE_FILE,
  synchronize: false,
  migrations,
  migrationsRun: true,
  logging: ['error', 'info', 'warn'],
  entities: Entities,
}).initialize();

// Crea un agente Veramo combinando più funzionalità per la gestione delle identità decentralizzate.
const agent = createAgent<IDIDManager & IKeyManager & IDataStore & IDataStoreORM & IResolver & ICredentialPlugin>({
  plugins: [
    // Gestore delle chiavi, responsabile della creazione e gestione delle chiavi private.
    new KeyManager({
      // Utilizza un KeyStore per archiviare le chiavi nel database.
      store: new KeyStore(dbConnection),
      kms: {
        // Sistema di gestione delle chiavi, utilizzando un PrivateKeyStore.
        local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(KMS_SECRET_KEY))),
      },
    }),
    // Gestore dei DID (Decentralized Identifiers), necessario per creare e gestire DIDs.
    new DIDManager({
      // Archivia DIDs nel database.
      store: new DIDStore(dbConnection),
      // Provider di DID predefinito.
      defaultProvider: 'did:ethr:private',
      providers: {
        // Configurazione per il provider di DIDs su Ethereum.
        'did:ethr:private': new EthrDIDProvider({
          defaultKms: 'local', // Imposta il sistema di gestione delle chiavi predefinito.
          network: 'private',   // Nome della rete, deve corrispondere a quello fornito nella configurazione del provider.
          rpcUrl: RPC_URL,     // URL RPC locale per la rete Besu.
          registry: '0xd54b47f8e6a1b97f3a84f63c867286272b273b7c', // Indirizzo del contratto di registro sulla rete Besu.
        }),
      },
    }),
    // Plugin per la risoluzione dei DIDs, necessario per ottenere informazioni associate ai DIDs.
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({
          networks: [
            {
              name: 'private', // Nome della rete, deve corrispondere a quello fornito nella configurazione del provider.
              rpcUrl: RPC_URL, // URL RPC per la rete.
              registry: '0xd54b47f8e6a1b97f3a84f63c867286272b273b7c', // Indirizzo del contratto di registro.
            },
          ],
        }),
      }),
    }),
    // Plugin per la gestione delle credenziali, consente di emettere e verificare credenziali decentralizzate.
    new CredentialPlugin(),
  ],
});

// Esporta l'agente configurato per l'utilizzo in altre parti dell'applicazione.
export { agent };
