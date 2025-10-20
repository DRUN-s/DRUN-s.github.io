$(function () {
  const tomeData = [
    {
      key: "tf00",
      folder: "tf00_catchup-comic",
      baseName: "tf00_catchup_comic",
      title: Object.fromEntries(
        Object.keys(translations).map((lang) => [
          lang,
          translations[lang].tf00Title,
        ])
      ),
      pages: 20,
    },
    {
      key: "tf01",
      folder: "tf01_ring-of-fired",
      baseName: "tf01_ring_of_fired",
      title: Object.fromEntries(
        Object.keys(translations).map((lang) => [
          lang,
          translations[lang].tf01Title,
        ])
      ),
      pages: 68,
    },
    {
      key: "tf02",
      folder: "tf02_unhappy-returns",
      baseName: "tf02_unhappy_returns",
      title: Object.fromEntries(
        Object.keys(translations).map((lang) => [
          lang,
          translations[lang].tf02Title,
        ])
      ),
      pages: 75,
    },
    {
      key: "tf03",
      folder: "tf03_a-cold-day-in-hell",
      baseName: "tf03_a_cold_day_in_hell",
      title: Object.fromEntries(
        Object.keys(translations).map((lang) => [
          lang,
          translations[lang].tf03Title,
        ])
      ),
      pages: 70,
    },
    {
      key: "tf04",
      folder: "tf04_blood-in-the-water",
      baseName: "tf04_blood_in_the_water",
      title: Object.fromEntries(
        Object.keys(translations).map((lang) => [
          lang,
          translations[lang].tf04Title,
        ])
      ),
      pages: 113,
    },
    {
      key: "tf05",
      folder: "tf05_old-wounds",
      baseName: "tf05_old_wounds",
      title: Object.fromEntries(
        Object.keys(translations).map((lang) => [
          lang,
          translations[lang].tf05Title,
        ])
      ),
      pages: 79,
    },

    {
      key: "tf06",
      folder: "tf06_the-naked-and-the-dead",
      baseName: "tf06_the_naked_and_the_dead",
      title: Object.fromEntries(
        Object.keys(translations).map((lang) => [
          lang,
          translations[lang].tf06Title,
        ])
      ),
      pages: 274,
    },

    {
      key: "tf07",
      folder: "tf07_the-days-have-worn-away",
      baseName: "tf07_the_days_have_worn_away",
      title: Object.fromEntries(
        Object.keys(translations).map((lang) => [
          lang,
          translations[lang].tf07Title,
        ])
      ),
      pages: 330,
    },
  ];

  function findTome(key) {
    return tomeData.find((t) => t.key === key);
  }
  function getNextTome(currentKey) {
    const index = tomeData.findIndex((t) => t.key === currentKey);
    return tomeData[index + 1] || null;
  }

  function parseHash() {
    const hash = window.location.hash.slice(1);
    const parts = hash.split("-");
    if (parts.length !== 3) {
      const savedLang = localStorage.getItem("selectedLanguage") || "EN";
      return { lang: savedLang, tomeKey: "tf00", pageNum: 1 };
    }
    const [lang, tomeKey, pageStr] = parts;
    const pageNum = parseInt(pageStr, 10);
    if (!findTome(tomeKey) || isNaN(pageNum)) return null;
    localStorage.setItem("selectedLanguage", lang);
    return { lang, tomeKey, pageNum };
  }

  function buildPath({ lang, tomeKey, pageNum }) {
    const tome = findTome(tomeKey);
    return `${tome.folder}/${lang}/${tome.baseName}-${pageNum}.jpg`;
  }

  function updateHash(data) {
    const newHash = `${data.lang}-${data.tomeKey}-${data.pageNum}`;
    if (window.location.hash !== "#" + newHash) {
      window.location.hash = newHash;
    }
  }

  function preloadImages({ lang, tomeKey, pageNum }) {
    const tome = findTome(tomeKey);
    const preloadRange = [-1, 1, 2, 3];
    preloadRange.forEach((offset) => {
      const targetPage = pageNum + offset;
      if (targetPage < 1 || targetPage > tome.pages) return;
      // Loads a few things in cache
      const img = new Image();
      img.src = `${tome.folder}/${lang}/${tome.baseName}-${targetPage}.jpg`;
      if (lang !== "EN") {
        const imgEn = new Image();
        imgEn.src = `${tome.folder}/EN/${tome.baseName}-${targetPage}.jpg`;
      }
    });
  }

  // test the presence of an image URL
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
    if (await testImage(primary))
      return {
        src: primary,
        langUsed: data.lang,
        fallback: false,
        notFound: false,
      };

    if (data.lang !== "EN") {
      const fallbackEN = buildPath({ ...data, lang: "EN" });
      if (await testImage(fallbackEN))
        return {
          src: fallbackEN,
          langUsed: "EN",
          fallback: true,
          notFound: false,
        };
    }

    // If nothing exists, uses the placeholder
    return {
      src: "/placeholder.png",
      langUsed: data.lang,
      fallback: false,
      notFound: true,
    };
  }

  async function loadPage(data) {
    if (!data) return;
    const { src, langUsed, fallback, notFound } = await resolveImageSource(
      data
    );

    $("#comicPage").off("error load").attr("src", src);
    $("#pageIndicator").text(
      `Langue : ${langUsed} | Tome : ${data.tomeKey.toUpperCase()} | Page ${
        data.pageNum
      }`
    );
    $("#langSelect").val(langUsed);

    const tome = findTome(data.tomeKey);
    const localizedTitle =
      (tome && (tome.title[langUsed] || tome.title["EN"])) || "Comic";
    const pageLabel = translations[langUsed]?.page || "Page";
    document.title = `${localizedTitle} – ${pageLabel} ${data.pageNum}`;

    // Updating the UI (but also avoids throwing another error)
    if (typeof window.setLanguage === "function") {
      window.setLanguage(langUsed, { skipHash: true });
    }

    // Warn the user we cannot find what he want :(
    if (fallback) {
      alert(
        `This page hasn't been translated in ${data.lang}. You can help us going faster on the project's discord. Fallback to the original version.`
      );
      updateHash({ ...data, lang: langUsed }); // Changes the page to english version
    } else if (notFound) {
      alert(
        `The page ${data.pageNum} from the issue ${data.tomeKey} cannot be found, enjoy this SMPTE test card as a placeholder.`
      );
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
      if (nextTome) {
        data = { lang: data.lang, tomeKey: nextTome.key, pageNum: 1 };
      } else return;
    } else if (newPage < 1) {
      const index = tomeData.findIndex((t) => t.key === data.tomeKey);
      const prevTome = tomeData[index - 1];
      if (prevTome) {
        data = {
          lang: data.lang,
          tomeKey: prevTome.key,
          pageNum: prevTome.pages,
        };
      } else return;
    } else {
      data.pageNum = newPage;
    }

    updateHash(data);
  }

  $("#helpToggle").on("click", function () {
    const area = $("#clickableArea");
    $(this).toggleClass("active");
    area.toggleClass("help-active");
  });

  // Buttons follows the state
  $(window).on("keydown", function (e) {
    if (e.key.toLowerCase() === "h") {
      $("#clickableArea").addClass("help-active");
      $("#helpToggle").addClass("active");
    }
  });

  $(window).on("keyup", function (e) {
    if (e.key.toLowerCase() === "h") {
      $("#clickableArea").removeClass("help-active");
      $("#helpToggle").removeClass("active");
    }
  });

  // --- Dropdown / setLanguage ---
  const selectedItem = $("#selectedItem");
  const dropdownContent = $("#select-container li");

  function setLanguage(lang, options = {}) {
    const item = dropdownContent.filter(`[lang-selection='${lang}']`);
    if (!item.length) return;

    const imgSrc = item.find("img").attr("src");
    const text = item.text().trim();
    selectedItem.attr("lang-selection", lang);
    selectedItem.html(
      `<img src="${imgSrc}" /> ${text} <span class="arrow-down"></span>`
    );

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

  const fullscreenToggle = document.getElementById("fullscreenToggle");
  const img = fullscreenToggle.querySelector("img");
  const clickableArea = document.getElementById("clickableArea");
  const body = document.body;

  // Fonction pour basculer le fullscreen
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      clickableArea
        .requestFullscreen()
        .then(() => {
          img.src = "/images/fullscreenOut.svg";
          body.classList.add("fullscreen-active");
        })
        .catch((err) => {
          console.error(`Error with fullscreen : ${err}`);
        });
    } else {
      document
        .exitFullscreen()
        .then(() => {
          img.src = "/images/fullscreenIn.svg";
          body.classList.remove("fullscreen-active");
        })
        .catch((err) => {
          console.error(`Error when exiting fullscreen : ${err}`);
        });
    }
  }

  // Clique sur le bouton
  fullscreenToggle.addEventListener("click", toggleFullscreen);

  // Appui sur F
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "f") {
      toggleFullscreen();
    }
  });

  // event handlers dropdown / select
  $("#language-dropdown button").on("click", function () {
    $("#select-container").toggle();
  });
  dropdownContent.on("click", function () {
    const lang = $(this).attr("lang-selection");
    setLanguage(lang);
    $("#select-container").hide();
  });

  $("#langSelect").on("change", function () {
    const newLang = $(this).val();
    localStorage.setItem("selectedLanguage", newLang);
    const data = parseHash();
    if (data) {
      data.lang = newLang;
      updateHash(data);
    }
  });

  // navigation / keyboard
  $("#leftZone").on("click", () => changePage(-1));
  $("#rightZone").on("click", () => changePage(1));
  $(window).on("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === " " || e.key === "Spacebar")
      $("#rightZone").click();
    else if (
      e.key === "ArrowLeft" ||
      e.key === "Backspace" ||
      e.key === "Delete"
    )
      $("#leftZone").click();
  });

  // hashchange -> load page
  $(window).on("hashchange", function () {
    const data = parseHash();
    if (data) loadPage(data);
  });

  // initial load
  const initialData = parseHash();
  if (initialData) loadPage(initialData);
  else
    updateHash({
      lang: localStorage.getItem("selectedLanguage") || "EN",
      tomeKey: "tf00",
      pageNum: 1,
    });
});
