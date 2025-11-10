// script.js (最終修正版 - 確保觸控按鈕可靠運作)

// --- 1. 取得 HTML 元素 ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const restartButton = document.getElementById('restartButton');
const pauseButton = document.getElementById('pauseButton');

// ★ 取得觸控方向按鈕
const upButton = document.getElementById('upButton');
const downButton = document.getElementById('downButton');
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');


// --- 2. 遊戲的基本單位 ---
const grid = 20;
const gridCount = canvas.width / grid; 

// --- 遊戲狀態 ---
let isGameOver = false;
let gameInterval; 
let isPaused = false; 

// --- 計分 & 加速 相關變數 ---
let score = 0;
let currentSpeed = 100; 
let foodEatenCount = 0; 
const speedUpAmount = 5; 
const speedIncrease = 10; 
const minSpeed = 50; 

// --- 3. 建立「蛇」 ---
let snake = [ { x: 10, y: 10 } ];

// --- 4. 建立「食物」 ---
let food = {}; 
createFood(); 

// --- 5. 蛇的移動方向 ---
let dx = 1; 
let dy = 0; 
let nextDx = dx;
let nextDy = dy; 

// --- 6. 主要的遊戲迴圈 (Game Loop) ---
function gameLoop() {
    if (isGameOver) {
        clearInterval(gameInterval);
        ctx.fillStyle = "black";
        const fontSize = Math.min(canvas.width / 8, 40);
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText("遊戲結束!", canvas.width / 2 - ctx.measureText("遊戲結束!").width / 2, canvas.height / 2);
        
        restartButton.style.display = 'inline-block'; 
        pauseButton.style.display = 'none'; 
        
        return; 
    }
    
    dx = nextDx;
    dy = nextDy;

    moveSnake(); 
    ctx.fillStyle = '#dddddd'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawFood(); 
    drawSnake(); 
}

// --- 7. 畫出蛇的函式 ---
function drawSnake() {
    ctx.fillStyle = 'green';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * grid, segment.y * grid, grid, grid);
    });
}

// --- 8. 畫出食物的函式 ---
function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * grid, food.y * grid, grid, grid);
}

// --- 10. 移動蛇的函式 ---
function moveSnake() {
    const head = { x: snake[0].x, y: snake[0].y };
    head.x += dx;
    head.y += dy;

    if (head.x < 0) head.x = gridCount - 1;
    else if (head.x >= gridCount) head.x = 0;
    if (head.y < 0) head.y = gridCount - 1;
    else if (head.y >= gridCount) head.y = 0;

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            isGameOver = true;
            return; 
        }
    }
    
    snake.unshift(head);
    const ateFood = (head.x === food.x && head.y === food.y);
    
    if (ateFood) {
        score += 10;
        scoreDisplay.textContent = "分數: " + score;
        foodEatenCount++;
        if (foodEatenCount % speedUpAmount === 0) {
            speedUpGame();
        }
        createFood(); 
    } else {
        snake.pop(); 
    }
}

// --- 加速遊戲的函式 ---
function speedUpGame() {
    if (currentSpeed > minSpeed) {
        currentSpeed -= speedIncrease;
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, currentSpeed);
    }
}

// --- 產生隨機位置的函式 ---
function randomGridPosition() {
    return Math.floor(Math.random() * gridCount);
}

// --- 產生新食物的函式 ---
function createFood() {
    food.x = randomGridPosition();
    food.y = randomGridPosition();
    let foodOnSnake = snake.some(segment => segment.x === food.x && segment.y === food.y);
    if (foodOnSnake) {
        createFood();
    }
}

// --- 統一處理方向改變的函式 ---
function handleDirectionChange(direction) {
    if (isGameOver || isPaused) return; 
    
    const goingUp = (dy === -1), goingDown = (dy === 1);
    const goingRight = (dx === 1), goingLeft = (dx === -1);
    
    switch (direction) {
        case "ArrowUp":
        case "up":
            if (!goingDown) { nextDx = 0; nextDy = -1; }
            break;
        case "ArrowDown":
        case "down":
            if (!goingUp) { nextDx = 0; nextDy = 1; }
            break;
        case "ArrowLeft":
        case "left":
            if (!goingRight) { nextDx = -1; nextDy = 0; }
            break;
        case "ArrowRight":
        case "right":
            if (!goingLeft) { nextDx = 1; nextDy = 0; }
            break;
        case 'p':
        case 'P':
            togglePauseGame(); 
            break;
    }
}

// --- 鍵盤事件監聽 ---
document.addEventListener("keydown", (event) => {
    handleDirectionChange(event.key);
});


// --- 重新開始遊戲的函式 ---
function restartGame() {
    snake = [ { x: 10, y: 10 } ];
    dx = 1;
    dy = 0;
    nextDx = 1; 
    nextDy = 0;
    score = 0;
    foodEatenCount = 0;
    currentSpeed = 100;
    isGameOver = false;
    isPaused = false; 

    restartButton.style.display = 'none';
    pauseButton.style.display = 'inline-block'; 
    pauseButton.textContent = '暫停'; 

    scoreDisplay.textContent = "分數: 0";
    createFood();
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, currentSpeed);
}

// --- 暫停/繼續 遊戲的函式 ---
function togglePauseGame() {
    if (isGameOver) return;

    isPaused = !isPaused; 

    if (isPaused) {
        clearInterval(gameInterval);
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height); 
        ctx.fillStyle = "white"; 
        const fontSize = Math.min(canvas.width / 8, 40);
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText("遊戲暫停", canvas.width / 2 - ctx.measureText("遊戲暫停").width / 2, canvas.height / 2);
        
        pauseButton.textContent = '繼續';
    } else {
        pauseButton.textContent = '暫停';
        gameInterval = setInterval(gameLoop, currentSpeed);
    }
}


// --- 9. 啟動遊戲！ ---
gameInterval = setInterval(gameLoop, currentSpeed); 

// --- 重新開始按鈕 點擊監聽 ---
// (功能按鈕在手機和桌機上都使用 'click' 即可)
restartButton.addEventListener('click', restartGame);

// --- 暫停按鈕 點擊監聽 ---
pauseButton.addEventListener('click', togglePauseGame);

// ★ 觸控方向按鈕點擊監聽 (iPhone 修正版)
// 
// 說明：
// 1. 我們改用 'touchstart' 事件，這是觸控螢幕的「按下」事件，反應最快。
// 2. 我們必須加上 event.preventDefault()，用來防止 iPhone 誤以為你想「捲動」頁面。

upButton.addEventListener('touchstart', (event) => {
    event.preventDefault(); // 阻止頁面捲動
    handleDirectionChange('up');
});

downButton.addEventListener('touchstart', (event) => {
    event.preventDefault(); // 阻止頁面捲動
    handleDirectionChange('down');
});

leftButton.addEventListener('touchstart', (event) => {
    event.preventDefault(); // 阻止頁面捲動
    handleDirectionChange('left');
});

rightButton.addEventListener('touchstart', (event) => {
    event.preventDefault(); // 阻止頁ត捲動
    handleDirectionChange('right');
});

// --- 為了桌機測試方便，我們也保留 'click' ---
// (這段是可選的，但建議保留，這樣在桌機上用滑鼠點擊也能玩)
// (手機會優先觸發 touchstart，所以不會有衝突)

if (!navigator.userAgent.match(/iPhone|iPad|Android/i)) {
    upButton.addEventListener('click', () => handleDirectionChange('up'));
    downButton.addEventListener('click', () => handleDirectionChange('down'));
    leftButton.addEventListener('click', () => handleDirectionChange('left'));
    rightButton.addEventListener('click', () => handleDirectionChange('right'));
}
