using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using WordGeneratorAPI.Models;

namespace WordGeneratorAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GameController : ControllerBase
    {
        // In-memory lists for simplicity. Replace with a database in a real application.
        private static List<Achievement> Achievements = new List<Achievement>();
        private static List<DailyChallenge> DailyChallenges = new List<DailyChallenge>();
        private static List<GameReplay> GameReplays = new List<GameReplay>();

        // Achievements
        [HttpGet("achievements")]
        public ActionResult<IEnumerable<Achievement>> GetAchievements()
        {
            return Ok(Achievements);
        }

        [HttpPost("achievements")]
        public ActionResult<Achievement> AddAchievement(Achievement achievement)
        {
            achievement.Id = Achievements.Count > 0 ? Achievements.Max(a => a.Id) + 1 : 1;
            Achievements.Add(achievement);
            return CreatedAtAction(nameof(GetAchievements), new { id = achievement.Id }, achievement);
        }

        // Daily Challenges
        [HttpGet("daily-challenges")]
        public ActionResult<IEnumerable<DailyChallenge>> GetDailyChallenges()
        {
            return Ok(DailyChallenges);
        }

        [HttpPost("daily-challenges")]
        public ActionResult<DailyChallenge> AddDailyChallenge(DailyChallenge challenge)
        {
            challenge.Id = DailyChallenges.Count > 0 ? DailyChallenges.Max(c => c.Id) + 1 : 1;
            DailyChallenges.Add(challenge);
            return CreatedAtAction(nameof(GetDailyChallenges), new { id = challenge.Id }, challenge);
        }

        // Game Replays
        [HttpGet("game-replays")]
        public ActionResult<IEnumerable<GameReplay>> GetGameReplays()
        {
            return Ok(GameReplays);
        }

        [HttpPost("game-replays")]
        public ActionResult<GameReplay> AddGameReplay(GameReplay replay)
        {
            replay.Id = GameReplays.Count > 0 ? GameReplays.Max(r => r.Id) + 1 : 1;
            GameReplays.Add(replay);
            return CreatedAtAction(nameof(GetGameReplays), new { id = replay.Id }, replay);
        }
    }
}