
Roguelike Hangman Game Concept
1. Core Gameplay:

Objective: The player's goal is to guess the hidden word by suggesting letters within a limited number of attempts, just like traditional hangman.

Procedural Generation: The words are randomly generated from a predefined list or an external API, ensuring a new word is selected each time a new game starts.

Permadeath: If the player fails to guess the word within the allowed number of incorrect guesses, the game ends and the player must start over from scratch, losing all progress.

2. Roguelike Elements:

Levels and Difficulty: As the player successfully guesses words, the game progresses through levels. Each level increases in difficulty by using longer or more complex words and reducing the number of allowed incorrect guesses.

Progression and Scoring: Players earn points for each correctly guessed word and receive bonuses for completing levels. The score resets if the player loses, emphasizing the permadeath aspect.

Random Events: To enhance the roguelike experience, random events can be introduced. For example, certain letters may appear more frequently, or players might get bonuses for guessing multiple words in a row without losing.

3. Additional Features:

Power-Ups: Players can earn or find power-ups that provide hints, additional guesses, or other advantages.

Leaderboards: Track high scores and allow players to compete for the highest scores globally or within a community.

Themes and Customizations: Allow players to customize the visual appearance of the game, such as changing the hangman illustration or background themes.

Technical Implementation
Frontend (JavaScript):

UI Elements: Create the game interface, including the word display, input field for guesses, hangman visualization, score display, and level indicator.

Event Handling: Implement JavaScript functions to handle user inputs, such as letter guesses and power-up activations.

Backend (C#):

API Development: Develop an API to provide random words and manage game data (player scores, levels, etc.).

Database Interaction: Use SQLite to store and retrieve player progress, scores, and other game-related data.

Game Logic: Implement the core game logic, including word validation, scoring, level progression, and random events.

Unit Tests: Create unit tests for the backend functionality to ensure the game's reliability and correctness.



--------------------------------------------------
Project Plan with Emphasis on Backend in C# and Frontend in JavaScript
1. Project Overview:
Objective: Create a web-based roguelike hangman game with significant backend functionality written in C# and a frontend developed in JavaScript.
Problem: Provide a fun and challenging word game with roguelike elements such as random word generation, increasing difficulty, and player progress tracking.
Solution: Develop a game where players guess words to avoid a "game over" state. Integrate random word selection, game levels, scoring, and robust backend features.
2. Project Structure and Features:
Frontend (JavaScript):
Design a user-friendly interface with consistent styling (color palette, fonts, buttons, etc.).
Implement game UI elements using JavaScript: word display, input field for guesses, hangman visualization, score display.
Backend (C# - 50%):
API Development:
Create a C# API to fetch random words.
Develop endpoints for saving and retrieving player progress, scores, and game settings.
Database Interaction:
Use SQLite for database interaction with at least one table (more if needed).
Develop C# classes to interact with the database, including creating, reading, updating, and deleting (CRUD) data.
Business Logic:
Implement game logic on the backend to handle word validation, scoring, level progression, and game-over state.
Additional Backend Features:
Create unit tests for API endpoints.
Implement regex for input validation to ensure correct format.
Create a dictionary or list in C# to manage game settings and configurations.
3. Detailed Requirements:
GitHub Repository:
Create a repository with at least 10 distinct commits.
Regularly push code changes to show progress.
Write a detailed README file explaining the project, features, and instructions for reviewers.
Visual Appeal:
Ensure the game design is visually appealing and engaging.
Consistent design for headings, buttons, forms, and other UI elements.
Research and incorporate industry trends in game design.
Technical Implementation:
Web-based application using MVC, Razor pages, Blazor, or SPA.
Integrate a student-created API for random word generation.
Use SQLite for database interaction with at least one table.
Create and utilize a minimum of 3 functions or methods.
Implement at least 3 features from the provided features list.
Ensure backend functionality written in C# constitutes 50% of the project.
Develop the frontend in JavaScript.
4. Timeline and Milestones:
Module 3:
Set up the project repository and initialize the project.
Design the UI and create wireframes/mockups.
Module 4:
Implement the game frontend in JavaScript and backend in C#.
Test the game thoroughly and fix any issues.
Conduct regular reviews with mentors.
Complete the project and submit before the deadline.
5. Additional Resources:
ASP.NET Core Web UI Frameworks
Creating Your First Web API
Writing to a File - Microsoft Guide
Overview of SOLID Principles
