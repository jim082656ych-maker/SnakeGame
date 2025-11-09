// script.js (完整更新版 - 響應式 + 觸控功能)

// --- 1. 取得 HTML 元素 ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const restartButton = document.getElementById('restartButton');
const pauseButton = document.getElementById('pauseButton');

// ★ (新功能) 取得觸控方向按鈕
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

// --- 6. 主要的遊戲迴圈 (Game Loop) ---
function gameLoop() {
    if (isGameOver) {
        clearInterval(gameInterval);
        ctx.fillStyle = "black";
        ctx.font = "40px 'Arial'";
        // ★ (修改) 文字自適應畫布大小
        const fontSize = Math.min(canvas.width / 8, 40);
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText("遊戲結束!", canvas.width / 2 - ctx.measureText("遊戲結束!").width / 2, canvas.height / 2);
        
        restartButton.style.display = 'inline-block'; 
        pauseButton.style.display = 'none'; 
        
        return; 
    }
    
    // (遊戲進行中)
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

    // (穿牆邏輯 - 不變)
    if (head.x < 0) head.x = gridCount - 1;
    else if (head.x >= gridCount) head.x = 0;
    if (head.y < 0) head.y = gridCount - 1;
    else if (head.y >= gridCount) head.y = 0;

    // (檢查撞到自己 - 不變)
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

// --- 改變方向的函式 (鍵盤) ---
function changeDirection(event) {
    if (event.key === 'p' || event.key === 'P') {
        togglePauseGame(); 
        return; 
    }
    if (isGameOver || isPaused) return; 
    
    handleDirectionChange(event.key); // ★ (新功能) 統一處理方向改變
}

// ★ (這是全新的) 統一處理方向改變的函式 (給鍵盤和觸控用)
function handleDirectionChange(direction) {
    // 檢查防止180度迴轉
    const goingUp = (dy === -1), goingDown = (dy === 1);
    const goingRight = (dx === 1), goingLeft = (dx === -1);

    if (direction === "ArrowUp" && !goingDown) { dx = 0; dy = -1; }
    else if (direction === "ArrowDown" && !goingUp) { dx = 0; dy = 1; }
    else if (direction === "ArrowLeft" && !goingRight) { dx = -1; dy = 0; }
    else if (direction === "ArrowRight" && !goingLeft) { dx = 1, dy = 0; }
    // ★ (新功能) 觸控按鈕的方向處理
    else if (direction === "up" && !goingDown) { dx = 0; dy = -1; }
    else if (direction === "down" && !goingUp) { dx = 0; dy = 1; }
    else if (direction === "left" && !goingRight) { dx = -1; dy = 0; }
    else if (direction === "right" && !goingLeft) { dx = 1, dy = 0; }
}


// --- 重新開始遊戲的函式 ---
function restartGame() {
    snake = [ { x: 10, y: 10 } ];
    dx = 1;
    dy = 0;
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
        // ★ (修改) 文字自適應畫布大小
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

// --- 11. 鍵盤事件監聽器 ---
document.addEventListener("keydown", changeDirection);

// --- 重新開始按鈕 點擊監聽 ---
restartButton.addEventListener('click', restartGame);

// --- 暫停按鈕 點擊監聽 ---
pauseButton.addEventListener('click', togglePauseGame);

// ★ (這是全新的) 觸控方向按鈕點擊監聽
upButton.addEventListener('click', () => handleDirectionChange('up'));
downButton.addEventListener('click', () => handleDirectionChange('down'));
leftButton.addEventListener('click', () => handleDirectionChange('left'));
rightButton.addEventListener('click', () => handleDirectionChange('right'));
