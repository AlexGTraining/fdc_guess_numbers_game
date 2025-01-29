const MIN = 0;
const MAX = 100;
const MAX_ATTEMPTS = 10;
const GUESS_STATES = Object.freeze({
    UNKNOWN: "unknown",
    CORRECT: "correct",
    LOW: "low",
    HIGH: "high"
});

const USER_NAME_KEY = "user_name";
const SaveManager = Object.freeze({
    save: function (key, value) {
        localStorage.setItem(key, value);
        console.log("executed localSave");
    },
    read: function (key) {
        return localStorage.getItem(key);
    },
    remove: function (key) {
        localStorage.removeItem(key);
    },
    clear: function () {
        localStorage.clear();
    }
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

const getUserName = function () {
    let old_user_name = SaveManager.read(USER_NAME_KEY);
    let message;
    if (old_user_name === null || old_user_name === undefined)
        message = ("Hi player!\nPlease enter your name");
    else
        message = `Hi ${old_user_name}!\nWould you like to change the name?`;

    let new_user_name = prompt(message);

    user_name = new_user_name !== null ? new_user_name : old_user_name;

    while (user_name.length === 0) {
        user_name = prompt(`Please give me a valid name`);
    }

    SaveManager.save(USER_NAME_KEY, user_name);
}

const introduceUserToRules = function () {
    notifyUser(`Welcome ${SaveManager.read(USER_NAME_KEY)}!\nHere are the game rules:\nI'm going to guess a number between ${MIN} and ${MAX}.\nThen you will get ${MAX_ATTEMPTS} to try and guess it. Don't worry! I'll give you hints along the way.\nIf you're quick enough you might even make the leaderbaord!\nGood Luck!`);
}

const game = function () {
    while (is_game_over) {
        let user_option = true;
        if (guess_state != GUESS_STATES.UNKNOWN)
            user_option = confirm("Would you like to try again?");

        if (!user_option)
            return;

        resetGame();
        getUserName();
        introduceUserToRules();
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
                    notifyUser('Sorry! Your guess was a bit too HIGH');
                    break;
                case GUESS_STATES.LOW:
                    notifyUser('Sorry! Your guess was a bit too LOW');
                    break;
            }
        }

        if (guesses_attempted < MAX_ATTEMPTS) {
            if (guesses_attempted < MAX_ATTEMPTS / 2)
                notifyUser(`YAAY! You won the game! Congratulations!\nAaaand you managed to do it in only ${guesses_attempted} attempts! Impressive!`);
            else
                notifyUser(`YAAY! You won the game! Congratulations!`);
        }
        else
            notifyUser(`Ahhh! Sorry, you lost!\nYou have used up all ${MAX_ATTEMPTS} attempts! Better luck next time :)`);
    }
}

let last_player_guess = null;
let guesses_attempted = 0;
let is_game_over = true;
let guess_state = GUESS_STATES.UNKNOWN;

game();