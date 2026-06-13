window.addEventListener("DOMContentLoaded", function () {
    const langContainer = document.getElementById("language-container");
  
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
  
  function playSound(src, volume = 0.5) {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => {});
  }

  window.IDDQD = function() {
    playSound("/sounds/haaax.mp3");
    console.log("Degreelessness mode on");
  };
  
