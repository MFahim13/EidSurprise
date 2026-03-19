// ============= GLOBAL STATE =============
let gameState = {
  miniReady: false,
  envelopeOpened: false,
  envelopeShown: false,
  giftBoxOpened: false,
  catTapCount: 0,
  catTapTimeout: null,
  isPlaying: false,
  currentStep: 0,
  isDJMode: false,
};

// ============= iOS HAPTIC FEEDBACK HELPER =============
/**
 * Trigger haptic vibration optimized for iOS and Android
 * iOS uses stronger patterns; Android uses standard Vibration API
 */
function triggerHaptic(pattern) {
  if (!navigator.vibrate && !navigator.webkitVibrate) {
    return; // Vibration not supported
  }

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const vibrateAPI = navigator.vibrate || navigator.webkitVibrate;

  if (isIOS) {
    // iOS: Amplify pattern for stronger feedback (iOS haptics are subtle)
    const amplifiedPattern = pattern.map((val, idx) => {
      // Amplify pauses more than vibrations for better iOS feedback
      return idx % 2 === 0 ? Math.min(val * 1.5, 200) : val * 1.2;
    });
    try {
      vibrateAPI.call(navigator, amplifiedPattern);
    } catch (e) {
      // Fallback: single strong vibration
      try {
        vibrateAPI.call(navigator, [100]);
      } catch (err) {
        console.log("Vibration not supported on this device");
      }
    }
  } else {
    // Android: Use pattern as-is
    try {
      vibrateAPI.call(navigator, pattern);
    } catch (e) {
      console.log("Vibration error:", e);
    }
  }
}

// ============= INITIALIZATION =============
document.addEventListener("DOMContentLoaded", () => {
  // Set default audio volume to 50% to avoid loud jump-scare
  const audioPlayer = document.getElementById("audio-player");
  if (audioPlayer) {
    audioPlayer.volume = 0.5;
  }

  setTimeout(() => {
    fadeOutLoadingScreen();
  }, 1500);
});

function fadeOutLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.classList.add("fade-out");
    setTimeout(() => {
      loadingScreen.remove();
      setDynamicGreeting();
      initializePage();
    }, 800);
  } else {
    setDynamicGreeting();
    initializePage();
  }
}

// ============= DYNAMIC TIME-BASED GREETING =============
function setDynamicGreeting() {
  const greetingElement = document.getElementById("dynamic-greeting");
  if (!greetingElement) return;

  const currentHour = new Date().getHours();
  let greeting = "";

  if (currentHour >= 5 && currentHour < 12) {
    // Morning: 5 AM - 12 PM
    greeting = "Good Morning, Ayat 🩷 🌅";
  } else if (currentHour >= 12 && currentHour < 17) {
    // Afternoon: 12 PM - 5 PM
    greeting = "Good Afternoon, Ayat 🩷 ☀️";
  } else if (currentHour >= 17 && currentHour < 21) {
    // Evening: 5 PM - 9 PM
    greeting = "Good Evening, Ayat 🩷 🌆";
  } else {
    // Night: 9 PM - 5 AM
    greeting = "Good Night, Ayat 🩷 🌙";
  }

  greetingElement.textContent = greeting;
}

function initializePage() {
  // Mini introduces herself with enthusiasm
  speakWithBubble("Hi there! I'm Mini! 🐱✨");

  setTimeout(() => {
    speakWithBubble("Welcome to your Eid celebration! 🌙💖");
  }, 2000);

  setTimeout(() => {
    speakWithBubble("I have something special waiting for you... ✉️");
  }, 4200);

  // Show envelope immediately as website loads
  setTimeout(() => {
    showEnvelope();
  }, 6000);

  // Setup interactions
  setupMiniInteractions();
  setupTouchTracking();

  // Random Mini reactions
  setInterval(() => {
    if (gameState.currentStep > 0 && !gameState.isPlaying) {
      const reactions = [
        "You're amazing! ✨",
        "Having fun? 🎉",
        "This is magical! 🌙",
      ];
      const random = Math.floor(Math.random() * reactions.length);
      if (Math.random() > 0.85) {
        speakWithBubble(reactions[random]);
      }
    }
  }, 12000);

  // Periodic Mini blink
  setInterval(() => {
    blinkCat();
  }, 5000);
}

// ============= MINI CAT INTERACTIONS =============

function setupMiniInteractions() {
  const mini = document.getElementById("mini");

  mini.addEventListener("click", () => {
    handleMiniTap();
  });

  mini.addEventListener("touchstart", (e) => {
    e.preventDefault();
    handleMiniTap();
  });
}

function handleMiniTap() {
  // Haptic feedback: Light tap for cat click
  triggerHaptic([10, 5, 10]);

  jumpCat();
  gameState.catTapCount++;

  // Random reaction to taps
  const reactions = ["Happy! 😸", "Hehe! 😸", "Again! 😸"];
  const random = Math.floor(Math.random() * reactions.length);
  speakWithBubble(reactions[random]);

  // Check for special interaction (5 taps)
  if (gameState.catTapTimeout) {
    clearTimeout(gameState.catTapTimeout);
  }

  gameState.catTapTimeout = setTimeout(() => {
    gameState.catTapCount = 0;
  }, 2000);

  if (gameState.catTapCount === 5) {
    triggerHeartExplosion();
    gameState.catTapCount = 0;

    // Haptic feedback: Special vibration for secret tap explosion
    triggerHaptic([100, 50, 100, 50, 100]);
  }
}

function jumpCat() {
  const mini = document.getElementById("mini");
  mini.classList.add("jump");
  setTimeout(() => mini.classList.remove("jump"), 600);
}

function blinkCat() {
  const mini = document.getElementById("mini");
  const emoji = mini.querySelector(".cat-emoji");
  // Blink effect by temporary hiding
  emoji.style.opacity = "0";
  setTimeout(() => {
    emoji.style.opacity = "1";
  }, 150);
}

function speakWithBubble(text) {
  const bubble = document.getElementById("speech-bubble");

  // Remove existing fade-out class
  bubble.classList.remove("fade-out");

  bubble.innerHTML = `<p>${text}</p>`;

  // Auto-hide after 3 seconds
  setTimeout(() => {
    bubble.classList.add("fade-out");
  }, 3000);
}

// ============= PUPIL TRACKING =============

function setupTouchTracking() {
  document.addEventListener("mousemove", (e) => {
    updateMiniLook(e.clientX, e.clientY);
  });

  document.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
      updateMiniLook(e.touches[0].clientX, e.touches[0].clientY);
    }
  });
}

function updateMiniLook(x, y) {
  const mini = document.getElementById("mini");
  const miniRect = mini.getBoundingClientRect();
  const miniCenterX = miniRect.left + miniRect.width / 2;
  const miniCenterY = miniRect.top + miniRect.height / 2;

  const angle = Math.atan2(y - miniCenterY, x - miniCenterX);

  // Rotate cat based on where user touches
  if (Math.abs(angle) > 1.5) {
    mini.style.transform = "scaleX(-1)";
  } else {
    mini.style.transform = "scaleX(1)";
  }
}

// ============= ENVELOPE INTERACTION =============

function showEnvelope() {
  if (gameState.envelopeShown) return;

  gameState.envelopeShown = true;
  gameState.currentStep = 1;

  const envelopeContainer = document.getElementById("envelope-container");
  envelopeContainer.style.display = "block";

  const envelope = document.getElementById("envelope");
  envelope.addEventListener("click", openEnvelope);
  envelope.addEventListener("touchstart", (e) => {
    e.preventDefault();
    openEnvelope();
  });
}

function openEnvelope() {
  if (gameState.envelopeOpened) return;

  // Haptic feedback: Gentle vibration for envelope opening
  triggerHaptic([20, 15, 25]);

  gameState.envelopeOpened = true;
  gameState.currentStep = 2;

  const letter = document.getElementById("letter");
  const envelope = document.getElementById("envelope");

  // Envelope stays visible
  envelope.style.opacity = "1";
  envelope.style.pointerEvents = "auto";

  // Create sparkles effect
  createSparkles(20);

  // Trigger letter animation (slide out from envelope)
  letter.classList.add("show");
  letter.offsetHeight; // Force reflow to ensure animation triggers

  speakWithBubble("Here's your message! 💌✨");

  // Setup close button
  const closeLetterBtn = document.getElementById("close-letter-btn");
  closeLetterBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeLetter();
  });
  closeLetterBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeLetter();
  });

  // Add click outside handler - DISABLED: only close via X button
  // setTimeout(() => {
  //     document.addEventListener('click', handleLetterClickOutside);
  //     document.addEventListener('touchstart', handleLetterClickOutside);
  // }, 100);
}

function handleLetterClickOutside(e) {
  // Only close if X button is clicked
  // This function is kept for legacy but not called
}

function closeLetter() {
  const letter = document.getElementById("letter");

  // Close letter
  letter.classList.remove("show");
  letter.classList.add("hide");

  speakWithBubble("Ready for your gift? 🎁");

  // Remove listener
  document.removeEventListener("click", handleLetterClickOutside);
  document.removeEventListener("touchstart", handleLetterClickOutside);

  // After letter closes, show gift button
  setTimeout(() => {
    gameState.envelopeOpened = false;
    showGiftButton();
  }, 800);
}

function showGiftButton() {
  const giftButton = document.getElementById("gift-button");
  const envelopeContainer = document.getElementById("envelope-container");

  // Hide envelope container
  envelopeContainer.style.display = "none";

  // Show gift button
  giftButton.style.display = "block";

  // Setup gift button handler
  giftButton.addEventListener("click", handleGiftButtonClick);
  giftButton.addEventListener("touchstart", (e) => {
    e.preventDefault();
    handleGiftButtonClick();
  });

  // Show effect buttons and music player early (before gift opening)
  setTimeout(() => {
    showInteractionButtons();
  }, 1500);
}

function handleGiftButtonClick() {
  // Haptic feedback: Medium vibration for gift button click
  triggerHaptic([25, 10, 25, 10, 30]);

  const giftButton = document.getElementById("gift-button");
  giftButton.style.display = "none";

  gameState.currentStep = 3;
  prepareGiftBox();
}

// ============= GIFT BOX INTERACTION =============

function prepareGiftBox() {
  gameState.currentStep = 3;
  const mini = document.getElementById("mini");
  const giftBoxContainer = document.getElementById("gift-box-container");

  // Show gift box
  giftBoxContainer.style.display = "flex";

  // Start shaking the gift
  const giftBox = document.getElementById("gift-box");
  giftBox.classList.add("shake");
  speakWithBubble("Open your gift! 🎉");

  // Make mini excited
  mini.classList.add("jump");
  setTimeout(() => mini.classList.remove("jump"), 600);

  setupGiftBoxInteraction();
}

function setupGiftBoxInteraction() {
  const giftBox = document.getElementById("gift-box");
  giftBox.addEventListener("click", openGiftBox);
  giftBox.addEventListener("touchstart", (e) => {
    e.preventDefault();
    openGiftBox();
  });
}

function openGiftBox() {
  if (gameState.giftBoxOpened) return;

  gameState.giftBoxOpened = true;
  gameState.currentStep = 4;

  const giftBox = document.getElementById("gift-box");
  const giftOpened = document.getElementById("gift-opened");
  const rewardCard = document.getElementById("reward-card");

  giftBox.classList.remove("shake");
  giftBox.classList.add("open");

  // Haptic feedback: Strong vibration pattern for gift opening celebration
  triggerHaptic([30, 10, 30, 10, 50]); // Pattern: strong celebration

  // Create big celebration
  createConfetti(100);
  createFireworks(150);

  // Fade out gift box completely
  setTimeout(() => {
    giftBox.style.transition = "all 0.4s ease";
    giftBox.style.opacity = "0";
    giftBox.style.transform = "scale(0.8)";
    giftBox.style.pointerEvents = "none";
  }, 300);

  // Tulips and chocolates fly away
  setTimeout(() => {
    giftOpened.style.display = "block";
    createFlyingTulipsAndChocolates(30); // Increased count for more items
    createFlyingChocolates(25); // Increased count for more items

    // Make Mini dance
    const mini = document.getElementById("mini");
    mini.classList.add("dance");
    setTimeout(() => mini.classList.remove("dance"), 1000);
  }, 500);

  // After items fly away, display the reward card
  setTimeout(() => {
    rewardCard.style.display = "block";

    // Setup close button only on reward card
    const closeBtn = document.getElementById("close-gift-btn");
    closeBtn.addEventListener("click", closeGiftCard);
    closeBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      closeGiftCard();
    });
  }, 2500);
}

function closeGiftCard() {
  const giftOpened = document.getElementById("gift-opened");
  const giftBoxContainer = document.getElementById("gift-box-container");
  const buttonsContainer = document.getElementById("buttons-container");
  const musicPlayer = document.getElementById("music-player");

  // Fade out gift card
  giftOpened.style.transition = "all 0.4s ease";
  giftOpened.style.opacity = "0";
  giftOpened.style.transform = "scale(0.8)";

  setTimeout(() => {
    giftOpened.style.display = "none";
    // Reset state for potential replay
    gameState.giftBoxOpened = false;
  }, 400);
}

// ============= EFFECT BUTTONS =============

function showInteractionButtons() {
  const buttonsContainer = document.getElementById("buttons-container");
  const musicPlayer = document.getElementById("music-player");

  buttonsContainer.style.display = "flex";
  musicPlayer.style.display = "flex";

  setupEffectButtons();
  setupMusicPlayer();
}

function setupEffectButtons() {
  const fireworksBtn = document.getElementById("fireworks-btn");
  const confettiBtn = document.getElementById("confetti-btn");
  const sparklesBtn = document.getElementById("sparkles-btn");
  const heartsBtn = document.getElementById("hearts-btn");
  const tulipsBtn = document.getElementById("tulips-btn");

  if (
    !fireworksBtn ||
    !confettiBtn ||
    !sparklesBtn ||
    !heartsBtn ||
    !tulipsBtn
  ) {
    return;
  }

  const handleFireworks = (e) => {
    if (e) e.preventDefault();
    createFireworks(120); // Increased for denser effect
    speakWithBubble("Boom! 🎆");

    // Haptic feedback: Intense rapid vibration for fireworks
    triggerHaptic([50, 30, 50, 30, 50]);
  };

  const handleConfetti = (e) => {
    if (e) e.preventDefault();
    createConfetti(100);
    speakWithBubble("Yay! 🎊");

    // Haptic feedback: Quick short vibration for confetti
    triggerHaptic([20, 10, 20]);
  };

  const handleSparkles = (e) => {
    if (e) e.preventDefault();
    // Haptic feedback: Sparkly light vibration
    triggerHaptic([12, 8, 12, 8, 12]);
    createSparkles(50);
    speakWithBubble("So magical! ✨");
  };

  const handleHearts = (e) => {
    if (e) e.preventDefault();
    createFloatingHearts(30);
    speakWithBubble("So sweet! 💖");

    // Haptic feedback: Soft gentle pulse for hearts
    triggerHaptic([15, 15, 15, 15, 15]);
  };

  const handleTulips = (e) => {
    if (e) e.preventDefault();
    // Haptic feedback: Gentle romantic vibration for flowers
    triggerHaptic([18, 12, 18, 12, 20]);
    createFloatingTulipsAndRoses(30);
    speakWithBubble("Beautiful tulips! 🌷");
  };

  // Remove any existing listeners
  fireworksBtn.replaceWith(fireworksBtn.cloneNode(true));
  confettiBtn.replaceWith(confettiBtn.cloneNode(true));
  sparklesBtn.replaceWith(sparklesBtn.cloneNode(true));
  heartsBtn.replaceWith(heartsBtn.cloneNode(true));
  tulipsBtn.replaceWith(tulipsBtn.cloneNode(true));

  // Get fresh references
  const newFireworksBtn = document.getElementById("fireworks-btn");
  const newConfettiBtn = document.getElementById("confetti-btn");
  const newSparklesBtn = document.getElementById("sparkles-btn");
  const newHeartsBtn = document.getElementById("hearts-btn");
  const newTulipsBtn = document.getElementById("tulips-btn");

  newFireworksBtn.addEventListener("click", handleFireworks);
  newFireworksBtn.addEventListener("touchstart", handleFireworks);

  newConfettiBtn.addEventListener("click", handleConfetti);
  newConfettiBtn.addEventListener("touchstart", handleConfetti);

  newSparklesBtn.addEventListener("click", handleSparkles);
  newSparklesBtn.addEventListener("touchstart", handleSparkles);

  newHeartsBtn.addEventListener("click", handleHearts);
  newHeartsBtn.addEventListener("touchstart", handleHearts);

  newTulipsBtn.addEventListener("click", handleTulips);
  newTulipsBtn.addEventListener("touchstart", handleTulips);
}

// ============= CONFETTI EFFECT =============

function createConfetti(count) {
  const container = document.getElementById("confetti-container");

  for (let i = 0; i < count; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";

    const x = Math.random() * window.innerWidth;
    const y = -10;

    confetti.style.left = x + "px";
    confetti.style.top = y + "px";

    // Random confetti colors
    const colors = [
      "#ff6b9d",
      "#ffd700",
      "#00d4ff",
      "#ff4757",
      "#ffb700",
      "#2ed573",
    ];
    confetti.style.background =
      colors[Math.floor(Math.random() * colors.length)];

    // Random size
    const size = Math.random() * 4 + 4;
    confetti.style.width = size + "px";
    confetti.style.height = size + "px";

    // Random x movement (swaying)
    const xMovement = (Math.random() - 0.5) * 400;
    const rotationAmount = Math.random() * 720 + 360;

    confetti.style.setProperty("--x-move", `${xMovement}px`);
    confetti.style.setProperty("--rotation", `${rotationAmount}deg`);

    // Random animation duration
    const duration = Math.random() * 2 + 2.5;
    confetti.style.setProperty("--duration", `${duration}s`);

    container.appendChild(confetti);

    // Remove after animation
    setTimeout(() => confetti.remove(), duration * 1000);
  }
}

// ============= SPARKLES EFFECT =============

function createSparkles(count) {
  const container = document.getElementById("confetti-container");

  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    sparkle.textContent = "✨";

    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;

    sparkle.style.left = x + "px";
    sparkle.style.top = y + "px";

    container.appendChild(sparkle);

    // Remove after animation
    setTimeout(() => sparkle.remove(), 2000);
  }
}

// ============= FIREWORKS EFFECT =============

function createFireworks(count) {
  const container = document.getElementById("fireworks-container");

  for (let i = 0; i < count; i++) {
    const firework = document.createElement("div");
    firework.className = "firework";

    const x = Math.random() * window.innerWidth;
    const y = Math.random() * (window.innerHeight * 0.6);

    firework.style.left = x + "px";
    firework.style.top = y + "px";

    // Random explosion direction with more spread
    const angle = Math.random() * Math.PI * 2;
    const velocity = 100 + Math.random() * 250; // Increased velocity
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;

    firework.style.setProperty("--tx", `${tx}px`);
    firework.style.setProperty("--ty", `${ty}px`);

    // Random burst intensity
    firework.style.setProperty("--duration", `${1.5 + Math.random() * 1}s`); // Increased duration (1.5-2.5s)

    container.appendChild(firework);

    // Remove after animation
    setTimeout(() => firework.remove(), 2500); // Increased timeout to 2.5s
  }
}

// ============= FLOATING HEARTS =============

function createFloatingHearts(count) {
  const container = document.getElementById("hearts-container");

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const heart = document.createElement("div");
      heart.className = "floating-heart";
      heart.textContent = "🩷";

      const x = Math.random() * window.innerWidth;
      const y = window.innerHeight + 20;

      heart.style.left = x + "px";
      heart.style.top = y + "px";

      container.appendChild(heart);

      // Remove after animation
      setTimeout(() => heart.remove(), 4000);
    }, i * 80);
  }
}

// ============= FLOATING TULIPS AND ROSES =============

function createFloatingTulipsAndRoses(count) {
  const container = document.getElementById("hearts-container");
  const flowers = ["💐", "🌸", "🌷"];

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const flower = document.createElement("div");
      flower.className = "floating-flower";
      flower.textContent = flowers[Math.floor(Math.random() * flowers.length)];

      const x = Math.random() * window.innerWidth;
      const y = window.innerHeight + 20;

      flower.style.left = x + "px";
      flower.style.top = y + "px";

      container.appendChild(flower);

      // Remove after animation
      setTimeout(() => flower.remove(), 4000);
    }, i * 80);
  }
}

// ============= FLYING GIFT ITEMS =============

function createFlyingTulipsAndChocolates(count) {
  const container = document.getElementById("hearts-container");
  const giftBox = document.getElementById("gift-box");
  const giftRect = giftBox.getBoundingClientRect();

  // Mix of tulips and mixed flowers
  const flowers = ["🌷", "🌸", "💐"];

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const tulip = document.createElement("div");
      tulip.className = "flying-tulip";
      tulip.textContent = flowers[Math.floor(Math.random() * flowers.length)];

      // Start from gift box center with slight random offset
      const startX = giftRect.left + giftRect.width / 2;
      const startY = giftRect.top + giftRect.height / 2;
      const offsetX = (Math.random() - 0.5) * 50;
      const offsetY = (Math.random() - 0.5) * 50;

      tulip.style.left = startX + offsetX + "px";
      tulip.style.top = startY + offsetY + "px";

      // Random angle for dispersion (maximum spread outward)
      const angle = Math.random() * Math.PI * 2;
      const distance = 750 + Math.random() * 400; // Spread distance
      const endOffsetX = Math.cos(angle) * distance;
      const endOffsetY = Math.sin(angle) * distance - 500; // Move more upward

      // Set animation values as px values for left/top animation
      const endX = startX + offsetX + endOffsetX;
      const endY = startY + offsetY + endOffsetY;

      tulip.style.setProperty("--endX", endX + "px");
      tulip.style.setProperty("--endY", endY + "px");
      tulip.style.setProperty("--rotation", Math.random() * 360);

      container.appendChild(tulip);

      // Trigger animation
      tulip.offsetHeight; // Force reflow
      tulip.classList.add("flying");

      // Remove after animation
      setTimeout(() => tulip.remove(), 2000);
    }, i * 30);
  }
}

function createFlyingChocolates(count) {
  const container = document.getElementById("hearts-container");
  const giftBox = document.getElementById("gift-box");
  const giftRect = giftBox.getBoundingClientRect();

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const chocolate = document.createElement("div");
      chocolate.className = "flying-chocolate";
      chocolate.textContent = "🍫";

      // Start from gift box center with slight random offset
      const startX = giftRect.left + giftRect.width / 2;
      const startY = giftRect.top + giftRect.height / 2;
      const offsetX = (Math.random() - 0.5) * 50;
      const offsetY = (Math.random() - 0.5) * 50;

      chocolate.style.left = startX + offsetX + "px";
      chocolate.style.top = startY + offsetY + "px";

      // Random angle for dispersion with maximum spread
      const angle = Math.random() * Math.PI * 2;
      const distance = 720 + Math.random() * 420; // Spread distance
      const endOffsetX = Math.cos(angle) * distance;
      const endOffsetY = Math.sin(angle) * distance - 520; // Move more upward

      // Set animation values as px values for left/top animation
      const endX = startX + offsetX + endOffsetX;
      const endY = startY + offsetY + endOffsetY;

      chocolate.style.setProperty("--endX", endX + "px");
      chocolate.style.setProperty("--endY", endY + "px");
      chocolate.style.setProperty("--rotation", Math.random() * 720); // More rotation for chocolates

      container.appendChild(chocolate);

      // Trigger animation
      chocolate.offsetHeight; // Force reflow
      chocolate.classList.add("flying");

      // Remove after animation
      setTimeout(() => chocolate.remove(), 2000);
    }, i * 25);
  }
}

// ============= HIDDEN INTERACTION =============

function triggerHeartExplosion() {
  const mini = document.getElementById("mini");

  // Make Mini spin
  mini.classList.add("spin");
  setTimeout(() => mini.classList.remove("spin"), 800);

  speakWithBubble("Oh my! You found the secret! 💗✨");

  // Big heart explosion
  createFloatingHearts(40);
  createSparkles(30);
  createConfetti(60);
}

// ============= MUSIC PLAYER =============

function setupMusicPlayer() {
  const musicBtn = document.getElementById("music-btn");
  const audioPlayer = document.getElementById("audio-player");
  const sceneBackground = document.getElementById("scene-background");

  musicBtn.addEventListener("click", () =>
    toggleMusic(musicBtn, audioPlayer, sceneBackground),
  );
  musicBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    toggleMusic(musicBtn, audioPlayer, sceneBackground);
  });

  audioPlayer.addEventListener("play", () => {
    gameState.isPlaying = true;
    musicBtn.classList.add("playing");
    sceneBackground.classList.add("dj-mode");
    startDJBeats();
    startCatDance();
    speakWithBubble("Let's dance! 🎵💃");
  });

  audioPlayer.addEventListener("pause", () => {
    gameState.isPlaying = false;
    musicBtn.classList.remove("playing");
    sceneBackground.classList.remove("dj-mode");
    stopDJBeats();
    stopCatDance();
    speakWithBubble("That was fun! 🐱");
  });

  audioPlayer.addEventListener("ended", () => {
    gameState.isPlaying = false;
    musicBtn.classList.remove("playing");
    sceneBackground.classList.remove("dj-mode");
    stopDJBeats();
    stopCatDance();
    speakWithBubble("More music? 🎵");
  });
}

function toggleMusic(btn, player, bg) {
  // Haptic feedback: Music button click
  triggerHaptic([30, 20, 30]);

  if (gameState.isPlaying) {
    player.pause();
  } else {
    player.play();
  }
}

function startCatDance() {
  const mini = document.getElementById("mini");

  // Continuous dance
  const danceInterval = setInterval(() => {
    if (!gameState.isPlaying) {
      clearInterval(danceInterval);
      return;
    }

    mini.classList.remove("dance", "spin", "jump");
    const dances = ["dance", "spin", "jump"];
    const randomDance = dances[Math.floor(Math.random() * dances.length)];
    mini.classList.add(randomDance);

    setTimeout(() => {
      mini.classList.remove(randomDance);
    }, 600);
  }, 700);
}

function stopCatDance() {
  const mini = document.getElementById("mini");
  mini.classList.remove("dance", "spin", "jump");
}

function startDJBeats() {
  const djBeats = document.getElementById("dj-beats");
  djBeats.innerHTML = "";
  djBeats.classList.add("active");

  // Create beat bars
  const barCount = 20;
  for (let i = 0; i < barCount; i++) {
    const bar = document.createElement("div");
    bar.className = "dj-beat-bar";
    bar.style.left = i * (100 / barCount) + "%";
    bar.style.animationDelay = i * 0.05 + "s";
    djBeats.appendChild(bar);
  }
}

function stopDJBeats() {
  const djBeats = document.getElementById("dj-beats");
  djBeats.classList.remove("active");
}

// ============= PREVENT DEFAULT BEHAVIORS =============

document.addEventListener(
  "touchmove",
  (e) => {
    if (
      e.target.closest(".confetti-container") ||
      e.target.closest(".hearts-container") ||
      e.target.closest(".fireworks-container")
    ) {
      return;
    }
  },
  { passive: true },
);

// Prevent pull-to-refresh on mobile
document.addEventListener(
  "touchmove",
  (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  },
  { passive: false },
);
