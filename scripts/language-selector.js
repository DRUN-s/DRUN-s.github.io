document.addEventListener("DOMContentLoaded", function () {
    let container = document.getElementById('select-container');
    let items = container.getElementsByTagName('ul')[0].getElementsByTagName('li');

    if (items.length === 0) {
        console.error("Aucun élément de langue trouvé !");
        return;
    }

    let selectedItem = items[0];
    selectedItem.setAttribute("selected", "true");

    for (let i = 1; i < items.length; i++) {
        items[i].addEventListener("click", function () {
            onSelect(this);
        });
    }

    function onSelect(item) {
        let langCode = item.getAttribute('lang-selection');

        console.log("Langue sélectionnée :", langCode);

        showUnselected();
        selectedItem.innerHTML = item.innerHTML;
        selectedItem.setAttribute('lang-selection', langCode);
        selectedItem.setAttribute('tooltip', item.getAttribute('tooltip'));
        hideSelected();
        unwrapSelector();

        updateText(langCode); // Mettre à jour les textes !
    }

    function updateText(lang) {
        if (translations[lang]) {
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

        for (let i = 1; i < items.length; i++) {
            if (items[i].getAttribute('lang-selection') === selectedLangCode) {
                items[i].style.opacity = '1';
                items[i].style.display = '';
                break;
            }
        }
    }

    function hideSelected() {
        let selectedLangCode = selectedItem.getAttribute('lang-selection');

        for (let i = 1; i < items.length; i++) {
            if (items[i].getAttribute('lang-selection') === selectedLangCode) {
                items[i].style.opacity = '0';
                setTimeout(() => items[i].style.display = 'none', 200);
                break;
            }
        }
    }

    hideSelected();
});
