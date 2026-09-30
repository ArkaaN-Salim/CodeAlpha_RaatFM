const tracks = [
  {
    title: "Is Tarah Aashiqui Ka",
    artist: "Kumar Sanu",
    src: "audio/track-01.mp3"
  },
  {
    title: "Pehli Pehli Baar Mohabbat Ki Hai",
    artist: "Kumar Sanu, Alka Yagnik",
    src: "audio/track-02.mp3"
  },
  {
    title: "Mujhse Mohabbat Ka Izhaar Karta",
    artist: "Alka Yagnik, Kumar Sanu",
    src: "audio/track-03.mp3"
  }
];

const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");
const muteBtn = document.getElementById("muteBtn");
const trackTitle = document.getElementById("trackTitle");
const trackArtist = document.getElementById("trackArtist");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const clock = document.getElementById("clock");
const onlineCount = document.getElementById("onlineCount");
const playlistBtn = document.getElementById("playlistBtn");
const playlistPanel = document.getElementById("playlistPanel");
const playlist = document.getElementById("playlist");
const autoplayBtn = document.getElementById("autoplayBtn");
const announcement = document.getElementById("playerAnnouncement");

let currentTrack = 0;
let autoplayEnabled = true;
let lastVolume = Number(volume.value);

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
}

function renderPlaylist() {
  playlist.innerHTML = tracks.map((track, index) => `
    <button class="playlist-item ${index === currentTrack ? "current" : ""}" data-index="${index}" type="button">
      <span class="playlist-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="playlist-meta">
        <span class="playlist-title">${track.title}</span>
        <span class="playlist-artist">${track.artist}</span>
      </span>
      <span class="playlist-duration" id="playlistDuration-${index}">—</span>
    </button>
  `).join("");

  playlist.querySelectorAll(".playlist-item").forEach((item) => {
    item.addEventListener("click", () => {
      loadTrack(Number(item.dataset.index), true);
    });
  });
}

function updatePlaylistHighlight() {
  playlist.querySelectorAll(".playlist-item").forEach((item, index) => {
    item.classList.toggle("current", index === currentTrack);
  });
}

function loadTrack(index, shouldPlay = false) {
  const track = tracks[index];
  currentTrack = index;
  audio.src = track.src;
  audio.load();

  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist;
  duration.textContent = "0:00";
  currentTime.textContent = "0:00";
  progress.value = 0;
  updatePlaylistHighlight();
  announcement.textContent = `Loaded ${track.title} by ${track.artist}`;

  if (shouldPlay) playTrack();
}

async function playTrack() {
  try {
    await audio.play();
  } catch (error) {
    console.warn("Audio could not start:", error);
  }
}

function togglePlay() {
  if (audio.paused) playTrack();
  else audio.pause();
}

function nextTrack() {
  currentTrack = (currentTrack + 1) % tracks.length;
  loadTrack(currentTrack, true);
}

function previousTrack() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
  loadTrack(currentTrack, true);
}

function updatePlayerState() {
  const isPlaying = !audio.paused;
  playBtn.textContent = isPlaying ? "❚❚" : "▶";
  playBtn.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
  playBtn.title = isPlaying ? "Pause" : "Play";
}

function togglePlaylist() {
  const isHidden = playlistPanel.hidden;
  playlistPanel.hidden = !isHidden;
  playlistBtn.setAttribute("aria-expanded", String(isHidden));
}

function toggleAutoplay() {
  autoplayEnabled = !autoplayEnabled;
  autoplayBtn.classList.toggle("active", autoplayEnabled);
  autoplayBtn.setAttribute("aria-pressed", String(autoplayEnabled));
  autoplayBtn.title = autoplayEnabled ? "Autoplay on" : "Autoplay off";
  announcement.textContent = autoplayEnabled ? "Autoplay enabled" : "Autoplay disabled";
}

audio.volume = Number(volume.value);

function updateVolumeUI() {
  const muted = audio.muted || audio.volume === 0;
  muteBtn.textContent = muted ? "🔇" : "🔊";
  muteBtn.setAttribute("aria-pressed", String(muted));
  muteBtn.setAttribute("aria-label", muted ? "Unmute" : "Mute");
  muteBtn.title = muted ? "Unmute" : "Mute";
}

updateVolumeUI();

volume.addEventListener("input", () => {
  const nextVolume = Number(volume.value);
  audio.volume = nextVolume;
  audio.muted = false;
  if (nextVolume > 0) lastVolume = nextVolume;
  updateVolumeUI();
});

muteBtn.addEventListener("click", () => {
  if (audio.muted || audio.volume === 0) {
    const restored = lastVolume > 0 ? lastVolume : 0.8;
    audio.muted = false;
    audio.volume = restored;
    volume.value = restored;
  } else {
    lastVolume = audio.volume;
    audio.muted = true;
  }
  updateVolumeUI();
});

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  progress.value = (audio.currentTime / audio.duration) * 100;
  currentTime.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  duration.textContent = formatTime(audio.duration);
  const itemDuration = document.getElementById(`playlistDuration-${currentTrack}`);
  if (itemDuration) itemDuration.textContent = formatTime(audio.duration);
});

audio.addEventListener("play", updatePlayerState);
audio.addEventListener("pause", updatePlayerState);

audio.addEventListener("ended", () => {
  if (autoplayEnabled) nextTrack();
  else updatePlayerState();
});

audio.addEventListener("error", () => {
  trackArtist.textContent = "Audio file unavailable";
  announcement.textContent = `Could not load ${tracks[currentTrack].title}`;
});

progress.addEventListener("input", () => {
  if (!audio.duration) return;
  audio.currentTime = (Number(progress.value) / 100) * audio.duration;
});

playBtn.addEventListener("click", togglePlay);
previousBtn.addEventListener("click", previousTrack);
nextBtn.addEventListener("click", nextTrack);
playlistBtn.addEventListener("click", togglePlaylist);
autoplayBtn.addEventListener("click", toggleAutoplay);

document.addEventListener("click", (event) => {
  if (!event.target.closest(".music-player")) {
    playlistPanel.hidden = true;
    playlistBtn.setAttribute("aria-expanded", "false");
  }
});

function updateClock() {
  clock.textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

function updateOnlineCount() {
  const current = Number(onlineCount.textContent);
  const change = Math.random() < 0.5 ? -1 : 1;
  onlineCount.textContent = Math.max(18, Math.min(36, current + change));
}

document.addEventListener("keydown", (event) => {
  if (event.target.matches("input, button, a")) return;
  if (event.code === "Space") {
    event.preventDefault();
    togglePlay();
  }
  if (event.key === "ArrowRight") nextTrack();
  if (event.key === "ArrowLeft") previousTrack();
  if (event.key === "ArrowUp") {
    event.preventDefault();
    volume.value = Math.min(1, Number(volume.value) + 0.05).toFixed(2);
    audio.volume = Number(volume.value);
    audio.muted = false;
    lastVolume = audio.volume;
    updateVolumeUI();
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    volume.value = Math.max(0, Number(volume.value) - 0.05).toFixed(2);
    audio.volume = Number(volume.value);
    audio.muted = false;
    if (audio.volume > 0) lastVolume = audio.volume;
    updateVolumeUI();
  }
});

renderPlaylist();
loadTrack(0);
updatePlayerState();
updateClock();
setInterval(updateClock, 1000);
setInterval(updateOnlineCount, 7000);
