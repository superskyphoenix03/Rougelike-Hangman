using System;
using System.Collections.Generic;

namespace WordGeneratorAPI.Models
{
    public class Achievement
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsUnlocked { get; set; }
    }

    public class DailyChallenge
    {
        public int Id { get; set; }
        public string ChallengeName { get; set; }
        public string Description { get; set; }
        public bool IsCompleted { get; set; }
    }

    public class GameReplay
    {
        public int Id { get; set; }
        public string PlayerName { get; set; }
        public List<string> Moves { get; set; }
        public DateTime DatePlayed { get; set; }
    }
}