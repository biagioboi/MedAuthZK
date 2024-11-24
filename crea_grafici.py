import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

def plot_benchmark_from_csv(file_path):
    # Caricare i dati dal file CSV
    df = pd.read_csv(file_path)

    # Raggruppa i dati per 'Iterazioni', 'Sottocategoria' e 'Categoria Principale'
    df_grouped = df.groupby(['Iterazioni', 'Sottocategoria', 'Categoria Principale']).agg({
        'Tempo Medio (ms)': 'mean',
        'Conteggio Idonei': 'sum'
    }).reset_index()

    # Trova la malattia o categoria principale da includere nel titolo
    malattie_max = df_grouped[df_grouped['Conteggio Idonei'] == df_grouped['Iterazioni']]  # Seleziona le righe con Conteggio Idonei == Iterazioni

    # Trova la malattia con il massimo conteggio idonei
    max_idonei = malattie_max['Conteggio Idonei'].max()
    malattie_max = malattie_max[malattie_max['Conteggio Idonei'] == max_idonei]
    print(malattie_max)
    if len(malattie_max) > 1:
        # Se ci sono più malattie con lo stesso conteggio idonei, usa la Categoria Principale
        malattia_nome = malattie_max['Categoria Principale'].values[0]  # Usa la prima categoria principale
    else:
        # Se c'è solo una malattia, usa la sottocategoria
        malattia_nome = malattie_max['Sottocategoria'].values[0]

    # Calcolare il tempo medio complessivo per tutte le iterazioni
    tempo_medio_complessivo = df_grouped['Tempo Medio (ms)'].mean()

    # Crea il grafico per il tempo medio per iterazione
    plt.figure(figsize=(10, 6))
    sns.lineplot(data=df_grouped, x='Iterazioni', y='Tempo Medio (ms)', hue='Sottocategoria', marker='o')

    # Aggiungere la linea tratteggiata per il tempo medio complessivo
    plt.axhline(y=tempo_medio_complessivo, color='red', linestyle='--', linewidth=2, label=f'Tempo medio complessivo: {tempo_medio_complessivo:.2f} ms')

    # Aggiungere il titolo e le etichette
    plt.title(f'Tempo medio per iterazione - Malattia: {malattia_nome}')
    plt.xlabel('Numero di iterazioni')
    plt.ylabel('Tempo medio (ms)')
    plt.grid(True)

    # Aggiungi la legenda
    plt.legend(title="Sottocategoria", bbox_to_anchor=(1.05, 1), loc='upper left')

    # Ottieni il nome del file senza estensione per il file di output
    file_name_without_extension = os.path.splitext(os.path.basename(file_path))[0]

    # Crea una directory per salvare i grafici, se non esiste
    output_dir = 'grafici_output'
    os.makedirs(output_dir, exist_ok=True)

    # Salva il grafico come file PNG
    output_file_path = os.path.join(output_dir, f'{file_name_without_extension}_grafico_complessivo.png')
    plt.tight_layout()
    plt.savefig(output_file_path)  # Salva il grafico come file PNG
    plt.close()  # Chiudi il grafico per liberare memoria

    print(f'Il grafico complessivo è stato salvato nella cartella: {output_dir}')

# Esempio di utilizzo per un file
csv_file_path = './veramo-project/outputs/benchmark_results.csv'  # Sostituire con il nome del file CSV
plot_benchmark_from_csv(csv_file_path)


# Esempio di utilizzo per un altro file
csv_file_path = './veramo-project/outputs/benchmark_results_multiple_categories.csv'  # Sostituire con il nome del file CSV
plot_benchmark_from_csv(csv_file_path)
