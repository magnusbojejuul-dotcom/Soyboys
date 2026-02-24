const gameContainer = document.getElementById('game-container');
const customCursor = document.getElementById('custom-cursor');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const currentScoreEl = document.getElementById('current-score');
const currentLivesEl = document.getElementById('current-lives');
const highscoreDisplay = document.getElementById('highscore-display');
const targetsLayer = document.getElementById('targets-layer');
const gameOverText = document.getElementById('game-over-text');
const titleEl = document.getElementById('game-title');

let score = 0;
let lives = 3;
let highscore = localStorage.getItem('soyboys_highscore') || 0;
let isPlaying = false;
let spawnInterval;
let gameSpeed = 2000; // How often targets spawn
let baseFlightTime = 3000; // Time to cross screen

// Preload the target faces (now full chimeras)
const targetImages = ['duck_joakim_real_transparent.png', 'duck_nils_real_transparent.png'];
targetImages.forEach(src => {
    const img = new Image();
    img.src = src;
});

// Initialize Highscore UI
highscoreDisplay.textContent = highscore;

// Custom Cursor Logic
gameContainer.addEventListener('mousemove', (e) => {
    const rect = gameContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Position cursor near center of mouse tip
    customCursor.style.left = `${x}px`;
    customCursor.style.top = `${y}px`;
});

// Hide default cursor when leaving game container just in case
gameContainer.addEventListener('mouseleave', () => {
    customCursor.style.display = 'none';
});
gameContainer.addEventListener('mouseenter', () => {
    customCursor.style.display = 'block';
});

// Start Game
startBtn.addEventListener('click', startGame);

function startGame() {
    isPlaying = true;
    score = 0;
    lives = 3;
    gameSpeed = 2000;
    baseFlightTime = 3500;
    updateUI();

    startScreen.style.display = 'none';
    gameOverText.style.display = 'none';
    titleEl.style.display = 'none';

    // Clear any existing targets
    targetsLayer.innerHTML = '';

    spawnInterval = setTimeout(spawnTarget, gameSpeed);
}

function updateUI() {
    currentScoreEl.textContent = score;
    let hearts = '';
    for (let i = 0; i < lives; i++) hearts += '❤️';
    currentLivesEl.textContent = hearts;

    if (lives <= 0) {
        gameOver();
    }
}

function spawnTarget() {
    if (!isPlaying) return;

    const target = document.createElement('div');
    target.classList.add('target');

    // Randomly choose Joakim or Nils
    const imgIndex = Math.floor(Math.random() * targetImages.length);
    target.style.backgroundImage = `url('${targetImages[imgIndex]}')`;

    // Randomly choose left or right side spawn
    const startFromLeft = Math.random() > 0.5;
    const startY = 50 + Math.random() * 200; // random height in sky
    const endY = 50 + Math.random() * 200; // random height in sky for destination

    // Starting position
    target.style.top = `${startY}px`;

    if (startFromLeft) {
        target.style.left = `-100px`;
        target.classList.add('flip'); // Flip so it faces right
    } else {
        target.style.left = `800px`;
    }

    // Add to DOM first so transition will trigger on next frame
    targetsLayer.appendChild(target);

    let isHit = false;

    // Hit detection
    target.addEventListener('mousedown', () => {
        if (!isPlaying || isHit) return;
        isHit = true;

        // Visual hit effect
        target.classList.add('hit');
        // Stop it in its tracks by locking current inline style width/left, or let it fall?
        // Simpler: Just fade it out and drop
        target.style.transition = 'all 0.5s ease-in';
        target.style.top = `${startY + 100}px`;

        score += 10;
        updateUI();

        // Increase difficulty
        if (gameSpeed > 800) gameSpeed -= 50;
        if (baseFlightTime > 1500) baseFlightTime -= 100;

        setTimeout(() => {
            if (target.parentNode) target.remove();
        }, 500);
    });

    // Animate across screen
    const flightDuration = baseFlightTime + (Math.random() * 500);

    // Ensure styles are calculated before setting transition
    requestAnimationFrame(() => {
        target.style.transition = `left ${flightDuration}ms linear, top ${flightDuration}ms linear`;
        target.style.left = startFromLeft ? `800px` : `-100px`;
        target.style.top = `${endY}px`;

        // Timer for when it reaches the edge
        setTimeout(() => {
            if (!isHit && isPlaying && target.parentNode) {
                target.remove();
                lives--; // escaped
                updateUI();
            }
        }, flightDuration);
    });

    // Schedule next spawn
    if (isPlaying) {
        let currentNextSpawn = gameSpeed + (Math.random() * 500);
        spawnInterval = setTimeout(spawnTarget, currentNextSpawn);
    }
}

function gameOver() {
    isPlaying = false;
    clearTimeout(spawnInterval);

    if (score > highscore) {
        highscore = score;
        localStorage.setItem('soyboys_highscore', highscore);
        highscoreDisplay.textContent = highscore;
    }

    startScreen.style.display = 'flex';
    gameOverText.style.display = 'block';

    startBtn.textContent = "Prøv Igen";
}

// Global click effect to simulate shooting soy beans
gameContainer.addEventListener('mousedown', (e) => {
    if (!isPlaying) return;

    // Recoil effect on weapon cursor
    customCursor.style.transform = `translate(-20%, -20%) rotate(-15deg) scale(1.1)`;
    setTimeout(() => {
        customCursor.style.transform = `translate(-20%, -20%) rotate(0deg) scale(1)`;
    }, 100);

    // Create bean projectile
    const rect = gameContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const bean = document.createElement('div');
    bean.classList.add('projectile');
    bean.style.left = `${x}px`;
    bean.style.top = `${y}px`;

    // Starts large at the cursor
    bean.style.transform = 'scale(1)';
    targetsLayer.appendChild(bean);

    // Animate the bean scaling down to look like it flies into the screen
    requestAnimationFrame(() => {
        bean.style.transform = 'scale(0.1)';
        bean.style.opacity = '0';

        setTimeout(() => {
            if (bean.parentNode) bean.remove();
        }, 200);
    });
});
