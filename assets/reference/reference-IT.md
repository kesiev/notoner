# Guida rapida ai file descrittore JSON di Notoner

Notoner usa dei descrittori JSON per descrivere un tavolo, sia se si tratti di un template che di un file di salvataggio.

```
{
	"meta": {
		(Metadati del tavolo)
	},
	"data": [
		(Elementi da aggiungere al tavolo)
	]
}
```

In questa guida, per brevità, alcuni nomi di attributi sono descritti con la formula `attributo.sottoAttributo`: questi vanno codificati come `{ "attributo": { "sottoAttributo": ... } }`.

## Struttura dei metadati

L'attributo `meta` di un file JSON Notoner è un oggetto che raccoglie alcuni attributi generali del tavolo, come il suo nome, il numero di giocatori previsti, o link per permettere all'utente di ottenere informazioni utili.

Nome | Tipo | Descrizione |
--- | --- | --- | 
title | [Testo](#struttura-testo) | Nome del tavolo. |
author | [Testo](#struttura-testo) | Autore del tavolo. Se è un gioco, inserisci il nome dell'autore (o i nomi degli autori). Altrimenti metti il tuo nome oppure omettilo. |
license | [Testo](#struttura-testo) | Licenza del tavolo. Se necessario, specifica sotto quale licenza viene distribuito questo media. |
licenseUrl | [URL tradotto](#struttura-url-tradotto) | URL della licenza. Se hai specificato una licenza, puoi anche specificare un indirizzo web nel quale trovarne i dettagli. |
players | [Testo](#struttura-testo) | Numero di giocatori. Inserisci un numero (come 1), una lista (come 2,4,6) o un range (come 3-6). Se è adatto a un qualsiasi numeri di giocatori, scrivi "Qualsiasi". |
description | [Testo](#struttura-testo) | Breve descrizione del tavolo. |
url | [URL tradotto](#struttura-url-tradotto) | Un indirizzo web dove trovare informazioni su quello che si trova su questo tavolo. Puoi ometterlo. |
manualUrl | [URL tradotto](#struttura-url-tradotto) | Un indirizzo web dove trovare le istruzioni su come giocare il gioco su questo tavolo. Puoi ometterlo. |

### Generatori procedurali

Notoner permette ai template di generare proceduralmente un tavolo tramite JavaScript. Per farlo è necessario aggiungere l'attributo `generator` alla radice del descrittore JSON indicando il file JavaScript da utilizzare. È anche possibile specificare una configurazione base, che verrà passata al generatore al momento dell'invocazione tramite l'attributo `settings`.

```
{
	"meta": {
		(Metadati del tavolo)
	},
	"data": [
		(Elementi da aggiungere al tavolo)
	]
	"generator": "generator.js",
	"settings": {
		"attribute1": "value1",
		"attribute2": "value2",
		(Altri attributi)
	}
}
```

Il file `generator.js` è così strutturato:

```
GENERATOR=(function(){
	return {
		run:(self, json, sub, cb)=>{
			// json: contiene la struttura del tavolo selezionato.
			// sub: contiene i dettagli del sotto-template selezionato.
			// sub.settings: contiene il valore dell'attributo settings del descrittore JSON.

			// Una volta modificato l'oggetto JSON:
			cb(json);
		}
	}
})();
```


### Sotto-template

Notoner permette ai template di offrire delle _varianti_ chiamate _sotto-template_, che l'utente potrà selezionare navigando il selettore dei template. Un sotto-template è definito da due gerarchie di oggetti: una nella sezione `meta` che ne definisce la descrizione e una che parte dalla radice del descrittore JSON che ne definisce gli elementi da aggiungere alla sezione `data` e `settings` quando selezionati.

```
{
	"meta": {
		(Metadati del tavolo)
		"subtemplates": [
			{
				"id": "subtemplate1",
				"meta": [ ... ]
			},
			{
				"id": "subtemplate2",
				"meta": [ ... ],
				"subtemplates": [ ... ]
			},
			(Descrizione ulteriori sotto-template)
		]
	},
	"data": [
		(Elementi da aggiungere al tavolo)
	],
	"subtemplates": [
		{
			"id": "subtemplate1",
			"data": [ ... ],
			"settings": { ... }
		},
		{
			"id": "subtemplate2",
			"data": [ ... ],
			"settings": { ... },
			"subtemplates":{ ... }
		}
		(Ulteriori sotto-template)
	}
}
```

I dettagli di questi sotto-template dovranno essere descritti dall'attributo `subtemplates` da aggiungere all'attributo `meta` alla radice del descrittore JSON:

Nome | Tipo | Descrizione |
--- | --- | --- | 
subtemplates |  | (Solo per template) Elenco dei sotto-template supportati. |
&nbsp;&nbsp;&nbsp;subtemplates[].id | `string` | Identificativo del sotto-template. |
&nbsp;&nbsp;&nbsp;subtemplates[].isDefault | `boolean` | Se `TRUE`, seleziona questo sotto-template se non specificato dall'utente. |
&nbsp;&nbsp;&nbsp;subtemplates[].meta |  | Informazioni sul sotto-template. |
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;subtemplates[].meta.title | `string` | Nome del sotto-template. |
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;subtemplates[].meta.description | `string` | Descrizione del sotto-template. |
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;subtemplates[].meta.subtemplates | Sotto-template | Ulteriori sotto-template. Segue la struttura di `subtemplates`. |

## Elementi

Ogni elemento è definito dalla stessa struttura JSON:

```
{
	"type": (Identificativo del tipo dello elemento),
	"data": {
		(Attributi dello elemento)
	}
}
```

Uno stesso elemento può offrire più identificativi, ognuno rappresentante una sua variante.

_A differenza dei file di salvataggio, i template possono specificare un attributo extra `zIndex` oltre a `type` e `data`: gli elementi verranno riordinati in base al loro `zIndex` alla generazione del tavolo, permettendo di non rispettare la sequenza specificata nell'attributo `data` del descrittore JSON. Questa tecnica concede maggior controllo sul posizionamento degli elementi ai sotto-template, permettendogli di mescolarli con altri in posizione fissa._

### Calcolatrice standard

Un antico dispositivo usato per compiere calcoli matematici.

#### Identificativi del tipo

 * `"calculator-landscape"`
 * `"calculator-portrait"`

#### Tag assegnati di default

 * `"type:calculator"`

#### Eventi disponibili per le macro

 * `reset`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
state |  | Stato della calcolatrice. (Gestito automaticamente) |
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
messages |  | Messaggi della calcolatrice. |
&nbsp;&nbsp;&nbsp;messages.clearMemory | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione del menù da mostrare per cancellare la memoria. |
&nbsp;&nbsp;&nbsp;messages.reset | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione del menù da mostrare per reimpostare la calcolatrice. |
&nbsp;&nbsp;&nbsp;messages.memoryCleared | `FALSE` per nasconderla o [Messaggio](#struttura-messaggio-popup) | Messaggio mostrato al termine quando la memoria viene cancellata. |
&nbsp;&nbsp;&nbsp;messages.resetDone | `FALSE` per nasconderla o [Messaggio](#struttura-messaggio-popup) | Messaggio mostrato al termine quando la calcolatrice viene reimpostata. |

### Calcolatrice personalizzata

Un antico dispositivo usato per compiere calcoli matematici. (Versione personalizzabile)

#### Identificativi del tipo

 * `"calculator-custom"`

#### Tag assegnati di default

 * `"type:calculator"`

#### Eventi disponibili per le macro

 * `reset`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
state |  | Stato della calcolatrice. (Gestito automaticamente) |
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
width | `float` (in mm) | Larghezza. |
height | `float` (in mm) | Altezza. |
frame | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Cornice](#struttura-cornice) | Blocco di sfondo. |
display | `FALSE` per nasconderla, `TRUE` per usare i valori di default o ([Cornice](#struttura-cornice) + [Etichetta](#struttura-etichetta-di-testo)) | Aspetto del display. |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
keys | `[` `[` ([Cornice](#struttura-cornice) + [Etichetta](#struttura-etichetta-di-testo)), ([Cornice](#struttura-cornice) + [Etichetta](#struttura-etichetta-di-testo)), ... `],` `[` ... `]`, ... `]` | Aspetto di ogni tasto, organizzato in righe e colonne. |
messages |  | Messaggi della calcolatrice. |
&nbsp;&nbsp;&nbsp;messages.clearMemory | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione del menù da mostrare per cancellare la memoria. |
&nbsp;&nbsp;&nbsp;messages.reset | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione del menù da mostrare per reimpostare la calcolatrice. |
&nbsp;&nbsp;&nbsp;messages.memoryCleared | `FALSE` per nasconderla o [Messaggio](#struttura-messaggio-popup) | Messaggio mostrato al termine quando la memoria viene cancellata. |
&nbsp;&nbsp;&nbsp;messages.resetDone | `FALSE` per nasconderla o [Messaggio](#struttura-messaggio-popup) | Messaggio mostrato al termine quando la calcolatrice viene reimpostata. |

### Catapulta standard

Un elemento che lancia uno o più elementi sopra un altro in una posizione casuale.

#### Identificativi del tipo

 * `"catapult"`

#### Tag assegnati di default

 * `"type:catapult"`

#### Eventi disponibili per le macro

 * `launch`
 * `setLastPoint`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
lastPoint | [Punto](#struttura-posizione-di-un-punto) | Coordinate sul tavolo della punto obiettivo. |
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
launchTags | `[` `string` `,` `string` `,` ... `]` | Lista di tag degli elementi che possono essere lanciati. |
launchOnTags | `[` `string` `,` `string` `,` ... `]` | Lista di tag degli elementi che possono essere usati come obiettivo. |
messages |  | Messaggi della catapulta. |
&nbsp;&nbsp;&nbsp;messages.setTarget | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per avviare l'impostazione del punto obiettivo. |
&nbsp;&nbsp;&nbsp;messages.launch | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per lanciare gli elementi. |

### Catapulta personalizzata

Un elemento che lancia uno o più elementi sopra un altro in una posizione casuale. (Versione personalizzabile)

#### Identificativi del tipo

 * `"catapult-custom"`

#### Tag assegnati di default

 * `"type:catapult"`

#### Eventi disponibili per le macro

 * `launch`
 * `setLastPoint`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
lastPoint | [Punto](#struttura-posizione-di-un-punto) | Coordinate sul tavolo della punto obiettivo. |
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
width | `float` (in mm) | Larghezza. |
height | `float` (in mm) | Altezza. |
guideLine | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Cornice](#struttura-cornice) | Mostra una linea tratteggiata dal punto centrale al punto obiettivo. |
frame | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Cornice](#struttura-cornice) | Blocco di sfondo. |
center | [Punto](#struttura-posizione-di-un-punto) | Posizione del punto centrale nell'elemento. |
launchTags | `[` `string` `,` `string` `,` ... `]` | Lista di tag degli elementi che possono essere lanciati. |
launchOnTags | `[` `string` `,` `string` `,` ... `]` | Lista di tag degli elementi che possono essere usati come obiettivo. |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
isTargetLocked | `boolean` | Se `TRUE`, il punto obiettivo è bloccato e non può essere modificato dall'utente. |
onShakeLaunch | `boolean` | Se `TRUE`, gli elementi saranno lanciati quando l'elemento viene agitato. |
onLaunchShake | `boolean` | Se `TRUE`, gli elementi devono essere agitati quando vengono lanciati. |
messages |  | Messaggi della catapulta. |
&nbsp;&nbsp;&nbsp;messages.setTarget | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per avviare l'impostazione del punto obiettivo. |
&nbsp;&nbsp;&nbsp;messages.launch | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per lanciare gli elementi. |

### Contatore standard

Un elemento che tiene traccia di un determinato valore.

#### Identificativi del tipo

 * `"counter-normal"`
 * `"counter-small"`
 * `"counter-verysmall"`

#### Tag assegnati di default

 * `"type:counter"`

#### Eventi disponibili per le macro

 * `reset`
 * `setValue`
 * `subtractValue`
 * `sumValue`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
value | `integer` | Valore dell'elemento. |
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
resetValue | `float` | Valore impostato quando l'elemento viene ripristinato. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
descriptionText | [Testo](#struttura-testo) | Testo da mostrare nell'etichetta descrittiva. |
maxValue | `float` | Valore massimo che il contatore può assumere. |
minValue | `float` | Valore minimo che il contatore può assumere. |
isTransparent | `boolean` | Se `TRUE`, è possibile vedere ciò che si trova sotto l'elemento. |
gauge | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Cornice](#struttura-cornice) | Aspetto della barra di progresso. |

### Contatore personalizzate

Un elemento che tiene traccia di un determinato valore. (Versione personalizzabile)

#### Identificativi del tipo

 * `"counter-custom"`

#### Tag assegnati di default

 * `"type:counter"`

#### Eventi disponibili per le macro

 * `reset`
 * `setValue`
 * `subtractValue`
 * `sumValue`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
value | `integer` | Valore dell'elemento. |
resetValue | `float` | Valore impostato quando l'elemento viene ripristinato. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
width | `float` (in mm) | Larghezza. |
height | `float` (in mm) | Altezza. |
frame | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Cornice](#struttura-cornice) | Blocco di sfondo. |
label | ([Cornice](#struttura-cornice) + [Etichetta](#struttura-etichetta-di-testo)) | Etichetta testuale che mostra il valore del contatore. |
leftButtons | `[` [Bottone contatore](#struttura-bottone-contatore) `,` [Bottone contatore](#struttura-bottone-contatore) `,` ... `]` | Bottoni da aggiungere alla sinistra del contatore. |
rightButtons | `[` [Bottone contatore](#struttura-bottone-contatore) `,` [Bottone contatore](#struttura-bottone-contatore) `,` ... `]` | Bottoni da aggiungere alla destra del contatore. |
menuButtons | `[` [Bottone menu](#struttura-bottone-nel-menù-del-contatore) `,` [Bottone menu](#struttura-bottone-nel-menù-del-contatore) `,` ... `]` | Bottoni da aggiungere alla menù contestuale del contatore. |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
description | `FALSE` per nasconderla, `TRUE` per usare i valori di default o ([Cornice](#struttura-cornice) + [Etichetta](#struttura-etichetta-di-testo)) | Etichetta descrittiva del contatore. |
descriptionText | [Testo](#struttura-testo) | Testo da mostrare nell'etichetta descrittiva. |
maxValue | `float` | Valore massimo che il contatore può assumere. |
minValue | `float` | Valore minimo che il contatore può assumere. |
isTransparent | `boolean` | Se `TRUE`, è possibile vedere ciò che si trova sotto l'elemento. |
isRotating | `boolean` | Se `TRUE`, il contatore più essere ruotato per cambiarne il valore. |
gauge | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Cornice](#struttura-cornice) | Aspetto della barra di progresso. |
gaugeMaxValue | `float` | Valore massimo da usare per disegnare la barra di progresso. |
gaugeMinValue | `float` | Valore minimo da usare per disegnare la barra di progresso. |
isGaugeMaxValueVisible | `boolean` | Se `TRUE`, mostra il valore massimo della barra del progresso vicino al valore del contatore. |
image | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Immagine di sfondo. |

### Dado standard

Mostra casualmente una delle sue facce.

#### Identificativi del tipo

 * `"dice-d10"`
 * `"dice-d10-ten"`
 * `"dice-d100"`
 * `"dice-d12"`
 * `"dice-d2"`
 * `"dice-d20"`
 * `"dice-d4"`
 * `"dice-d6"`
 * `"dice-d6-pips"`
 * `"dice-d8"`

#### Tag assegnati di default

 * `"type:dice"`

#### Eventi disponibili per le macro

 * `flip`
 * `roll`
 * `setSide`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
value | `integer` | Indice della faccia del dado da mostrare. (`0` per la prima faccia) |
messages |  | Messaggi del dado. |
&nbsp;&nbsp;&nbsp;messages.flip | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione del menù da mostrare per girare l'elemento sottosopra. |
&nbsp;&nbsp;&nbsp;messages.roll | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione del menù da mostrare per tirare l'elemento. |

### Dado personalizzato

Mostra casualmente una delle sue facce. (Versione personalizzabile)

#### Identificativi del tipo

 * `"dice-custom"`

#### Tag assegnati di default

 * `"type:dice"`

#### Eventi disponibili per le macro

 * `flip`
 * `roll`
 * `setSide`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
width | `float` (in mm) | Larghezza. |
height | `float` (in mm) | Altezza. |
value | `integer` | Indice della faccia del dado da mostrare. (`0` per la prima faccia) |
faces | `[` Faccia `,` Faccia `,` ... `]` | Elenco delle facce del dado. |
&nbsp;&nbsp;&nbsp;faces[].frame | `integer` | Indice del fotogramma dello sprite da mostrare. |
&nbsp;&nbsp;&nbsp;faces[].label | [Testo](#struttura-testo) | Etichetta testuale della faccia. |
&nbsp;&nbsp;&nbsp;faces[].icon | [Risorsa URL](#struttura-risorsa-url) o [Risorsa Canvas](#struttura-canvas) o [Risorsa SVG](#struttura-svg) | Icona da mostrare nel menù di selezione delle facce. |
&nbsp;&nbsp;&nbsp;faces[].value | `integer` | Valore del dado quando mostra questa faccia. |
isFlippable | `boolean` | Se `TRUE`, l'elemento può essere girato sull'altro lato. |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
frame | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Cornice](#struttura-cornice) | Blocco di sfondo. |
image | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Immagine di sfondo. |
isRotating | `boolean` | Se `TRUE`, è possibile scorrere le facce del dado ruotandolo. |
facesImage | [Immagine](#struttura-immagine) | Immagine usata per le facce del dado. La risorsa `image` deve contenere la sezione `sprite` dei metadati. |
facesLabel | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Etichetta](#struttura-etichetta-di-testo) | Etichetta di testo usata per le facce del dado. |
messages |  | Messaggi del dado. |
&nbsp;&nbsp;&nbsp;messages.flip | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione del menù da mostrare per girare l'elemento sottosopra. |
&nbsp;&nbsp;&nbsp;messages.roll | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione del menù da mostrare per tirare l'elemento. |

### Elemento per tracciare linee standard

Utilizza lo strumento attualmente selezionato per disegnare (matita o gomma) per tracciare una linea sui fogli sottostanti.

#### Identificativi del tipo

 * `"line-compass"`
 * `"line-ruler"`

#### Tag assegnati di default

 * `"type:line"`

#### Eventi disponibili per le macro

 * `paint`
 * `reset`
 * `setLastStep`
 * `setLastVector`
 * `shuffle`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
lastVector | [Vettore](#struttura-vettore) | Vettore verso il punto di obiettivo. |
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
lastStep | `integer` | Passaggio impostato per la prossima traccia. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
previewTool |  | Mostra l'anteprima dello strumento selezionato sull'elemento. |
&nbsp;&nbsp;&nbsp;previewTool.border | `boolean` | Se `TRUE`, mostra l'anteprima sul bordo dell'elemento. |
&nbsp;&nbsp;&nbsp;previewTool.background | `boolean` | Se `TRUE`, mostra l'anteprima sullo sfondo dell'elemento. |
&nbsp;&nbsp;&nbsp;previewTool.guides | `boolean` | Se `TRUE`, mostra l'anteprima sulle guide dell'elemento. |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
drawOnTags | `[` `string` `,` `string` `,` ... `]` | Permette all'elemento di disegnare solo sugli elementi con i tag specificati. |

### Elemento per tracciare linee personalizzato

Utilizza lo strumento attualmente selezionato per disegnare (matita o gomma) per tracciare una linea sui fogli sottostanti. (Versione personalizzabile)

#### Identificativi del tipo

 * `"line-custom"`

#### Tag assegnati di default

 * `"type:line"`

#### Eventi disponibili per le macro

 * `paint`
 * `reset`
 * `setLastStep`
 * `setLastVector`
 * `shuffle`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
lastVector | [Vettore](#struttura-vettore) | Vettore verso il punto di obiettivo. |
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
lastStep | `integer` | Passaggio impostato per la prossima traccia. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
width | `float` (in mm) | Larghezza. |
height | `float` (in mm) | Altezza. |
guideLabel | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Cornice](#struttura-cornice) | Mostra un'etichetta che riporta la distanza tra il punto centrale e il punto obiettivo. |
guideCircle | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Cornice](#struttura-cornice) | Mostra un cerchio tratteggiato dal punto centrale al punto obiettivo. |
guideLine | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Cornice](#struttura-cornice) | Mostra una linea tratteggiata dal punto centrale al punto obiettivo. |
draw |  | Linee tracciate dall'elemento. |
&nbsp;&nbsp;&nbsp;draw.line | `boolean` | Se `TRUE`, disegna una linea dal punto centrale al punto obiettivo. |
&nbsp;&nbsp;&nbsp;draw.circle | `boolean` | Se `TRUE`, disegna un cerchio dal punto centrale al punto obiettivo. |
frame | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Cornice](#struttura-cornice) | Blocco di sfondo. |
center | [Punto](#struttura-posizione-di-un-punto) | Posizione del punto centrale nell'elemento. |
onShakeShuffle | `boolean` | Se `TRUE`, seleziona un angolo o una distanza casuale quando viene agitato. |
rotationAngle | `float` (in radianti) | Quando l'elemento viene ruotato, ruota l'angolo selezionato del valore specificato. |
drawOnTags | `[` `string` `,` `string` `,` ... `]` | Permette all'elemento di disegnare solo sugli elementi con i tag specificati. |
distance |  | Regole da applicare alla distanza tra il centro e il punto obiettivo. |
&nbsp;&nbsp;&nbsp;distance.max | `float` (in mm) | Distanza massima dal centro al punto obiettivo. |
&nbsp;&nbsp;&nbsp;distance.step | `float` (in mm) | Passo da usare per la distanza dal centro al punto obiettivo. |
previewTool |  | Mostra l'anteprima dello strumento selezionato sull'elemento. |
&nbsp;&nbsp;&nbsp;previewTool.border | `boolean` | Se `TRUE`, mostra l'anteprima sul bordo dell'elemento. |
&nbsp;&nbsp;&nbsp;previewTool.background | `boolean` | Se `TRUE`, mostra l'anteprima sullo sfondo dell'elemento. |
&nbsp;&nbsp;&nbsp;previewTool.guides | `boolean` | Se `TRUE`, mostra l'anteprima sulle guide dell'elemento. |
drawOnDrag | `boolean` | Se `TRUE`, disegna la linea subito dopo aver stabilito il punto obiettivo. |
drawOnClick | `boolean` | Se `TRUE`, disegna la linea subito quando viene fatto click/tap sull'elemento. |
onDrawExpand | `boolean` | Se `TRUE`, aumenta la distanza del valore originale di `lastRadius` ogni volta che una linea viene tracciata. |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
isTargetLocked | `boolean` | Se `TRUE`, il punto obiettivo è bloccato e non può essere modificato dall'utente. |

### Forbici standard

Un elemento in grado di tagliare elementi foglio per ricavarne degli elementi segnalino.

#### Identificativi del tipo

 * `"scissors"`

#### Tag assegnati di default

 * `"type:scissors"`

#### Eventi disponibili per le macro

 * `setLastArea`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
lastArea | [Area](#struttura-area) | Area da ritagliare. |
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
isAreaLocked | `boolean` | Se `TRUE`, impedisce all'utente di cambiare l'area da tagliare. |
messages |  | Messaggi delle forbici. |
&nbsp;&nbsp;&nbsp;messages.setArea | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per avviare selezionare l'area da ritagliare. |
&nbsp;&nbsp;&nbsp;messages.cut | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per avviare effettuare un taglio. |
&nbsp;&nbsp;&nbsp;messages.removeSheet | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per rimuovere un foglio dal tavolo. |
&nbsp;&nbsp;&nbsp;messages.selectSheet | `FALSE` per nasconderla o [Messaggio](#struttura-messaggio-popup) | Messaggio mostrato quando deve essere selezionato il foglio da eliminare. |
cutOnTags | `[` `string` `,` `string` `,` ... `]` | Permette all'elemento di tagliare solo gli elementi con i tag specificati. |
cutTags | `[` `string` `,` `string` `,` ... `]` | Assegna ai ritagli i tag specificati. |
cutModels | `[` [Opzione area](#struttura-opzione-area) `,` [Opzione area](#struttura-opzione-area) `,` ... `]` | Specifica una lista di aree da tagliare preimpostate che l'utente può selezionare. |

### Forbici personalizzate

Un elemento in grado di tagliare elementi foglio per ricavarne degli elementi segnalino. (Versione personalizzabile)

#### Identificativi del tipo

 * `"scissors-custom"`

#### Tag assegnati di default

 * `"type:scissors"`

#### Eventi disponibili per le macro

 * `setLastArea`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
lastArea | [Area](#struttura-area) | Area da ritagliare. |
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
frame | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Cornice](#struttura-cornice) | Blocco di sfondo. |
width | `float` (in mm) | Larghezza. |
height | `float` (in mm) | Altezza. |
guideArea | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Cornice](#struttura-cornice) | Mostra un'area tratteggiata che mostra l'area da tagliare. |
guideLabel | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Cornice](#struttura-cornice) | Mostra un'etichetta che riporta la dimensione dell'area da tagliare. |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
isAreaLocked | `boolean` | Se `TRUE`, impedisce all'utente di cambiare l'area da tagliare. |
messages |  | Messaggi delle forbici. |
&nbsp;&nbsp;&nbsp;messages.setArea | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per avviare selezionare l'area da ritagliare. |
&nbsp;&nbsp;&nbsp;messages.cut | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per avviare effettuare un taglio. |
&nbsp;&nbsp;&nbsp;messages.removeSheet | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per rimuovere un foglio dal tavolo. |
&nbsp;&nbsp;&nbsp;messages.selectSheet | `FALSE` per nasconderla o [Messaggio](#struttura-messaggio-popup) | Messaggio mostrato quando deve essere selezionato il foglio da eliminare. |
cutOnTags | `[` `string` `,` `string` `,` ... `]` | Permette all'elemento di tagliare solo gli elementi con i tag specificati. |
cutTags | `[` `string` `,` `string` `,` ... `]` | Assegna ai ritagli i tag specificati. |
cutModels | `[` [Opzione area](#struttura-opzione-area) `,` [Opzione area](#struttura-opzione-area) `,` ... `]` | Specifica una lista di aree da tagliare preimpostate che l'utente può selezionare. |

### Foglio vuoto

Un foglio vuoto. Può avere un pattern prestampato.

#### Identificativi del tipo

 * `"sheet-blank-landscape"`
 * `"sheet-blank-portrait"`

#### Tag assegnati di default

 * `"type:sheet"`

#### Eventi disponibili per le macro

 * `reset`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
pattern |  | Pattern da stampare sul foglio. |
&nbsp;&nbsp;&nbsp;pattern.width | `float` (in mm) | Larghezza. |
&nbsp;&nbsp;&nbsp;pattern.height | `float` (in mm) | Altezza. |
&nbsp;&nbsp;&nbsp;pattern.type | `integer` | Disegno da usare per il pattern. (`1` per righe, `2` per quadretti, `3` per esagoni verticali, `4` per esagoni orizzontali) |
&nbsp;&nbsp;&nbsp;pattern.topMargin | `float` (in mm) | Margine superiore dal quale partire a disegnare il pattern. |
&nbsp;&nbsp;&nbsp;pattern.bottomMargin | `float` (in mm) | Margine inferiore dal quale partire a disegnare il pattern. |
&nbsp;&nbsp;&nbsp;pattern.rightMargin | `float` (in mm) | Margine destro dal quale partire a disegnare il pattern. |
&nbsp;&nbsp;&nbsp;pattern.leftMargin | `float` (in mm) | Margine sinistro dal quale partire a disegnare il pattern. |
&nbsp;&nbsp;&nbsp;pattern.color | [Colore](#struttura-colore) | Colore del pattern. |
image | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Immagine di sfondo. |

### Foglio

Un foglio prestampato. (Versione personalizzabile)

#### Identificativi del tipo

 * `"sheet"`

#### Tag assegnati di default

 * `"type:sheet"`

#### Eventi disponibili per le macro

 * `reset`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
width | `float` (in mm) | Larghezza. |
height | `float` (in mm) | Altezza. |
model | [Risorsa tradotta](#struttura-risorsa-tradotta) | Immagine da stampare sul foglio. |
modelOpacity | `float` (0-1) | Opacità dell'immagine da stampare su foglio. (`1` per completamente visibile, `0` per invisibile) |
image | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Immagine di sfondo. |
isReadOnly | `boolean` | Se `TRUE`, l'elemento può essere modificato dall'utente. |
pattern |  | Pattern da stampare sul foglio. |
&nbsp;&nbsp;&nbsp;pattern.width | `float` (in mm) | Larghezza. |
&nbsp;&nbsp;&nbsp;pattern.height | `float` (in mm) | Altezza. |
&nbsp;&nbsp;&nbsp;pattern.type | `integer` | Disegno da usare per il pattern. (`1` per righe, `2` per quadretti, `3` per esagoni verticali, `4` per esagoni orizzontali) |
&nbsp;&nbsp;&nbsp;pattern.topMargin | `float` (in mm) | Margine superiore dal quale partire a disegnare il pattern. |
&nbsp;&nbsp;&nbsp;pattern.bottomMargin | `float` (in mm) | Margine inferiore dal quale partire a disegnare il pattern. |
&nbsp;&nbsp;&nbsp;pattern.rightMargin | `float` (in mm) | Margine destro dal quale partire a disegnare il pattern. |
&nbsp;&nbsp;&nbsp;pattern.leftMargin | `float` (in mm) | Margine sinistro dal quale partire a disegnare il pattern. |
&nbsp;&nbsp;&nbsp;pattern.color | [Colore](#struttura-colore) | Colore del pattern. |
frame | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Cornice](#struttura-cornice) | Blocco di sfondo. |

### Timbro standard

Un elemento che permette di disegnare alcune immagini predefinite sui fogli.

#### Identificativi del tipo

 * `"stamp-normal"`
 * `"stamp-small"`

#### Tag assegnati di default

 * `"type:stamp"`

#### Eventi disponibili per le macro

 * `paint`
 * `setRotation`
 * `setSide`
 * `shuffle`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
selectedStamp | `integer` | Indice del timbro correntemente selezionato. |
rotation | `integer` | Direzione verso la quale l'elemento è girato. (`0` per dritto, `1` per destra, `2` per sottosopra, `3` per sinistra) |
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
previewTool |  | Mostra l'anteprima dello strumento selezionato sull'elemento. |
&nbsp;&nbsp;&nbsp;previewTool.border | `boolean` | Se `TRUE`, mostra l'anteprima sul bordo dell'elemento. |
&nbsp;&nbsp;&nbsp;previewTool.background | `boolean` | Se `TRUE`, mostra l'anteprima sullo sfondo dell'elemento. |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
colorize | `boolean` | Se `TRUE`, usa lo strumento attualmente selezionato per disegnare l'immagine del timbro. |
drawOnTags | `[` `string` `,` `string` `,` ... `]` | Permette all'elemento di disegnare solo sugli elementi con i tag specificati. |

### Timbro personalizzato

Un elemento che permette di disegnare alcune immagini predefinite sui fogli. (Versione personalizzabile)

#### Identificativi del tipo

 * `"stamp-custom"`

#### Tag assegnati di default

 * `"type:stamp"`

#### Eventi disponibili per le macro

 * `paint`
 * `setRotation`
 * `setSide`
 * `shuffle`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
rotation | `integer` | Direzione verso la quale l'elemento è girato. (`0` per dritto, `1` per destra, `2` per sottosopra, `3` per sinistra) |
selectedStamp | `integer` | Indice del timbro correntemente selezionato. |
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
width | `float` (in mm) | Larghezza. |
height | `float` (in mm) | Altezza. |
frame | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Cornice](#struttura-cornice) | Blocco di sfondo. |
image | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Immagine di sfondo. |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
onShakeShuffle | `boolean` | Se `TRUE`, seleziona un timbro casuale quando viene agitato. |
isRotating | `boolean` | Se `TRUE`, l'elemento più essere ruotato. |
stamps | `[` Timbro `,` Timbro `,` ... `]` | Elenco dei timbri disponibili. |
&nbsp;&nbsp;&nbsp;stamps[].frame | `integer` | Indice del fotogramma dello sprite da disegnare. |
&nbsp;&nbsp;&nbsp;stamps[].label | [Testo](#struttura-testo) | Etichetta testuale del timbro. |
&nbsp;&nbsp;&nbsp;stamps[].icon | [Risorsa URL](#struttura-risorsa-url) o [Risorsa Canvas](#struttura-canvas) o [Risorsa SVG](#struttura-svg) | Icona del timbro. |
stampsImage | [Immagine](#struttura-immagine) | Posizione e immagine da usare come timbro. |
previewTool |  | Mostra l'anteprima dello strumento selezionato sull'elemento. |
&nbsp;&nbsp;&nbsp;previewTool.border | `boolean` | Se `TRUE`, mostra l'anteprima sul bordo dell'elemento. |
&nbsp;&nbsp;&nbsp;previewTool.background | `boolean` | Se `TRUE`, mostra l'anteprima sullo sfondo dell'elemento. |
drawOnTags | `[` `string` `,` `string` `,` ... `]` | Permette all'elemento di disegnare solo sugli elementi con i tag specificati. |
colorize | `boolean` | Se `TRUE`, usa lo strumento attualmente selezionato per disegnare l'immagine del timbro. |

### Orologio standard

Conta quanto tempo è passato dal suo avviamento.

#### Identificativi del tipo

 * `"timer-clock"`

#### Tag assegnati di default

 * `"type:timer"`

#### Eventi disponibili per le macro

 * `reset`
 * `shuffle`
 * `start`
 * `stop`
 * `toggle`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
count | `integer` (secondi) | Conteggio corrente dell'orologio. |
messages |  | Messaggi dell'orologio. |
&nbsp;&nbsp;&nbsp;messages.start | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per avviare l'orologio. |
&nbsp;&nbsp;&nbsp;messages.stop | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per fermare l'orologio. |
&nbsp;&nbsp;&nbsp;messages.reset | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per resettare l'orologio. |
&nbsp;&nbsp;&nbsp;messages.restart | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per riavviare l'orologio. |
&nbsp;&nbsp;&nbsp;messages.startStop | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per cambiare lo stato dell'orologio. |
&nbsp;&nbsp;&nbsp;messages.timeUp | `FALSE` per nasconderla o [Messaggio](#struttura-messaggio-popup) | Messaggio mostrato al termine del conto alla rovescia. |

### Conto alla rovescia standard

Conta per un dato numero di secondi per poi attivarsi.

#### Identificativi del tipo

 * `"timer-countdown"`

#### Tag assegnati di default

 * `"type:timer"`

#### Eventi disponibili per le macro

 * `reset`
 * `shuffle`
 * `start`
 * `stop`
 * `toggle`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
timeLeft | `integer` (secondi) | Tempo limite dell'orologio. |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
count | `integer` (secondi) | Conteggio corrente dell'orologio. |
messages |  | Messaggi dell'orologio. |
&nbsp;&nbsp;&nbsp;messages.start | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per avviare l'orologio. |
&nbsp;&nbsp;&nbsp;messages.stop | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per fermare l'orologio. |
&nbsp;&nbsp;&nbsp;messages.reset | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per resettare l'orologio. |
&nbsp;&nbsp;&nbsp;messages.restart | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per riavviare l'orologio. |
&nbsp;&nbsp;&nbsp;messages.startStop | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per cambiare lo stato dell'orologio. |
&nbsp;&nbsp;&nbsp;messages.timeUp | `FALSE` per nasconderla o [Messaggio](#struttura-messaggio-popup) | Messaggio mostrato al termine del conto alla rovescia. |

### Orologio personalizzato

Un elemento che misurara il tempo. (Versione personalizzabile)

#### Identificativi del tipo

 * `"timer-custom"`

#### Tag assegnati di default

 * `"type:timer"`

#### Eventi disponibili per le macro

 * `reset`
 * `shuffle`
 * `start`
 * `stop`
 * `toggle`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
width | `float` (in mm) | Larghezza. |
height | `float` (in mm) | Altezza. |
frame | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Cornice](#struttura-cornice) | Blocco di sfondo. |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
label | ([Cornice](#struttura-cornice) + [Etichetta](#struttura-etichetta-di-testo)) | Etichetta testuale dell'orologio. |
count | `integer` (secondi) | Conteggio corrente dell'orologio. |
timeLeft | `integer` (secondi) | Tempo limite dell'orologio. |
messages |  | Messaggi dell'orologio. |
&nbsp;&nbsp;&nbsp;messages.start | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per avviare l'orologio. |
&nbsp;&nbsp;&nbsp;messages.stop | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per fermare l'orologio. |
&nbsp;&nbsp;&nbsp;messages.reset | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per resettare l'orologio. |
&nbsp;&nbsp;&nbsp;messages.restart | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per riavviare l'orologio. |
&nbsp;&nbsp;&nbsp;messages.startStop | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per cambiare lo stato dell'orologio. |
&nbsp;&nbsp;&nbsp;messages.timeUp | `FALSE` per nasconderla o [Messaggio](#struttura-messaggio-popup) | Messaggio mostrato al termine del conto alla rovescia. |

### Segnalino personalizzato

Un segnalino che può usato per indicare una posizione sul tavolo.

#### Identificativi del tipo

 * `"token-0"`
 * `"token-1"`
 * `"token-2"`
 * `"token-3"`

#### Tag assegnati di default

 * `"type:token"`

#### Eventi disponibili per le macro

 * `flip`
 * `setRotation`
 * `setSide`
 * `shuffle`
 * `spin`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
rotation | `integer` | Direzione verso la quale l'elemento è girato. (`0` per dritto, `1` per destra, `2` per sottosopra, `3` per sinistra. Vedi l'attributo `rotation` per eccezioni.) |
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
mode | `integer` | Aspetto del segnalino. (`0` per quadrato, `1` per arrotondato, `2` per rotondo) |
labelText | [Testo](#struttura-testo) | Testo da mostrare sul segnalino. |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
isTransparent | `boolean` | Se `TRUE`, è possibile vedere ciò che si trova sotto l'elemento. |

### Segnalino a due facce personalizzato

Un segnalino che può usato per indicare una posizione sul tavolo. Può essere girato per mostrare la faccia sul retro.

#### Identificativi del tipo

 * `"token-0-flip"`
 * `"token-1-flip"`
 * `"token-2-flip"`
 * `"token-3-flip"`

#### Tag assegnati di default

 * `"type:token"`

#### Eventi disponibili per le macro

 * `flip`
 * `setRotation`
 * `setSide`
 * `shuffle`
 * `spin`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
side | `boolean` | Lato sul quale è girato il segnalino. (`FALSE` per fronte, `TRUE` per retro) |
rotation | `integer` | Direzione verso la quale l'elemento è girato. (`0` per dritto, `1` per destra, `2` per sottosopra, `3` per sinistra. Vedi l'attributo `rotation` per eccezioni.) |
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
mode | `integer` | Aspetto del segnalino. (`0` per quadrato, `1` per arrotondato, `2` per rotondo) |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
labelText | [Testo](#struttura-testo) | Testo da mostrare sul segnalino. |
flipLabelText | [Testo](#struttura-testo) | Testo da mostrare sul retro segnalino. |
flipBackgroundColor | [Colore](#struttura-colore) | Colore del retro del segnalino. |
isTransparent | `boolean` | Se `TRUE`, è possibile vedere ciò che si trova sotto l'elemento. |
messages |  | Messaggi del segnalino. |
&nbsp;&nbsp;&nbsp;messages.flip | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione del menù da mostrare per girare l'elemento sull'altra faccia. |
&nbsp;&nbsp;&nbsp;messages.toss | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione del menù da mostrare per lanciare l'elemento come una moneta. |
&nbsp;&nbsp;&nbsp;messages.spin | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione del menù da mostrare per ruotare casualmente l'elemento. |
&nbsp;&nbsp;&nbsp;messages.rotateStraight | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per ruotare il segnalino in posizione dritta. |
&nbsp;&nbsp;&nbsp;messages.rotateUpsideDown | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per ruotare il segnalino sottosopra. |
&nbsp;&nbsp;&nbsp;messages.rotateRight | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per ruotare il segnalino verso destra. |
&nbsp;&nbsp;&nbsp;messages.rotateLeft | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per ruotare il segnalino verso sinistra. |

### Peeple standard

Un segnalino a forma di omino che può essere tenuto in piedi o sdraiato.

#### Identificativi del tipo

 * `"token-0-peeple"`
 * `"token-1-peeple"`
 * `"token-2-peeple"`
 * `"token-3-peeple"`

#### Tag assegnati di default

 * `"type:token"`

#### Eventi disponibili per le macro

 * `flip`
 * `setRotation`
 * `setSide`
 * `shuffle`
 * `spin`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
side | `boolean` | Lato sul quale è girato il segnalino. (`FALSE` per fronte, `TRUE` per retro) |
rotation | `integer` | Direzione verso la quale l'elemento è girato. (`0` per dritto, `1` per destra, `2` per sottosopra, `3` per sinistra. Vedi l'attributo `rotation` per eccezioni.) |
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
isTransparent | `boolean` | Se `TRUE`, è possibile vedere ciò che si trova sotto l'elemento. |
messages |  | Messaggi del segnalino. |
&nbsp;&nbsp;&nbsp;messages.flip | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione del menù da mostrare per girare l'elemento sull'altra faccia. |
&nbsp;&nbsp;&nbsp;messages.toss | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione del menù da mostrare per lanciare l'elemento come una moneta. |
&nbsp;&nbsp;&nbsp;messages.spin | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione del menù da mostrare per ruotare casualmente l'elemento. |
&nbsp;&nbsp;&nbsp;messages.rotateStraight | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per ruotare il segnalino in posizione dritta. |
&nbsp;&nbsp;&nbsp;messages.rotateUpsideDown | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per ruotare il segnalino sottosopra. |
&nbsp;&nbsp;&nbsp;messages.rotateRight | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per ruotare il segnalino verso destra. |
&nbsp;&nbsp;&nbsp;messages.rotateLeft | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per ruotare il segnalino verso sinistra. |

### Segnalino personalizzato

Un segnalino che può usato per indicare una posizione sul tavolo. Può essere girato per mostrare la faccia sul retro. (Versione personalizzabile)

#### Identificativi del tipo

 * `"token-custom"`

#### Tag assegnati di default

 * `"type:token"`

#### Eventi disponibili per le macro

 * `flip`
 * `setRotation`
 * `setSide`
 * `shuffle`
 * `spin`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
side | `boolean` | Lato sul quale è girato il segnalino. (`FALSE` per fronte, `TRUE` per retro) |
rotation | `integer` | Direzione verso la quale l'elemento è girato. (`0` per dritto, `1` per destra, `2` per sottosopra, `3` per sinistra. Vedi l'attributo `rotation` per eccezioni.) |
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
messages |  | Messaggi del segnalino. |
&nbsp;&nbsp;&nbsp;messages.flip | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione del menù da mostrare per girare l'elemento sull'altra faccia. |
&nbsp;&nbsp;&nbsp;messages.toss | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione del menù da mostrare per lanciare l'elemento come una moneta. |
&nbsp;&nbsp;&nbsp;messages.spin | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione del menù da mostrare per ruotare casualmente l'elemento. |
&nbsp;&nbsp;&nbsp;messages.rotateStraight | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per ruotare il segnalino in posizione dritta. |
&nbsp;&nbsp;&nbsp;messages.rotateUpsideDown | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per ruotare il segnalino sottosopra. |
&nbsp;&nbsp;&nbsp;messages.rotateRight | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per ruotare il segnalino verso destra. |
&nbsp;&nbsp;&nbsp;messages.rotateLeft | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione per ruotare il segnalino verso sinistra. |
width | `float` (in mm) | Larghezza. |
height | `float` (in mm) | Altezza. |
value | `integer` | Valore dell'elemento. |
mode | `integer` | Aspetto del segnalino. (`0` per quadrato, `1` per arrotondato, `2` per rotondo) |
frame | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Cornice](#struttura-cornice) | Blocco di sfondo. |
image | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Immagine di sfondo. |
label | [Testo](#struttura-testo) | Etichetta testuale del segnalino. |
labelText | [Testo](#struttura-testo) | Testo da mostrare sul segnalino. |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
isTransparent | `boolean` | Se `TRUE`, è possibile vedere ciò che si trova sotto l'elemento. |
flipImage | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Immagine di sfondo del retro del segnalino. |
flipBackgroundColor | [Colore](#struttura-colore) | Colore del retro del segnalino. |
flipLabelText | [Testo](#struttura-testo) | Testo da mostrare sul retro segnalino. |
flipValue | `integer` | Valore dell'elemento mostra il suo retro. |
isRotating | `boolean` | Se `TRUE`, il segnalino più essere ruotato. |
isFlippable | `boolean` | Se `TRUE`, l'elemento può essere girato sull'altro lato. |
isSpinnable | `boolean` | Se `TRUE`, l'elemento può essere ruotato casualmente verso una direzione. |
isCut | `boolean` | Se `TRUE`, il segnalino è un ritaglio generato da un elemento forbice. |
contentRotations |  | Stabilisce le rotazioni possibili. Se specificato, l'elemento non cambierà dimensione quando verrà ruotato e l'attributo `rotation` si riferirà all'elemento di questa lista. |
&nbsp;&nbsp;&nbsp;contentRotations[].label | [Testo](#struttura-testo) | Etichetta testuale della rotazione. |
&nbsp;&nbsp;&nbsp;contentRotations[].icon | [Risorsa URL](#struttura-risorsa-url) o [Risorsa Canvas](#struttura-canvas) o [Risorsa SVG](#struttura-svg) | Icona da mostrare nel menù. |
&nbsp;&nbsp;&nbsp;contentRotations[].angle | `float` (in radianti) | Angolo della rotazione. |

### Vassoio standard

Un'area trasparente che aiuta a muovere, sommare e tirare più elementi. Agitalo per tirare tutti gli elementi sopra di esso.

#### Identificativi del tipo

 * `"tray"`

#### Tag assegnati di default

 * `"type:tray"`

#### Eventi disponibili per le macro

 * `shuffle`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
mode | `integer` | Modalità di funzionamento del vassoio. (`-1` per nessuno, `0` per solo somma, `1` per somma/sottrazione) |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
messages |  | Messaggi del vassoio. |
&nbsp;&nbsp;&nbsp;messages.shake | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione del menù da mostrare per agitare il vassoio. |

### Mescola-mazzi

Un vassoio che manipola segnalini o ritagli come un mazzo di carte.

#### Identificativi del tipo

 * `"tray-cardshuffler"`

#### Tag assegnati di default

 * `"type:tray"`

#### Eventi disponibili per le macro

 * `shuffle`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
width | `float` (in mm) | Larghezza. |
height | `float` (in mm) | Altezza. |
messages |  | Messaggi del vassoio. |
&nbsp;&nbsp;&nbsp;messages.shake | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione del menù da mostrare per agitare il vassoio. |
label | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Etichetta](#struttura-etichetta-di-testo) | Etichetta testuale del vassoio. |
labelText | [Testo](#struttura-testo) | Testo da mostrare sul vassoio. |
image | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Immagine di sfondo. |

### Vassoio personalizzato

Un'area trasparente che aiuta a muovere, sommare e tirare più elementi. Agitalo per tirare tutti gli elementi sopra di esso. (Versione personalizzabile)

#### Identificativi del tipo

 * `"tray-custom"`

#### Tag assegnati di default

 * `"type:tray"`

#### Eventi disponibili per le macro

 * `shuffle`

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
tags | `[` `string` `,` `string` `,` ... `]` | Lista di tag con il quale può essere identificato dagli altri elementi. |
zIndexGroup | `integer` | Gruppo di profondità. L'utente non potrà spostare gli elementi con un valore inferiore sopra quelli con valore superiore. (Default: `0`) |
fence | [Area](#struttura-area) | Impedisce all'elemento di muoversi al di fuori dell'area specificata. |
snapTo |  | Stabilisce le regole di posizionamento da seguire quando l'elemento viene spostato. |
&nbsp;&nbsp;&nbsp;snapTo[].tags | `[` `string` `,` `string` `,` ... `]` | Allinea l'elemento agli elementi con i tag specificati. |
&nbsp;&nbsp;&nbsp;snapTo[].grid | [Griglia](#struttura-griglia) | Allinea l'elemento a una griglia. |
doNotFrame | `boolean` | Se `TRUE`, esclude l'elemento quando il tavolo viene inquadrato per intero. |
onResetMacro | [Macro](#struttura-macro) | Macro da eseguire quando il tavolo viene creato o resettato. |
onDropMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene spostato. |
onSelectMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene selezionato. |
onShakeMacro | [Macro](#struttura-macro) | Esegue una macro quando viene agitato. |
onClickMacro | [Macro](#struttura-macro) | Macro da eseguire quando l'elemento viene cliccato. |
onMenuMacros | `[` [Opzione macro](#struttura-opzione-macro) `,` [Opzione macro](#struttura-opzione-macro) `,` ... `]` | Se l'elemento supporta il menù contestuale, mostra delle opzioni aggiuntive che permettono di eseguire una macro. |
isVariableZIndex | `boolean` | Se `TRUE`, viene portato in primo piano quando viene selezionato. |
isDragTopSurfaces | `boolean` | Se `TRUE`, anche gli elementi soprastanti verranno spostati quando l'elemento viene spostato. |
isDraggable | `boolean` | Se `TRUE`, può essere spostato trascinandolo. |
icon | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Icona da mostrare sull'elemento. |
width | `float` (in mm) | Larghezza. |
height | `float` (in mm) | Altezza. |
label | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Etichetta](#struttura-etichetta-di-testo) | Etichetta testuale del vassoio. |
labelText | [Testo](#struttura-testo) | Testo da mostrare sul vassoio. |
frame | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Cornice](#struttura-cornice) | Blocco di sfondo. |
mode | `integer` | Modalità di funzionamento del vassoio. (`-1` per nessuno, `0` per solo somma, `1` per somma/sottrazione) |
backgroundColor | [Colore](#struttura-colore) | Colore base dell'elemento. |
splitPosition | `float` (0-1) | Rapporto di larghezza tra l'area di somma e quella di sottrazione. |
countValues | `integer` | Conta il numero di elementi sul vassoio con il valore specificato al posto di sommarne il valore. |
sumLabel | [Etichetta](#struttura-etichetta-di-testo) | Etichetta testuale del valore della somma applicato al blocco di sfondo. (solo per solo somma) |
leftLabel | [Etichetta](#struttura-etichetta-di-testo) | Etichetta testuale dei valori da sommare. (solo per somma/sottrazione) |
rightLabel | ([Cornice](#struttura-cornice) + [Etichetta](#struttura-etichetta-di-testo)) | Etichetta testuale dei valori da sottrarre. (solo per somma/sottrazione) |
bottomLabel | [Etichetta](#struttura-etichetta-di-testo) | Etichetta testuale del risultato del calcolo. (solo per somma/sottrazione) |
messages |  | Messaggi del vassoio. |
&nbsp;&nbsp;&nbsp;messages.shake | `FALSE` per nasconderla o [Opzione](#struttura-opzione-menu) | Opzione del menù da mostrare per agitare il vassoio. |
image | `FALSE` per nasconderla, `TRUE` per usare i valori di default o [Immagine](#struttura-immagine) | Immagine di sfondo. |

## Strutture

Alcuni elementi possono fare uso di strutture complesse e condivise per descrivere i propri attributi. Nei descrittori JSON di Notoner sono rappresentate come semplici sotto-strutture JSON:

```
{
	(Nome dell'attributo): (Valore dell'attributo),
	...
}
```


### Struttura testo

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
EN | `string` | Testo in inglese. (Utilizzato come impostazione predefinita se manca la traduzione nella lingua selezionata dall'utente) |
IT | `string` | Testo in italiano. |

### Struttura URL tradotto

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
EN | [Risorsa URL](#struttura-risorsa-url) | URL in inglese. (Utilizzata come impostazione predefinita se manca la risorsa tradotta nella lingua selezionata dall'utente) |
IT | [Risorsa URL](#struttura-risorsa-url) | URL in italiano. |

### Struttura area

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
width | `float` (in mm) | Larghezza. |
height | `float` (in mm) | Altezza. |

### Struttura griglia

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
x | `float` | Posizione orizzontale dell'origine della griglia. |
y | `float` | Posizione verticale dell'origine della griglia. |
width | `float` | Larghezza delle celle della griglia. |
height | `float` | Altezza delle celle della griglia. |
tiltColumns | `[` `float` (in mm) `,` `float` (in mm) `,` ... `]` | Scostamento delle colonne in base alla riga corrispondente. Permette di allineare alcune figure non rettangolari come gli esagoni. |
tiltRows | `[` `float` (in mm) `,` `float` (in mm) `,` ... `]` | Scostamento delle righe in base alla colonna corrispondente. Permette di allineare alcune figure non rettangolari come gli esagoni. |

### Struttura macro

Una macro è descritta da un array di oggetti, dove ogni oggetto descrive una o più azioni da compiere su un set di elementi.

Se una macro è composta da una sola riga è possibile omettere l'array e specificare il singolo oggetto che descrive l'azione. Ad esempio, la macro `[ { "forEach": { "setSide": true } } ]` contiene una sola operazione, per cui può essere abbreviata con `{ "forEach": { "setSide": true } }`.

Larga parte dei valori specificabili in una macro, come quelli booleani, numerici o elementi, possono essere sostituiti invece da un [getter macro](#struttura-getter-macro).

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
getElementsByTag | `[` `string` `,` `string` `,` ... `]` | Seleziona tutti gli elementi sul tavolo con i tag specificati. Se non specificato, usa l'elemento corrente o la selezione di elementi della riga precedente. |
getRest | `boolean` | Se `TRUE`, seleziona tutti gli elementi scartati dalla clausola `on` della riga precedente della macro. |
onElements |  | Seleziona un sottoinsieme di elementi da considerare in questa riga della macro. Tutte le clausole sono valutate in `AND`. |
&nbsp;&nbsp;&nbsp;onElements.self | `boolean` | Se `TRUE`, aggiunge l'elemento corrente agli elementi da considerare. |
&nbsp;&nbsp;&nbsp;onElements.if | [Condizione macro](#struttura-condizione-macro) | Stabilisce se l'elemento deve essere selezionato. |
&nbsp;&nbsp;&nbsp;onElements.pickRandom | `integer` | Seleziona un sottoinsieme casuale tra gli elementi selezionati. |
if | [Condizione macro](#struttura-condizione-macro) | Stabilisce se le istruzioni `execute`, `forEach`, `do` e `onRestDo` dovranno essere eseguite. |
times | `integer` | Esegue le istruzioni `execute`, `forEach`, `do` e `onRestDo` il numero specificato di volte. Se non specificato, `1`. |
set | `{` Nome variabile `:` Valore variabile `,` Nome variabile `:` Valore variabile... `}` | Assegna dei valori a diverse variabili. |
execute |  | Effettua un'azione sull'interfaccia. |
&nbsp;&nbsp;&nbsp;execute.setTool |  | Imposta lo strumento selezionato. |
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;execute.setTool.id | `string` | Tipo dell strumento. (`"pencil"` per la matita, `"eraser"` per la gomma) |
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;execute.setTool.config | `string` | Configurazione strumento. (per la matita: `"blue"`, `"green"`, `"red"`, `"yellow"`, `"cyan"`, `"purple"` o `"black"`. Per la gomma: `"small"`, `"medium"` o `"large"`) |
forEach |  | Effettua una serie di operazioni sugli elementi selezionati. |
&nbsp;&nbsp;&nbsp;forEach.shuffleZIndex | `boolean` | Se `TRUE`, mescola la posizione in profondità degli elementi, similmente a come si mescola un mazzo di carte. |
&nbsp;&nbsp;&nbsp;forEach.invertZIndex | `boolean` | Se `TRUE`, inverte la posizione in profondità degli elementi, similmente a come si gira un mazzo di carte sottosopra. |
&nbsp;&nbsp;&nbsp;forEach.shufflePosition | `boolean` | Se `TRUE`, mescola la posizione orizzontale e verticale degli elementi. |
&nbsp;&nbsp;&nbsp;forEach.select | `boolean` | Se `TRUE`, aggiunge gli elementi alla selezione corrente. |
&nbsp;&nbsp;&nbsp;forEach.toss | `boolean` | Se supportato e `TRUE`, lancia l'elemento come fosse una moneta. |
&nbsp;&nbsp;&nbsp;forEach.launch | `boolean` | Se supportato e `TRUE`, lancia l'elemento. |
&nbsp;&nbsp;&nbsp;forEach.roll | `boolean` | Se supportato e `TRUE`, fa rotolare l'elemento. |
&nbsp;&nbsp;&nbsp;forEach.flip | `boolean` | Se supportato e `TRUE`, gira l'elemento sottosopra. |
&nbsp;&nbsp;&nbsp;forEach.reset | `boolean` | Se supportato e `TRUE`, ripristina l'elemento. |
&nbsp;&nbsp;&nbsp;forEach.toggle | `boolean` | Se supportato e `TRUE`, inverte lo stato dell'elemento. |
&nbsp;&nbsp;&nbsp;forEach.stop | `boolean` | Se supportato e `TRUE`, ferma l'elemento. |
&nbsp;&nbsp;&nbsp;forEach.start | `boolean` | Se supportato e `TRUE`, avvia l'elemento. |
&nbsp;&nbsp;&nbsp;forEach.shuffle | `boolean` | Se supportato e `TRUE`, avvia l'animazione di mescolamento dell'elemento. |
&nbsp;&nbsp;&nbsp;forEach.spin | `boolean` | Se supportato e `TRUE`, l'elemento viene girato con un orientamento casuale. |
&nbsp;&nbsp;&nbsp;forEach.shake | `boolean` | Se supportato e `TRUE`, agita l'elemento. |
&nbsp;&nbsp;&nbsp;forEach.stopAnimation | `boolean` | Se `TRUE`, arresta l'animazione corrente. |
&nbsp;&nbsp;&nbsp;forEach.setSide | `boolean` o `integer` | Se supportato, imposta la faccia sul quale l'elemento è girato. (`FALSE` per fronte, `TRUE` per retro o un numero a partire da `0` per l'indice della faccia di un dado) |
&nbsp;&nbsp;&nbsp;forEach.setLastVector | [Vettore](#struttura-vettore) | Se supportato, imposta il vettore verso il punto di obiettivo dell'elemento. |
&nbsp;&nbsp;&nbsp;forEach.setLastPoint | [Punto](#struttura-posizione-di-un-punto) | Se supportato, imposta le coordinate sul tavolo della punto obiettivo. |
&nbsp;&nbsp;&nbsp;forEach.setLastStep | `integer` | Se supportato, imposta il passaggio per la prossima traccia. |
&nbsp;&nbsp;&nbsp;forEach.setLastArea | [Area](#struttura-area) | Se supportato, l'area selezionata. |
&nbsp;&nbsp;&nbsp;forEach.setRotation | `integer` | Se supportato, imposta la rotazione dell'elemento. (`0` per dritto, `1` per destra, `2` per sottosopra, `3` per sinistra) |
&nbsp;&nbsp;&nbsp;forEach.setValue | `float` | Se supportato, imposta il valore dell'elemento. |
&nbsp;&nbsp;&nbsp;forEach.sumValue | `float` | Se supportato, somma il valore a quello dell'elemento. |
&nbsp;&nbsp;&nbsp;forEach.subtractValue | `float` | Se supportato, sottrae il valore a quello dell'elemento. |
&nbsp;&nbsp;&nbsp;forEach.paint | `boolean` | Se supportato e `TRUE`, disegna con l'elemento. |
&nbsp;&nbsp;&nbsp;forEach.moveOnTop | `boolean` | Se `TRUE`, sposta gli elementi in cima. |
&nbsp;&nbsp;&nbsp;forEach.moveToTable | [Pila](#struttura-pila) | Sposta gli elementi in una determinata posizione assoluta sul tavolo. |
&nbsp;&nbsp;&nbsp;forEach.moveIntoTable | [Area](#struttura-area) | Sposta l'elemento in una posizione casuale all'interno di determinata area assoluta sul tavolo. |
&nbsp;&nbsp;&nbsp;forEach.moveTo | [Pila](#struttura-pila) | Sposta gli elementi in una determinata posizione relativa. |
&nbsp;&nbsp;&nbsp;forEach.moveInto | [Area](#struttura-area) | Sposta l'elemento in una posizione casuale all'interno di determinata area relativa. |
&nbsp;&nbsp;&nbsp;forEach.moveBy |  | Sposta l'elemento orizzontalmente e verticalmente di una misura data. |
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;forEach.moveBy.x | `float` (in mm) | Posizione orizzontale. |
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;forEach.moveBy.y | `float` (in mm) | Posizione verticale. |
&nbsp;&nbsp;&nbsp;forEach.do | [Macro](#struttura-macro) | Esegue una nuova macro selezionando ogni elemento. |
do | [Macro](#struttura-macro) | Esegue una sotto-macro considerando gli elementi selezionati. |
onRestDo | [Macro](#struttura-macro) | Esegue una sotto-macro considerando gli elementi scartati dalla clausola `on`. |
break | `boolean` | Se `TRUE`, interrompe l'esecuzione dalla sotto-macro corrente. |
else | [Macro](#struttura-macro) | Macro da eseguire se la condizione `if` non è verificata. |

### Struttura opzione macro

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
if | [Condizione macro](#struttura-condizione-macro) | Stabilisce se l'opzione deve essere mostrata. |
title | [Testo](#struttura-testo) | Etichetta dell'opzione. |
icon | [Risorsa URL](#struttura-risorsa-url) o [Risorsa Canvas](#struttura-canvas) o [Risorsa SVG](#struttura-svg) | Icona dell'opzione. |
macro | [Macro](#struttura-macro) | Macro da eseguire alla selezione. |

### Struttura immagine

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
width | `float` (in mm) | Larghezza. |
height | `float` (in mm) | Altezza. |
opacity | `float` (0-1) | Opacità. (`1` per completamente visibile, `0` per invisibile) |
padding | `float` (in mm) | Spaziatura tra il contenuto e il bordo. |
borderRadius | `float` (in mm) | Arrotondamento del bordo. |
baseColor | [Colore](#struttura-colore) | Colore da usare al posto del `baseColor` specificato nei metadati di `image`. |
image | [Risorsa URL](#struttura-risorsa-url) o [Risorsa Canvas](#struttura-canvas) o [Risorsa SVG](#struttura-svg) | Immagine. |

### Struttura colore

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
r | `integer` (0-255) | Valore del rosso. |
g | `integer` (0-255) | Valore del verde. |
b | `integer` (0-255) | Valore del blu. |
a | `float` (0-1) | Opacità del colore. (`1` per opaco, `0` per invisibile) |

### Struttura opzione menu

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
title | [Testo](#struttura-testo) | Etichetta dell'opzione. |
icon | [Risorsa URL](#struttura-risorsa-url) o [Risorsa Canvas](#struttura-canvas) o [Risorsa SVG](#struttura-svg) | Icona dell'opzione. |

### Struttura messaggio popup

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
title | [Testo](#struttura-testo) | Testo del messaggio. |

### Struttura cornice

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
width | `float` (in mm) | Larghezza. |
height | `float` (in mm) | Altezza. |
opacity | `float` (0-1) | Opacità. (`1` per completamente visibile, `0` per invisibile) |
padding | `float` (in mm) | Spaziatura tra il contenuto e il bordo. |
borderRadius | `float` (in mm) | Arrotondamento del bordo. |
right | `float` (in mm) | Distanza dal bordo destro. |
bottom | `float` (in mm) | Distanza dal bordo inferiore. |
borderSize | `float` (in mm) | Dimensione del bordo. |
backgroundColor | [Colore](#struttura-colore) | Colore dello sfondo. |
boxShadow |  | Ombreggiatura. |
&nbsp;&nbsp;&nbsp;boxShadow.x | `float` (in mm) | Scostamento orizzontale dell'ombra. |
&nbsp;&nbsp;&nbsp;boxShadow.y | `float` (in mm) | Scostamento verticale dell'ombra. |
&nbsp;&nbsp;&nbsp;boxShadow.size | `float` (in mm) | Diffusione dell'ombra. |
&nbsp;&nbsp;&nbsp;boxShadow.color | [Colore](#struttura-colore) | Colore dell'ombra. |
&nbsp;&nbsp;&nbsp;boxShadow.type | `string` | Tipo di ombra. (`"inset"` o non specificato) |

### Struttura etichetta di testo

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
width | `float` (in mm) | Larghezza. |
height | `float` (in mm) | Altezza. |
opacity | `float` (0-1) | Opacità. (`1` per completamente visibile, `0` per invisibile) |
padding | `float` (in mm) | Spaziatura tra il contenuto e il bordo. |
borderRadius | `float` (in mm) | Arrotondamento del bordo. |
lineHeight | `float` (in mm) | Altezza della linea. |
strokeWidth | `float` (in mm) | Dimensione del bordo del testo. |
strokeColor | [Colore](#struttura-colore) | Colore del bordo del testo. |
textColor | [Colore](#struttura-colore) | Colore del testo. |
fontSize | `float` (in mm) | Dimensione del testo. |
fontFamily | `string` | Font da usare per il testo. |
fontWeight | `string` | Spessore del testo. |
textAlign | `"auto"` o `"left"` o `"right"` o `"center"` | Allineamento del testo. |
whiteSpace | `"normal"` o "`nowrap"` | Controlla come devono essere gestiti gli spazi. |
overflow | `"visible"` o "`hidden"` | Controlla come deve comportarsi se il contenuto è troppo grande per entrare nell'area. |

### Struttura posizione di un punto

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |

### Struttura bottone contatore

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
frame | ([Cornice](#struttura-cornice) + [Etichetta](#struttura-etichetta-di-testo)) | Aspetto del bottone. |
frameText | [Testo](#struttura-testo) | Testo del bottone. |
onSelect | [Azione](#struttura-azione-bottone-contatore) | Azione del bottone. |

### Struttura bottone nel menù del contatore

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
title | [Testo](#struttura-testo) | Etichetta dell'opzione. |
icon | [Risorsa URL](#struttura-risorsa-url) o [Risorsa Canvas](#struttura-canvas) o [Risorsa SVG](#struttura-svg) | Icona dell'opzione. |
onSelect | [Azione](#struttura-azione-bottone-contatore) | Azione del bottone. |

### Struttura risorsa URL

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
isResource | `TRUE` | Stabilisce che l'oggetto rappresenta una risorsa. |
type | `"url"` | Tipo della risorsa. |
url | `string` | URL della risorsa. Se inizia per `/` (ad es. `"/images/elements/dice-default.svg"`) si riferisce directory principale di Notoner. Nei file template, i percorsi relativi (ad es. `"sheets/sheet-1-EN.svg"`) si riferiscono alla directory del template. |
meta | [Metadata](#struttura-metadata-risorse) | Metadati della risorsa. |

### Struttura canvas

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
isResource | `TRUE` | Stabilisce che l'oggetto rappresenta una risorsa. |
type | `"canvas"` | Tipo della risorsa. |
file | `string` | Nome del file immagine all'interno del pacchetto. Il percorso è sempre relativo (ad es. `"sheet-1-EN.svg"`) e si riferisce alla radice del pacchetto. |
meta | [Metadata](#struttura-metadata-risorse) | Metadati della risorsa. |

### Struttura SVG

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
isResource | `TRUE` | Stabilisce che l'oggetto rappresenta una risorsa. |
type | `"svg"` | Tipo della risorsa. |
file | `string` | Nome del file immagine all'interno del pacchetto. |
meta | [Metadata](#struttura-metadata-risorse) | Metadati della risorsa. |

### Struttura vettore

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
angle | `float` (in radianti) | Angolo dal punto obiettivo. |
length | `float` (in mm) | Distanza dal punto obiettivo. |

### Struttura opzione area

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
title | [Testo](#struttura-testo) | Etichetta dell'opzione. |
icon | [Risorsa URL](#struttura-risorsa-url) o [Risorsa Canvas](#struttura-canvas) o [Risorsa SVG](#struttura-svg) | Icona dell'opzione. |
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
width | `float` (in mm) | Larghezza. |
height | `float` (in mm) | Altezza. |

### Struttura risorsa tradotta

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
EN | [Risorsa URL](#struttura-risorsa-url) o [Risorsa Canvas](#struttura-canvas) o [Risorsa SVG](#struttura-svg) | Risorsa in inglese. (Utilizzata come impostazione predefinita se manca la risorsa tradotta nella lingua selezionata dall'utente) |
IT | [Risorsa URL](#struttura-risorsa-url) o [Risorsa Canvas](#struttura-canvas) o [Risorsa SVG](#struttura-svg) | Risorsa in italiano. |

### Struttura condizione macro

Una condizione macro è descritta da un array di oggetti, dove ogni oggetto descrive una o più sotto-condizioni. La condizione macro risulterà vera se tutte le condizioni e sotto-condizioni sono verificate.

Se una condizione macro è composta da una sola riga è possibile omettere l'array e specificare il singolo oggetto che descrive la condizione. Ad esempio, la condizione macro `[ { "isCollidingWith": { "get": [ "elementByTag", "deck" ] } } ]` contiene una sola condizione, per cui può essere abbreviata con `{ "isCollidingWith": { "get": [ "elementByTag", "deck" ] } }`.

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
value | [Getter macro](#struttura-getter-macro) | Stabilisce il valore da verificare. Se non specificato considera l'elemento corrente. |
isValued | `boolean` | Se `TRUE`, valuta se il valore da verificare è _true-ish_. |
isNotValued | `boolean` | Se `TRUE`, valuta se il valore da verificare è _false-ish_. |
isEqualTo | Qualsiasi | Valuta se il valore da verificare è uguale al valore specificato. |
isNotEqualTo | Qualsiasi | Valuta se il valore da verificare non è uguale al valore specificato. |
isSameTo | Qualsiasi | Valuta se il valore da verificare è identico al valore specificato. Utile per verificare l'identità di un elemento. |
isNotSameTo | Qualsiasi | Valuta se il valore da verificare non è identico al valore specificato. Utile per verificare l'identità di un elemento. |
isGreaterThan | Qualsiasi | Valuta se il valore da verificare è più grande al valore specificato. |
isGreaterEqualThan | Qualsiasi | Valuta se il valore da verificare è più grande o uguale al valore specificato. |
isLessThan | Qualsiasi | Valuta se il valore da verificare è più piccolo al valore specificato. |
isLessEqualThan | Qualsiasi | Valuta se il valore da verificare è più piccolo o uguale al valore specificato. |
isCollidingWith | Qualsiasi | Valuta se il valore da verificare è un elemento che collide con l'elemento specificato. |
isNotCollidingWith | Qualsiasi | Valuta se il valore da verificare è un elemento che non collide con l'elemento specificato. |
isOver | Qualsiasi | Valuta se il valore da verificare è un elemento che si trova più in primo piano rispetto all'elemento specificato. |
isNotOver | Qualsiasi | Valuta se il valore da verificare è un elemento che si trova meno in primo piano rispetto all'elemento specificato. |
isCovering | Qualsiasi | Valuta se il valore da verificare è un elemento copre parzialmente o completamente l'elemento specificato. |
isNotCovering | Qualsiasi | Valuta se il valore da verificare è un elemento non copre parzialmente o completamente l'elemento specificato. |
isCoveredBy | Qualsiasi | Valuta se il valore da verificare è un elemento è coperto parzialmente o completamente dall'elemento specificato. |
isNotCoveredBy | Qualsiasi | Valuta se il valore da verificare è un elemento non è coperto parzialmente o completamente dall'elemento specificato. |
hasTag | `[` `string` `,` `string` `,` ... `]` | Valuta se il valore da verificare è un elemento con uno dei tag specificati. |
hasNotTag | `[` `string` `,` `string` `,` ... `]` | Valuta se il valore da verificare è un elemento con nessuno dei tag specificati. |
isSelected | `boolean` | Se `TRUE`, valuta se il valore da verificare è un elemento evidenziato. |
isNotSelected | `boolean` | Se `TRUE`, valuta se il valore da verificare non è un elemento evidenziato. |
not | `boolean` | Se `TRUE`, restituisce il risultato opposto alle condizioni valutate. |

### Struttura pila

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
x | `float` (in mm) | Posizione orizzontale. |
y | `float` (in mm) | Posizione verticale. |
gapX | `float` (in mm) | Specifica la distanza orizzontale tra un elemento e il successivo. |
gapY | `float` (in mm) | Specifica la distanza verticale tra un elemento e il successivo. |

### Struttura azione bottone contatore

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
sumValue | `float` | Somma il valore specificato al valore del contatore. |
subtractValue | `float` | Sottrae il valore specificato al valore del contatore. |
setValue | `float` | Imposta il valore del contatore. |
macro | [Macro](#struttura-macro) | Macro da eseguire alla selezione. |

### Struttura metadata risorse

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
sprite |  | Definisce come usare la risorsa come uno sprite. |
&nbsp;&nbsp;&nbsp;sprite.width | `integer` | Larghezza del fotogramma dello sprite. |
&nbsp;&nbsp;&nbsp;sprite.height | `integer` | Altezza del fotogramma dello sprite. |
&nbsp;&nbsp;&nbsp;sprite.gapX | `integer` | Distanza orizzontale tra un fotogramma e l'altro dello sprite. |
&nbsp;&nbsp;&nbsp;sprite.frame | `integer` | Indice del fotogramma dello sprite da utilizzare. |
crop |  | Definisce il ritaglio dell'immagine da utilizzare. |
&nbsp;&nbsp;&nbsp;crop.x | `float` | Posizione orizzontale del ritaglio dell'immagine. |
&nbsp;&nbsp;&nbsp;crop.y | `float` | Posizione verticale del ritaglio dell'immagine. |
&nbsp;&nbsp;&nbsp;crop.width | `float` | Larghezza del ritaglio dell'immagine. |
&nbsp;&nbsp;&nbsp;crop.height | `float` | Altezza del ritaglio dell'immagine. |
&nbsp;&nbsp;&nbsp;crop.imageWidth | `integer` | Larghezza dell'immagine intera. Obbligatorio per le immagini in formato SVG. |
&nbsp;&nbsp;&nbsp;crop.imageHeight | `integer` | Altezza dell'immagine intera. Obbligatorio per le immagini in formato SVG. |
svg |  | Definisce gli attributi speciali per i file SVG. |
&nbsp;&nbsp;&nbsp;svg.baseColor | `string` | Stringa da sostituire con l'attributo `baseColor` quando la risorsa viene generata da una [Immagine](#struttura-immagine). |

### Struttura getter macro

Larga parte dei valori specificabili in una macro, come quelli booleani, numerici o elementi, possono essere sostituiti da un _getter macro_.

Un getter macro è un oggetto che descrive una procedura per ottenere il valore che sostituisce. Ad esempio, è possibile usare il macro getter `{ "get": "element.x" }` per ottenere il valore di posizione orizzontale dell'elemento corrente.

#### Attributi

Nome | Tipo | Descrizione |
--- | --- | --- | 
get | `[` Qualsiasi `,` Qualsiasi `,` ... `]` | Esegue una catena di operazioni separati da `.` per ottenere un valore. |
&nbsp; | `"elementsByTag"`, `string` o `[` `string` `,` `string` `,` ... `]` | Restituisce gli elementi aventi il tag o i tag specificati. |
&nbsp; | `"elementByTag"`, `string` o `[` `string` `,` `string` `,` ... `]` | Restituisce un singolo elemento avente il tag o i tag specificati. |
&nbsp; | `"variable"`, `string` | Restituisce il valore di una variabile. La variabile `self` si riferisce all'elemento che ha lanciato la macro. |
&nbsp; | `"rest"` | Restituisce tutti gli elementi scartati dalla clausola `on` della riga precedente della macro. |
&nbsp; | `"elements"` | Restituisce gli elementi considerati dalla riga corrente della macro. |
&nbsp; | `"element"` | Restituisce l'elemento corrente. |
&nbsp; | `"count"` | Restituisce il numero di elementi attualmente selezionati. |
&nbsp; | `"first"` | Restituisce il primo elemento tra quelli selezionati. |
&nbsp; | `"last"` | Restituisce l'ultimo elemento tra quelli selezionati. |
&nbsp; | `string` | Restituisce il valore dell'attributo specificato dell'elemento selezionato. |
variable | `string` | Restituisce il valore di una variabile. La variabile `self` si riferisce all'elemento che ha lanciato la macro. |
self | `boolean` | Restituisce l'elemento che ha lanciato la macro. |
random |  | Restituisce un valore casuale. |
&nbsp;&nbsp;&nbsp;random.value | `[` Qualsiasi `,` Qualsiasi `,` ... `]` | Restituisce un valore casuale tra quelli specificati. |
&nbsp;&nbsp;&nbsp;random.number |  | Restituisce un numero casuale. |
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;random.number.from | `float` | Stabilisce il numero più basso. (incluso) Se non specificato, `0`. |
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;random.number.to | `float` | Stabilisce il numero più alto. (escluso) Se non specificato, `0`. |
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;random.number.step | `float` | Stabilisce il passo da usare. Se non specificato, `1`. |
sum | `[` Qualsiasi `,` Qualsiasi `,` ... `]` | Restituisce la somma dei valori specificati. |
subtract | `[` Qualsiasi `,` Qualsiasi `,` ... `]` | Restituisce la sottrazione dei valori specificati. |
multiply | `[` Qualsiasi `,` Qualsiasi `,` ... `]` | Restituisce la moltiplicazione tra i valori specificati. |
divide | `[` Qualsiasi `,` Qualsiasi `,` ... `]` | Restituisce la divisione tra i valori specificati. |

