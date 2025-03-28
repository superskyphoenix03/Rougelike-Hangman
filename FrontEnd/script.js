const apiUrl = "http://localhost:5127/word"; // Updated API URL

let selectedWord = "";
let guessedLetters = [];
let lives = 5;
let wordCoins = 0;
let difficultyLevel = "Easy"; // Initial difficulty level
let completedWords = 0;

const wordElement = document.getElementById("word");
const messageElement = document.getElementById("message");
const guessInput = document.getElementById("guess-input");
const guessButton = document.getElementById("guess-button");
const livesElement = document.getElementById("lives");
const coinsElement = document.getElementById("coins");
const shopElement = document.getElementById("shop");
const shopItemsElement = document.getElementById("shop-items");
const tryAgainButton = document.getElementById("try-again-button");

async function fetchRandomWord() {
    let wordLength;
    if (completedWords < 3) {
        wordLength = 3;
    } else if (difficultyLevel === "Easy") {
        wordLength = getRandomInt(3, 5);
    } else if (difficultyLevel === "Medium") {
        wordLength = getRandomInt(6, 8);
    } else if (difficultyLevel === "Hard") {
        wordLength = getRandomInt(9, 12);
    }

    try {
        const response = await fetch(`${apiUrl}?type=common&length=${wordLength}`);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("API Response:", data); // Debugging log
        selectedWord = data.text.toLowerCase();
        updateWordDisplay();
    } catch (error) {
        console.error("Failed to fetch the word:", error);
        messageElement.innerHTML = "Failed to fetch the word. Please try again.";
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateWordDisplay() {
    wordElement.innerHTML = selectedWord.split("").map(letter => guessedLetters.includes(letter) ? letter : "_").join(" ");
}

function checkGameStatus() {
    if (!wordElement.innerHTML.includes("_")) {
        messageElement.innerHTML = "Congratulations! You guessed the word!";
        wordCoins += 10; // Earn Word Coins for completing a level
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        showShop();
        updateDifficulty();
    } else if (lives <= 0) {
        messageElement.innerHTML = `Game Over! The word was "${selectedWord}".`;
        guessButton.disabled = true;
        tryAgainButton.style.display = "block"; // Show the Try Again button
    }
}

function showShop() {
    shopElement.style.display = "block";
    guessButton.disabled = true;
    populateShop();
}

function hideShop() {
    shopElement.style.display = "none";
    guessButton.disabled = false;
    fetchWord();
}

function updateDifficulty() {
    completedWords++;
    if (difficultyLevel === "Easy" && completedWords >= 3) {
        difficultyLevel = "Medium";
    } else if (difficultyLevel === "Medium" && completedWords >= 6) {
        difficultyLevel = "Hard";
    }
}

function fetchWord() {
    fetchRandomWord();
}

function populateShop() {
    const shopItems = [
        { name: "Hint", cost: getRandomInt(3, 7), action: buyHint },
        { name: "Extra Life", cost: getRandomInt(8, 12), action: buyLife },
        { name: "Gamble", cost: getRandomInt(5, 10), action: gamble },
    ];

    // Shuffle the shop items array and select the first 3 items
    const selectedItems = shopItems.sort(() => 0.5 - Math.random()).slice(0, 3);

    shopItemsElement.innerHTML = "";
    selectedItems.forEach(item => {
        const itemElement = document.createElement("div");
        itemElement.className = "shop-item";
        itemElement.innerHTML = `${item.name} - ${item.cost} coins`;
        itemElement.addEventListener("click", () => item.action(item.cost));
        shopItemsElement.appendChild(itemElement);
    });
}

function buyHint(cost) {
    if (wordCoins >= cost) {
        wordCoins -= cost;
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

function buyLife(cost) {
    if (wordCoins >= cost) {
        wordCoins -= cost;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        lives++;
        livesElement.innerHTML = `Lives: ${lives}`;
    } else {
        messageElement.innerHTML = "Not enough coins to buy an extra life.";
    }
}

function gamble(cost) {
    if (wordCoins >= cost) {
        wordCoins -= cost;
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
        const gambleOutcome = Math.random() < 0.5 ? 'win' : 'lose';
        if (gambleOutcome === 'win') {
            wordCoins += cost * 2;
            messageElement.innerHTML = `You won the gamble! You earned ${cost * 2} coins.`;
        } else {
            messageElement.innerHTML = "You lost the gamble.";
        }
        coinsElement.innerHTML = `Coins: ${wordCoins}`;
    } else {
        messageElement.innerHTML = "Not enough coins to gamble.";
    }
}

guessButton.addEventListener("click", () => {
    const guess = guessInput.value.toLowerCase();
    guessInput.value = "";

    if (guess && !guessedLetters.includes(guess)) {
        guessedLetters.push(guess);
        if (!selectedWord.includes(guess)) {
            lives--;
            livesElement.innerHTML = `Lives: ${lives}`;
        }
        updateWordDisplay();
        checkGameStatus();
    }
});

document.getElementById("continue").addEventListener("click", () => {
    hideShop();
    lives = 5;
    guessedLetters = [];
    fetchWord();
});

tryAgainButton.addEventListener("click", () => {
    // Reset game state
    lives = 5;
    wordCoins = 0;
    difficultyLevel = "Easy";
    completedWords = 0;
    guessedLetters = [];
    guessButton.disabled = false;
    tryAgainButton.style.display = "none";
    messageElement.innerHTML = "";
    livesElement.innerHTML = `Lives: ${lives}`;
    coinsElement.innerHTML = `Coins: ${wordCoins}`;
    fetchWord();
});

coinsElement.innerHTML = `Coins: ${wordCoins}`;
fetchWord();

document.getElementById("continue").addEventListener("click", () => {
    hideShop();
    lives = 5;
    guessedLetters = [];
    fetchWord();
});

tryAgainButton.addEventListener("click", () => {
    // Reset game state
    lives = 5;
    wordCoins = 0;
    difficultyLevel = "Easy";
    completedWords = 0;
    guessedLetters = [];
    guessButton.disabled = false;
    tryAgainButton.style.display = "none";
    messageElement.innerHTML = "";
    livesElement.innerHTML = `Lives: ${lives}`;
    coinsElement.innerHTML = `Coins: ${wordCoins}`;
    fetchWord();
});

coinsElement.innerHTML = `Coins: ${wordCoins}`;
fetchWord();