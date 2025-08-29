document.addEventListener("DOMContentLoaded", function () {
    let dropdown = document.getElementById('language-dropdown');
    let container = document.getElementById('select-container');
    let list = container.getElementsByTagName('ul')[0];
    let items = list.getElementsByTagName('li');
    let selectedItem = document.getElementById('selectedItem');

    const defaultTexts = {}; // Stockage des textes par défaut

    if (items.length === 0) {
        console.error("Aucun élément de langue trouvé !");
        return;
    }

    // --- Détection langue effective ---
    const supportedLangs = ["EN","FR","FI","ES","KR","DE","PL","TR","CS"];
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split("-")[0].toUpperCase();
    const savedLang = localStorage.getItem("selectedLanguage");

    let effectiveLang = savedLang || (supportedLangs.includes(langCode) ? langCode : "EN");
    localStorage.setItem("selectedLanguage", effectiveLang);

    console.log("Langue appliquée :", effectiveLang);

    // --- Mise à jour du bouton ET du lecteur ---
    const item = document.querySelector(`#select-container li[lang-selection="${effectiveLang}"]`);
    if (item && selectedItem) {
        selectedItem.innerHTML = item.innerHTML + '<span class="arrow-down"></span>';
        selectedItem.setAttribute("lang-selection", effectiveLang);
    }

    updateText(effectiveLang);
    hideSelected();

    // --- Gestion des clics sur la liste ---
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
        console.log("Langue sélectionnée :", langCode);

        localStorage.setItem("selectedLanguage", langCode);

        showUnselected();
        selectedItem.innerHTML = item.innerHTML + '<span class="arrow-down"></span>';
        selectedItem.setAttribute('lang-selection', langCode);
        selectedItem.setAttribute('tooltip', item.getAttribute('tooltip'));
        hideSelected();
        unwrapSelector();
        dropdown.classList.remove("open");

        updateText(langCode);
    }

    function updateText(lang) {
        if (!translations?.[lang]) {
            console.warn("Aucune traduction trouvée pour la langue :", lang);
            return;
        }
    
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
