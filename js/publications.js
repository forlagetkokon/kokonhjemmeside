// Henter udgivelser fra den lokale JSON-fil og bygger bogkortene på oversigten.
import { hentUdgivelser } from "./udgivelser-data.js";

const udgivelsesfelt = document.querySelector("[data-publications]");

// Gør tekst fra JSON-filen sikker at sætte ind i HTML.
function beskytHtml(vaerdi) {
  return String(vaerdi ?? "").replace(/[&<>'"]/g, (tegn) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[tegn]);
}

function udgivelsesUrl(slug) {
  return `/udgivelse.html?slug=${encodeURIComponent(slug)}`;
}

// Forkorter den fulde bogbeskrivelse til en kort tekst på oversigtskortet.
function lavKortTekst(beskrivelse, maksOrd = 22) {
  const ord = String(beskrivelse ?? "").trim().split(/\s+/).filter(Boolean);
  if (ord.length <= maksOrd) return ord.join(" ");
  return `${ord.slice(0, maksOrd).join(" ")} (...)`;
}

// Et nyt objekt i data/udgivelser.json bliver automatisk til et bogkort.
function lavBogkort(udgivelse) {
  const forside = udgivelse.forside ?? {};
  return `<article class="bogkort">
    <a href="${udgivelsesUrl(udgivelse.slug)}" aria-label="Læs om ${beskytHtml(udgivelse.titel)}">
      <div class="bogforside-ramme">
        <img src="${beskytHtml(forside.sti)}" alt="${beskytHtml(forside.alt)}" loading="lazy" width="600" height="760">
      </div>
      <div class="bogkort-indhold">
        <p class="overlinje">Udgivelse</p>
        <h2>${beskytHtml(udgivelse.titel)}</h2>
        <p class="bogforfatter">${beskytHtml(udgivelse.forfatter)}</p>
        <p class="bogbeskrivelse">${beskytHtml(lavKortTekst(udgivelse.beskrivelse || udgivelse.kort_beskrivelse))}</p>
        <span class="tekstlink"><span class="tekstlink-tekst">Læs om udgivelsen</span><span aria-hidden="true">→</span></span>
      </div>
    </a>
  </article>`;
}

async function visUdgivelser() {
  try {
    const udgivelser = await hentUdgivelser();
    udgivelsesfelt.innerHTML = udgivelser.length
      ? udgivelser.map(lavBogkort).join("")
      : '<p class="statusbesked indlaesningsfelt" role="status">Der er endnu ingen udgivelser i kataloget.</p>';
  } catch (error) {
    udgivelsesfelt.innerHTML = `<p class="statusbesked indlaesningsfelt" role="status">${beskytHtml(error.message)}</p>`;
  }
}

if (udgivelsesfelt) visUdgivelser();
