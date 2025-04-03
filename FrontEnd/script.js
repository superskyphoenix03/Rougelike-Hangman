// These are the web addresses (URLs) where we get or send data for different parts of the game.
const apiUrl = "http://localhost:5127/word";
const scoreApiUrl = "http://localhost:5127/api/scores";
const leaderboardApiUrl = "http://localhost:5127/api/leaderboard";
const achievementsApiUrl = "http://localhost:5127/api/game/achievements";
const dailyChallengesApiUrl = "http://localhost:5127/api/game/daily-challenges";
const gameReplaysApiUrl = "http://localhost:5127/api/game/game-replays";

// These variables store important information for the game, like the current word and player's score.
let selectedWord = ""; // The word the player is trying to guess
let nextWord = ""; // The next word to guess
let selectedTheme = ""; // The theme of the current word (like animals, colors)
let nextTheme = ""; // The theme of the next word
let guessedLetters = []; // The letters the player has guessed so far
let hp = 50; // Player's health points
let maxHp = 50; // Maximum health points
let lives = 3; // Number of lives the player has
let wordCoins = 0; // Coins the player earns from guessing words
let difficultyLevel = "easy"; // The difficulty level of the game
let completedWords = 0; // Number of words the player has guessed correctly
let timer = 60; // Time left to guess the word
let timerInterval; // Variable to store the timer interval

// These variables store references to HTML elements that we will update during the game.
const elements = {
    word: document.getElementById("word"), // The element where the word is displayed
    theme: document.getElementById("theme"), // The element where the theme is displayed
    level: document.getElementById("level"), // The element where the level is displayed
    message: document.getElementById("message"), // The element where messages are displayed
    guessInput: document.getElementById("guess-input"), // The input field where the player types their guess
    guessButton: document.getElementById("guess-button"), // The button to submit the guess
    hp: document.getElementById("hp"), // The element where health points are displayed
    lives: document.getElementById("lives"), // The element where the number of lives is displayed
    coins: document.getElementById("coins"), // The element where the number of coins is displayed
    timer: document.getElementById("timer"), // The element where the timer is displayed
    shop: document.getElementById("shop"), // The element where the shop is displayed
    shopOptions: document.getElementById("shop-options"), // The element where shop options are displayed
    tryAgainButton: document.getElementById("try-again-button"), // The button to try the game again
    leaderboardForm: document.getElementById("leaderboard-form"), // The form to submit the player's score
    playerNameInput: document.getElementById("player-name"), // The input field for the player's name
    submitScoreButton: document.getElementById("submit-score-button"), // The button to submit the score
    leaderboard: document.getElementById("leaderboard"), // The element where the leaderboard is displayed
    leaderboardTableBody: document.getElementById("leaderboard-table").querySelector("tbody"), // The table body for the leaderboard
    playAgainButton: document.getElementById("play-again-button"), // The button to play the game again
    continueButton: document.getElementById("continue") // The button to continue the game
};

// These are functions to interact with the game's backend.
const apiEndpoints = {
    // Fetch a random word from the server with error handling and loading indicator.
        fetchRandomWord: async () => {
            try {
                const response = await fetch(`${apiUrl}?difficulty=${difficultyLevel}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const word = await response.json();
                console.log("Server response:", word); // Log the response
                if (!word.wordText || !word.wordTheme || !word.wordHint) {
                    throw new Error('Invalid response format');
                }
                setNextWord(word);
            } catch (error) {
                console.error("Error fetching random word:", error); // Log the error
                elements.message.innerHTML = error.message;
            }
    
    },

    // Submit the player's score to the server.
    submitScore: async (scoreData) => {
        try {
            const response = await fetch(scoreApiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(scoreData)
            });
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Server response:", data);
            elements.leaderboardForm.style.display = "none";
            apiEndpoints.displayLeaderboard();
        } catch (error) {
            console.error("Failed to submit score:", error);
        }
    },

    // Display the leaderboard with high scores.
    displayLeaderboard: async () => {
        try {
            const response = await fetch(leaderboardApiUrl);
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Server response:", data);
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

    // Fetch the player's achievements from the server.
    fetchAchievements: async () => {
        try {
            const response = await fetch(achievementsApiUrl);
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Server response:", data);
        } catch (error) {
            console.error("Failed to fetch achievements:", error);
        }
    },

    // Fetch the daily challenges from the server.
    fetchDailyChallenges: async () => {
        try {
            const response = await fetch(dailyChallengesApiUrl);
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Server response:", data);
        } catch (error) {
            console.error("Failed to fetch daily challenges:", error);
        }
    },

    // Fetch game replays from the server.
    fetchGameReplays: async () => {
        try {
            const response = await fetch(gameReplaysApiUrl);
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Server response:", data);
        } catch (error) {
            console.error("Failed to fetch game replays:", error);
        }
    }
};

// This function generates a random number between min (minimum) and max (maximum).
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// This function updates the game display with the current game data.
const updateDisplay = () => {
    elements.word.innerHTML = selectedWord.split("").map(letter => guessedLetters.includes(letter) ? letter : "_").join(" ");
    elements.theme.innerHTML = `Theme: ${selectedTheme}`;
    elements.level.innerHTML = `Level: ${completedWords + 1}`;
    elements.hp.innerHTML = `HP: ${hp}`;
    elements.lives.innerHTML = `Lives: ${lives}`;
    elements.coins.innerHTML = `Coins: ${wordCoins}`;
    elements.timer.innerHTML = `Time: ${timer}`;
};

// This function checks if the game is over or if the player has won.
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

// This function shows the shop where players can buy items with their coins.
const showShop = () => {
    elements.shop.style.display = "block";
    elements.guessButton.disabled = true;
    randomizeShopOptions();
};

// This function hides the shop after the player buys something.
const hideShop = () => {
    elements.shop.style.display = "none";
    elements.guessButton.disabled = false;
    prepareNextWord(); // Ensure the game continues
};

// This function updates the game difficulty based on the number of completed words.
const updateDifficulty = () => {
    completedWords++;
    if (difficultyLevel === "easy" && completedWords >= 3) difficultyLevel = "medium";
    else if (difficultyLevel === "medium" && completedWords >= 6) difficultyLevel = "hard";
    else if (difficultyLevel === "hard" && completedWords >= 9) difficultyLevel = "hard";
    updateDisplay();
};

// This function prepares the next word for the player to guess.
const prepareNextWord = async () => {
    await apiEndpoints.fetchRandomWord();
    selectedWord = nextWord;
    selectedTheme = nextTheme;
    guessedLetters = [];
    timer = 60;
    startTimer();
    updateDisplay();
};

// This function starts the game timer.
const startTimer = () => {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer--;
        if (timer <= 0) checkGameStatus();
        updateDisplay();
    }, 1000);
};

// This function adds more time to the game timer.
const addTime = (seconds) => {
    timer += seconds;
    updateDisplay();
};

// This function randomly selects shop options for the player to buy.
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

// This function lets the player buy a hint.
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

// This function lets the player buy an extra life.
const buyLife = () => {
    if (wordCoins >= 10) {
        wordCoins -= 10;
        hp = Math.min(hp + 10, maxHp);
        updateDisplay();
    } else {
        elements.message.innerHTML = "Not enough coins to buy an extra life.";
    }
};

// This function lets the player reveal a letter in the word.
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

// This function lets the player skip the current word.
const skipWord = () => {
    if (wordCoins >= 15) {
        wordCoins -= 15;
        prepareNextWord();
    } else {
        elements.message.innerHTML = "Not enough coins to skip the word.";
    }
};

// This function handles the player's guess.
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

// Event listener for the guess button.
elements.guessButton.addEventListener("click", makeGuess);

// Event listener for the guess input to allow pressing Enter key.
elements.guessInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        makeGuess();
    }
});

// Event listener for the try again button to restart the game.
elements.tryAgainButton.addEventListener("click", () => {
    hp = maxHp;
    wordCoins = 0;
    difficultyLevel = "easy";
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

// Event listener for the submit score button to send the score to the server.
elements.submitScoreButton.addEventListener("click", () => {
    apiEndpoints.submitScore({
        UserName: elements.playerNameInput.value || "Anonymous",
        Points: wordCoins,
        Level: completedWords + 1,
        DateAchieved: new Date().toISOString()
    });
});

// Event listener for the play again button to restart the game.
elements.playAgainButton.addEventListener("click", () => elements.tryAgainButton.click());

// Event listener for the continue button to continue the game after shopping.
elements.continueButton.addEventListener("click", () => {
    hideShop();
    prepareNextWord();
});

// Fetch a random word and prepare the game when the page loads.
const setNextWord = (word) => {
    nextWord = word.wordText.toLowerCase();
    nextTheme = word.wordTheme;
    nextHint = word.wordHint;
};
apiEndpoints.fetchRandomWord();
apiEndpoints.fetchAchievements();
apiEndpoints.fetchDailyChallenges();
apiEndpoints.fetchGameReplays();