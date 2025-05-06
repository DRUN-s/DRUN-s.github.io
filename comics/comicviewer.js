$(document).ready(function () {
    
    const tomeData = [
      {
        key: "tf00",
        folder: "tf00_catchup-comic",
        baseName: "tf00_catchup_comic",
        pages: 20 
      },
      {
        key: "tf01",
        folder: "tf01_ring-of-fired",
        baseName: "tf01_ring_of_fired",
        pages: 68 
      }
      //  Add more tomes here
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
      if (parts.length !== 3) return null;
  
      const [lang, tomeKey, pageStr] = parts;
      const pageNum = parseInt(pageStr, 10);
      if (!findTome(tomeKey) || isNaN(pageNum)) return null;
  
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
  
    $("#nextPage").click(() => changePage(1));
    $("#prevPage").click(() => changePage(-1));
  
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
  });
  