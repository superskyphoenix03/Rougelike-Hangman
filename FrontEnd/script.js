const apiUrl = "http://localhost:5127/word"; // Updated API URL
const scoreApiUrl = "http://localhost:5127/api/scores"; // Score API URL
const leaderboardApiUrl = "http://localhost:5127/api/leaderboard"; // Leaderboard API URL
const achievementsApiUrl = "http://localhost:5127/api/game/achievements"; // Achievements API URL
const dailyChallengesApiUrl = "http://localhost:5127/api/game/daily-challenges"; // Daily Challenges API URL
const gameReplaysApiUrl = "http://localhost:5127/api/game/game-replays"; // Game Replays API URL

let selectedWord = "";
let nextWord = "";
let selectedTheme = "";
let nextTheme = "";
let guessedLetters = [];
let hp = 50; // Lowered maximum HP to 50
let maxHp = 50;
let lives = 3; // Added lives system
let wordCoins = 0;
let difficultyLevel = "common";
let completedWords = 0;
let timer = 60;
let timerInterval;

const wordElement = document.getElementById("word");
const themeElement = document.getElementById("theme");
const levelElement = document.getElementById("level");
const messageElement = document.getElementById("message");
const guessInput = document.getElementById("guess-input");
const guessButton = document.getElementById("guess-button");
const hpElement = document.getElementById("hp");
const livesElement = document.getElementById("lives");
const coinsElement = document.getElementById("coins");
const timerElement = document.getElementById("timer");
const shopElement = document.getElementById("shop");
const shopOptionsElement = document.getElementById("shop-options");
const tryAgainButton = document.getElementById("try-again-button");
const leaderboardForm = document.getElementById("leaderboard-form");
const playerNameInput = document.getElementById("player-name");
const submitScoreButton = document.getElementById("submit-score-button");
const leaderboardElement = document.getElementById("leaderboard");
const leaderboardTableBody = document.getElementById("leaderboard-table").querySelector("tbody");
const playAgainButton = document.getElementById("play-again-button");

async function fetchRandomWord() {
    const wordLength = getDesiredWordLength();
    try {
        const response = await fetch(`${apiUrl}?type=${difficultyLevel}&length=${wordLength}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const word = await response.json();
        nextWord = word.text.toLowerCase();
        nextTheme = word.theme;
    } catch (error) {
        console.error("Failed to fetch the word:", error);
        messageElement.innerHTML = "Failed to fetch the word. Please try again.";
    }
}

function getDesiredWordLength() {
    if (completedWords < 3) {
        return 3;
    } else if (difficultyLevel === "common") {
        return getRandomInt(3, 5);
    } else if (difficultyLevel === "easy") {
        return getRandomInt(4, 6);
    } else if (difficultyLevel === "medium") {
        return getRandomInt(6, 8);
    } else if (difficultyLevel === "hard") {
        return getRandomInt(8, 12);
    }
    return 3;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateWordDisplay() {
    wordElement.innerHTML = selectedWord.split("").map(letter => guessedLetters.includes(letter) ? letter : "_").join(" ");
}

function updateThemeDisplay() {
    themeElement.innerHTML = `Theme: ${selectedTheme}`;
}

function updateLevelDisplay() {
    levelElement.innerHTML = `Level: ${completedWords + 1}`;
}

function checkGameStatus() {
    if (!wordElement.innerHTML.includes("_")) {
        messageElement.innerHTML = "Congratulations! You guessed the word!";
        wordCoins += 10;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        showShop();
        updateDifficulty();
        addTime(10); // Add time for guessing the word correctly
    } else if (hp <= 0) {
        lives--;
        if (lives > 0) {
            hp = maxHp;
            hpElement.innerHTML = `HP: ${hp}`;
            livesElement.innerHTML = `Lives: ${lives}`;
            messageElement.innerHTML = `You lost a life! Lives remaining: ${lives}`;
        } else {
            clearInterval(timerInterval);
            messageElement.innerHTML = `Game Over! The word was "${selectedWord}".`;
            guessButton.disabled = true;
            tryAgainButton.style.display = "block";
            leaderboardForm.style.display = "block"; // Show the leaderboard form
        }
    } else if (timer <= 0) {
        clearInterval(timerInterval);
        messageElement.innerHTML = `Game Over! The word was "${selectedWord}".`;
        guessButton.disabled = true;
        tryAgainButton.style.display = "block";
        leaderboardForm.style.display = "block"; // Show the leaderboard form
    }
}

function showShop() {
    shopElement.style.display = "block";
    guessButton.disabled = true;
    randomizeShopOptions();
}

function hideShop() {
    shopElement.style.display = "none";
    guessButton.disabled = false;
    prepareNextWord();
}

function updateDifficulty() {
    completedWords++;
    if (difficultyLevel === "common" && completedWords >= 3) {
        difficultyLevel = "easy";
    } else if (difficultyLevel === "easy" && completedWords >= 6) {
        difficultyLevel = "medium";
    } else if (difficultyLevel === "medium" && completedWords >= 9) {
        difficultyLevel = "hard";
    }
    updateLevelDisplay(); // Update the level display
}

async function prepareNextWord() {
    await fetchRandomWord(); // Ensure the word is fetched before proceeding
    selectedWord = nextWord;
    selectedTheme = nextTheme;
    guessedLetters = [];
    timer = 60;
    timerElement.innerHTML = `Time: ${timer}`;
    updateWordDisplay();
    updateThemeDisplay();
    startTimer();
}

function startTimer() {
    console.log("Starting Timer...");
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer--;
        timerElement.innerHTML = `Time: ${timer}`;
        if (timer <= 0) {
            checkGameStatus();
        }
    }, 1000);
}

function addTime(seconds) {
    timer += seconds;
    timerElement.innerHTML = `Time: ${timer}`;
}

function randomizeShopOptions() {
    const shopOptions = [
        { id: "buy-hint", text: "Buy Hint (5 Coins)", cost: 5, action: buyHint },
        { id: "buy-life", text: "Buy Extra Life (10 Coins)", cost: 10, action: buyLife },
        { id: "gamble", text: "Gamble (5 Coins)", cost: 5, action: gamble },
        { id: "reveal-letter", text: "Reveal a Letter (8 Coins)", cost: 8, action: revealLetter },
        { id: "skip-word", text: "Skip Word (15 Coins)", cost: 15, action: skipWord },
        { id: "double-coins", text: "Double Coins on Next Word (20 Coins)", cost: 20, action: doubleCoins },
        { id: "halve-lives-lost", text: "Halve Lives Lost on Next Incorrect Guess (12 Coins)", cost: 12, action: halveLivesLost },
        { id: "extra-guess", text: "Extra Guess (6 Coins)", cost: 6, action: extraGuess },
        { id: "freeze-time", text: "Freeze Time (10 Coins)", cost: 10, action: freezeTime },
        { id: "slow-motion", text: "Slow Motion (10 Coins)", cost: 10, action: slowMotion },
        { id: "reduce-word-length", text: "Reduce Word Length (15 Coins)", cost: 15, action: reduceWordLength },
        { id: "increase-word-length", text: "Increase Word Length (10 Coins)", cost: 10, action: increaseWordLength },
        { id: "reveal-theme", text: "Reveal Theme (5 Coins)", cost: 5, action: revealTheme },
        { id: "reveal-vowel", text: "Reveal a Vowel (7 Coins)", cost: 7, action: revealVowel },
        { id: "reveal-consonant", text: "Reveal a Consonant (7 Coins)", cost: 7, action: revealConsonant },
        { id: "extra-life-2", text: "Buy Extra Life (20 Coins)", cost: 20, action: buyExtraLife },
        { id: "extra-hint", text: "Buy Extra Hint (5 Coins)", cost: 5, action: buyExtraHint },
        { id: "reveal-first-letter", text: "Reveal First Letter (5 Coins)", cost: 5, action: revealFirstLetter },
        { id: "reveal-last-letter", text: "Reveal Last Letter (5 Coins)", cost: 5, action: revealLastLetter },
        { id: "reset-lives", text: "Reset Lives (30 Coins)", cost: 30, action: resetLives }
    ];

    shopOptionsElement.innerHTML = "";
    const randomizedOptions = [];
    while (randomizedOptions.length < 3) {
        const option = shopOptions[getRandomInt(0, shopOptions.length - 1)];
        if (!randomizedOptions.includes(option)) {
            randomizedOptions.push(option);
        }
    }

    randomizedOptions.forEach(option => {
        const button = document.createElement("button");
        button.id = option.id;
        button.innerHTML = option.text;
        button.addEventListener("click", option.action);
        shopOptionsElement.appendChild(button);
    });
}

function buyHint() {
    if (wordCoins >= 5) {
        wordCoins -= 5;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        const hints = selectedWord.split("").filter(letter => !guessedLetters.includes(letter));
        if (hints.length > 0) {
            guessedLetters.push(hints[0]);
            updateWordDisplay();
            checkGameStatus();
        }
    } else {
        messageElement.innerHTML = "Not enough coins to buy a hint.";
    }
}

function buyLife() {
    if (wordCoins >= 10) {
        wordCoins -= 10;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        hp += 10;
        if (hp > maxHp) hp = maxHp;
        hpElement.innerHTML = `HP: ${hp}`;
    } else {
        messageElement.innerHTML = "Not enough coins to buy an extra life.";
    }
}

function gamble() {
    if (wordCoins >= 5) {
        wordCoins -= 5;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        const gambleOutcome = Math.random() < 0.5 ? 'win' : 'lose';
        if (gambleOutcome === 'win') {
            wordCoins += 15;
            messageElement.innerHTML = "You won the gamble! You earned 15 coins.";
        } else {
            messageElement.innerHTML = "You lost the gamble.";
        }
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
    } else {
        messageElement.innerHTML = "Not enough coins to gamble.";
    }
}

function revealLetter() {
    if (wordCoins >= 8) {
        wordCoins -= 8;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        const letters = selectedWord.split("").filter(letter => !guessedLetters.includes(letter));
        if (letters.length > 0) {
            guessedLetters.push(letters[0]);
            updateWordDisplay();
            checkGameStatus();
        }
    } else {
        messageElement.innerHTML = "Not enough coins to reveal a letter.";
    }
}

function skipWord() {
    if (wordCoins >= 15) {
        wordCoins -= 15;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        prepareNextWord();
    } else {
        messageElement.innerHTML = "Not enough coins to skip the word.";
    }
}

function doubleCoins() {
    if (wordCoins >= 20) {
        wordCoins -= 20;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        wordCoins += 10; // Double coins for the next word guessed correctly
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
    } else {
        messageElement.innerHTML = "Not enough coins to double coins.";
    }
}

function halveLivesLost() {
    if (wordCoins >= 12) {
        wordCoins -= 12;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        hp = Math.ceil(hp / 2);
        hpElement.innerHTML = `HP: ${hp}`;
    } else {
        messageElement.innerHTML = "Not enough coins to halve lives lost.";
    }
}

function extraGuess() {
    if (wordCoins >= 6) {
        wordCoins -= 6;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        // Provide an extra guess
    } else {
        messageElement.innerHTML = "Not enough coins for an extra guess.";
    }
}

function freezeTime() {
    if (wordCoins >= 10) {
        wordCoins -= 10;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        // Freeze time for a certain period
    } else {
        messageElement.innerHTML = "Not enough coins to freeze time.";
    }
}

function slowMotion() {
    if (wordCoins >= 10) {
        wordCoins -= 10;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        // Slow down time for a certain period
    } else {
        messageElement.innerHTML = "Not enough coins for slow motion.";
    }
}

function reduceWordLength() {
    if (wordCoins >= 15) {
        wordCoins -= 15;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        // Reduce the length of the current word
    } else {
        messageElement.innerHTML = "Not enough coins to reduce word length.";
    }
}

function increaseWordLength() {
    if (wordCoins >= 10) {
        wordCoins -= 10;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        // Increase the length of the current word
    } else {
        messageElement.innerHTML = "Not enough coins to increase word length.";
    }
}

function revealTheme() {
    if (wordCoins >= 5) {
        wordCoins -= 5;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        themeElement.innerHTML = `Theme: ${selectedTheme}`;
    } else {
        messageElement.innerHTML = "Not enough coins to reveal theme.";
    }
}

function revealVowel() {
    if (wordCoins >= 7) {
        wordCoins -= 7;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        const vowels = selectedWord.split("").filter(letter => "aeiou".includes(letter) && !guessedLetters.includes(letter));
        if (vowels.length > 0) {
            guessedLetters.push(vowels[0]);
            updateWordDisplay();
            checkGameStatus();
        }
    } else {
        messageElement.innerHTML = "Not enough coins to reveal a vowel.";
    }
}

function revealConsonant() {
    if (wordCoins >= 7) {
        wordCoins -= 7;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        const consonants = selectedWord.split("").filter(letter => !"aeiou".includes(letter) && !guessedLetters.includes(letter));
        if (consonants.length > 0) {
            guessedLetters.push(consonants[0]);
            updateWordDisplay();
            checkGameStatus();
        }
    } else {
        messageElement.innerHTML = "Not enough coins to reveal a consonant.";
    }
}

function buyExtraLife() {
    if (wordCoins >= 20) {
        wordCoins -= 20;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        lives++;
        livesElement.innerHTML = `Lives: ${lives}`;
        messageElement.innerHTML = `Extra life bought! Lives remaining: ${lives}`;
    } else {
        messageElement.innerHTML = "Not enough coins to buy an extra life.";
    }
}

function buyExtraHint() {
    if (wordCoins >= 5) {
        wordCoins -= 5;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        const hints = selectedWord.split("").filter(letter => !guessedLetters.includes(letter));
        if (hints.length > 0) {
            guessedLetters.push(hints[0]);
            updateWordDisplay();
            checkGameStatus();
        }
    } else {
        messageElement.innerHTML = "Not enough coins for an extra hint.";
    }
}

function revealFirstLetter() {
    if (wordCoins >= 5) {
        wordCoins -= 5;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        guessedLetters.push(selectedWord[0]);
        updateWordDisplay();
        checkGameStatus();
    } else {
        messageElement.innerHTML = "Not enough coins to reveal the first letter.";
    }
}

function revealLastLetter() {
    if (wordCoins >= 5) {
        wordCoins -= 5;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        guessedLetters.push(selectedWord[selectedWord.length - 1]);
        updateWordDisplay();
        checkGameStatus();
    } else {
        messageElement.innerHTML = "Not enough coins to reveal the last letter.";
    }
}

function resetLives() {
    if (wordCoins >= 30) {
        wordCoins -= 30;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        hp = maxHp;
        lives = 3;
        hpElement.innerHTML = `HP: ${hp}`;
        livesElement.innerHTML = `Lives: ${lives}`;
        messageElement.innerHTML = `Lives reset! Lives remaining: ${lives}`;
    } else {
        messageElement.innerHTML = "Not enough coins to reset lives.";
    }
}

function submitScore() {
    const scoreData = {
        UserName: playerNameInput.value || "Anonymous", // Use player name or Anonymous
        Points: wordCoins,
        Level: completedWords + 1, // Include the level
        DateAchieved: new Date().toISOString()
    };

    fetch(scoreApiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(scoreData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Score submitted successfully:", data);
        leaderboardForm.style.display = "none"; // Hide the form after submission
        displayLeaderboard(); // Show the leaderboard after submission
    })
    .catch(error => {
        console.error("Failed to submit score:", error);
    });
    }
    
    function displayLeaderboard() {
    fetch(leaderboardApiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        leaderboardTableBody.innerHTML = ""; // Clear existing leaderboard
        data.forEach((entry, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${entry.UserName}</td>
                <td>${entry.Points}</td>
                <td>${entry.Level}</td>
                <td>${new Date(entry.DateAchieved).toLocaleString()}</td>
            `;
            leaderboardTableBody.appendChild(row);
        });
        leaderboardElement.style.display = "block"; // Show leaderboard
        playAgainButton.style.display = "block"; // Show play again button
    })
    .catch(error => {
        console.error("Failed to fetch leaderboard:", error);
    });
    }
    
    guessButton.addEventListener("click", () => {
    const guess = guessInput.value.toLowerCase();
    guessInput.value = "";
    
    if (guess && !guessedLetters.includes(guess)) {
        guessedLetters.push(guess);
        if (!selectedWord.includes(guess)) {
            hp -= 10;
            timer -= 5; // Deduct time for wrong guess
            hpElement.innerHTML = `HP: ${hp}`;
            timerElement.innerHTML = `Time: ${timer}`;
        }
        updateWordDisplay();
        checkGameStatus();
    }
    });
    
    document.getElementById("continue").addEventListener("click", () => {
    hideShop();
    prepareNextWord();
    });
    
    tryAgainButton.addEventListener("click", () => {
    hp = maxHp;
    wordCoins = 0;
    difficultyLevel = "common";
    completedWords = 0;
    guessedLetters = [];
    lives = 3;
    guessButton.disabled = false;
    tryAgainButton.style.display = "none";
    leaderboardForm.style.display = "none";
    leaderboardElement.style.display = "none";
    messageElement.innerHTML = "";
    hpElement.innerHTML = `HP: ${hp}`;
    livesElement.innerHTML = `Lives: ${lives}`;
    coinsElement.innerHTML = `Coins: ${wordCoins}`;
    timer = 60;
    timerElement.innerHTML = `Time: ${timer}`;
    updateLevelDisplay(); // Update level display
    prepareNextWord();
    });
    
    submitScoreButton.addEventListener("click", submitScore);
    playAgainButton.addEventListener("click", () => {
    tryAgainButton.click(); // Trigger try again logic
    });
    
    coinsElement.innerHTML = `Coins: ${wordCoins}`;
    fetchRandomWord(); // Fetch the initial word for the game
    prepareNextWord(); // Prepare the first word
    
    // Fetch Achievements
    async function fetchAchievements() {
    try {
        const response = await fetch(achievementsApiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const achievements = await response.json();
        // Display achievements (add your own logic here)
        console.log(achievements);
    } catch (error) {
        console.error("Failed to fetch achievements:", error);
    }
    }
    
    // Fetch Daily Challenges
    async function fetchDailyChallenges() {
    try {
        const response = await fetch(dailyChallengesApiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const challenges = await response.json();
        // Display daily challenges (add your own logic here)
        console.log(challenges);
    } catch (error) {
        console.error("Failed to fetch daily challenges:", error);
    }
    }
    
    // Fetch Game Replays
    async function fetchGameReplays() {
    try {
        const response = await fetch(gameReplaysApiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const replays = await response.json();
        // Display game replays (add your own logic here)
        console.log(replays);
    } catch (error) {
        console.error("Failed to fetch game replays:", error);
    }
    }
    
    // Call the new functions to fetch data
    fetchAchievements();
    fetchDailyChallenges();
    fetchGameReplays();