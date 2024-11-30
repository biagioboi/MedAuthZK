import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os  # Importa il modulo os per gestire file e cartelle

# Carica il file CSV
file_path = 'benchmark_results.csv'  # Sostituisci con il percorso del tuo file
df = pd.read_csv(file_path)

# Raggruppa i dati per 'Iterazioni', 'Sottocategoria' e 'Categoria Principale'
df_grouped = df.groupby(['Iterazioni', 'Sottocategoria', 'Categoria Principale']).agg({
    'Tempo Medio (ms)': 'mean',
}).reset_index()

# Calcolare il tempo medio per ogni sottocategoria tra tutte le iterazioni
tempo_medio_per_sottocategoria = df_grouped.groupby(['Categoria Principale', 'Sottocategoria'])['Tempo Medio (ms)'].mean()

# Ottieni il nome del file senza estensione per il file di output
file_name_without_extension = os.path.splitext(os.path.basename(file_path))[0]

# Crea una directory per salvare i grafici
output_dir = f'grafici_per_iterazione_{file_name_without_extension}'
os.makedirs(output_dir, exist_ok=True)

# Generare una palette di colori per le sottocategorie
palette = sns.color_palette("tab20", n_colors=len(df_grouped['Sottocategoria'].unique()))

# Creare un dizionario che mappa ciascuna sottocategoria al suo colore
color_map = {sottocategoria: palette[i] for i, sottocategoria in enumerate(df_grouped['Sottocategoria'].unique())}

# Grafico separato per ogni Categoria Principale
for categoria in df_grouped['Categoria Principale'].unique():
    plt.figure(figsize=(14, 8))

    # Filtro i dati per la Categoria Principale
    subset = df_grouped[df_grouped['Categoria Principale'] == categoria]
    
    # Crea il grafico per ogni sottocategoria
    sns.lineplot(data=subset, x='Iterazioni', y='Tempo Medio (ms)', hue='Sottocategoria', marker='o', linewidth=2, palette=color_map)

    # Calcolare il tempo medio per ogni sottocategoria (media tra le iterazioni)
    for sottocategoria in subset['Sottocategoria'].unique():
        tempo_medio = tempo_medio_per_sottocategoria.loc[(categoria, sottocategoria)]
        
        # Aggiungere la linea tratteggiata per il tempo medio della sottocategoria nella categoria specifica
        plt.axhline(y=tempo_medio, color=color_map[sottocategoria], linestyle='--', label=f'Tempo Medio {sottocategoria}: {tempo_medio:.2f} ms')

    # Personalizzare il grafico
    plt.title(f'Variazione del tempo medio per iterazione - Categoria: {categoria}')
    plt.xlabel('Iterazioni')
    plt.ylabel('Tempo Medio (ms)')
    plt.xticks(rotation=45)

    # Spostare la legenda a destra
    plt.legend(title='Sottocategorie', loc='upper left', bbox_to_anchor=(1.05, 1))  # Posiziona la legenda a destra

    # Salva il grafico con il nome della categoria
    output_file_path = os.path.join(output_dir, f'{file_name_without_extension}_{categoria}_variazione_tempo_iterazioni.png')
    plt.tight_layout()
    plt.savefig(output_file_path)
    plt.close()

    print(f'Grafico per la categoria "{categoria}" salvato in: {output_file_path}')

# Se vuoi un grafico combinato con tutte le categorie principali
plt.figure(figsize=(14, 8))

# Crea un grafico combinato per tutte le categorie principali
sns.lineplot(data=df_grouped, x='Iterazioni', y='Tempo Medio (ms)', hue='Sottocategoria', style='Categoria Principale', markers=True, dashes=False, linewidth=2, palette=color_map)

# Aggiungi la linea tratteggiata per il tempo medio della sottocategoria
for categoria in df_grouped['Categoria Principale'].unique():
    # Calcolare il tempo medio per ogni sottocategoria in questa categoria
    for sottocategoria in df_grouped[df_grouped['Categoria Principale'] == categoria]['Sottocategoria'].unique():
        tempo_medio = tempo_medio_per_sottocategoria.loc[(categoria, sottocategoria)]
        plt.axhline(y=tempo_medio, color=color_map[sottocategoria], linestyle='--', label=f'Tempo Medio {sottocategoria} - {categoria}: {tempo_medio:.2f} ms')

# Personalizzare il grafico
plt.title(f'Variazione del Tempo Medio per Sottocategorie in tutte le Categorie Principali')
plt.xlabel('Iterazioni')
plt.ylabel('Tempo Medio (ms)')
plt.xticks(rotation=45)

# Spostare la legenda a destra
plt.legend(title='Sottocategorie', loc='upper left', bbox_to_anchor=(1.05, 1))  # Posiziona la legenda a destra

# Salva il grafico combinato
combined_output_path = os.path.join(output_dir, f'{file_name_without_extension}_variazione_combinata_tempo_iterazioni.png')
plt.tight_layout()
plt.savefig(combined_output_path)
plt.close()

print(f'Grafico combinato salvato in: {combined_output_path}')
