// scripts/comicsManager.js
const ComicsManager = (() => {
  const COVERS_BASE = '/comics/covers/main';
  const COMICS_BASE = '/comics';

  const LOCALIZED_COVERS = {
    tf00Cover: 'tf00',
    tf01Cover: 'tf01',
    tf02Cover: 'tf02',
  };

  //TODO: Gather these informations from a comics-data.json
  // Only these comics will be checked
  const HOSTED_COMICS = [
    ['tf00', 'catchup-comic'],
    ['tf01', 'ring-of-fired'],
    ['tf02', 'unhappy-returns'],
    ['tf03', 'a-cold-day-in-hell'],
    ['tf04', 'blood-in-the-water'],
    ['tf05', 'old-wounds'],
    ['tf06', 'the-naked-and-the-dead'],
    ['tf07', 'the-days-have-worn-away'],
  ];

  function updateCovers(lang) {
    const LANG = lang.toUpperCase();
    for (const [imgId, comicId] of Object.entries(LOCALIZED_COVERS)) {
      const img = document.getElementById(imgId);
      if (!img) { console.warn(`ComicsManager: image not found "${imgId}"`); continue; }

      // Random cover handled by inline script, we don't touch
      if (imgId === 'tf07Cover') continue;

      const langSrc     = `${COVERS_BASE}/${comicId}/${comicId}${LANG}_cover.png`;
      const fallbackSrc = `${COVERS_BASE}/${comicId}/${comicId}_cover.png`;

      const test = new Image();
      test.onload  = () => { img.src = langSrc; };
      test.onerror = () => {
        console.warn(`ComicsManager: no cover for ${LANG}/${comicId}, fallback to en`);
        img.src = fallbackSrc;
      };
      test.src = langSrc;
    }
  }

  function checkAvailability(lang) {
    const LANG = lang.toUpperCase();
    for (const [id, slug] of HOSTED_COMICS) {
      const img = document.getElementById(id + 'Cover');
      if (!img) continue;

      const wrapper = img.closest('.image_wrapper');
      const overlay = wrapper?.querySelector('.overlay');
      if (!overlay) continue;

      const dir  = `${id}_${slug}`;
      const file = `${id}_${slug.replace(/-/g, '_')}-1.jpg`;
      const url  = `${COMICS_BASE}/${dir}/${LANG}/${file}?_ts=${Date.now()}`;

      const test = new Image();
      test.onload  = () => { overlay.style.display = 'none'; };
      test.onerror = () => { overlay.style.display = 'flex'; };
      test.src = url;
    }
  }

  function showUpdateComicsOverlays() {
    const EXTERNAL_IDS = [
      'tfu00Cover','tfu01Cover','tfu02Cover','tfu03Cover','tfu04Cover',
      'tfu05Cover','tfu06Cover','tfu07Cover','tfu08Cover','tfu09Cover',
      'tfu10Cover','tfu11Cover','tfu12Cover','tfu13Cover','tfu14Cover',
      'tfu15Cover','tfu16Cover','tfu17Cover','tfu18Cover',
    ];

    EXTERNAL_IDS.forEach(imgId => {
      const img = document.getElementById(imgId);
      if (!img) return;
      const overlay = img.closest('.image_wrapper')?.querySelector('.overlay');
      if (!overlay) return;
      overlay.style.display = 'flex';
    });
  }

  function update(lang) {
    updateCovers(lang);
    checkAvailability(lang);
    showUpdateComicsOverlays();
  }

  return { update };
})();