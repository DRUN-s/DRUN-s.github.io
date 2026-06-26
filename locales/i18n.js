// scripts/i18n.js
const I18n = (() => {
  const SUPPORTED = ['en','fr','es','de','it','pl','tr','fi','kr','sw','cs','ro','et','sk','ptbr','ja'];
  const _defaults = {};
  function detectLang() {
    // selectedLanguage = choix utilisateur partagé avec comicviewer.js, prioritaire.
    const selected = localStorage.getItem('selectedLanguage');
    if (selected && SUPPORTED.includes(selected)) return selected;
    const saved = localStorage.getItem('lang');
    if (saved && SUPPORTED.includes(saved)) return saved;
    const browser = (navigator.language || '').split('-')[0].toLowerCase();
    return SUPPORTED.includes(browser) ? browser : 'en';
    }
  async function load(lang) {
    const res = await fetch(`/locales/${lang}.json`);
    if (!res.ok) return load('en');
    return res.json();
    }
  function applyDict(dict) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (!(key in _defaults)) _defaults[key] = el.innerHTML;
      const val = dict[key];
      if (!val || val.trim() === '') { el.innerHTML = _defaults[key]; return; }
      if (/<[a-z][\s\S]*>/i.test(val)) el.innerHTML = val;
      else el.textContent = val;
      });
    }
  async function setLang(lang) {
    lang = lang.toLowerCase();
    if (!SUPPORTED.includes(lang)) {
      console.warn(`I18n: unsupported language "${lang}", falling back to en`);
      lang = 'en';
      }
    const dict = await load(lang);
    applyDict(dict);
    localStorage.setItem('lang', lang);
    // selectedLanguage = langue choisie par l'utilisateur, partagée avec
    // comicviewer.js pour qu'elle persiste entre les pages i18n et les pages comic.
    localStorage.setItem('selectedLanguage', lang);
    document.documentElement.lang = lang;
    return { lang, dict };
    }
  async function init() {
    return setLang(detectLang());
    }
  return { init, setLang, load, applyDict, detectLang, SUPPORTED };
  })();
