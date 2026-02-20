lucide.createIcons();

const video = document.getElementById("video");
const log = document.getElementById("log-text");
const recordBtn = document.getElementById("record-btn");
const startBtn = document.getElementById("start-btn");
const snapBtn = document.getElementById("snap-btn");
const openBtn = document.getElementById("open-btn");
const timerElement = document.getElementById("timer");

let mediaRecorder;
let recordedChunks = [];
let timerInterval;
let seconds = 0;

function updateTimerDisplay() {
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  timerElement.innerText = `${hrs}:${mins}:${secs}`;
}

function startTimer() {
  seconds = 0;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    seconds++;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  updateTimerDisplay();
}

async function initSystem() {
  try {
    log.innerText = "REQUESTING_ACCESS...";
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: "always" },
      audio: true,
    });

    video.srcObject = stream;

    video.onloadedmetadata = () => {
      video.play();
      enableButtons();
      log.innerText = "SYSTEM_ONLINE: Source Linked.";
    };

    setupRecorder(stream);
    stream.getVideoTracks()[0].onended = () => {
      resetSystem();
    };
  } catch (e) {
    log.innerText = "ERROR: Access Denied or Cancelled.";
    console.error(e);
  }
}

function setupRecorder(stream) {
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NovaRecord_${new Date().getTime()}.webm`;
    a.click();
    recordedChunks = [];
    log.innerText = "FILE_EXPORTED: Check Downloads.";
  };
}

recordBtn.onclick = () => {
  if (mediaRecorder.state === "inactive") {
    mediaRecorder.start();
    startTimer();
    recordBtn.classList.add("active");
    recordBtn.innerHTML = `<i data-lucide="square"></i>`; // تغییر آیکون به توقف
    log.innerText = "RECORDING_IN_PROGRESS...";
  } else {
    mediaRecorder.stop();
    stopTimer();
    recordBtn.classList.remove("active");
    recordBtn.innerHTML = `<i data-lucide="circle-dot"></i>`;
    log.innerText = "ENCODING_VIDEO...";
  }
  lucide.createIcons();
};

snapBtn.onclick = () => {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 1920;
  canvas.height = video.videoHeight || 1080;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const link = document.createElement("a");
  link.download = `NovaSnap_${new Date().getTime()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  log.innerText = "SNAPSHOT_SAVED.";
};

startBtn.onclick = async () => {
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await video.requestPictureInPicture();
      log.innerText = "PIP_MODE_ACTIVE.";
    }
  } catch (err) {
    log.innerText = "PIP_ERROR: Not Supported.";
  }
};

function enableButtons() {
  startBtn.disabled = false;
  recordBtn.disabled = false;
  snapBtn.disabled = false;
}

function resetSystem() {
  stopTimer();
  startBtn.disabled = true;
  recordBtn.disabled = true;
  snapBtn.disabled = true;
  log.innerText = "SYSTEM_OFFLINE: Source Disconnected.";
  timerElement.innerText = "00:00:00";
}

openBtn.onclick = initSystem;
const panel = document.querySelector(".master-panel");

document.addEventListener("mousemove", (e) => {
  const x = (window.innerWidth / 2 - e.clientX) / 80;
  const y = (window.innerHeight / 2 - e.clientY) / 80;
  panel.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
});

document.querySelectorAll(".glass-btn").forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--x", `${e.clientX - rect.left}px`);
    btn.style.setProperty("--y", `${e.clientY - rect.top}px`);
  });
});
