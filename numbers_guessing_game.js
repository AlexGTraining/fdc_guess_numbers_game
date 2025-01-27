const MIN = 0;
const MAX = 100;
const MAX_ATTEMPTS = 10;
const GUESS_STATES = Object.freeze({
    UNKNOWN: "unknown",
    CORRECT: "correct",
    LOW: "low",
    HIGH: "high"
});

const generateRandomNumber = function (min = MIN, max = MAX) {
    return Math.floor(Math.random() * max);
};

const getPlayerGuess = function () {
    let user_input = prompt(`I'm thinking of a number.. Can you guess which one it is?`);
    return parseInt(user_input);
};

const checkPlayerGuess = function (playerGuess, numberGenerated) {
    if (playerGuess === numberGenerated)
        return GUESS_STATES.CORRECT;
    else if (playerGuess > numberGenerated)
        return GUESS_STATES.HIGH;
    else
        return GUESS_STATES.LOW;
}

const notifyUser = function (message) {
    alert(message);
}

const resetGame = function () {
    last_player_guess = null;
    guesses_attempted = 0;
    is_game_over = false;
    guess_state = GUESS_STATES.UNKNOWN;
}

const game = function () {
    while (is_game_over) {
        let user_option = true;
        if (guess_state != GUESS_STATES.UNKNOWN) {
            let input = prompt("Would you like to try again? y/n");

            switch (input) {
                case "y":
                    user_option = true;
                    break;
                case "n":
                default:
                    user_option = false;
                    break;
            }
        }

        if (!user_option)
            return;

        resetGame();
        let generatedNumber = generateRandomNumber();
        console.log("generatedNumber " + generatedNumber);

        while (!is_game_over && guesses_attempted < MAX_ATTEMPTS) {
            guesses_attempted++;
            last_player_guess = getPlayerGuess();
            guess_state = checkPlayerGuess(last_player_guess, generatedNumber);

            switch (guess_state) {
                case GUESS_STATES.CORRECT:
                    is_game_over = true;
                    notifyUser('Congratulation! Your guess was CORRECT!');
                    break;
                case GUESS_STATES.HIGH:
                    notifyUser('Sorry! Your guess was a bit too high');
                    break;
                case GUESS_STATES.LOW:
                    notifyUser('Sorry! Your guess was a bit too low');
                    break;
            }
        }

        if (guesses_attempted < MAX_ATTEMPTS) 
            notifyUser(`YAAY! You won the game! Congratulations!\nAaaand you managed to do it in only ${guesses_attempted} attempts! Impressive!`);
        else 
            notifyUser(`Ahhh! Sorry, you lost!\nYou have used up all ${MAX_ATTEMPTS} attempts! Better luck next time :)`);
    }
}

let last_player_guess = null;
let guesses_attempted = 0;
let is_game_over = true;
let guess_state = GUESS_STATES.UNKNOWN;

game();