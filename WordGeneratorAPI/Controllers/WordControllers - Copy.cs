using Microsoft.AspNetCore.Mvc; // Import ASP.NET Core MVC framework
using System; // Import System namespace for basic functionalities
using System.Collections.Generic; // Import collections for using dictionaries and lists
using System.Linq; // Import LINQ for list operations

namespace WordGeneratorAPI.Controllers
{
    [ApiController] // Define this class as an API controller
    [Route("[controller]")] // Route requests to this controller using the controller's name
    public class WordController : ControllerBase
    {
        // Define a dictionary to store word categories and their hints
        private static readonly Dictionary<string, (string[] Words, string Hint)> WordCategories = new Dictionary<string, (string[], string)>
        {
            { "common", (new[] { "cat", "dog", "bat", "rat", "sun", "fun", "run", "fan", "cow", "pig" }, "Common words used in daily life") },
            { "fruits", (new[] { "apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "honeydew", "kiwi", "lemon" }, "Various kinds of fruits") },
            { "animals", (new[] { "elephant", "fox", "giraffe", "hippopotamus", "iguana", "jaguar", "kangaroo", "lion", "monkey", "newt" }, "Names of animals") },
            { "colors", (new[] { "red", "blue", "green", "yellow", "orange", "purple", "brown", "pink", "black", "white" }, "Names of colors") },
            { "countries", (new[] { "argentina", "brazil", "canada", "denmark", "egypt", "france", "germany", "hungary", "india", "japan" }, "Names of countries") },
            { "occupations", (new[] { "doctor", "engineer", "teacher", "nurse", "pilot", "chef", "artist", "musician", "writer", "dentist" }, "Various occupations") },
            { "sports", (new[] { "soccer", "basketball", "tennis", "cricket", "hockey", "baseball", "rugby", "golf", "swimming", "cycling" }, "Different types of sports") },
            { "instruments", (new[] { "piano", "guitar", "drums", "violin", "flute", "saxophone", "trumpet", "cello", "harp", "clarinet" }, "Musical instruments") },
            { "vehicles", (new[] { "car", "truck", "bus", "motorcycle", "bicycle", "scooter", "airplane", "helicopter", "boat", "submarine" }, "Different types of vehicles") },
            { "household", (new[] { "table", "chair", "sofa", "bed", "lamp", "desk", "cupboard", "shelf", "mirror", "rug" }, "Common household items") },
            { "clothing", (new[] { "shirt", "pants", "dress", "skirt", "jacket", "coat", "hat", "scarf", "gloves", "socks" }, "Types of clothing") }
        };

        // Endpoint to get a random word based on type, length, and difficulty
        [HttpGet]
        public ActionResult<WordResponse> GetRandomWord([FromQuery] string type = "common", [FromQuery] int length = 3, [FromQuery] string difficulty = "easy")
        {
            var random = new Random(); // Create a random number generator
            if (!WordCategories.ContainsKey(type)) // Check if the word type exists
            {
                return BadRequest("Invalid word type. Please use a valid category."); // Return error if type is invalid
            }

            var words = WordCategories[type].Words; // Get words of the specified type
            var hint = WordCategories[type].Hint; // Get hint for the specified type

            // Filter words by length and difficulty
            var filteredWords = words.Where(word => word.Length == length && GetWordDifficulty(word) == difficulty).ToList();

            if (!filteredWords.Any()) // Check if no words match the criteria
            {
                return NotFound("No words found with the specified criteria."); // Return error if no words found
            }

            var randomWord = filteredWords[random.Next(filteredWords.Count)]; // Select a random word from the filtered list
            return Ok(new WordResponse { Text = randomWord, Theme = type, Hint = hint }); // Return the random word, theme, and hint
        }

        // Helper method to determine word difficulty based on length
        private string GetWordDifficulty(string word)
        {
            if (word.Length <= 4) return "easy"; // Words with length 4 or less are easy
            if (word.Length <= 6) return "medium"; // Words with length 5-6 are medium
            return "hard"; // Words with length greater than 6 are hard
        }
    }

    // Class to represent the response structure
    public class WordResponse
    {
        public string Text { get; set; } // The word text
        public string Theme { get; set; } // The word theme
        public string Hint { get; set; } // Hint for the word
    }
}