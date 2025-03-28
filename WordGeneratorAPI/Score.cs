using System;
using System.Collections.Generic;

namespace WordGeneratorAPI
{
    public class Score
    {
        public int Id { get; set; } // Unique identifier for each score
        public string PlayerName { get; set; } // Name of the player
        public int Points { get; set; } // Points scored by the player
        public DateTime DateAchieved { get; set; } // Date when the score was achieved
    }

    public class Leaderboard
    {
        public List<Score> Scores { get; set; } = new List<Score>();
    }
}