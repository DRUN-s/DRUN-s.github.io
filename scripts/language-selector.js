document.addEventListener("DOMContentLoaded", function () {
    let dropdown = document.getElementById('language-dropdown');
    let container = document.getElementById('select-container');
    let list = container.getElementsByTagName('ul')[0];
    let items = list.getElementsByTagName('li');
    let selectedItem = document.getElementById('selectedItem');

    const defaultTexts = {}; // Stockage des textes par défaut

    if (items.length === 0) {
        console.error("No language elements found.");
        return;
    }

    //Detects the browser's language
    const supportedLangs = Object.keys(translations);
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split("-")[0].toUpperCase();
    const savedLang = localStorage.getItem("selectedLanguage");

    let effectiveLang = savedLang || (supportedLangs.includes(langCode) ? langCode : "EN");
    localStorage.setItem("selectedLanguage", effectiveLang);

    console.log("Applied language :", effectiveLang);

    //Updates the language selector accordingly
    const item = document.querySelector(`#select-container li[lang-selection="${effectiveLang}"]`);
    if (item && selectedItem) {
        selectedItem.innerHTML = item.innerHTML + '<span class="arrow-down"></span>';
        selectedItem.setAttribute("lang-selection", effectiveLang);
    }

    updateText(effectiveLang);
    updateCovers(effectiveLang);
    checkComicsAvailability(effectiveLang);
    hideSelected();

    //Clicks on the list.
    for (let i = 0; i < items.length; i++) {
        items[i].addEventListener("click", function () {
            onSelect(this);
        });
    }

    selectedItem.addEventListener("click", function (e) {
        e.stopPropagation();
        dropdown.classList.toggle("open");
    });

    document.addEventListener("click", function () {
        dropdown.classList.remove("open");
    });

    function onSelect(item) {
        let langCode = item.getAttribute('lang-selection');
        console.log("Selected language :", langCode);

        localStorage.setItem("selectedLanguage", langCode);

        showUnselected();
        selectedItem.innerHTML = item.innerHTML + '<span class="arrow-down"></span>';
        selectedItem.setAttribute('lang-selection', langCode);
        hideSelected();
        unwrapSelector();
        dropdown.classList.remove("open");

        updateText(langCode);
        updateCovers(langCode);
        checkComicsAvailability(langCode);
    }

    function updateText(lang) {
        if (!translations?.[lang]) {
            console.warn("No translation found for :", lang);
            return;
        }
    
        const dict = translations[lang] || translations["EN"];

        document.querySelectorAll("[data-key]").forEach(el => {
          const key = el.getAttribute("data-key");
          if (dict[key]) {
            el.textContent = dict[key];
          }
        });

        for (const [key, value] of Object.entries(translations[lang])) {
            const el = document.getElementById(key);
            if (!el) continue;
    
            if (!(key in defaultTexts)) {
                defaultTexts[key] = el.textContent;
            }
    
            if (typeof value === "string" && value.trim() !== "") {
                el.textContent = value;
            } else {
                el.textContent = defaultTexts[key];
            }
        }
    }

    function updateCovers(lang) {
        const covers = {
            tf00Cover: "tf00",
            tf01Cover: "tf01",
            tf02Cover: "tf02",
        };
    
        const BASE = "/comics/covers/main";
    
        //console.log("=== updateCovers has been called with :", lang, "===");
    
        for (const [imgId, comicId] of Object.entries(covers)) {
            const img = document.getElementById(imgId);
            if (!img) {
                console.warn("Couldn't find image from ID :", imgId);
                continue;
            }
    
            const langPath = `${BASE}/${comicId}/${comicId}${lang}_cover.png`;
            const fallback = `${BASE}/${comicId}/${comicId}_cover.png`;
    
            const test = new Image();
            test.onload = () => {
                img.src = langPath;
            };
            test.onerror = () => {
                console.warn("Cover not found :", langPath, " → fallback to english");
                img.src = fallback;
            };
            test.src = langPath;
        }
    }
    
    function checkComicsAvailability(lang) {
        const BASE = "/comics";
        const comics = Object.fromEntries([
            ["tf00","catchup-comic"],
            ["tf01","ring-of-fired"],
            ["tf02","unhappy-returns"],
            ["tf03","a-cold-day-in-hell"],
            ["tf04","blood-in-the-water"],
            ["tf05","old-wounds"],
            ["tf06","the-naked-and-the-dead"],
            ["tf07","the-days-have-worn-away"],
            ["tfu00","XXXXXX"],
            ["tfu01","XXXXXX"],
            ["tfu02","XXXXXX"]
            ].map(([id, slug]) => [
            id+"Cover",
            { dir: `${id}_${slug}`, file: `${id}_${slug.replace(/-/g,"_")}-1.jpg` } //this line converts kebab case (folders) to snake case (files)
            ]));

        for (const [imgId, { dir, file }] of Object.entries(comics)) {
            const img = document.getElementById(imgId);
            if (!img) continue;
            
            const wrapper = img.closest(".image_wrapper");
            const overlay = wrapper ? wrapper.querySelector(".overlay") : null;
            if (!overlay) continue;
            
            const url = `${BASE}/${dir}/${lang}/${file}`;
            
            const test = new Image();
            test.onload = () => { overlay.style.display = "none"; };
            test.onerror = () => { overlay.style.display = "flex"; };
            test.src = url + "?_ts=" + Date.now(); // anti-cache
        }
    }

    //Handling the language selector button
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
