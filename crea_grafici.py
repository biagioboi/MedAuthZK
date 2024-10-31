import pandas as pd
import matplotlib.pyplot as plt
import os

# Carica il file CSV
file_name = 'benchmark_results.csv'
df = pd.read_csv(file_name)

# Raggruppa i dati per 'Iterazioni', 'Sottocategoria' e 'Categoria Principale', calcola la media dei 'Tempo Medio (ms)' e il totale dei 'Conteggio Idonei'
df_grouped = df.groupby(['Iterazioni', 'Sottocategoria', 'Categoria Principale']).agg({'Tempo Medio (ms)': 'mean', 'Conteggio Idonei': 'sum'}).reset_index()

# Ottieni le iterazioni uniche
iterazioni = df_grouped['Iterazioni'].unique()

# Crea una directory per salvare i grafici, se non esiste
output_dir = 'grafici_output'
os.makedirs(output_dir, exist_ok=True)

# Crea un grafico per ogni iterazione
for iterazione in iterazioni:
    df_iterazione = df_grouped[df_grouped['Iterazioni'] == iterazione]
    
    # Ordina i dati in base al 'Tempo Medio (ms)' in ordine decrescente
    df_sorted = df_iterazione.sort_values(by='Tempo Medio (ms)', ascending=False)

    # Trova la malattia con il massimo conteggio idonei
    max_idonei = df_sorted['Conteggio Idonei'].max()
    malattie_max = df_sorted[df_sorted['Conteggio Idonei'] == max_idonei]

    # Determina il nome da includere nel titolo
    if len(malattie_max) > 1:
        # Se ci sono più malattie, usa solo la Categoria Principale
        malattia_nome = malattie_max['Categoria Principale'].values[0]  # Usa la prima categoria principale
    else:
        # Se c'è solo una malattia, usa il suo nome
        malattia_nome = malattie_max['Sottocategoria'].values[0]

    # Crea il grafico
    plt.figure(figsize=(10, 6))
    plt.bar(df_sorted['Sottocategoria'], df_sorted['Tempo Medio (ms)'], color='skyblue')
    plt.ylabel('Tempo Medio (ms)')
    plt.xlabel('Sottocategoria')
    plt.title(f'Tempo Medio per Sottocategoria - Iterazione {iterazione} (Malattia: {malattia_nome})')
    plt.xticks(rotation=45, ha='right')  # Ruota le etichette sull'asse X per una migliore leggibilità
    plt.grid(axis='y')

    # Salva il grafico con un nome file basato sul nome del file originale e sull'iterazione
    output_file_path = os.path.join(output_dir, f'{os.path.splitext(file_name)[0]}_iterazione_{iterazione}.png')
    plt.tight_layout()
    plt.savefig(output_file_path)  # Salva il grafico come file PNG
    plt.close()  # Chiudi il grafico per liberare memoria

print(f'I grafici sono stati salvati nella cartella: {output_dir}')

