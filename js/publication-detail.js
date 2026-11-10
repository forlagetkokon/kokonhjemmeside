// Viser én udgivelse fra JSON-filen, herunder bogfakta, galleri og forstørrede billeder.
import { hentUdgivelser } from "./udgivelser-data.js";

const udgivelsesfelt = document.querySelector("[data-publication-detail]");
const billedDialog = document.querySelector("#billed-dialog");

// Gør tekst fra JSON-filen sikker at sætte ind i HTML.
function beskytHtml(vaerdi) {
  return String(vaerdi ?? "").replace(/[&<>'"]/g, (tegn) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[tegn]);
}

function hentSlug() {
  return new URLSearchParams(location.search).get("slug") ?? "";
}

// To linjeskift i JSON-teksten bliver til to separate afsnit på siden.
function lavAfsnit(indhold) {
  return String(indhold ?? "")
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((afsnit) => `<p>${beskytHtml(afsnit)}</p>`)
    .join("");
}

// Valgfrie afsnit skjules helt, når deres felt er tomt i JSON-filen.
function valgfriTekstsektion(titel, indhold) {
  if (!indhold || !String(indhold).trim()) return "";
  return `<section class="indholdssektion broedtekst"><h2>${beskytHtml(titel)}</h2>${lavAfsnit(indhold)}</section>`;
}

function visFaktavaerdi(vaerdi) {
  return vaerdi === null || vaerdi === undefined || String(vaerdi).trim() === ""
    ? "Afventer oplysninger"
    : String(vaerdi);
}

function lavBogfakta(udgivelse) {
  const fakta = [
    ["ISBN", udgivelse.isbn],
    ["Sidetal", udgivelse.sidetal],
    ["Format / bind", udgivelse.format_bind],
    ["Sprog", udgivelse.sprog],
    ["Dansk udgivelse", udgivelse.dansk_udgivelsesaar],
    ["Originaludgivelse", udgivelse.originaludgivelsesaar],
    ["Originaltitel", udgivelse.originaltitel],
    ["Oversætter", udgivelse.oversaetter],
    ["Omslag og materialer", udgivelse.format_og_materialer],
  ];

  const faktapunkter = fakta.map(([navn, vaerdi]) => `
    <div>
      <dt>${beskytHtml(navn)}</dt>
      <dd>${beskytHtml(visFaktavaerdi(vaerdi))}</dd>
    </div>`).join("");

  return `<section class="indholdssektion" aria-labelledby="bogfakta-titel">
    <h2 id="bogfakta-titel">Mere om bogen</h2>
    <dl class="bogfakta">${faktapunkter}</dl>
  </section>`;
}

// Forside og galleri holdes adskilt i JSON, men vises samlet på detaljesiden.
function lavDetaljeGalleri(forside, galleri, titel) {
  const seteStier = new Set();
  const gyldigeBilleder = [forside, ...(Array.isArray(galleri) ? galleri : [])].filter((billede) => {
    if (!billede?.sti?.startsWith("./assets/images/") || !billede.alt || seteStier.has(billede.sti)) return false;
    seteStier.add(billede.sti);
    return true;
  });
  if (!gyldigeBilleder.length) return "";

  const dias = gyldigeBilleder.map((billede, nummer) => `
    <figure class="karusel-slide">
      <button
        class="billedforstoerrelse"
        type="button"
        data-image-expand
        tabindex="${nummer === 0 ? "0" : "-1"}"
        aria-label="Forstør billede ${nummer + 1} af ${gyldigeBilleder.length}: ${beskytHtml(billede.alt)}"
      >
        <img
          src="${beskytHtml(billede.sti)}"
          alt="${beskytHtml(billede.alt)}"
          ${nummer === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}
        >
      </button>
    </figure>`).join("");

  if (gyldigeBilleder.length === 1) {
    return `<div class="detalje-forside" role="group" aria-label="Forside til ${beskytHtml(titel)}">
      <div class="detalje-galleri">${dias}</div>
    </div>`;
  }

  const prikker = gyldigeBilleder.map((billede, nummer) => `
    <button
      class="karusel-prik"
      type="button"
      data-carousel-dot="${nummer}"
      aria-label="Vis billede ${nummer + 1} af ${gyldigeBilleder.length}"
      ${nummer === 0 ? 'aria-current="true"' : ""}
    ></button>`).join("");

  return `<div class="detalje-forside" role="region" aria-label="Billeder af ${beskytHtml(titel)}" data-carousel>
    <div class="karusel-visning">
      <div
        class="detalje-galleri er-karusel"
        tabindex="0"
        role="group"
        aria-label="Billedkarussel. Brug venstre og højre piletast til at skifte billede."
      >${dias}</div>
      <button class="karusel-pil forrige" type="button" data-carousel-prev aria-label="Vis forrige billede"><span aria-hidden="true">‹</span></button>
      <button class="karusel-pil naeste" type="button" data-carousel-next aria-label="Vis næste billede"><span aria-hidden="true">›</span></button>
    </div>
    <div class="karusel-prikker" role="group" aria-label="Vælg billede">${prikker}</div>
  </div>`;
}

function startKaruseller() {
  udgivelsesfelt.querySelectorAll("[data-carousel]").forEach((karusel) => {
    const billedrulle = karusel.querySelector(".er-karusel");
    const dias = [...karusel.querySelectorAll(".karusel-slide")];
    const billedKnapper = [...karusel.querySelectorAll("[data-image-expand]")];
    const prikker = [...karusel.querySelectorAll("[data-carousel-dot]")];
    const mindreBevaegelse = matchMedia("(prefers-reduced-motion: reduce)");
    let aktivtNummer = 0;
    let scrollTid;

    function opdaterPrikker(nummer) {
      aktivtNummer = (nummer + dias.length) % dias.length;
      prikker.forEach((prik, prikNummer) => {
        if (prikNummer === aktivtNummer) prik.setAttribute("aria-current", "true");
        else prik.removeAttribute("aria-current");
      });
      billedKnapper.forEach((knap, knapNummer) => {
        knap.tabIndex = knapNummer === aktivtNummer ? 0 : -1;
      });
    }

    function visBillede(nummer, animer = true) {
      opdaterPrikker(nummer);
      billedrulle.scrollTo({
        left: billedrulle.clientWidth * aktivtNummer,
        behavior: animer && !mindreBevaegelse.matches ? "smooth" : "auto",
      });
    }

    karusel.querySelector("[data-carousel-prev]")?.addEventListener("click", () => visBillede(aktivtNummer - 1));
    karusel.querySelector("[data-carousel-next]")?.addEventListener("click", () => visBillede(aktivtNummer + 1));
    prikker.forEach((prik, nummer) => prik.addEventListener("click", () => visBillede(nummer)));

    billedrulle.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      visBillede(aktivtNummer + (event.key === "ArrowRight" ? 1 : -1));
    });

    billedrulle.addEventListener("scroll", () => {
      clearTimeout(scrollTid);
      scrollTid = window.setTimeout(() => {
        // Venter til scroll er landet, før den aktive prik og tab-rækkefølgen opdateres.
        if (!billedrulle.clientWidth) return;
        opdaterPrikker(Math.round(billedrulle.scrollLeft / billedrulle.clientWidth));
      }, 100);
    }, { passive: true });

    window.addEventListener("resize", () => visBillede(aktivtNummer, false));
  });
}

// Genbruger ét dialogvindue: Det viser den samme billedrækkefølge som den karussel, brugeren klikkede i.
function startBilleddialog() {
  if (!billedDialog || !udgivelsesfelt) return;
  const dialogBillede = billedDialog.querySelector("[data-dialog-image]");
  const dialogTitel = billedDialog.querySelector("[data-dialog-title]");
  const forrigeKnap = billedDialog.querySelector("[data-dialog-prev]");
  const naesteKnap = billedDialog.querySelector("[data-dialog-next]");
  const dialogPrikker = billedDialog.querySelector("[data-dialog-dots]");
  let dialogBilleder = [];
  let aktivtDialogBillede = 0;

  function visDialogBillede(nummer) {
    if (!dialogBilleder.length) return;
    aktivtDialogBillede = (nummer + dialogBilleder.length) % dialogBilleder.length;
    const billede = dialogBilleder[aktivtDialogBillede];
    dialogBillede.src = billede.sti;
    dialogBillede.alt = billede.alt;
    dialogTitel.textContent = dialogBilleder.length > 1
      ? `Billede ${aktivtDialogBillede + 1} af ${dialogBilleder.length}`
      : "Billede fra udgivelsen";

    dialogPrikker.querySelectorAll("[data-dialog-dot]").forEach((prik, prikNummer) => {
      if (prikNummer === aktivtDialogBillede) prik.setAttribute("aria-current", "true");
      else prik.removeAttribute("aria-current");
    });
  }

  function opretDialogKarusel() {
    const erKarusel = dialogBilleder.length > 1;
    forrigeKnap.hidden = !erKarusel;
    naesteKnap.hidden = !erKarusel;
    dialogPrikker.hidden = !erKarusel;

    if (!erKarusel) {
      dialogPrikker.innerHTML = "";
      return;
    }

    dialogPrikker.innerHTML = dialogBilleder.map((billede, nummer) => `
      <button
        class="karusel-prik"
        type="button"
        data-dialog-dot="${nummer}"
        aria-label="Vis billede ${nummer + 1} af ${dialogBilleder.length}"
        ${nummer === aktivtDialogBillede ? 'aria-current="true"' : ""}
      ></button>`).join("");
  }

  udgivelsesfelt.addEventListener("click", (event) => {
    const knap = event.target.closest("[data-image-expand]");
    const billede = knap?.querySelector("img");
    if (!knap || !billede) return;

    const karusel = knap.closest("[data-carousel]");
    const billedKnapper = karusel ? [...karusel.querySelectorAll("[data-image-expand]")] : [knap];
    dialogBilleder = billedKnapper
      .map((billedKnap) => {
        const billedeElement = billedKnap.querySelector("img");
        return {
          sti: billedeElement?.currentSrc || billedeElement?.src,
          alt: billedeElement?.alt ?? "",
        };
      })
      .filter((dialogBilledeData) => dialogBilledeData.sti);
    aktivtDialogBillede = Math.max(0, billedKnapper.indexOf(knap));
    opretDialogKarusel();
    visDialogBillede(aktivtDialogBillede);
    billedDialog.showModal();
  });

  forrigeKnap?.addEventListener("click", () => visDialogBillede(aktivtDialogBillede - 1));
  naesteKnap?.addEventListener("click", () => visDialogBillede(aktivtDialogBillede + 1));
  dialogPrikker?.addEventListener("click", (event) => {
    const prik = event.target.closest("[data-dialog-dot]");
    if (prik) visDialogBillede(Number(prik.dataset.dialogDot));
  });

  billedDialog.addEventListener("keydown", (event) => {
    if (dialogBilleder.length < 2 || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    visDialogBillede(aktivtDialogBillede + (event.key === "ArrowRight" ? 1 : -1));
  });

  billedDialog.querySelector("[data-dialog-close]")?.addEventListener("click", () => billedDialog.close());
  billedDialog.addEventListener("click", (event) => {
    if (event.target === billedDialog) billedDialog.close();
  });
  billedDialog.addEventListener("close", () => {
    dialogBillede.removeAttribute("src");
    dialogBillede.alt = "";
    dialogBilleder = [];
    dialogPrikker.innerHTML = "";
  });
}

function lavRelateretBogkort(udgivelse) {
  const forside = udgivelse.forside ?? {};
  const url = `/udgivelse.html?slug=${encodeURIComponent(udgivelse.slug)}`;

  return `<article class="bogkort">
    <a href="${url}">
      <div class="bogforside-ramme">
        <img src="${beskytHtml(forside.sti)}" alt="${beskytHtml(forside.alt)}" loading="lazy" width="600" height="760">
      </div>
      <div class="bogkort-indhold">
        <p class="overlinje">Læs videre</p>
        <h3>${beskytHtml(udgivelse.titel)}</h3>
        <p class="bogforfatter">${beskytHtml(udgivelse.forfatter)}</p>
        <span class="tekstlink">
          <span class="tekstlink-tekst">Se udgivelsen</span>
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </a>
  </article>`;
}

function visUdgivelse(udgivelse, relateredeUdgivelser) {
  document.title = `${udgivelse.titel} · Kokon`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", udgivelse.kort_beskrivelse);
  const forside = udgivelse.forside ?? {};
  const billedGalleri = lavDetaljeGalleri(forside, udgivelse.galleri, udgivelse.titel);
  const handling = udgivelse.beskrivelse || "Afventer godkendt bogbeskrivelse.";
  const oversaetter = udgivelse.oversaetter
    ? `<p class="detalje-meta">Oversat af ${beskytHtml(udgivelse.oversaetter)}</p>`
    : "";
  const ekstraSektion = `<section class="sektion flade-sektion">
    <div class="sektion-indhold detalje-indhold">
      ${valgfriTekstsektion("Om forfatteren", udgivelse.forfatter_beskrivelse)}
      ${lavBogfakta(udgivelse)}
    </div>
  </section>`;
  const relateredeSektion = relateredeUdgivelser.length
    ? `<section class="sektion relaterede-boeger" aria-labelledby="relaterede-titel">
      <div class="sektion-indhold">
        <p class="overlinje">Flere udgivelser</p>
        <h2 id="relaterede-titel">Læs videre hos Kokon</h2>
        <div class="bog-gitter">${relateredeUdgivelser.map(lavRelateretBogkort).join("")}</div>
      </div>
    </section>`
    : "";

  udgivelsesfelt.innerHTML = `
    <section class="sektion">
      <div class="sektion-indhold">
        <a class="tilbage-link" href="./udgivelser.html"><span aria-hidden="true">←</span><span class="tilbage-link-tekst">Tilbage til udgivelser</span></a>
        <article class="detalje-hero">
          ${billedGalleri}
          <div class="lodret-indhold">
            <p class="overlinje">${beskytHtml(udgivelse.forfatter)}</p>
            <h1>${beskytHtml(udgivelse.titel)}</h1>
            ${oversaetter}
            <div class="detalje-handling broedtekst">
              <h2>Handling</h2>
              ${lavAfsnit(handling)}
            </div>
          </div>
        </article>
      </div>
    </section>
    ${ekstraSektion}
    ${relateredeSektion}`;

  startKaruseller();
}

async function hentValgtUdgivelse() {
  const slug = hentSlug();
  if (!slug) {
    udgivelsesfelt.innerHTML = '<section class="sektion"><div class="sektion-indhold"><p class="statusbesked" role="status">Udgivelsen mangler en gyldig adresse.</p></div></section>';
    return;
  }

  try {
    const udgivelser = await hentUdgivelser();
    const udgivelse = udgivelser.find((bog) => bog.slug === slug);
    if (!udgivelse) {
      udgivelsesfelt.innerHTML = '<section class="sektion"><div class="sektion-indhold"><p class="statusbesked" role="status">Udgivelsen blev ikke fundet.</p></div></section>';
      return;
    }
    const relateredeUdgivelser = udgivelser.filter((bog) => bog.slug !== slug).slice(0, 3);
    visUdgivelse(udgivelse, relateredeUdgivelser);
  } catch (error) {
    udgivelsesfelt.innerHTML = `<section class="sektion"><div class="sektion-indhold"><p class="statusbesked" role="status">${beskytHtml(error.message)}</p></div></section>`;
  }
}

startBilleddialog();
if (udgivelsesfelt) hentValgtUdgivelse();
