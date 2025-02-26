<h2>Discalimer</h2>

This project was created as an assignment for the Frontend Development Training Course organized by Kreativestorm.
It represents 1 of 2 main assignments of the 3rd week, out of the 4 weeks of this course, along side https://github.com/AlexGTraining/fdc_rochambeau_game.

<h2>Requirements</h2>

<h3>Assignment specifications</h3>

  - Create a numbers guessing game using only alert / prompt / confirm windows
  - Create the following functions:
      - generateRandomNumber
        - returns a random integer between 1 and 100 
      - getPlayerGuess
        - prompts the user to enter a guess and returns the player's input as an integer
      - checkGuess 
        - takes two parameters - the player's guess and the correct number. It should return a string indicating whetherthe guess is too low, too high, or correct
      - game
        - generateRandomNumber
        - create loop with 10 attempts
        - print win/lose message after the rounds end
        - print number of attempts the player used
  - Optional: Implement a scoring system that rewards the player with points based on how quickly they guess the correct number
  - Work with assigned colleagues as a team

<h3>Technologies allowed</h3>

  - HTML
  - JavaScript

<h2>Implementation</h2>

<h3>Preview</h3>

https://alexgtraining.github.io/fdc_guess_numbers_game

<h3>Considerations</h3>

  - Engaging game backstory and messaging
  - Handling user flow with
      - option to retry
      - skip intro after first attempt
      - valid name insertion
      - score update on leaderboard for same user
      - top 5 leaderboard with yourself reflected independent of score
  - Separated game content (messages, values) from game logic to ease potential future changes to content (eg. localization, game balancing, improve user experience)
