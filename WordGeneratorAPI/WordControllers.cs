using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace RandomWordGeneratorApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WordController : ControllerBase
    {
        private static readonly Dictionary<string, string[]> WordCategories = new Dictionary<string, string[]>
        {
            { "common", new[] { "cat", "dog", "bat", "rat", "sun", "fun", "run", "fan", "cow", "pig" } },
            { "fruits", new[] { "apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "honeydew", "kiwi", "lemon" } },
            { "animals", new[] { "elephant", "fox", "giraffe", "hippopotamus", "iguana", "jaguar", "kangaroo", "lion", "monkey", "newt" } },
            { "colors", new[] { "red", "blue", "green", "yellow", "orange", "purple", "brown", "pink", "black", "white" } },
            { "countries", new[] { "argentina", "brazil", "canada", "denmark", "egypt", "france", "germany", "hungary", "india", "japan" } },
            { "occupations", new[] { "doctor", "engineer", "teacher", "nurse", "pilot", "chef", "artist", "musician", "writer", "dentist" } },
            { "sports", new[] { "soccer", "basketball", "tennis", "cricket", "hockey", "baseball", "rugby", "golf", "swimming", "cycling" } },
            { "instruments", new[] { "piano", "guitar", "drums", "violin", "flute", "saxophone", "trumpet", "cello", "harp", "clarinet" } },
            { "vehicles", new[] { "car", "truck", "bus", "motorcycle", "bicycle", "scooter", "airplane", "helicopter", "boat", "submarine" } },
            { "household", new[] { "table", "chair", "sofa", "bed", "lamp", "desk", "cupboard", "shelf", "mirror", "rug" } },
            { "clothing", new[] { "shirt", "pants", "dress", "skirt", "jacket", "coat", "hat", "scarf", "gloves", "socks" } }
        };

        [HttpGet]
        public ActionResult<WordResponse> GetRandomWord([FromQuery] string type = "common", [FromQuery] int length = 3)
        {
            var random = new Random();
            if (!WordCategories.ContainsKey(type))
            {
                return BadRequest("Invalid word type. Please use a valid category.");
            }

            var filteredWords = WordCategories[type].Where(word => word.Length == length).ToList();

            if (!filteredWords.Any())
            {
                return NotFound("No words found with the specified criteria.");
            }

            var randomWord = filteredWords[random.Next(filteredWords.Count)];
            return Ok(new WordResponse { Text = randomWord, Theme = type });
        }
    }

    public class WordResponse
    {
        public string Text { get; set; }
        public string Theme { get; set; }
    }
}