# MedAuthZKP - Protocollo di autenticazione SSI e autorizzazione sanitaria basato su approcci ZKP in ambito medico

## Obiettivo

Il protocollo è progettato per garantire la privacy dei pazienti in contesti sanitari, consentendo loro di dimostrare la presenza di specifiche condizioni mediche senza rivelare la natura esatta della condizione. Utilizzando tecnologie avanzate come **identità auto-sovrane (SSI)**, **credenziali verificabili (VC)**, **presentazioni verificabili (VP)** e **prove a conoscenza zero (ZKP)** tramite **Zokrates**, il paziente può ottenere l'autorizzazione ai trattamenti in modo sicuro e rispettoso della privacy.

## Flusso di Lavoro e Componenti

### 1. Emissione delle Credenziali Verificabili (VC)
- Un ente superiore, come il **Sistema Nazionale Sanitario (SNS)**, emette le **Credenziali Verificabili (VC)** relative a specifiche malattie o condizioni di salute del paziente.
- Queste credenziali vengono salvate nel **wallet digitale del paziente**, sono firmate digitalmente dal SNS e possono essere verificate da terze parti tramite tecnologie blockchain.

### 2. Autorizzazione ai trattamenti (Selective Disclosure)
- Il paziente, volendo autorizzare un trattamento, seleziona esclusivamente le informazioni necessarie dalla propria VC, omettendo i dettagli sensibili grazie alla **Selective Disclosure**.
- Il paziente genera una **Presentazione Verificabile (VP)**, contenente solo i dati essenziali e sintetici necessari all'autenticazione, ottenendo un controllo selettivo e sicuro delle informazioni condivise.

### 3. Creazione di una prova a conoscenza zero con Zokrates
- Per garantire una privacy totale, il paziente utilizza **Zokrates** per generare una **prova a conoscenza zero (ZKP)**, che dimostra matematicamente il possesso di una condizione sanitaria senza rivelarne dettagli specifici.
- La ZKP viene allegata alla VP, consentendo al paziente di dimostrare l'idoneità al trattamento senza esporre la natura della propria condizione medica.

### 4. Emissione e utilizzo del Soulbound Token (SBT)
- Dopo aver verificato la ZKP e la VP, l’ente sanitario emette un **Soulbound Token (SBT)**, che rappresenta l’autorizzazione ai trattamenti:
  - **SBT a Singola Categoria**: Autorizza l’accesso al trattamento per la malattia specifica dimostrata tramite la ZKP.
  - **SBT Multi-Categoria**: Estende l'accesso al trattamento per la malattia dimostrata e per altre condizioni correlate appartenenti alla stessa categoria diagnostica (es. “Malattie Metaboliche”).

### 5. Autenticazione presso le strutture sanitarie
- Il paziente utilizza il proprio **SBT** presso la struttura sanitaria, che autentica il token e autorizza il trattamento. 

--- 

## Panoramica delle Tipologie di Soulbound Token (SBT)

### 1. Soulbound Token a Singola Categoria

- **Descrizione**: L’SBT a Singola Categoria offre un’autorizzazione limitata al paziente per accedere ai trattamenti relativi a una specifica malattia dimostrata. Questa tipologia di token è utile per garantire che l'accesso ai trattamenti sia strettamente controllato.
- **Esempio**: Se un paziente dimostra di avere asma, l'SBT a Singola Categoria autorizza esclusivamente i trattamenti per l’asma, senza estendere l'accesso ad altre condizioni respiratorie, come la bronchite cronica o la BPCO.
- **Vantaggi**:
  - **Maggiore controllo**: L'accesso limitato ai dati sanitari riduce il rischio di esposizione a informazioni sensibili.
  - **Privacy aumentata**: Poiché si condivide solo l'autorizzazione per una singola malattia, si minimizzano le informazioni rivelate a terzi.

### 2. Soulbound Token Multi-Categoria

- **Descrizione**: L’SBT Multi-Categoria offre un’autorizzazione estesa che consente al paziente di accedere ai trattamenti per tutte le malattie correlate appartenenti a una stessa categoria diagnostica, oltre alla condizione specifica dimostrata.
- **Esempio**: Se un paziente dimostra di avere una condizione nella categoria delle malattie metaboliche, come il diabete, l'SBT Multi-Categoria consente l'accesso ai trattamenti non solo per il diabete, ma anche per altre condizioni correlate come dislipidemia e obesità.
- **Vantaggi**:
  - **Ampia accessibilità**: Permette l'accesso a una gamma di trattamenti necessari, senza richiedere verifiche ripetute per condizioni correlate.
  - **Privacy superiore**: Autorizzando l'accesso a una categoria piuttosto che a una singola condizione, si riduce il rischio di divulgazione di informazioni specifiche, mantenendo così un alto livello di riservatezza.
  - **Gestione efficiente**: Facilita un approccio integrato alla cura, permettendo al paziente di ricevere trattamenti per diverse condizioni correlate senza la necessità di ulteriori autorizzazioni.

--- 
## Gestione delle credenziali con Veramo e Blockchain
- **Veramo** viene utilizzato per la gestione delle credenziali e l’interazione tra wallet digitale, SNS e strutture sanitarie, facilitando l’integrazione delle VC e la generazione delle VP.
- L’infrastruttura di **blockchain** supporta la verifica dell’integrità e autenticità delle VC e degli SBT, garantendo un registro sicuro e immutabile per il controllo delle autorizzazioni in modo decentralizzato.


Questo protocollo innovativo promuove un sistema di autenticazione e autorizzazione sicuro e rispettoso della privacy del paziente, offrendo alle strutture sanitarie uno strumento efficiente per gestire i trattamenti autorizzati e riducendo l'esposizione dei dati sensibili. 


# MedAuthZKP - Installazione 

---

## 1. Installazione delle Dipendenze

```bash
# Entrare nella directory del progetto Veramo
cd veramo-project

# Installare le dipendenze richieste
npm install

# Installare TypeScript (se non già installato)
npm install -g tsc

# Compilare i file TypeScript dopo eventuali modifiche
npm run build

# I file compilati saranno salvati nella cartella dist come file .js

---

## 2. Configurazione della Rete Blockchain e Deploy dei Contratti

### 2.1 Avvio della rete locale con Docker

```bash
# Nella directory principale del progetto, individuare il file quorum-test-network.zip ed estrarlo

# Accedere alla directory estratta e avviare lo script
cd quorum-test-network
./start.sh

# Assicurarsi che Docker sia in esecuzione e che le risorse siano adeguatamente allocate (CPU e RAM)

### 2.2 Deploy dei Contratti

```bash
# Aprire Remix IDE e configurare la compilazione con i seguenti parametri:
# - EVM Version: Istanbul
# - Environment: Rete locale configurata tramite Besu

# Effettuare il deploy dei contratti nell'ordine seguente:
# 1. Deploy dei Verifier Contracts generati con ZoKrates
# 2. Deploy dei SBT Contracts, configurando il costruttore con l'indirizzo dei contratti Verifier precedentemente deployati

# Modificare il file .env per configurare l'ambiente, includendo:
# - Indirizzi dei contratti deployati
# - Parametri specifici della rete blockchain locale

# Nota: Il file .env non dovrebbe mai essere pubblicato in ambienti di produzione per motivi di sicurezza.

---

## 3. Configurazione dell'Interfaccia Web

```bash
# Accedere alla directory dedicata all'interfaccia web
cd medical-record-sbt

# Installare e avviare un server web locale
npx live-server

# Se live-server non è installato, eseguire il comando:
npm install -g live-server

# Il server avvierà automaticamente il browser
# Navigare verso la cartella src, che contiene il file index.html

# Configurare l'interazione con il contratto SBT
# Modificare i file JavaScript responsabili dell'interazione con il contratto
# Inserire l'indirizzo corretto del contratto SBT nei file di configurazione
