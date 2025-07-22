window.addEventListener("DOMContentLoaded", function () {
    const langContainer = document.getElementById("language-container");
  
    // Position originale par rapport au haut de la page
    const containerTop = langContainer.getBoundingClientRect().top + window.scrollY;
  
    function handleScroll() {
      const scrollTop = window.scrollY;
  
      if (scrollTop >= containerTop) {
        langContainer.classList.add("sticky");
      } else {
        langContainer.classList.remove("sticky");
      }
    }
  
    window.addEventListener("scroll", handleScroll);
  });
  