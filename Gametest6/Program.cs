// Program.cs

using System;

namespace GameTest6 // This should be the same as the namespace in HangmanGame.cs
{
    public static class Program
    {
        [STAThread]
        static void Main()
        {
            using (var game = new HangmanGame()) // Use the HangmanGame class from GameTest6 namespace
            {
                game.Run();
            }
        }
    }
}
