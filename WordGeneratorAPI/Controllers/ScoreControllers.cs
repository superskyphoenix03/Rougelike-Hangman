using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

namespace WordGeneratorAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScoreController : ControllerBase
    {
        // In-memory list to store scores for simplicity. In a real application, this would be replaced with a database.
        private static List<Score> Scores = new List<Score>();

        // GET: api/Score
        [HttpGet]
        public ActionResult<IEnumerable<Score>> GetScores()
        {
            return Ok(Scores);
        }

        // GET: api/Score/{id}
        [HttpGet("{id}")]
        public ActionResult<Score> GetScore(int id)
        {
            var score = Scores.FirstOrDefault(s => s.Id == id);
            if (score == null)
            {
                return NotFound();
            }
            return Ok(score);
        }

        // POST: api/Score
        [HttpPost]
        public ActionResult<Score> AddScore(Score score)
        {
            score.Id = Scores.Count > 0 ? Scores.Max(s => s.Id) + 1 : 1;
            Scores.Add(score);
            return CreatedAtAction(nameof(GetScore), new { id = score.Id }, score);
        }

        // PUT: api/Score/{id}
        [HttpPut("{id}")]
        public IActionResult UpdateScore(int id, Score updatedScore)
        {
            var score = Scores.FirstOrDefault(s => s.Id == id);
            if (score == null)
            {
                return NotFound();
            }

            score.PlayerName = updatedScore.PlayerName;
            score.Points = updatedScore.Points;
            score.DateAchieved = updatedScore.DateAchieved;

            return NoContent();
        }

        // DELETE: api/Score/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteScore(int id)
        {
            var score = Scores.FirstOrDefault(s => s.Id == id);
            if (score == null)
            {
                return NotFound();
            }

            Scores.Remove(score);
            return NoContent();
        }

        // GET: api/Score/Leaderboard
        [HttpGet("Leaderboard")]
        public ActionResult<Leaderboard> GetLeaderboard()
        {
            var leaderboard = new Leaderboard
            {
                Scores = Scores.OrderByDescending(s => s.Points).Take(10).ToList()
            };
            return Ok(leaderboard);
        }
    }
}