/* script.js (完整最終修正版 - 修正手機觸控) */

// --- 1. 取得 HTML 元素 ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const restartButton = document.getElementById('restartButton');
const pauseButton = document.getElementById('pauseButton');

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
    
    // 遊戲暫停時，不執行任何更新
    if (isPaused) {
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
    ctx.fillStyle = 'blue'; 
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

    // 穿牆邏輯
    if (head.x < 0) head.x = gridCount - 1;
    else if (head.x >= gridCount) head.x = 0;
    if (head.y < 0) head.y = gridCount - 1;
    else if (head.y >= gridCount) head.y = 0;

    // 檢查是否撞到自己 (★ 這裡是 head.y)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head
            