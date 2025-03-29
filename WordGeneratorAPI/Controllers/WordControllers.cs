using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite; // Import SQLite namespace
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace WordGeneratorAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WordController : ControllerBase
    {
        private readonly string _connectionString = "Data Source=WordsDatabase.db";
        private readonly string _logFilePath = "Logs/WordRequests.log";

        public WordController()
        {
            // Ensure the log directory exists
            Directory.CreateDirectory(Path.GetDirectoryName(_logFilePath));
        }

        [HttpGet]
        public async Task<ActionResult<WordResponse>> GetRandomWord([FromQuery] string type = "common", [FromQuery] int length = 3, [FromQuery] string difficulty = "easy")
        {
            try
            {
                await using var connection = new SqliteConnection(_connectionString);
                await connection.OpenAsync();

                // Check if the word type exists
                var categoryExists = await CheckCategoryExistsAsync(connection, type);
                if (!categoryExists)
                {
                    LogRequest(type, length, difficulty, "Invalid word type");
                    return BadRequest("Invalid word type. Please use a valid category.");
                }

                // Get words of the specified type, length, and difficulty
                var words = await GetWordsAsync(connection, type, length, difficulty);

                if (words.Count == 0)
                {
                    LogRequest(type, length, difficulty, "No words found");
                    return NotFound("No words found with the specified criteria.");
                }

                var random = new Random();
                var randomWord = words[random.Next(words.Count)];
                var hint = await GetHintAsync(connection, type);

                LogRequest(type, length, difficulty, "Success");
                return Ok(new WordResponse { WordText = randomWord, WordTheme = type, WordHint = hint });
            }
            catch (Exception ex)
            {
                LogRequest(type, length, difficulty, $"Error: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }

        private async Task<bool> CheckCategoryExistsAsync(SqliteConnection connection, string type)
        {
            var command = connection.CreateCommand();
            command.CommandText = "SELECT COUNT(*) FROM WordCategories WHERE Type = $type";
            command.Parameters.AddWithValue("$type", type);

            var count = (long)await command.ExecuteScalarAsync();
            return count > 0;
        }

        private async Task<List<string>> GetWordsAsync(SqliteConnection connection, string type, int length, string difficulty)
        {
            var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT Text FROM Words
                WHERE Type = $type AND Length = $length AND Difficulty = $difficulty";
            command.Parameters.AddWithValue("$type", type);
            command.Parameters.AddWithValue("$length", length);
            command.Parameters.AddWithValue("$difficulty", difficulty);

            var words = new List<string>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                words.Add(reader.GetString(0));
            }

            return words;
        }

        private async Task<string> GetHintAsync(SqliteConnection connection, string type)
        {
            var command = connection.CreateCommand();
            command.CommandText = "SELECT Hint FROM WordCategories WHERE Type = $type";
            command.Parameters.AddWithValue("$type", type);

            return (string)await command.ExecuteScalarAsync();
        }

        private void LogRequest(string type, int length, string difficulty, string result)
        {
            var logMessage = $"{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} | Type: {type}, Length: {length}, Difficulty: {difficulty} | Result: {result}";
            File.AppendAllText(_logFilePath, logMessage + Environment.NewLine);
        }
    }

    public class WordResponse
    {
        public string WordText { get; set; } // The word text
        public string WordTheme { get; set; } // The word theme
        public string WordHint { get; set; } // Hint for the word
    }
}