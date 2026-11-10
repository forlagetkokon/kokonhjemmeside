// Henter bogdata fra den lokale JSON-fil, så nye udgivelser ikke kræver ændringer i JavaScript.

const dataSti = "./data/udgivelser.json";

// Brug JSON-filens valgte rækkefølge. `sortering` gør det muligt at flytte en bog uden at flytte hele objektet.
function sorterUdgivelser(foerste, anden) {
  const foersteTal = Number(foerste.sortering ?? 0);
  const andetTal = Number(anden.sortering ?? 0);
  return foersteTal - andetTal || String(foerste.titel).localeCompare(String(anden.titel), "da");
}

// Returnerer kun synlige bøger. Sæt `synlig` til false i JSON, mens en bog stadig er under arbejde.
export async function hentUdgivelser() {
  let svar;

  try {
    // `no-store` gør en genindlæsning mere tilbøjelig til at vise en netop uploadet JSON-fil.
    svar = await fetch(dataSti, { cache: "no-store" });
  } catch {
    throw new Error("Udgivelserne kunne ikke hentes. Prøv igen senere.");
  }

  if (!svar.ok) throw new Error("Udgivelserne kunne ikke hentes. Prøv igen senere.");

  let data;
  try {
    data = await svar.json();
  } catch {
    throw new Error("Udgivelserne kunne ikke læses. Kontrollér datafilen.");
  }

  if (!Array.isArray(data.udgivelser)) {
    throw new Error("Udgivelserne kunne ikke læses. Kontrollér datafilen.");
  }

  return data.udgivelser
    .filter((udgivelse) => udgivelse && udgivelse.synlig !== false)
    .sort(sorterUdgivelser);
}
