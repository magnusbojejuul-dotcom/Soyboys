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

const targetImages = ['Joakim.jpg', 'Nils.jpg'];

// Initialize Highscore UI
highscoreDisplay.textContent = highscore;

// Custom Cursor Logic
gameContainer.addEventListener('mousemove', (e) => {
    const rect = gameContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Position cursor at center of mouse tip
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
    for(let i=0; i<lives; i++) hearts += '❤️';
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
    
    // Random horizontal position (0 to game width - target width)
    const maxX = 800 - 100; // container width - target width
    const randomX = Math.floor(Math.random() * maxX);
    target.style.left = `${randomX}px`;
    
    let isHit = false;

    // Hit detection
    target.addEventListener('mousedown', () => {
        if (!isPlaying || isHit) return;
        isHit = true;
        
        // Visual hit effect
        target.classList.add('hit');
        target.style.backgroundImage = 'none'; // remove pic so it looks like it exploded or disappeared
        
        score += 10;
        updateUI();
        
        // Increase difficulty
        if (gameSpeed > 600) {
            gameSpeed -= 50;
        }

        setTimeout(() => {
            target.remove();
        }, 300);
    });

    targetsLayer.appendChild(target);

    // Animate up
    setTimeout(() => {
        target.classList.add('up');
    }, 50);

    // Animate down after a delay (if not hit)
    setTimeout(() => {
        if (!isHit && isPlaying) {
            target.classList.remove('up');
            
            // Deduct life since it escaped
            setTimeout(() => {
                if (target.parentNode) {
                    target.remove();
                    lives--;
                    updateUI();
                }
            }, 500); // Wait for down animation to finish
        }
    }, 1500); // Time it stays up

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
    
    // Make the button say "Prøv igen" 
    startBtn.textContent = "Prøv Igen";
}

// Global click effect to simulate shooting
gameContainer.addEventListener('mousedown', () => {
    if(!isPlaying) return;
    
    // Recoil effect on cursor
    customCursor.style.transform = `translate(-50%, -50%) rotate(-15deg) scale(1.1)`;
    setTimeout(() => {
        customCursor.style.transform = `translate(-50%, -50%) rotate(0deg) scale(1)`;
    }, 100);
});
