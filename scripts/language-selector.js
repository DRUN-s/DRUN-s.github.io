document.addEventListener("DOMContentLoaded", function () {
    let dropdown = document.getElementById('language-dropdown');
    let container = document.getElementById('select-container');
    let list = container.getElementsByTagName('ul')[0];
    let items = list.getElementsByTagName('li');
    let selectedItem = document.getElementById('selectedItem');

    if (items.length === 0) {
        console.error("Aucun élément de langue trouvé !");
        return;
    }

    // Init visuelle : cache l'élément de la langue active dans la liste
    let activeLangCode = selectedItem.getAttribute('lang-selection');
    for (let i = 0; i < items.length; i++) {
        let itemLang = items[i].getAttribute('lang-selection');
        if (itemLang === activeLangCode) {
            items[i].style.opacity = '0';
            items[i].style.display = 'none';
        }

        items[i].addEventListener("click", function () {
            onSelect(this);
        });
    }

    selectedItem.addEventListener("click", function (e) {
        e.stopPropagation();
        dropdown.classList.toggle("open");
    });

    // Fermer le menu si clic en dehors
    document.addEventListener("click", function () {
        dropdown.classList.remove("open");
    });

    function onSelect(item) {
        let langCode = item.getAttribute('lang-selection');

        console.log("Langue sélectionnée :", langCode);

        showUnselected();
        selectedItem.innerHTML = item.innerHTML + '<span class="arrow-down"></span>';
        selectedItem.setAttribute('lang-selection', langCode);
        selectedItem.setAttribute('tooltip', item.getAttribute('tooltip'));
        hideSelected();
        unwrapSelector();
        dropdown.classList.remove("open");

        updateText(langCode); // Mettre à jour les textes !
    }

    function updateText(lang) {
        if (typeof translations !== "undefined" && translations[lang]) {
            document.getElementById('blurbText').textContent = translations[lang]["blurbText"];
            document.getElementById('WIPText').textContent = translations[lang]["WIPText"];
        } else {
            console.warn("Aucune traduction trouvée pour la langue :", lang);
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
