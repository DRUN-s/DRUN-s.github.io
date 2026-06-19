// Charge une langue, fallback EN si besoin
async function loadTranslations(lang) {
  const load = (l) => fetch(`../locales/${l}.json`).then(r => r.ok ? r.json() : null);
  
  if (lang === "en") {
    return { translations: await load("en"), lang: "en" };
  }
  
  const [primary, fallback] = await Promise.all([load(lang), load("en")]);
  return {
    translations: { ...fallback, ...primary }, // les clés manquantes tombent sur EN
    lang: primary ? lang : "en"
  };
}

$(async function () {
  let currentLang = localStorage.getItem("selectedLanguage") || "en";
  let translations = {};

  async function initLang(lang) {
    const result = await loadTranslations(lang);
    translations = result.translations;
    currentLang = result.lang;
  }

  const tomeData = [
    { key: "tf00", folder: "tf00_catchup-comic",          baseName: "tf00_catchup_comic",          titleKey: "tf00Title", pages: 20  },
    { key: "tf01", folder: "tf01_ring-of-fired",          baseName: "tf01_ring_of_fired",          titleKey: "tf01Title", pages: 68  },
    { key: "tf02", folder: "tf02_unhappy-returns",        baseName: "tf02_unhappy_returns",        titleKey: "tf02Title", pages: 70  },
    { key: "tf03", folder: "tf03_a-cold-day-in-hell",     baseName: "tf03_a_cold_day_in_hell",     titleKey: "tf03Title", pages: 70  },
    { key: "tf04", folder: "tf04_blood-in-the-water",     baseName: "tf04_blood_in_the_water",     titleKey: "tf04Title", pages: 113 },
    { key: "tf05", folder: "tf05_old-wounds",             baseName: "tf05_old_wounds",             titleKey: "tf05Title", pages: 79  },
    { key: "tf06", folder: "tf06_the-naked-and-the-dead", baseName: "tf06_the_naked_and_the_dead", titleKey: "tf06Title", pages: 274 },
    { key: "tf07", folder: "tf07_the-days-have-worn-away",baseName: "tf07_the_days_have_worn_away",titleKey: "tf07Title", pages: 330 },
  ];

  function findTome(key) { return tomeData.find((t) => t.key === key); }
  function getNextTome(currentKey) {
    const index = tomeData.findIndex((t) => t.key === currentKey);
    return tomeData[index + 1] || null;
  }

  function parseHash() {
    const hash = window.location.hash.slice(1);
    const parts = hash.split("-");
    if (parts.length !== 3) {
      const savedLang = localStorage.getItem("selectedLanguage") || "en";
      return { lang: savedLang, tomeKey: "tf00", pageNum: 1 };
    }
    const [lang, tomeKey, pageStr] = parts;
    const pageNum = parseInt(pageStr, 10);
    if (!findTome(tomeKey) || isNaN(pageNum)) return null;
    localStorage.setItem("selectedLanguage", lang);
    return { lang, tomeKey, pageNum };
  }

  // Construit le chemin vers le fichier image. Les clés de langue (lang) sont
  // toujours manipulées en minuscule dans le reste du code (sélecteur, traductions,
  // localStorage), mais les dossiers de comics sur disque sont en MAJUSCULE.
  // C'est ICI, et uniquement ici, qu'on convertit pour matcher le système de fichiers.
  function buildPath({ lang, tomeKey, pageNum }) {
    const tome = findTome(tomeKey);
    return `${tome.folder}/${lang.toUpperCase()}/${tome.baseName}-${pageNum}.jpg`;
  }

  function updateHash(data) {
    const newHash = `${data.lang}-${data.tomeKey}-${data.pageNum}`;
    if (window.location.hash !== "#" + newHash) {
      window.location.hash = newHash;
    }
  }

  function preloadImages({ lang, tomeKey, pageNum }) {
    const tome = findTome(tomeKey);
    [-1, 1, 2, 3].forEach((offset) => {
      const targetPage = pageNum + offset;
      if (targetPage < 1 || targetPage > tome.pages) return;
      new Image().src = `${tome.folder}/${lang.toUpperCase()}/${tome.baseName}-${targetPage}.jpg`;
      if (lang !== "en") {
        new Image().src = `${tome.folder}/EN/${tome.baseName}-${targetPage}.jpg`;
      }
    });
  }

  function testImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  async function resolveImageSource(data) {
    const primary = buildPath(data);
    if (await testImage(primary)) return { src: primary, langUsed: data.lang, fallback: false, notFound: false };

    if (data.lang !== "en") {
      const fallbackEN = buildPath({ ...data, lang: "en" }); // buildPath applique déjà .toUpperCase()
      if (await testImage(fallbackEN)) return { src: fallbackEN, langUsed: "en", fallback: true, notFound: false };
    }

    return { src: "../placeholder.png", langUsed: data.lang, fallback: false, notFound: true };
  }

  async function loadPage(data) {
    if (!data) return;

    // Recharge les traductions si la langue a changé
    if (data.lang !== currentLang) {
      await initLang(data.lang);
    }

    const { src, langUsed, fallback, notFound } = await resolveImageSource(data);

    $("#comicPage").off("error load").attr("src", src);

    const tome = findTome(data.tomeKey);
    const title = translations[tome.titleKey] || tome.titleKey;
    const pageLabel = translations["page"] || "Page";

    $("#pageIndicator").text(`Langue : ${langUsed} | Tome : ${data.tomeKey.toUpperCase()} | Page ${data.pageNum}`);
    $("#langSelect").val(langUsed);
    document.title = `${title} – ${pageLabel} ${data.pageNum}`;

    if (typeof window.setLanguage === "function") {
      window.setLanguage(langUsed, { skipHash: true });
    }

    if (fallback) {
      alert(`This page hasn't been translated in ${data.lang}. Fallback to English.`);
      updateHash({ ...data, lang: langUsed });
    } else if (notFound) {
      alert(`Page ${data.pageNum} from ${data.tomeKey} cannot be found.`);
    }

    preloadImages({ ...data, lang: langUsed });
  }

  function changePage(delta) {
    let data = parseHash();
    if (!data) return;
    const currentTome = findTome(data.tomeKey);
    const newPage = data.pageNum + delta;

    if (newPage > currentTome.pages) {
      const nextTome = getNextTome(data.tomeKey);
      if (nextTome) data = { lang: data.lang, tomeKey: nextTome.key, pageNum: 1 };
      else return;
    } else if (newPage < 1) {
      const index = tomeData.findIndex((t) => t.key === data.tomeKey);
      const prevTome = tomeData[index - 1];
      if (prevTome) data = { lang: data.lang, tomeKey: prevTome.key, pageNum: prevTome.pages };
      else return;
    } else {
      data.pageNum = newPage;
    }

    updateHash(data);
  }

  // --- UI ---
  $("#helpToggle").on("click", function () {
    $("#clickableArea").toggleClass("help-active");
    $(this).toggleClass("active");
  });
  $(window).on("keydown", function (e) {
    if (e.key.toLowerCase() === "h") { $("#clickableArea").addClass("help-active"); $("#helpToggle").addClass("active"); }
  });
  $(window).on("keyup", function (e) {
    if (e.key.toLowerCase() === "h") { $("#clickableArea").removeClass("help-active"); $("#helpToggle").removeClass("active"); }
  });

  // --- Dropdown ---
  const selectedItem = $("#selectedItem");
  const dropdownContent = $("#select-container li");

  async function setLanguage(lang, options = {}) {
    const item = dropdownContent.filter(`[lang-selection='${lang}']`);
    if (!item.length) return;

    const imgSrc = item.find("img").attr("src");
    const text = item.text().trim();
    selectedItem.attr("lang-selection", lang);
    selectedItem.html(`<img src="${imgSrc}" /> ${text} <span class="arrow-down"></span>`);

    localStorage.setItem("selectedLanguage", lang);
    $("#langSelect").val(lang);

    if (!options.skipHash) {
      const data = parseHash();
      if (!data) return;
      data.lang = lang;
      updateHash(data);
    }
  }
  window.setLanguage = setLanguage;

  // --- Fullscreen ---
  const fullscreenToggle = document.getElementById("fullscreenToggle");
  const img = fullscreenToggle.querySelector("img");
  const clickableArea = document.getElementById("clickableArea");

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      clickableArea.requestFullscreen()
        .then(() => { img.src = "../images/fullscreenOut.svg"; document.body.classList.add("fullscreen-active"); })
        .catch(err => console.error(err));
    } else {
      document.exitFullscreen()
        .then(() => { img.src = "../images/fullscreenIn.svg"; document.body.classList.remove("fullscreen-active"); })
        .catch(err => console.error(err));
    }
  }
  fullscreenToggle.addEventListener("click", toggleFullscreen);
  document.addEventListener("keydown", (e) => { if (e.key.toLowerCase() === "f") toggleFullscreen(); });

  // --- Dropdown events ---
  $("#language-dropdown button").on("click", function () { $("#select-container").toggle(); });
  dropdownContent.on("click", function () {
    setLanguage($(this).attr("lang-selection"));
    $("#select-container").hide();
  });
  $("#langSelect").on("change", function () {
    const data = parseHash();
    if (data) { data.lang = $(this).val(); updateHash(data); }
  });

  // --- Navigation ---
  $("#leftZone").on("click", () => changePage(-1));
  $("#rightZone").on("click", () => changePage(1));
  $(window).on("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === " " || e.key === "Spacebar") $("#rightZone").click();
    else if (e.key === "ArrowLeft" || e.key === "Backspace" || e.key === "Delete") $("#leftZone").click();
  });

  // --- Hashchange & init ---
  $(window).on("hashchange", function () {
    const data = parseHash();
    if (data) loadPage(data);
  });

  const initialData = parseHash();
  await initLang(initialData?.lang || "en");

  if (initialData) loadPage(initialData);
  else updateHash({ lang: currentLang, tomeKey: "tf00", pageNum: 1 });
});