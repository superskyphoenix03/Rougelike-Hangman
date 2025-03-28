const apiUrl = "http://localhost:5127/word";
const scoreApiUrl = "http://localhost:5127/api/scores";
const leaderboardApiUrl = "http://localhost:5127/api/leaderboard";
const achievementsApiUrl = "http://localhost:5127/api/game/achievements";
const dailyChallengesApiUrl = "http://localhost:5127/api/game/daily-challenges";
const gameReplaysApiUrl = "http://localhost:5127/api/game/game-replays";

let selectedWord = "";
let nextWord = "";
let selectedTheme = "";
let nextTheme = "";
let guessedLetters = [];
let hp = 50;
let maxHp = 50;
let lives = 3;
let wordCoins = 0;
let difficultyLevel = "common";
let completedWords = 0;
let timer = 60;
let timerInterval;

const elements = {
    word: document.getElementById("word"),
    theme: document.getElementById("theme"),
    level: document.getElementById("level"),
    message: document.getElementById("message"),
    guessInput: document.getElementById("guess-input"),
    guessButton: document.getElementById("guess-button"),
    hp: document.getElementById("hp"),
    lives: document.getElementById("lives"),
    coins: document.getElementById("coins"),
    timer: document.getElementById("timer"),
    shop: document.getElementById("shop"),
    shopOptions: document.getElementById("shop-options"),
    tryAgainButton: document.getElementById("try-again-button"),
    leaderboardForm: document.getElementById("leaderboard-form"),
    playerNameInput: document.getElementById("player-name"),
    submitScoreButton: document.getElementById("submit-score-button"),
    leaderboard: document.getElementById("leaderboard"),
    leaderboardTableBody: document.getElementById("leaderboard-table").querySelector("tbody"),
    playAgainButton: document.getElementById("play-again-button"),
    continueButton: document.getElementById("continue") // Added continue button element
};

const apiEndpoints = {
    fetchRandomWord: async () => {
        try {
            const response = await fetch(`${apiUrl}?type=${difficultyLevel}&length=${getDesiredWordLength()}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const word = await response.json();
            nextWord = word.text.toLowerCase();
            nextTheme = word.theme;
        } catch (error) {
            elements.message.innerHTML = "Failed to fetch the word. Please try again.";
        }
    },
    submitScore: async (scoreData) => {
        try {
            const response = await fetch(scoreApiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(scoreData)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            elements.leaderboardForm.style.display = "none";
            apiEndpoints.displayLeaderboard();
        } catch (error) {
            console.error("Failed to submit score:", error);
        }
    },
    displayLeaderboard: async () => {
        try {
            const response = await fetch(leaderboardApiUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            elements.leaderboardTableBody.innerHTML = data.map((entry, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${entry.UserName}</td>
                    <td>${entry.Points}</td>
                    <td>${entry.Level}</td>
                    <td>${new Date(entry.DateAchieved).toLocaleString()}</td>
                </tr>
            `).join("");
            elements.leaderboard.style.display = "block";
            elements.playAgainButton.style.display = "block";
        } catch (error) {
            console.error("Failed to fetch leaderboard:", error);
        }
    },
    fetchAchievements: async () => {
        try {
            const response = await fetch(achievementsApiUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            console.log(await response.json());
        } catch (error) {
            console.error("Failed to fetch achievements:", error);
        }
    },
    fetchDailyChallenges: async () => {
        try {
            const response = await fetch(dailyChallengesApiUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            console.log(await response.json());
        } catch (error) {
            console.error("Failed to fetch daily challenges:", error);
        }
    },
    fetchGameReplays: async () => {
        try {
            const response = await fetch(gameReplaysApiUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            console.log(await response.json());
        } catch (error) {
            console.error("Failed to fetch game replays:", error);
        }
    }
};

const getDesiredWordLength = () => {
    if (completedWords < 3) return 3;
    if (difficultyLevel === "common") return getRandomInt(3, 5);
    if (difficultyLevel === "easy") return getRandomInt(4, 6);
    if (difficultyLevel === "medium") return getRandomInt(6, 8);
    if (difficultyLevel === "hard") return getRandomInt(8, 12);
    return 3;
};

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const updateDisplay = () => {
    elements.word.innerHTML = selectedWord.split("").map(letter => guessedLetters.includes(letter) ? letter : "_").join(" ");
    elements.theme.innerHTML = `Theme: ${selectedTheme}`;
    elements.level.innerHTML = `Level: ${completedWords + 1}`;
    elements.hp.innerHTML = `HP: ${hp}`;
    elements.lives.innerHTML = `Lives: ${lives}`;
    elements.coins.innerHTML = `Coins: ${wordCoins}`;
    elements.timer.innerHTML = `Time: ${timer}`;
};

const checkGameStatus = () => {
    if (!elements.word.innerHTML.includes("_")) {
        elements.message.innerHTML = "Congratulations! You guessed the word!";
        wordCoins += 10;
        showShop();
        updateDifficulty();
        addTime(10);
    } else if (hp <= 0 || timer <= 0) {
        lives--;
        if (lives > 0) {
            hp = maxHp;
            elements.message.innerHTML = `You lost a life! Lives remaining: ${lives}`;
        } else {
            clearInterval(timerInterval);
            elements.message.innerHTML = `Game Over! The word was "${selectedWord}".`;
            elements.guessButton.disabled = true;
            elements.tryAgainButton.style.display = "block";
            elements.leaderboardForm.style.display = "block";
        }
    }
    updateDisplay();
};

const showShop = () => {
    elements.shop.style.display = "block";
    elements.guessButton.disabled = true;
    randomizeShopOptions();
};

const hideShop = () => {
    elements.shop.style.display = "none";
    elements.guessButton.disabled = false;
    prepareNextWord(); // Ensure the game continues
};

const updateDifficulty = () => {
    completedWords++;
    if (difficultyLevel === "common" && completedWords >= 3) difficultyLevel = "easy";
    else if (difficultyLevel === "easy" && completedWords >= 6) difficultyLevel = "medium";
    else if (difficultyLevel === "medium" && completedWords >= 9) difficultyLevel = "hard";
    updateDisplay();
};

const prepareNextWord = async () => {
    await apiEndpoints.fetchRandomWord();
    selectedWord = nextWord;
    selectedTheme = nextTheme;
    guessedLetters = [];
    timer = 60;
    startTimer();
    updateDisplay();
};

const startTimer = () => {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer--;
        if (timer <= 0) checkGameStatus();
        updateDisplay();
    }, 1000);
};

const addTime = (seconds) => {
    timer += seconds;
    updateDisplay();
};

const randomizeShopOptions = () => {
    const shopOptions = [
        { id: "buy-hint", text: "Buy Hint (5 Coins)", cost: 5, action: buyHint },
        { id: "buy-life", text: "Buy Extra Life (10 Coins)", cost: 10, action: buyLife },
        { id: "reveal-letter", text: "Reveal a Letter (8 Coins)", cost: 8, action: revealLetter },
        { id: "skip-word", text: "Skip Word (15 Coins)", cost: 15, action: skipWord }
    ];
    elements.shopOptions.innerHTML = "";
    const randomizedOptions = [];
    while (randomizedOptions.length < 3) {
        const option = shopOptions[getRandomInt(0, shopOptions.length - 1)];
        if (!randomizedOptions.includes(option)) randomizedOptions.push(option);
    }
    randomizedOptions.forEach(option => {
        const button = document.createElement("button");
        button.id = option.id;
        button.innerHTML = option.text;
        button.addEventListener("click", () => {
            option.action();
            hideShop(); // Ensure the shop is hidden after an item is purchased
        });
        elements.shopOptions.appendChild(button);
    });
};

const buyHint = () => {
    if (wordCoins >= 5) {
        wordCoins -= 5;
        const hints = selectedWord.split("").filter(letter => !guessedLetters.includes(letter));
        if (hints.length > 0) guessedLetters.push(hints[0]);
        updateDisplay();
        checkGameStatus();
    } else {
        elements.message.innerHTML = "Not enough coins to buy a hint.";
    }
};

const buyLife = () => {
    if (wordCoins >= 10) {
        wordCoins -= 10;
        hp = Math.min(hp + 10, maxHp);
        updateDisplay();
    } else {
        elements.message.innerHTML = "Not enough coins to buy an extra life.";
    }
};

const revealLetter = () => {
    if (wordCoins >= 8) {
        wordCoins -= 8;
        const letters = selectedWord.split("").filter(letter => !guessedLetters.includes(letter));
        if (letters.length > 0) guessedLetters.push(letters[0]);
        updateDisplay();
        checkGameStatus();
    } else {
        elements.message.innerHTML = "Not enough coins to reveal a letter.";
    }
};

const skipWord = () => {
    if (wordCoins >= 15) {
        wordCoins -= 15;
        prepareNextWord();
    } else {
        elements.message.innerHTML = "Not enough coins to skip the word.";
    }
};

const makeGuess = () => {
    const guess = elements.guessInput.value.toLowerCase();
    elements.guessInput.value = "";
    if (guess && !guessedLetters.includes(guess)) {
        guessedLetters.push(guess);
        if (!selectedWord.includes(guess)) {
            hp -= 10;
            timer -= 5;
        }
        updateDisplay();
        checkGameStatus();
    }
};

elements.guessButton.addEventListener("click", makeGuess);

elements.guessInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        makeGuess();
    }
});

elements.tryAgainButton.addEventListener("click", () => {
    hp = maxHp;
    wordCoins = 0;
    difficultyLevel = "common";
    completedWords = 0;
    guessedLetters = [];
    lives = 3;
    elements.guessButton.disabled = false;
    elements.tryAgainButton.style.display = "none";
    elements.leaderboardForm.style.display = "none";
    elements.leaderboard.style.display = "none";
    elements.message.innerHTML = "";
    timer = 60;
    updateDisplay();
    prepareNextWord();
});

elements.submitScoreButton.addEventListener("click", () => {
    apiEndpoints.submitScore({
        UserName: elements.playerNameInput.value || "Anonymous",
        Points: wordCoins,
        Level: completedWords + 1,
        DateAchieved: new Date().toISOString()
    });
});

elements.playAgainButton.addEventListener("click", () => elements.tryAgainButton.click());

elements.continueButton.addEventListener("click", () => {
    hideShop();
    prepareNextWord();
});

apiEndpoints.fetchRandomWord();
prepareNextWord();
apiEndpoints.fetchAchievements();
apiEndpoints.fetchDailyChallenges();
apiEndpoints.fetchGameReplays();