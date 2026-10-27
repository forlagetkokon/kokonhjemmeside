// Vælger gemt eller systemstyret tema, før siden bliver vist.
// Filen kører tidligt for at undgå et kort blink med det forkerte tema.
(() => {
  const gemtTema = localStorage.getItem("kokon-theme");
  let tema;

  if (gemtTema === "light" || gemtTema === "dark") {
    tema = gemtTema;
  } else if (matchMedia("(prefers-color-scheme: dark)").matches) {
    tema = "dark";
  } else {
    tema = "light";
  }

  document.documentElement.dataset.theme = tema;
  document.documentElement.dataset.themePreference = gemtTema || "system";
})();
