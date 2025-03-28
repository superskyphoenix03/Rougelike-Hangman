using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace WordGeneratorAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WordController : ControllerBase
    {
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

        [HttpGet]
        public ActionResult<WordResponse> GetRandomWord([FromQuery] string type = "common", [FromQuery] int length = 3, [FromQuery] string difficulty = "easy")
        {
            var random = new Random();
            if (!WordCategories.ContainsKey(type))
            {
                return BadRequest("Invalid word type. Please use a valid category.");
            }

            var words = WordCategories[type].Words;
            var hint = WordCategories[type].Hint;

            var filteredWords = words.Where(word => word.Length == length && GetWordDifficulty(word) == difficulty).ToList();

            if (!filteredWords.Any())
            {
                return NotFound("No words found with the specified criteria.");
            }

            var randomWord = filteredWords[random.Next(filteredWords.Count)];
            return Ok(new WordResponse { Text = randomWord, Theme = type, Hint = hint });
        }

        private string GetWordDifficulty(string word)
        {
            if (word.Length <= 4) return "easy";
            if (word.Length <= 6) return "medium";
            return "hard";
        }
    }

    public class WordResponse
    {
        public string Text { get; set; }
        public string Theme { get; set; }
        public string Hint { get; set; }
    }
}