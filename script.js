/* script.js (最終修正版) */

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

    // 檢查是否撞到自己 (★ 這裡已修正 head.y)
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

// --- 統一處理方向改變的函式 (鍵盤用) ---
function handleDirectionChange(key) {
    if (isGameOver || isPaused) return; 
    
    const goingUp = (dy === -1), goingDown = (dy === 1);
    const goingRight = (dx === 1), goingLeft = (dx === -1);
    
    switch (key) {
        case "ArrowUp":
            if (!goingDown) { nextDx = 0; nextDy = -1; }
            break;
        case "ArrowDown":
            if (!goingUp) { nextDx = 0; nextDy = 1; }
            break;
        case "ArrowLeft":
            if (!goingRight) { nextDx = -1; nextDy = 0; }
            break;
        case "ArrowRight":
            if (!goingLeft) { nextDx = 1; nextDy = 0; }
            break;
        case 'p':
        case 'P':
            togglePauseGame(); 
            break;
    }
}

// --- 處理「畫布觸控」的函式 ---
function handleCanvasTouch(event) {
    // 阻止頁面捲動
    event.preventDefault(); 
    if (isGameOver) return; // 遊戲結束後，點擊畫布不應觸發暫停
    
    // 如果遊戲未暫停，則觸控為移動
    if (!isPaused) {
        // 取得畫布在螢幕上的實際位置
        const rect = canvas.getBoundingClientRect();
        // 取得使用者點擊的第一個點 (相對於「螢幕」)
        const touch = event.touches[0];
        
        // 計算點擊位置 (相對於「畫布」的中心點)
        const touchX = touch.clientX - rect.left - rect.width / 2;
        const touchY = touch.clientY - rect.top - rect.height / 2;
        
        const goingUp = (dy === -1), goingDown = (dy === 1);
        const goingRight = (dx === 1), goingLeft = (dx === -1);

        // 檢查點擊位置是在「水平」還是「垂直」方向
        // Math.abs() 是取絕對值 (不管正負)
        if (Math.abs(touchX) > Math.abs(touchY)) {
            // --- 水平方向 (點了左邊或右邊) ---
            if (touchX > 0 && !goingLeft) {
                // 點了右邊 (touchX 是正數)
                nextDx = 1; nextDy = 0;
            } else if (touchX < 0 && !goingRight) {
                // 點了左邊 (touchX 是負數)
                nextDx = -1; nextDy = 0;
            }
        } else {
            // --- 垂直方向 (點了上面或下面) ---
            if (touchY > 0 && !goingUp) {
                // 點了下面 (touchY 是正數)
                nextDx = 0; nextDy = 1;
            } else if (touchY < 0 && !goingDown) {
                // 點了上面 (touchY 是負數)
                nextDx = 0; nextDy = -1;
            }
        }
    }
    // 如果遊戲已暫停，則觸控畫布等於按下「繼續」
    else {
        togglePauseGame();
    }
}


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
        // clearInterval(gameInterval); // gameLoop 內部會檢查 isPaused，這裡可以不用清
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height); 
        ctx.fillStyle = "white"; 
        const fontSize = Math.min(canvas.width / 8, 40);
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText("遊戲暫停", canvas.width / 2 - ctx.measureText("遊戲暫停").width / 2, canvas.height / 2);
        pauseButton.textContent = '繼續';
    } else {
        pauseButton.textContent = '暫停';
        // gameInterval = setInterval(gameLoop, currentSpeed); // 移到 gameLoop 頂部檢查
    }
}


// --- 9. 啟動遊戲！ ---
gameInterval = setInterval(gameLoop, currentSpeed); 

// --- 11. 鍵盤事件監聽 ---
document.addEventListener("keydown", (event) => {
    handleDirectionChange(event.key);
});

// --- -------------------- ---
// --- 按鈕 & 畫布事件監聽 ---
// --- -------------------- ---

// --- 重新開始按鈕 點擊監聽 ---
restartButton.addEventListener('click', restartGame);

// --- 暫停按鈕 點擊監聽 ---
pauseButton.addEventListener('click', togglePauseGame);

// --- 「畫布」觸控事件監聽 ---
canvas.addEventListener('touchstart', handleCanvasTouch, { passive: false });
