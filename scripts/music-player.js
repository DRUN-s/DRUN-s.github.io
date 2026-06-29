  let pausePlayButton = document.querySelector("#pauseMusicImg");
  let trackName = document.querySelector("#musicPlayerTitle");
  let trackIndex=0;
  let trackList = [
    {
      name: "Upgrade Station",
      path: "sounds/upgradeStation.mp3"
    },
    {
      name: "Archimedes",
      path: "sounds/Archimedes.mp3"
    }
    /* {
      name: "Test",
      path: "sounds/cha-ching-money.mp3"
    } */
  ];
  let isPlaying=false;
  let isLooping=true;
  console.log(isPlaying)
  let currTrack=document.createElement("audio");
  function loadTrack(trackIndex) {
    let trackPath=trackList[trackIndex].path;
    let trackSource="";
    // if the script is called upon from comicreader.html it adds a '../' to the file path of the song (because the comic reader is in /comics)
    if (window.location.pathname=="/comics/comicreader.html") {
      const folderAbove="../";
      trackSource=folderAbove.concat(trackPath);
    } else {trackSource=trackPath;} // if not it assings the path from trackList directly as the song filepath
    currTrack.src = trackSource;
    currTrack.load();
    trackName.innerHTML = trackList[trackIndex].name;
    if (isLooping) {
    currTrack.loop = true;
    playMusic();
    }
    else {
      currTrack.addEventListener("ended", nextTrack);
      playMusic();
    }
  }
  
  loadTrack(trackIndex); // this loads the music track upon first opening the site


  function playPauseMusic() {
    if(!isPlaying) playMusic();
    else pauseMusic();
  }

  function playMusic() {
    currTrack.play();
    if (isLooping) {
      currTrack.loop = true;
    }
    isPlaying=true;
    if(window.location.pathname=="/comics/comicreader.html") {pausePlayButton.src="../images/pause.svg";}
    else {pausePlayButton.src="images/pause.svg";}

  }
  function pauseMusic() {
    currTrack.pause();
    isPlaying = false;
    if(window.location.pathname=="/comics/comicreader.html") {pausePlayButton.src="../images/play.svg";}
    else {pausePlayButton.src="images/play.svg";}
    console.log(isPlaying)
  }
  
  pauseMusic() //makes the default to paused

  function nextTrack() {
  // Go back to the first track if the
  // current one is the last in the track list
  if (trackIndex < trackList.length - 1)
    trackIndex += 1;
  else trackIndex = 0;
  loadTrack(trackIndex);
  playMusic();
  }

  function prevTrack() {
    // goes back to the last track if the current one is the first one
    if (trackIndex == 0)
      trackIndex = trackList.length - 1;
    else trackIndex -= 1;
    loadTrack(trackIndex);
    playMusic();
  }

  // script for changing the volume
  let volume = document.querySelector("#volume");
  volume.addEventListener("change", function(e) {
  currTrack.volume = e.currentTarget.value / 100;
  })

let music_player = document.querySelector("#musicPlayer");
  let maximise_window = document.querySelector("#maximizeIcon");
  // btn is our parameter, its min when its ordered to be minimized and max when maximized
  function changeSize(btn) {
    if (btn=="min") {
      music_player.style.display = "none";
      maximise_window.style.display = "flex";
    }
    else if(btn=="max") {
      music_player.style.display = "block";
      maximise_window.style.display = "none";
    }
  }
  
