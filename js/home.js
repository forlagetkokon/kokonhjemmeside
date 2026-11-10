// Henter og viser den fremhævede udgivelse fra den lokale JSON-fil på forsiden.
import { hentUdgivelser } from "./udgivelser-data.js";

const udgivelsesfelt = document.querySelector("[data-featured-publication]");

// Gør tekst fra JSON-filen sikker at sætte ind i HTML.
function beskytHtml(vaerdi) {
  return String(vaerdi ?? "").replace(/[&<>'"]/g, (tegn) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[tegn]);
}

async function visFremhaevetUdgivelse() {
  try {
    const udgivelser = await hentUdgivelser();
    const udgivelse = udgivelser.find((bog) => bog.fremhaevet) ?? udgivelser[0];
    if (!udgivelse) {
      udgivelsesfelt.innerHTML = '<p class="statusbesked" role="status">Der er endnu ingen fremhævet udgivelse.</p>';
      return;
    }
    const forside = udgivelse.forside ?? {};
    udgivelsesfelt.innerHTML = `
      <div class="fremhaevet-layout">
        <div class="fremhaevet-billede">
          <img src="${beskytHtml(forside.sti)}" alt="${beskytHtml(forside.alt)}" width="600" height="760" loading="lazy">
        </div>
        <div class="lodret-indhold">
          <p class="overlinje">Fremhævet udgivelse</p>
          <h2>${beskytHtml(udgivelse.titel)}</h2>
          <p class="bogforfatter">${beskytHtml(udgivelse.forfatter)}</p>
          <p class="indledning">${beskytHtml(udgivelse.kort_beskrivelse)}</p>
          <a class="knap" href="./udgivelse.html?slug=${encodeURIComponent(udgivelse.slug)}">Læs om udgivelsen</a>
        </div>
      </div>`;
  } catch (error) {
    udgivelsesfelt.innerHTML = `<p class="statusbesked" role="status">${beskytHtml(error.message)}</p>`;
  }
}

if (udgivelsesfelt) visFremhaevetUdgivelse();
