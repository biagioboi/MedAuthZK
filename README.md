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
- Grazie alla privacy garantita dalla ZKP, la struttura conosce solo l’autorizzazione al trattamento e non la specifica condizione sanitaria. 

--- 

## Gestione delle credenziali con Veramo e Blockchain
- **Veramo** viene utilizzato per la gestione delle credenziali e l’interazione tra wallet digitale, SNS e strutture sanitarie, facilitando l’integrazione delle VC e la generazione delle VP.
- L’infrastruttura di **blockchain** supporta la verifica dell’integrità e autenticità delle VC e degli SBT, garantendo un registro sicuro e immutabile per il controllo delle autorizzazioni in modo decentralizzato.


## Vantaggi del protocollo
- **Massima privacy**: Utilizzando ZKP e Selective Disclosure, le informazioni sensibili sono condivise in modo sicuro e limitato.
- **Controllo autonomo**: Il paziente può gestire le proprie autorizzazioni e informazioni sanitarie in modo autonomo e sicuro.
- **Interoperabilità e sicurezza**: Veramo e la blockchain assicurano che le credenziali siano facilmente verificabili e autentiche senza compromessi sulla riservatezza.

---

Questo protocollo innovativo promuove un sistema di autenticazione e autorizzazione sicuro e rispettoso della privacy del paziente, offrendo alle strutture sanitarie uno strumento efficiente per gestire i trattamenti autorizzati e riducendo l'esposizione dei dati sensibili. 
