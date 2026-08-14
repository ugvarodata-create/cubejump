const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const gameUI = document.getElementById("gameUI");
const gameOver = document.getElementById("gameOver");
const shop = document.getElementById("shop");
const backgroundShop = document.getElementById("backgroundShop");

let running = false;

let score = 0;
let coins = Number(localStorage.getItem("cubeCoins")) || 0;
let best = Number(localStorage.getItem("cubeBest")) || 0;

let selectedSkin =
    localStorage.getItem("cubeSelectedSkin") || "blue";

let selectedBackground =
    localStorage.getItem("cubeBackground") || "sky";

let ownedSkins =
    JSON.parse(localStorage.getItem("cubeSkins")) || ["blue"];

let ownedBackgrounds =
    JSON.parse(localStorage.getItem("cubeBackgrounds")) || ["sky"];

let obstacles = [];
let gameCoins = [];

let lastTime = 0;
let obstacleTimer = 0;
let coinTimer = 0;


// ==========================
// CANVAS
// ==========================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);


// ==========================
// PLAYER
// ==========================

const player = {
    x: 0,
    y: 0,
    size: 45,
    vx: 0,
    vy: 0
};


// ==========================
// START
// ==========================

function startGame() {

    menu.style.display = "none";
    shop.style.display = "none";
    backgroundShop.style.display = "none";
    gameOver.style.display = "none";

    canvas.style.display = "block";
    gameUI.style.display = "block";

    score = 0;

    obstacles = [];
    gameCoins = [];

    player.x = canvas.width / 2 - 22;
    player.y = canvas.height / 2;

    player.vx = 0;
    player.vy = 0;

    obstacleTimer = 0;
    coinTimer = 0;

    running = true;

    lastTime = performance.now();

    requestAnimationFrame(gameLoop);
}


// ==========================
// TOUCH
// ==========================

canvas.addEventListener("pointerdown", function(event) {

    if (!running) return;

    if (event.clientX < canvas.width / 2) {
        player.vx = -500;
    } else {
        player.vx = 500;
    }

    player.vy = -650;
});


// ==========================
// KEYBOARD
// ==========================

document.addEventListener("keydown", function(event) {

    if (!running) return;

    if (event.key === "ArrowLeft") {
        player.vx = -500;
        player.vy = -650;
    }

    if (event.key === "ArrowRight") {
        player.vx = 500;
        player.vy = -650;
    }
});


// ==========================
// OBSTACLE
// ==========================

function createObstacle() {

    obstacles.push({
        x: Math.random() * canvas.width,
        y: -60,
        radius: 30,
        speed: 220 + Math.random() * 120,
        rotation: 0
    });
}


// ==========================
// COIN
// ==========================

function createCoin() {

    gameCoins.push({
        x: 30 + Math.random() * (canvas.width - 60),
        y: -30,
        radius: 14,
        speed: 200
    });
}


// ==========================
// UPDATE
// ==========================

function update(dt) {

    player.vy += 1200 * dt;

    player.x += player.vx * dt;
    player.y += player.vy * dt;

    player.vx *= 0.92;


    if (player.x < 0) {
        player.x = 0;
        player.vx = 0;
    }

    if (player.x + player.size > canvas.width) {
        player.x = canvas.width - player.size;
        player.vx = 0;
    }


    if (player.y > canvas.height + 100) {
        endGame();
        return;
    }


    score += dt * 10;

    document.getElementById("score").textContent =
        Math.floor(score);


    obstacleTimer += dt;

    if (obstacleTimer >= 0.8) {
        createObstacle();
        obstacleTimer = 0;
    }


    coinTimer += dt;

    if (coinTimer >= 1) {
        createCoin();
        coinTimer = 0;
    }


    for (let i = obstacles.length - 1; i >= 0; i--) {

        const obstacle = obstacles[i];

        obstacle.y += obstacle.speed * dt;
        obstacle.rotation += dt * 4;

        if (hitCircle(obstacle, player)) {
            endGame();
            return;
        }

        if (obstacle.y > canvas.height + 100) {
            obstacles.splice(i, 1);
        }
    }


    for (let i = gameCoins.length - 1; i >= 0; i--) {

        const coin = gameCoins[i];

        coin.y += coin.speed * dt;

        if (hitCircle(coin, player)) {

            coins++;

            localStorage.setItem(
                "cubeCoins",
                coins
            );

            updateCoins();

            gameCoins.splice(i, 1);

            continue;
        }

        if (coin.y > canvas.height + 50) {
            gameCoins.splice(i, 1);
        }
    }
}


// ==========================
// COLLISION
// ==========================

function hitCircle(circle, rect) {

    const closestX = Math.max(
        rect.x,
        Math.min(circle.x, rect.x + rect.size)
    );

    const closestY = Math.max(
        rect.y,
        Math.min(circle.y, rect.y + rect.size)
    );

    const dx = circle.x - closestX;
    const dy = circle.y - closestY;

    return (
        dx * dx + dy * dy <
        circle.radius * circle.radius
    );
}


// ==================================================
// BACKGROUNDS
// ==================================================

function drawBackground() {

    // ================= SKY =================

    if (selectedBackground === "sky") {

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                canvas.height
            );

        gradient.addColorStop(0, "#1599e8");
        gradient.addColorStop(0.55, "#65d7ff");
        gradient.addColorStop(1, "#d7f7ff");

        ctx.fillStyle = gradient;

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        // მზე

        ctx.fillStyle = "#ffe45c";

        ctx.beginPath();

        ctx.arc(
            canvas.width - 100,
            100,
            55,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // ღრუბლები

        drawCloud(100, 120, 1);
        drawCloud(400, 200, 0.8);
        drawCloud(700, 100, 1.1);


        // შორეული მთები

        ctx.fillStyle = "#6ca5c7";

        ctx.beginPath();

        ctx.moveTo(0, canvas.height);

        ctx.lineTo(
            canvas.width * 0.25,
            canvas.height - 180
        );

        ctx.lineTo(
            canvas.width * 0.45,
            canvas.height
        );

        ctx.lineTo(
            canvas.width * 0.65,
            canvas.height - 220
        );

        ctx.lineTo(
            canvas.width,
            canvas.height - 100
        );

        ctx.lineTo(
            canvas.width,
            canvas.height
        );

        ctx.closePath();

        ctx.fill();
    }


    // ================= HALLOWEEN =================

    else if (selectedBackground === "halloween") {

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                canvas.height
            );

        gradient.addColorStop(0, "#080014");
        gradient.addColorStop(0.5, "#26003d");
        gradient.addColorStop(1, "#090010");

        ctx.fillStyle = gradient;

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        // მთვარე

        ctx.fillStyle = "#ffd96b";

        ctx.beginPath();

        ctx.arc(
            canvas.width - 120,
            120,
            70,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // ვარსკვლავები

        ctx.fillStyle = "white";

        for (let i = 0; i < 80; i++) {

            const x =
                (i * 127) % canvas.width;

            const y =
                (i * 71) % (canvas.height * 0.6);

            ctx.fillRect(
                x,
                y,
                2,
                2
            );
        }


        // მიწა

        ctx.fillStyle = "#090909";

        ctx.fillRect(
            0,
            canvas.height - 80,
            canvas.width,
            80
        );


        // გოგრები

        ctx.font = "55px Arial";

        ctx.fillText(
            "🎃",
            60,
            canvas.height - 25
        );

        ctx.fillText(
            "🎃",
            canvas.width - 120,
            canvas.height - 25
        );


        // ღამურა

        ctx.font = "40px Arial";

        ctx.fillText(
            "🦇",
            canvas.width * 0.25,
            180
        );

        ctx.fillText(
            "🦇",
            canvas.width * 0.7,
            250
        );
    }


    // ================= GALAXY =================

    else if (selectedBackground === "galaxy") {

        const gradient =
            ctx.createRadialGradient(
                canvas.width / 2,
                canvas.height / 2,
                50,
                canvas.width / 2,
                canvas.height / 2,
                canvas.height
            );

        gradient.addColorStop(0, "#7d22d9");
        gradient.addColorStop(0.35, "#24105d");
        gradient.addColorStop(1, "#020008");

        ctx.fillStyle = gradient;

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        // ვარსკვლავები

        ctx.fillStyle = "white";

        for (let i = 0; i < 160; i++) {

            const x =
                (i * 97) % canvas.width;

            const y =
                (i * 53) % canvas.height;

            const size =
                i % 5 === 0 ? 3 : 1.5;

            ctx.fillRect(
                x,
                y,
                size,
                size
            );
        }


        // დიდი პლანეტა

        ctx.fillStyle = "#e34dff";

        ctx.beginPath();

        ctx.arc(
            canvas.width - 120,
            160,
            70,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // პლანეტის რგოლი

        ctx.strokeStyle = "#ffb5ff";

        ctx.lineWidth = 8;

        ctx.beginPath();

        ctx.ellipse(
            canvas.width - 120,
            160,
            105,
            30,
            -0.2,
            0,
            Math.PI * 2
        );

        ctx.stroke();


        // პატარა პლანეტა

        ctx.fillStyle = "#45d8ff";

        ctx.beginPath();

        ctx.arc(
            100,
            250,
            35,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    // ================= SNOW =================

    else if (selectedBackground === "snow") {

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                canvas.height
            );

        gradient.addColorStop(0, "#4fa8dc");
        gradient.addColorStop(0.6, "#bdeaff");
        gradient.addColorStop(1, "#f5fbff");

        ctx.fillStyle = gradient;

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        // მთები

        ctx.fillStyle = "#ffffff";

        drawMountain(
            -100,
            canvas.height,
            280,
            300
        );

        drawMountain(
            200,
            canvas.height,
            300,
            360
        );

        drawMountain(
            520,
            canvas.height,
            300,
            280
        );

        drawMountain(
            780,
            canvas.height,
            300,
            350
        );


        // თოვლი

        ctx.fillStyle = "white";

        for (let i = 0; i < 70; i++) {

            const x =
                (i * 113) % canvas.width;

            const y =
                (i * 79) % canvas.height;

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                3,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }
}


// ==========================
// CLOUD
// ==========================

function drawCloud(x, y, scale) {

    ctx.fillStyle = "rgba(255,255,255,0.9)";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        25 * scale,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 35 * scale,
        y - 15 * scale,
        35 * scale,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 75 * scale,
        y,
        27 * scale,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


// ==========================
// MOUNTAIN
// ==========================

function drawMountain(x, bottom, width, height) {

    ctx.beginPath();

    ctx.moveTo(
        x,
        bottom
    );

    ctx.lineTo(
        x + width / 2,
        bottom - height
    );

    ctx.lineTo(
        x + width,
        bottom
    );

    ctx.closePath();

    ctx.fill();
}


// ==========================
// PLAYER
// ==========================

function drawPlayer() {

    if (selectedSkin === "red") {
        ctx.fillStyle = "#ff3030";
    }

    else if (selectedSkin === "green") {
        ctx.fillStyle = "#20c96b";
    }

    else if (selectedSkin === "purple") {
        ctx.fillStyle = "#9b45ff";
    }

    else if (selectedSkin === "gold") {
        ctx.fillStyle = "#ffd21f";
    }

    else {
        ctx.fillStyle = "#168cff";
    }


    ctx.fillRect(
        player.x,
        player.y,
        player.size,
        player.size
    );


    ctx.fillStyle = "white";

    ctx.fillRect(
        player.x + 8,
        player.y + 8,
        9,
        9
    );
}


// ==========================
// OBSTACLE
// ==========================

function drawObstacle(obstacle) {

    ctx.save();

    ctx.translate(
        obstacle.x,
        obstacle.y
    );

    ctx.rotate(
        obstacle.rotation
    );

    ctx.fillStyle = "#222";

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        obstacle.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.strokeStyle = "#ff3333";

    ctx.lineWidth = 5;

    for (let i = 0; i < 8; i++) {

        ctx.rotate(
            Math.PI / 4
        );

        ctx.beginPath();

        ctx.moveTo(0, 0);

        ctx.lineTo(
            obstacle.radius,
            0
        );

        ctx.stroke();
    }

    ctx.restore();
}


// ==========================
// COIN
// ==========================

function drawCoin(coin) {

    ctx.fillStyle = "#ffd21f";

    ctx.beginPath();

    ctx.arc(
        coin.x,
        coin.y,
        coin.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.strokeStyle = "#a86f00";

    ctx.lineWidth = 3;

    ctx.stroke();


    ctx.fillStyle = "#8a6500";

    ctx.font = "bold 15px Arial";

    ctx.textAlign = "center";

    ctx.textBaseline = "middle";

    ctx.fillText(
        "$",
        coin.x,
        coin.y
    );
}


// ==========================
// DRAW
// ==========================

function draw() {

    drawBackground();

    for (const obstacle of obstacles) {
        drawObstacle(obstacle);
    }

    for (const coin of gameCoins) {
        drawCoin(coin);
    }

    drawPlayer();
}


// ==========================
// GAME LOOP
// ==========================

function gameLoop(time) {

    if (!running) return;

    let dt =
        (time - lastTime) / 1000;

    if (dt > 0.03) {
        dt = 0.03;
    }

    lastTime = time;

    update(dt);

    draw();

    requestAnimationFrame(gameLoop);
}


// ==========================
// GAME OVER
// ==========================

function endGame() {

    running = false;

    const finalScore =
        Math.floor(score);

    if (finalScore > best) {

        best = finalScore;

        localStorage.setItem(
            "cubeBest",
            best
        );
    }

    document.getElementById(
        "finalScore"
    ).textContent = finalScore;

    document.getElementById(
        "finalBest"
    ).textContent = best;

    gameUI.style.display = "none";

    gameOver.style.display = "flex";
}


// ==================================================
// CUBE SHOP
// ==================================================

function openShop() {

    menu.style.display = "none";

    shop.style.display = "block";

    backgroundShop.style.display = "none";

    updateCoins();

    updateSkinButtons();
}


function closeShop() {

    shop.style.display = "none";

    menu.style.display = "flex";
}


// ==========================
// BUY SKIN
// ==========================

function buySkin(skin, price) {

    if (ownedSkins.includes(skin)) {

        selectSkin(skin);

        return;
    }


    if (coins < price) {

        alert("ქოინები არ გყოფნის 🪙");

        return;
    }


    coins -= price;

    ownedSkins.push(skin);

    selectedSkin = skin;


    localStorage.setItem(
        "cubeCoins",
        coins
    );

    localStorage.setItem(
        "cubeSkins",
        JSON.stringify(ownedSkins)
    );

    localStorage.setItem(
        "cubeSelectedSkin",
        selectedSkin
    );


    updateCoins();

    updateSkinButtons();
}


// ==========================
// SELECT SKIN
// ==========================

function selectSkin(skin) {

    if (!ownedSkins.includes(skin)) {
        return;
    }

    selectedSkin = skin;

    localStorage.setItem(
        "cubeSelectedSkin",
        selectedSkin
    );

    updateSkinButtons();
}


function updateSkinButtons() {

    document
        .querySelectorAll(".skinButton")
        .forEach(button => {

            const skin =
                button.dataset.skin;

            if (skin === selectedSkin) {

                button.textContent =
                    "✓ არჩეულია";
            }

            else if (
                ownedSkins.includes(skin)
            ) {

                button.textContent =
                    "არჩევა";
            }
        });
}


// ==================================================
// BACKGROUND SHOP
// ==================================================

function openBackgroundShop() {

    shop.style.display = "none";

    backgroundShop.style.display = "block";

    updateBackgroundShop();
}


function closeBackgroundShop() {

    backgroundShop.style.display = "none";

    shop.style.display = "block";

    updateCoins();
}


// ==========================
// BUY BACKGROUND
// ==========================

function buyBackground(background, price) {

    if (ownedBackgrounds.includes(background)) {

        selectBackground(background);

        return;
    }


    if (coins < price) {

        alert("ქოინები არ გყოფნის 🪙");

        return;
    }


    coins -= price;

    ownedBackgrounds.push(background);

    selectedBackground = background;


    localStorage.setItem(
        "cubeCoins",
        coins
    );

    localStorage.setItem(
        "cubeBackgrounds",
        JSON.stringify(ownedBackgrounds)
    );

    localStorage.setItem(
        "cubeBackground",
        selectedBackground
    );


    updateCoins();

    updateBackgroundShop();
}


// ==========================
// SELECT BACKGROUND
// ==========================

function selectBackground(background) {

    if (!ownedBackgrounds.includes(background)) {
        return;
    }

    selectedBackground = background;

    localStorage.setItem(
        "cubeBackground",
        selectedBackground
    );

    updateBackgroundShop();
}


// ==========================
// UPDATE BACKGROUND SHOP
// ==========================

function updateBackgroundShop() {

    const element =
        document.getElementById(
            "backgroundCoins"
        );

    if (element) {

        element.textContent =
            coins;
    }


    document
        .querySelectorAll(
            ".backgroundButtonSelect"
        )
        .forEach(button => {

            const background =
                button.dataset.background;


            if (
                background === selectedBackground
            ) {

                button.textContent =
                    "✓ არჩეულია";
            }

            else if (
                ownedBackgrounds.includes(
                    background
                )
            ) {

                button.textContent =
                    "არჩევა";
            }
        });
}


// ==========================
// COINS
// ==========================

function updateCoins() {

    const menuCoins =
        document.getElementById(
            "menuCoins"
        );

    const shopCoins =
        document.getElementById(
            "shopCoins"
        );

    const gameCoinsNumber =
        document.getElementById(
            "shopCoinsNumber"
        );

    const backgroundCoins =
        document.getElementById(
            "backgroundCoins"
        );


    if (menuCoins) {

        menuCoins.textContent =
            coins;
    }

    if (shopCoins) {

        shopCoins.textContent =
            coins;
    }

    if (gameCoinsNumber) {

        gameCoinsNumber.textContent =
            coins;
    }

    if (backgroundCoins) {

        backgroundCoins.textContent =
            coins;
    }
}


// ==========================
// MENU
// ==========================

function goToMenu() {

    running = false;

    canvas.style.display = "none";

    gameUI.style.display = "none";

    gameOver.style.display = "none";

    shop.style.display = "none";

    backgroundShop.style.display = "none";

    menu.style.display = "flex";

    updateCoins();
}


// ==========================
// BUTTONS
// ==========================

document
    .getElementById("startButton")
    .addEventListener(
        "click",
        startGame
    );


document
    .getElementById("restartButton")
    .addEventListener(
        "click",
        startGame
    );


// ==========================
// INITIAL
// ==========================

document.getElementById(
    "best"
).textContent = best;

updateCoins();

updateSkinButtons();

updateBackgroundShop();


// პირველი ფონის ჩვენება
canvas.style.display = "none";
gameUI.style.display = "none";
gameOver.style.display = "none";
shop.style.display = "none";
backgroundShop.style.display = "none";
menu.style.display = "flex";