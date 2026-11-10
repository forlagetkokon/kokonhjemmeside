## Guide - hvordan siden virker 

Hvis du skal tilføje eller ændre en bog, kan du gøre det således:
1. Upload eller slet ønskede webp billeder under stien `assets/images/udgivelser/INDSÆT BOG-SLUG HER/`.
2. Åbn `data/udgivelser.json`, kopiér et eksisterende bog-objekt og ret indholdet.
     
### Felter
- `slug`: Bogens korte, unikke adresse, fx "uegnet-som-menneske".
- `synlig`: Sæt til true for at vise bogen eller false for at skjule den midlertidigt.
- `sortering`: Bestemmer bogens placering i oversigten.
- `fremhaevet`: Sæt kun én bog til true, hvis den skal vises på forside på hjemmesiden.
- `titel, forfatter, kort_beskrivelse og beskrivelse`: Bogens tekster.
- `forside`: Skal bruges til bogens forside (husk alt-tekst og brug en sti som `./assets/images/udgivelser/min-nye-bog/min-nye-bog-front.webp`).
- `galleri`: Ekstra billeder. Hvert billede skal have en sti med samme format og en alt-tekst.
- `forfatter_beskrivelse`: Er valgfri og vises kun, når den har tekst.
Bogfakta som ISBN og sidetal vises som “Afventer oplysninger”, når værdien mangler eller er `null`.

### Vigtigt når JSON-filen redigeres
- Brug dobbelte citationstegn omkring tekst.
- Sæt komma mellem felter og bog-objekter, men aldrig efter den sidste.
- Skriv alt-tekst til hvert billede.
