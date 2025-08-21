$(document).ready(function () {
    
    const tomeData = [
      {
        key: "tf00",
        folder: "tf00_catchup-comic",
        baseName: "tf00_catchup_comic",
        title: {
          EN: "Catchup Comic",
          FR: "BD de rattrapage",
          KR: "줄거리 요약편"
        },
        pages: 20 
      },
      {
        key: "tf01",
        folder: "tf01_ring-of-fired",
        baseName: "tf01_ring_of_fired",
        title: {
          EN: "Ring of fired",
          FR: "Marche ou crève"
        },
        pages: 68 
      },
      {
        key: "tf02",
        folder: "tf02_unhappy-returns",
        baseName: "tf02_unhappy_returns",
        title: {
          EN: "Unhappy returns",
          FR: "Retour malheureux"
        },
        pages: 75 
      },
      {
        key: "tf03",
        folder: "tf03_a_cold_day_in_hell",
        baseName: "tf03_a_cold_day_in_hell",
        title: {
          EN: "A cold day in hell",
          FR: "Un jour froid en enfer"
        },
        pages: 70 
      },
      {
        key: "tf04",
        folder: "tf04_blood-in-the-water",
        baseName: "tf04_blood_in_the_water",
        title: {
          EN: "Blood in the water",
          FR: "Du sang dans les eaux"
        },
        pages: 113 
      },
      {
        key: "tf05",
        folder: "tf05_old-wounds",
        baseName: "tf05_old_wounds",
        title: {
          EN: "Old wounds",
          FR: "Vielles plaies"
        },
        pages: 79 
      },
      {
        key: "tf06",
        folder: "tf06_the-naked-and-the-dead",
        baseName: "tf06_the_naked_and_the_dead",
        title: {
          EN: "The naked and the dead",
          FR: "Le nu et le mort"
        },
        pages: 274 
      },
      {
        key: "tf07",
        folder: "tf07_the-days-have-worn-away",
        baseName: "tf07_the_days_have_worn_away",
        title: {
          EN: "The days have worn away",
          FR: "Les jours se sont usés"
        },
        pages: 330 
      }
    ];
  
    function findTome(key) {
      return tomeData.find(t => t.key === key);
    }
  
    function getNextTome(currentKey) {
      const index = tomeData.findIndex(t => t.key === currentKey);
      return tomeData[index + 1] || null;
    }
  
    function parseHash() {
      const hash = window.location.hash.slice(1);
      const parts = hash.split("-");
      if (parts.length !== 3) {
        // No hash found for language → the hash in localStorage is then loaded
        const savedLang = localStorage.getItem("selectedLanguage") || "EN";
        return { lang: savedLang, tomeKey: "tf00", pageNum: 1 }; 
      }
    
      const [lang, tomeKey, pageStr] = parts;
      const pageNum = parseInt(pageStr, 10);
      if (!findTome(tomeKey) || isNaN(pageNum)) return null;
    
      // Saves the language to localStorage in the reader as well
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
        const preloadRange = [-1, 1, 2, 3]; // page précédente + 3 suivantes
      
        preloadRange.forEach(offset => {
          const targetPage = pageNum + offset;
          if (targetPage < 1 || targetPage > tome.pages) return;
          const img = new Image();
          img.src = `${tome.folder}/${lang}/${tome.baseName}-${targetPage}.jpg`;
        });
      }
      

    function loadPage(data) {
      const imagePath = buildPath(data);
      console.log("Chargement de :", imagePath);
  
      $("#comicPage")
        .attr("src", imagePath)
        .off("error")
        .on("error", function () {
          alert("Image non trouvée : " + imagePath);
        });
  
      $("#pageIndicator").text(`Langue : ${data.lang} | Tome : ${data.tomeKey.toUpperCase()} | Page ${data.pageNum}`);
      $("#langSelect").val(data.lang); // synchro menu langue

      //Changement du titre de la page selon le tome
      const tome = findTome(data.tomeKey);
      const localizedTitle = tome.title[data.lang] || tome.title["EN"];
      document.title = `${localizedTitle}`; //TODO: Add  "– Page ${data.pageNum}" in the end of this but make sure that "page" is also translated.

      preloadImages(data);
    }
  
    function changePage(delta) {
        let data = parseHash();
        if (!data) return;
      
        const currentTome = findTome(data.tomeKey);
        const newPage = data.pageNum + delta;
      
        if (newPage > currentTome.pages) {
          // Aller au premier page du tome suivant
          const nextTome = getNextTome(data.tomeKey);
          if (nextTome) {
            data = {
              lang: data.lang,
              tomeKey: nextTome.key,
              pageNum: 1
            };
          } else {
            return; // Pas de tome suivant
          }
        } else if (newPage < 1) {
          // Aller à la dernière page du tome précédent
          const index = tomeData.findIndex(t => t.key === data.tomeKey);
          const prevTome = tomeData[index - 1];
          if (prevTome) {
            data = {
              lang: data.lang,
              tomeKey: prevTome.key,
              pageNum: prevTome.pages
            };
          } else {
            return; // Pas de tome précédent
          }
        } else {
          data.pageNum = newPage;
        }
      
        updateHash(data);
    }
  
    //Si la zone es cliqué la page change
    $("#leftZone").on("click", () => changePage(-1));
    $("#rightZone").on("click", () => changePage(1));
  
    $(window).on("hashchange", function () {
      const data = parseHash();
      if (data) loadPage(data);
    });
  
    $("#langSelect").on("change", function () {
      const newLang = $(this).val();
      const data = parseHash();
      if (!data) return;
      data.lang = newLang;
      updateHash(data);
    });
  
    // Premier chargement
    const initialData = parseHash();
    if (initialData) {
      loadPage(initialData);
    } else {
      window.location.hash = "FR-tf00-1";
    }

    const fullscreenToggle = document.getElementById('fullscreenToggle');
    const img = fullscreenToggle.querySelector('img');
    
    fullscreenToggle.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            // Activer le fullscreen
            document.documentElement.requestFullscreen().then(() => {
                img.src = '/images/fullscreenOut.png'; // changer l'image
            }).catch(err => {
                console.error(`Erreur lors du fullscreen : ${err}`);
            });
        } else {
            // Quitter le fullscreen
            document.exitFullscreen().then(() => {
                img.src = '/images/fullscreenIn.png'; // remettre l'image initiale
            }).catch(err => {
                console.error(`Erreur lors de la sortie du fullscreen : ${err}`);
            });
        }
    });
    
    // Pour gérer le retour sur la page via ESC ou autre méthode
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            img.src = '/images/fullscreenIn.png';
        }
    });
    
    
    $(document).ready(function () {

      const selectedItem = $("#selectedItem");
      const dropdownContent = $("#select-container li");
    
      // Initialise le bouton avec la langue stockée
      const savedLang = localStorage.getItem("selectedLanguage") || "EN";
      setLanguage(savedLang);
    
      // Fonction pour mettre à jour le bouton et le hash
      function setLanguage(lang) {
        const item = dropdownContent.filter(`[lang-selection='${lang}']`);
        if (!item.length) return;
    
        // Met à jour le bouton visible
        const imgSrc = item.find("img").attr("src");
        const text = item.text().trim();
        selectedItem.attr("lang-selection", lang);
        selectedItem.html(`<img src="${imgSrc}" /> ${text} <span class="arrow-down"></span>`);
    
        // Sauvegarde la langue
        localStorage.setItem("selectedLanguage", lang);
    
        // Change la langue de la page
        const data = parseHash();
        if (!data) return;
        data.lang = lang;
        updateHash(data);
      }
    
      // Ouvre/ferme le dropdown
      $("#language-dropdown button").on("click", function () {
        $("#select-container").toggle();
      });
    
      // Sélection d'une langue
      dropdownContent.on("click", function () {
        const lang = $(this).attr("lang-selection");
        setLanguage(lang);
        $("#select-container").hide();
      });
    
      // Fermer si clic en dehors
      $(document).on("click", function (e) {
        if (!$(e.target).closest("#language-dropdown").length) {
          $("#select-container").hide();
        }
      });
    });
    

  });

//Changes the language stored in localStorage if another language is selected
  $("#langSelect").on("change", function () {
    const newLang = $(this).val();
    localStorage.setItem("selectedLanguage", newLang);

    const data = parseHash();
    if (data) {
        data.lang = newLang;
        updateHash(data);
        loadPage(data);
    }
});


$(window).on("keydown", function (e) {
  if (e.key === "ArrowRight") {
    $("#rightZone").click();
  } else if (e.key === "ArrowLeft") {
    $("#leftZone").click();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  function unwrapSelector() {
    container.style.pointerEvents = "none";
    setTimeout(() => container.style.pointerEvents = "auto", 200);
  }

  function showUnselected() {
    let selectedLangCode = selectedItem.getAttribute('lang-selection');
    for (let i = 0; i < items.length; i++) {
        if (items[i].getAttribute('lang-selection') === selectedLangCode) {
            items[i].style.opacity = '1';
            items[i].style.display = '';
            break;
        }
    }
  }

  function hideSelected() {
    let selectedLangCode = selectedItem.getAttribute('lang-selection');
    for (let i = 0; i < items.length; i++) {
        if (items[i].getAttribute('lang-selection') === selectedLangCode) {
            items[i].style.opacity = '0';
            setTimeout(() => items[i].style.display = 'none', 200);
            break;
        }
    }
  }
});