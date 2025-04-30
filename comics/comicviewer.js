$(document).ready(function () {
    const tomeData = {
      tf00: {
        folder: "tf_00_catchup-comic",
        baseName: "tf00_catchup_comic"
      },
      // Ajoute d’autres tomes ici plus tard
    };
  
    function parseHash() {
      const hash = window.location.hash.slice(1); // retire le #
      const parts = hash.split("-");
      if (parts.length !== 3) return null;
  
      const [lang, tomeKey, pageStr] = parts;
      const pageNum = parseInt(pageStr, 10);
      if (!tomeData[tomeKey] || isNaN(pageNum)) return null;
  
      return { lang, tomeKey, pageNum };
    }
  
    function buildPath({ lang, tomeKey, pageNum }) {
        const tome = tomeData[tomeKey];
        return `${tome.folder}/${lang}/${tome.baseName}-${pageNum}.jpg`;
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
    }
  
    function updateHash(data) {
      const newHash = `${data.lang}-${data.tomeKey}-${data.pageNum}`;
      if (window.location.hash !== "#" + newHash) {
        window.location.hash = newHash;
      }
    }
  
    function changePage(delta) {
      const data = parseHash();
      if (!data) return;
      data.pageNum += delta;
      if (data.pageNum < 1) return;
      updateHash(data);
      loadPage(data);
    }
  
    $("#nextPage").click(() => changePage(1));
    $("#prevPage").click(() => changePage(-1));
  
    $(window).on("hashchange", function () {
      const data = parseHash();
      if (data) loadPage(data);
    });
  
    const initialData = parseHash();
    if (initialData) {
      loadPage(initialData);
    } else {
      window.location.hash = "FR-tf00-1";
    }
  });
  