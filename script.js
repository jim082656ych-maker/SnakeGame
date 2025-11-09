// script.js (完整更新版 - 第十四步：暫停功能)

// --- 1. 取得 HTML 元素 ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const restartButton = document.getElementById('restartButton');
// ★ (新功能) 取得「暫停按鈕」
const pauseButton = document.getElementById('pauseButton');

// --- 2. 遊戲的基本單位 ---
const grid = 20;
const gridCount = canvas.width / grid; // 20

// --- 遊戲狀態 ---
let isGameOver = false;
let gameInterval; 
// ★ (新功能) 遊戲暫停狀態
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
        ctx.fillText("遊戲結束!", canvas.width / 4, canvas.height / 2);
        
        restartButton.style.display = 'inline-block'; // 顯示「重新開始」
        pauseButton.style.display = 'none'; // ★ 隱藏「暫停」
        
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
        // (計分與加速邏輯 - 不變)
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

// --- 改變方向的函式 ---
function changeDirection(event) {
    // ★ (新功能) 檢查是否按下 'P' 鍵來暫停
    if (event.key === 'p' || event.key === 'P') {
        togglePauseGame(); // 呼叫暫停函式
        return; // 結束
    }

    // (新功能) 如果遊戲結束 或 遊戲暫停，就不能改變方向
    if (isGameOver || isPaused) return; 
    
    // (防止180度迴轉 - 不變)
    const goingUp = (dy === -1), goingDown = (dy === 1);
    const goingRight = (dx === 1), goingLeft = (dx === -1);

    if (event.key === "ArrowUp" && !goingDown) { dx = 0; dy = -1; }
    else if (event.key === "ArrowDown" && !goingUp) { dx = 0; dy = 1; }
    else if (event.key === "ArrowLeft" && !goingRight) { dx = -1; dy = 0; }
    else if (event.key === "ArrowRight" && !goingLeft) { dx = 1, dy = 0; }
}

// --- 重新開始遊戲的函式 ---
function restartGame() {
    // 1. 重設所有遊戲變數
    snake = [ { x: 10, y: 10 } ];
    dx = 1;
    dy = 0;
    score = 0;
    foodEatenCount = 0;
    currentSpeed = 100;
    isGameOver = false;
    isPaused = false; // ★ (新功能) 重設暫停狀態

    // 2. 隱藏「重新開始」按鈕，顯示「暫停」按鈕
    restartButton.style.display = 'none';
    pauseButton.style.display = 'inline-block'; // ★ (新功能)
    pauseButton.textContent = '暫停'; // ★ (新功能) 確保文字是「暫停」

    // 3. 更新計分板
    scoreDisplay.textContent = "分數: 0";

    // 4. 產生新食物
    createFood();

    // 5. 清除舊的計時器
    clearInterval(gameInterval);

    // 6. 用「初始速度」重新啟動遊戲
    gameInterval = setInterval(gameLoop, currentSpeed);
}

// --- ★ (這是全新的) 暫停/繼續 遊戲的函式 ---
function togglePauseGame() {
    // 如果遊戲結束了，就不能暫停
    if (isGameOver) return;

    // 翻轉「暫停狀態」 (true 變 false, false 變 true)
    isPaused = !isPaused; 

    if (isPaused) {
        // --- 遊戲「被暫停」 ---
        // 1. 停止遊戲迴圈
        clearInterval(gameInterval);
        
        // 2. 畫上「暫停」浮水印
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // 半透明黑色
        ctx.fillRect(0, 0, canvas.width, canvas.height); // 蓋住整個畫面
        ctx.fillStyle = "white"; // 白色字
        ctx.font = "40px 'Arial'";
        ctx.fillText("遊戲暫停", canvas.width / 4, canvas.height / 2);
        
        // 3. 更改按鈕文字
        pauseButton.textContent = '繼續';
    } else {
        // --- 遊戲「被繼續」 ---
        // 1. 更改按鈕文字
        pauseButton.textContent = '暫停';
        
        // 2. 重新啟動遊戲迴圈 (用目前的速度)
        gameInterval = setInterval(gameLoop, currentSpeed);
    }
}


// --- 9. 啟動遊戲！ ---
gameInterval = setInterval(gameLoop, currentSpeed); 

// --- 11. 鍵盤事件監聽器 ---
document.addEventListener("keydown", changeDirection);

// --- 重新開始按鈕 點擊監聽 ---
restartButton.addEventListener('click', restartGame);

// --- ★ (新功能) 暫停按鈕 點擊監聽 ---
pauseButton.addEventListener('click', togglePauseGame);
