using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace GameTest6
{
    public class HangmanGame : Game
    {
        private GraphicsDeviceManager _graphics;
        private SpriteBatch _spriteBatch;
        private SpriteFont _font;
        private Texture2D _fadeTexture, _backgroundTexture;
        private List<char> guessedLetters = new List<char>();
        private string wordToGuess = "", displayWord = "";
        private int wrongGuesses = 0, maxWrongGuesses = 6, playerLives = 3, currentLevel = 1, score = 0, points = 0;
        private float timer = 60.0f; // Timer starts at 60 seconds
        private const float correctWordBonusTime = 10.0f;
        private const float wrongGuessTimePenalty = -2.0f;
        private Texture2D[] hangmanParts;
        private GameState currentState = GameState.MainMenu;
        private static readonly HttpClient httpClient = new HttpClient();
        private const string RandomWordApiUrl = "https://random-word-api.herokuapp.com/word?number=1";
        private bool canPressKey = true;
        private double keyCooldownTimer = 0;
        private const double keyCooldownDuration = 0.3; // Adjusted cooldown duration
        private bool firstWinAchieved = false;
        private int winStreak = 0;
        private int hintsAvailable = 0, extraGuessesAvailable = 0;
        private float fadeAlpha = 1.0f;
        private bool isFadingOut = false, isFadingIn = false;
        private Action fadeCompleteAction = null;
        private List<ShopOption> shopOptions = new List<ShopOption>(), availableShopOptions;

        public HangmanGame()
        {
            _graphics = new GraphicsDeviceManager(this);
            Content.RootDirectory = "Content";
            IsMouseVisible = true;
            hangmanParts = new Texture2D[maxWrongGuesses];
        }

        private enum GameState
        {
            MainMenu,
            Playing,
            GameOver,
            Win,
            Shop
        }

        private class ShopOption
        {
            public string Description { get; set; }
            public int Cost { get; set; }
            public Action Effect { get; set; }
        }

        protected override async void Initialize()
        {
            base.Initialize();
            InitializeShopOptions();
            await SelectWordForCurrentLevel(); // Ensure word is loaded before game starts
        }

        protected override void LoadContent()
        {
            _spriteBatch = new SpriteBatch(GraphicsDevice);
            _font = Content.Load<SpriteFont>("FontFile");
            _fadeTexture = Content.Load<Texture2D>("fadeTexture");
            _backgroundTexture = Content.Load<Texture2D>("background");

            for (int i = 0; i < maxWrongGuesses; i++)
            {
                hangmanParts[i] = LoadHangmanPart(i + 1);
            }
        }

        private Texture2D LoadHangmanPart(int partNumber)
        {
            try
            {
                return Content.Load<Texture2D>($"HangmanPart{partNumber}");
            }
            catch (Exception)
            {
                return Content.Load<Texture2D>("DefaultTexture");
            }
        }

        private void InitializeShopOptions()
        {
            shopOptions = new List<ShopOption>
            {
                new ShopOption { Description = "Extra Life - 200 Points", Cost = 200, Effect = () => playerLives++ },
                new ShopOption { Description = "Change Word - 100 Points", Cost = 100, Effect = async () => await ResetLevel() },
                new ShopOption { Description = "Hint - 150 Points", Cost = 150, Effect = () => hintsAvailable++ },
                new ShopOption { Description = "Extra Guess - 100 Points", Cost = 100, Effect = () => { extraGuessesAvailable++; maxWrongGuesses++; } },
                new ShopOption { Description = "Extra Time - 50 Points", Cost = 50, Effect = () => timer += 20.0f },
                new ShopOption { Description = "Double or Nothing - 500 Points", Cost = 500, Effect = DoubleOrNothing },
                new ShopOption { Description = "Reveal Random Letters - 300 Points", Cost = 300, Effect = () => RevealRandomLetters(3) },
                new ShopOption { Description = "Triple or Nothing - 800 Points", Cost = 800, Effect = TripleOrNothing },
                new ShopOption { Description = "Reveal Half Letters - 400 Points", Cost = 400, Effect = () => RevealRandomLetters(wordToGuess.Length / 2) },
                new ShopOption { Description = "Undo 1 Random Penalty - 150 Points", Cost = 150, Effect = UndoRandomPenalty },
                new ShopOption { Description = "Speed Up Timer for Extra Points - 200 Points", Cost = 200, Effect = SpeedUpTimer },
                new ShopOption { Description = "Slow Down Timer - 150 Points", Cost = 150, Effect = SlowDownTimer }
            };
        }

        protected override void Update(GameTime gameTime)
        {
            if (isFadingOut || isFadingIn)
            {
                UpdateFade(gameTime);
                return;
            }

            var keyboardState = Keyboard.GetState();
            UpdateKeyCooldown(gameTime);

            switch (currentState)
            {
                case GameState.MainMenu:
                    HandleMainMenuInput(keyboardState);
                    break;
                case GameState.Playing:
                    HandlePlayingInput(keyboardState, gameTime);
                    break;
                case GameState.GameOver:
                    HandleGameOverInput(keyboardState);
                    break;
                case GameState.Win:
                    HandleWinInput(keyboardState);
                    break;
                case GameState.Shop:
                    HandleShopInput(keyboardState);
                    break;
            }

            base.Update(gameTime);
        }

        protected override void Draw(GameTime gameTime)
        {
            GraphicsDevice.Clear(Color.CornflowerBlue); // Light blue background for visual appeal

            _spriteBatch.Begin();
            _spriteBatch.Draw(_backgroundTexture, new Rectangle(0, 0, _graphics.PreferredBackBufferWidth, _graphics.PreferredBackBufferHeight), Color.White);

            switch (currentState)
            {
                case GameState.MainMenu:
                    DrawMainMenu();
                    break;
                case GameState.Playing:
                    DrawPlaying();
                    break;
                case GameState.GameOver:
                    DrawGameOver();
                    break;
                case GameState.Win:
                    DrawWin();
                    break;
                case GameState.Shop:
                    DrawShop();
                    break;
            }

            if (isFadingOut || isFadingIn)
            {
                _spriteBatch.Draw(_fadeTexture, new Rectangle(0, 0, _graphics.PreferredBackBufferWidth, _graphics.PreferredBackBufferHeight), Color.Black * fadeAlpha);
            }

            _spriteBatch.End();
            base.Draw(gameTime);
        }

        private void DrawMainMenu()
        {
            _spriteBatch.DrawString(_font, "Hangman Game", new Vector2(100, 100), Color.White);
            _spriteBatch.DrawString(_font, "Press Enter to Start", new Vector2(100, 150), Color.White);
        }

        private void DrawPlaying()
        {
            _spriteBatch.DrawString(_font, $"Word: {displayWord}", new Vector2(100, 100), Color.Cyan);
            _spriteBatch.DrawString(_font, $"Guessed Letters: {string.Join(", ", guessedLetters)}", new Vector2(100, 150), Color.Cyan);
            _spriteBatch.DrawString(_font, $"Wrong Guesses: {wrongGuesses}", new Vector2(100, 200), Color.Cyan);
            _spriteBatch.DrawString(_font, $"Lives: {playerLives}", new Vector2(100, 250), Color.Cyan);
            _spriteBatch.DrawString(_font, $"Score: {score}", new Vector2(100, 300), Color.Cyan);
            _spriteBatch.DrawString(_font, $"Hints Available: {hintsAvailable}", new Vector2(100, 350), Color.Cyan);
            _spriteBatch.DrawString(_font, $"Extra Guesses Available: {extraGuessesAvailable}", new Vector2(100, 400), Color.Cyan);
            _spriteBatch.DrawString(_font, $"Timer: {timer:F2} seconds", new Vector2(100, 450), Color.Cyan); // Timer

            for (int i = 0; i < Math.Min(wrongGuesses, hangmanParts.Length); i++) // Ensure we don't go out of bounds
            {
                _spriteBatch.Draw(hangmanParts[i], new Vector2(600, 100 + i * 50), Color.Cyan);
            }
        }

        private void DrawGameOver()
        {
            _spriteBatch.DrawString(_font, "Game Over", new Vector2(100, 100), Color.Red);
            _spriteBatch.DrawString(_font, "Press Enter to Restart", new Vector2(100, 150), Color.Red);
        }

        private void DrawWin()
        {
            _spriteBatch.DrawString(_font, "You Win!", new Vector2(100, 100), Color.Lime);
            _spriteBatch.DrawString(_font, "Press Enter to Continue", new Vector2(100, 150), Color.Lime);
        }

        private void DrawShop()
        {
            _spriteBatch.DrawString(_font, "Shop", new Vector2(100, 100), Color.Yellow);

            for (int i = 0; i < availableShopOptions.Count; i++)
            {
                _spriteBatch.DrawString(_font, $"{i + 1}. {availableShopOptions[i].Description}", new Vector2(100, 150 + i * 50), Color.Yellow);
            }

            _spriteBatch.DrawString(_font, $"Score: {score}", new Vector2(100, 300 + availableShopOptions.Count * 50), Color.Yellow); // Display score in shop
            _spriteBatch.DrawString(_font, "Press Enter to Continue", new Vector2(100, 350 + availableShopOptions.Count * 50), Color.Yellow);
        }

        private void HandleMainMenuInput(KeyboardState keyboardState)
        {
            if (IsKeyPressed(keyboardState, Keys.Enter))
            {
                StartFadeTransition(GameState.Playing);
            }
        }

        private void HandlePlayingInput(KeyboardState keyboardState, GameTime gameTime)
        {
            timer -= (float)gameTime.ElapsedGameTime.TotalSeconds; // Decrease timer

            if (timer <= 0)
            {
                playerLives--;
                if (playerLives <= 0)
                {
                    StartFadeTransition(GameState.GameOver);
                }
                else
                {
                    _ = ResetLevel();
                }
            }

            if (canPressKey)
            {
                HandleLetterInput(keyboardState);
            }

            if (!displayWord.Contains("_"))
            {
                timer += correctWordBonusTime; // Add time on correct word guess
                StartFadeTransition(GameState.Win);
                points += 100;
                score += 100 * currentLevel;
                winStreak++;
                if (!firstWinAchieved)
                {
                    firstWinAchieved = true;
                }
            }
        }

        private void HandleLetterInput(KeyboardState keyboardState)
        {
            foreach (var key in keyboardState.GetPressedKeys())
            {
                if (key >= Keys.A && key <= Keys.Z)
                {
                    canPressKey = false;
                    keyCooldownTimer = keyCooldownDuration;

                    char guessedLetter = char.ToUpper(key.ToString()[0]);
                    if (!guessedLetters.Contains(guessedLetter))
                    {
                        guessedLetters.Add(guessedLetter);
                        if (wordToGuess.Contains(guessedLetter))
                        {
                            UpdateDisplayWord(guessedLetter);
                        }
                        else
                        {
                            wrongGuesses++;
                            timer += wrongGuessTimePenalty; // Subtract time on wrong guess
                            if (wrongGuesses >= maxWrongGuesses)
                            {
                                playerLives--;
                                if (playerLives <= 0)
                                {
                                    StartFadeTransition(GameState.GameOver);
                                }
                                else
                                {
                                    _ = ResetLevel(); // async, but doesn't block game flow
                                }
                            }
                        }
                    }
                }

                if (key == Keys.H && hintsAvailable > 0)
                {
                    hintsAvailable--;
                    RevealHint();
                }
            }
        }

        private void HandleGameOverInput(KeyboardState keyboardState)
        {
            if (IsKeyPressed(keyboardState, Keys.Enter))
            {
                ResetGame();
                StartFadeTransition(GameState.MainMenu);
            }
        }

        private void HandleWinInput(KeyboardState keyboardState)
        {
            if (IsKeyPressed(keyboardState, Keys.Enter))
            {
                RandomizeShopOptions();
                StartFadeTransition(GameState.Shop);
            }
        }

        private void HandleShopInput(KeyboardState keyboardState)
        {
            for (int i = 0; i < availableShopOptions.Count; i++)
            {
                if (IsKeyPressed(keyboardState, Keys.D1 + i) && score >= availableShopOptions[i].Cost)
                {
                    score -= availableShopOptions[i].Cost;
                    availableShopOptions[i].Effect.Invoke();
                }
            }

            if (IsKeyPressed(keyboardState, Keys.Enter))
            {
                StartFadeTransition(GameState.Playing);
                _ = ResetLevel(); // async, no blocking
            }
        }

        private bool IsKeyPressed(KeyboardState keyboardState, Keys key)
        {
            if (keyboardState.IsKeyDown(key) && canPressKey)
            {
                canPressKey = false;
                keyCooldownTimer = keyCooldownDuration;
                return true;
            }
            return false;
        }

        private void UpdateKeyCooldown(GameTime gameTime)
        {
            keyCooldownTimer -= gameTime.ElapsedGameTime.TotalSeconds;
            if (keyCooldownTimer <= 0)
            {
                canPressKey = true;
            }
        }

        private void StartFadeTransition(GameState nextState)
        {
            isFadingOut = true;
            fadeCompleteAction = () => {
                currentState = nextState;
                isFadingIn = true;
                isFadingOut = false;
            };
        }

        private void UpdateFade(GameTime gameTime)
        {
            if (isFadingOut)
            {
                fadeAlpha += (float)gameTime.ElapsedGameTime.TotalSeconds;
                if (fadeAlpha >= 1.0f)
                {
                    fadeAlpha = 1.0f;
                    fadeCompleteAction?.Invoke();
                }
            }
            else if (isFadingIn)
            {
                fadeAlpha -= (float)gameTime.ElapsedGameTime.TotalSeconds;
                if (fadeAlpha <= 0.0f)
                {
                    fadeAlpha = 0.0f;
                    isFadingIn = false;
                }
            }
        }

        private void RandomizeShopOptions()
        {
            if (shopOptions == null)
            {
                Console.WriteLine("shopOptions is null");
                return;
            }

            Random random = new Random();
            availableShopOptions = shopOptions.OrderBy(x => random.Next()).Take(3).ToList();
        }

        private async Task<string> FetchRandomWord()
        {

            int maxRetries = 3;
            int delay = 2000; // 2 seconds delay

            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    HttpResponseMessage response = await httpClient.GetAsync(RandomWordApiUrl);
                    if (response.IsSuccessStatusCode)
                    {
                        string jsonResponse = await response.Content.ReadAsStringAsync();
                        var data = JsonSerializer.Deserialize<List<string>>(jsonResponse);
                        if (data != null && data.Count > 0 && !string.IsNullOrWhiteSpace(data[0]))
                        {
                            Console.WriteLine($"Fetched word: {data[0]}"); // Debug statement
                            return data[0].ToUpper();
                        }
                    }
                    else
                    {
                        Console.WriteLine($"HTTP Error: {response.StatusCode} - {response.ReasonPhrase}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error fetching word: {ex.Message}");
                }

                // Wait before retrying
                if (attempt < maxRetries)
                {
                    await Task.Delay(delay);
                }
            }

            return "DEFAULT"; // Fallback word
        }

        private async Task SelectWordForCurrentLevel()
        {
            wordToGuess = await FetchRandomWord();
            displayWord = new string('_', wordToGuess.Length);
            Console.WriteLine($"Selected word: {wordToGuess}"); // Log the selected word for debugging
            Console.WriteLine($"Display word: {displayWord}"); // Debug statement
        }

        private void UpdateDisplayWord(char guessedLetter)
        {
            var updatedDisplayWord = displayWord.ToCharArray();
            for (int i = 0; i < wordToGuess.Length; i++)
            {
                if (wordToGuess[i] == guessedLetter)
                {
                    updatedDisplayWord[i] = guessedLetter;
                }
            }
            displayWord = new string(updatedDisplayWord);
            Console.WriteLine($"Updated display word: {displayWord}"); // Debug statement
        }

        private async Task ResetLevel()
        {
            guessedLetters.Clear();
            wrongGuesses = 0;
            await SelectWordForCurrentLevel();
        }

        private async void ResetGame()
        {
            playerLives = 3;
            currentLevel = 1;
            score = 0;
            points = 0;
            hintsAvailable = 0;
            extraGuessesAvailable = 0;
            timer = 60.0f; // Reset timer for new game
            await ResetLevel();
        }

        private void RevealHint()
        {
            var random = new Random();
            var hiddenLetters = displayWord
                .Select((c, index) => new { Char = c, Index = index })
                .Where(x => x.Char == '_')
                .Select(x => x.Index)
                .ToList();

            if (hiddenLetters.Count > 0)
            {
                int randomIndex = hiddenLetters[random.Next(hiddenLetters.Count)];
                UpdateDisplayWord(wordToGuess[randomIndex]);
            }
        }

        private void RevealRandomLetters(int count)
        {
            var random = new Random();
            var hiddenLetters = displayWord
                .Select((c, index) => new { Char = c, Index = index })
                .Where(x => x.Char == '_')
                .Select(x => x.Index)
                .ToList();

            for (int i = 0; i < count && hiddenLetters.Count > 0; i++)
            {
                int randomIndex = hiddenLetters[random.Next(hiddenLetters.Count)];
                UpdateDisplayWord(wordToGuess[randomIndex]);
                hiddenLetters.Remove(randomIndex);
            }
        }

        private void DoubleOrNothing()
        {
            Random random = new Random();
            if (random.Next(2) == 0) // 50% chance
            {
                score += 1000; // Double the points
            }
            else
            {
                score = 0; // Lose all points
            }
        }

        private void TripleOrNothing()
        {
            Random random = new Random();
            if (random.Next(3) == 0) // 33% chance
            {
                score += 2400; // Triple the points
            }
            else
            {
                score = 0; // Lose all points
            }
        }

        private void UndoRandomPenalty()
        {
            if (wrongGuesses > 0)
            {
                wrongGuesses--;
            }
        }

        private void SpeedUpTimer()
        {
            if (timer > 10.0f)
            {
                timer -= 10.0f;
                score += 200; // Grant extra points
            }
        }

        private void SlowDownTimer()
        {
            if (score >= 50)
            {
                timer += 15.0f;
                score -= 50;
            }
        }

        private class WordnikResponse
        {
            public string word { get; set; }
        }
    }
}