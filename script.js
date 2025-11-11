// 等待 HTML 文件完全載入後再執行
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. 取得所有需要的 HTML 元素 ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d'); // 這是我們用來繪圖的 2D 上下文
    const scoreDisplay = document.getElementById('scoreDisplay');
    const pauseButton = document.getElementById('pauseButton');
    const restartButton = document.getElementById('restartButton');

    // --- 2. 遊戲設定 (常數) ---
    const gridSize = 20; // 每個格子的寬高 (px)
    const canvasSize = canvas.width; // 畫布寬高 (400px)
    
    // --- 3. 遊戲狀態 (會變動的變數) ---
    let snake, food, score, direction, dx, dy;
    let isGameOver, isPaused;
    let gameLoop; // 用來存放 setInterval 的 ID，以便控制

    // [!新增] 用來儲存觸控起始點
    let touchStartX = 0;
    let touchStartY = 0;

    // --- 4. 遊戲初始化函式 ---
    function initializeGame() {
        // 蛇的初始狀態：一個包含 {x, y} 物件的陣列
        // 陣列的第一個元素是蛇頭
        snake = [
            { x: 10 * gridSize, y: 10 * gridSize }, // 蛇頭 (在畫布中間)
            { x: 9 * gridSize, y: 10 * gridSize },
            { x: 8 * gridSize, y: 10 * gridSize }
        ];

        // 食物 (隨機位置)
        food = createFood();

        // 遊戲狀態
        score = 0;
        isGameOver = false;
        isPaused = false;
        
        // 初始方向 (往右)
        // dx, dy 代表 x 和 y 軸的「變化量」
        dx = gridSize; // 每次向 x 移動 +20
        dy = 0;       // 每次向 y 移動 +0

        // 更新 UI
        scoreDisplay.textContent = `分數: 0`;
        pauseButton.textContent = '暫停';

        // 如果之前有遊戲迴圈在跑，先清除
        if (gameLoop) {
            clearInterval(gameLoop);
        }
        
        // 啟動遊戲迴圈 (Game Loop)
        // 這是遊戲的心跳！每 100 毫秒執行一次 main 函式
        gameLoop = setInterval(main, 100); 
    }

    // --- 5. 主遊戲迴圈 (Main Game Loop) ---
    function main() {
        if (isGameOver) {
            // 遊戲結束，停止迴圈
            clearInterval(gameLoop);
            alert(`遊戲結束！你的分數是: ${score}`);
            return;
        }

        if (isPaused) {
            // 遊戲暫停，跳過這次更新
            return;
        }

        // 遊戲SOP: 移動 -> 檢查碰撞 -> 繪圖
        moveSnake();
        checkCollision();
        
        // 只有在遊戲未結束時才繪圖
        if (!isGameOver) {
            draw();
        }
    }

    // --- 6. 繪圖函式 ---
    function draw() {
        // (1) 清空畫布 (用畫布背景色蓋掉)
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        // (2) 畫蛇
        ctx.fillStyle = '#00FF00'; // 綠色
        snake.forEach(segment => {
            ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
            // 幫蛇加個邊框，看起來更清楚
            ctx.strokeStyle = '#333'; 
            ctx.strokeRect(segment.x, segment.y, gridSize, gridSize);
        });

        // (3) 畫食物
        ctx.fillStyle = '#FF0000'; // 紅色
        ctx.fillRect(food.x, food.y, gridSize, gridSize);
        ctx.strokeStyle = '#333';
        ctx.strokeRect(food.x, food.y, gridSize, gridSize);
    }

    // --- 7. 產生食物 ---
    function createFood() {
        let foodPosition;
        while (true) {
            // 隨機產生一個 x, y 座標
            const x = Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize;
            const y = Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize;
            foodPosition = { x, y };

            // 檢查食物是否產生在蛇的身上
            let onSnake = snake.some(segment => segment.x === x && segment.y === y);
            
            if (!onSnake) {
                // 如果沒在蛇身上，就回傳這個座標
                return foodPosition;
            }
            // 如果在蛇身上，迴圈會繼續，重新產生
        }
    }

    // --- 8. 移動蛇 (穿牆版) ---
    function moveSnake() {
        // (1) 創造新的蛇頭的「預定位置」
        const head = { 
            x: snake[0].x + dx, 
            y: snake[0].y + dy 
        };

        // (1.5) 穿牆邏輯
        if (head.x < 0) {
            head.x = canvasSize - gridSize; 
        } else if (head.x >= canvasSize) {
            head.x = 0; 
        }
        if (head.y < 0) {
            head.y = canvasSize - gridSize;
        } else if (head.y >= canvasSize) {
            head.y = 0;
        }

        // (2) 把「處理過」的新蛇頭加到陣列的最前面 (unshift)
        snake.unshift(head);

        // (3) 檢查是否吃到食物
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreDisplay.textContent = `分數: ${score}`;
            food = createFood(); // 產生新食物
        } else {
            snake.pop(); // 沒吃到，把蛇的最後一節移掉
        }
    }

    // --- 9. 檢查碰撞 (移除撞牆) ---
    function checkCollision() {
        const head = snake[0];

        // 檢查撞到自己 (從第二節開始檢查)
        if (snake.length > 4) {
            for (let i = 1; i < snake.length; i++) {
                if (head.x === snake[i].x && head.y === snake[i].y) {
                    isGameOver = true;
                    break;
                }
            }
        }
    }

    // --- 10. 控制事件監聽 ---

    // (A) 鍵盤控制
    document.addEventListener('keydown', e => {
        // 為了防止「瞬間 180 度迴轉」
        const goingUp = (dy === -gridSize);
        const goingDown = (dy === gridSize);
        const goingLeft = (dx === -gridSize);
        const goingRight = (dx === gridSize);

        let isGameKey = false;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
                if (!goingDown) { dx = 0; dy = -gridSize; } // 往上
                isGameKey = true;
                break;
            case 'ArrowDown':
            case 's':
                if (!goingUp) { dx = 0; dy = gridSize; } // 往下
                isGameKey = true;
                break;
            case 'ArrowLeft':
            case 'a':
                if (!goingRight) { dx = -gridSize; dy = 0; } // 往左
                isGameKey = true;
                break;
            case 'ArrowRight':
            case 'd':
                if (!goingLeft) { dx = gridSize; dy = 0; } // 往右
                isGameKey = true;
                break;
            case ' ': // 空白鍵暫停
                togglePause();
                isGameKey = true;
                break;
        }

        // 如果是遊戲按鍵，就防止瀏覽器的預設行為
        if (isGameKey) {
            e.preventDefault();
        }
    });

    // (B) 按鈕控制
    pauseButton.addEventListener('click', () => {
        togglePause();
        pauseButton.blur(); // 點擊後，立刻讓按鈕失去焦點
    });
    
    restartButton.addEventListener('click', () => {
        initializeGame();
        restartButton.blur(); // 點擊後，立刻讓按鈕失去焦點
    });

    // [!新增] (C) 手機触控支援
    // 我們把事件綁定在 canvas 上，而不是 document
    // { passive: false } 是為了告訴瀏覽器：我「會」呼叫 preventDefault()
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    function handleTouchStart(e) {
        // 防止點擊穿透或觸發滑鼠事件
        e.preventDefault(); 
        const firstTouch = e.touches[0];
        touchStartX = firstTouch.clientX;
        touchStartY = firstTouch.clientY;
    }

    function handleTouchMove(e) {
        // [!] 關鍵：防止在畫布上滑動時，整個網頁跟著捲動！
        e.preventDefault();
    }

    function handleTouchEnd(e) {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;

        handleSwipe(touchEndX, touchEndY); // 計算滑動
    }

    function handleSwipe(endX, endY) {
        const minSwipeDist = 40; // 最小滑動距離 (px)，太短的觸控不算
        const deltaX = endX - touchStartX;
        const deltaY = endY - touchStartY;

        // 取得目前方向，防止 180 度迴轉
        const goingUp = (dy === -gridSize);
        const goingDown = (dy === gridSize);
        const goingLeft = (dx === -gridSize);
        const goingRight = (dx === gridSize);

        // 判斷是「水平滑動」還是「垂直滑動」
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平滑動 (X 軸的變化量 > Y 軸的變化量)
            if (deltaX > minSwipeDist && !goingLeft) {
                // 向右滑 (且目前不是向左)
                dx = gridSize; dy = 0;
            } else if (deltaX < -minSwipeDist && !goingRight) {
                // 向左滑 (且目前不是向右)
                dx = -gridSize; dy = 0;
            }
        } else {
            // 垂直滑動
            if (deltaY > minSwipeDist && !goingUp) {
                // 向下滑 (且目前不是向上)
                dx = 0; dy = gridSize;
            } else if (deltaY < -minSwipeDist && !goingDown) {
                // 向上滑 (且目前不是向下)
                dx = 0; dy = -gridSize;
            }
        }
    }


    function togglePause() {
        if (isGameOver) return; // 遊戲結束了，不給暫停

        isPaused = !isPaused; // 切換暫停狀態
        if (isPaused) {
            pauseButton.textContent = '繼續';
        } else {
            pauseButton.textContent = '暫停';
        }
    }
    
    // --- 11. 遊戲開始！ ---
    initializeGame();

}); // 確保這個結尾的括號和分號存在！
