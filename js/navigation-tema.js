// Styrer mobilmenuen og brugerens valg mellem lyst og mørkt tema.
const menuKnap = document.querySelector(".menu-knap");
const navigation = document.querySelector(".hovednavigation");
const temaKnapper = document.querySelectorAll(".tema-knap");
const temaTekster = document.querySelectorAll("[data-theme-label]");
const sideindhold = document.querySelectorAll("main, .sidefod-baggrund");
const springOverLink = document.querySelector(".spring-over-link");
const hovedindhold = document.querySelector("main");
const desktopBredde = matchMedia("(min-width: 64rem)");
const systemTema = matchMedia("(prefers-color-scheme: dark)");

// Med JavaScript flyttes fokus direkte til indholdet; uden JavaScript virker ankerlinket stadig.
springOverLink?.addEventListener("click", (event) => {
  event.preventDefault();
  hovedindhold?.focus();
});

// Lukker mobilmenuen og kan sende tastaturfokus tilbage til menuknappen.
function lukMenu(givFokusTilbage = false) {
  if (!menuKnap || !navigation) return;
  menuKnap.setAttribute("aria-expanded", "false");
  menuKnap.setAttribute("aria-label", "Åbn menu");
  navigation.removeAttribute("data-open");
  document.body.classList.remove("menu-aaben");
  sideindhold.forEach((element) => element.removeAttribute("inert"));
  if (givFokusTilbage) menuKnap.focus();
}

// Åbner eller lukker mobilmenuen og skjuler resten af siden for tastaturnavigation.
menuKnap?.addEventListener("click", () => {
  const skalAabne = menuKnap.getAttribute("aria-expanded") !== "true";
  menuKnap.setAttribute("aria-expanded", String(skalAabne));
  menuKnap.setAttribute("aria-label", skalAabne ? "Luk menu" : "Åbn menu");
  navigation.toggleAttribute("data-open", skalAabne);
  document.body.classList.toggle("menu-aaben", skalAabne);
  sideindhold.forEach((element) => element.toggleAttribute("inert", skalAabne));
  if (skalAabne) navigation.querySelector("a")?.focus();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation?.hasAttribute("data-open")) {
    lukMenu(true);
  }
});

navigation?.addEventListener("click", (event) => {
  if (event.target.closest("a")) lukMenu();
});

desktopBredde.addEventListener("change", (event) => {
  if (event.matches) lukMenu();
});

// Holder både headerens og footerens temaknapper ens.
function opdaterTemaKnapper() {
  const erMoerkt = document.documentElement.dataset.theme === "dark";
  temaKnapper.forEach((temaKnap) => {
    temaKnap.setAttribute("aria-checked", String(erMoerkt));
    temaKnap.setAttribute("aria-label", erMoerkt ? "Slå lyst tema til" : "Slå mørkt tema til");
  });
  temaTekster.forEach((temaTekst) => {
    temaTekst.textContent = erMoerkt ? "Mørk" : "Lys";
  });
}

opdaterTemaKnapper();

function skiftTema() {
  const tema = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = tema;
  document.documentElement.dataset.themePreference = tema;
  localStorage.setItem("kokon-theme", tema);
  opdaterTemaKnapper();
}

temaKnapper.forEach((temaKnap) => temaKnap.addEventListener("click", skiftTema));

// Følger systemets temaændring, når brugeren ikke selv har valgt et tema.
systemTema.addEventListener("change", (event) => {
  if (document.documentElement.dataset.themePreference !== "system") return;
  document.documentElement.dataset.theme = event.matches ? "dark" : "light";
  opdaterTemaKnapper();
});
