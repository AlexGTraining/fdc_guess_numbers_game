const MIN_GUESS = 0;
const MAX_GUESS = 100;
const MAX_ATTEMPTS = 10;
const LEADERBOARD_COUNT = 5;
const GUESS_STATES = Object.freeze({
    UNKNOWN: "unknown",
    CORRECT: "correct",
    LOW: "low",
    HIGH: "high"
});

const USER_NAME_KEY = "user_name";
const LEADERBOARD_KEY = "leaderboard";
const SaveManager = Object.freeze({
    save: function (key, value) {
        localStorage.setItem(key, value);
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

function LeaderboardItem(name, score) {
    this.name = name;
    this.score = score;
};

const generateRandomNumber = function (min = MIN_GUESS, max = MAX_GUESS) {
    return Math.floor(Math.random() * max);
};

const getPlayerGuess = function () {
    let user_input = promptUser("I'm thinking of a number.. Can you guess which one it is?");
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

const promptUser = function (message) {
    prompt(message);
}

const resetGame = function () {
    last_player_guess = null;
    guesses_attempted = 0;
    is_game_over = false;
    guess_state = GUESS_STATES.UNKNOWN;
    game_start_time = new Date().getTime();
    game_end_time = game_start_time;
}

const getUserName = function () {
    let old_user_name = SaveManager.read(USER_NAME_KEY);
    let message = (old_user_name === null || old_user_name === undefined) ? "Hi player!\nPlease enter your name" : `Hi ${old_user_name}!\nWould you like to change the name?`;

    let new_user_name = promptUser(message);

    if (new_user_name === null)
        return null;

    user_name = (new_user_name !== undefined && new_user_name.trim().length !== 0) ? new_user_name : old_user_name;

    while (user_name === null || user_name === undefined || user_name.trim().length === 0) {
        user_name = promptUser(`Please give me a valid name`);
    }

    SaveManager.save(USER_NAME_KEY, user_name);

    return user_name;
}

const introduceUserToRules = function () {
    notifyUser(`Welcome ${SaveManager.read(USER_NAME_KEY)}!\nHere are the game rules:\nI'm going to guess a number between ${MIN_GUESS} and ${MAX_GUESS}.\nThen you will get ${MAX_ATTEMPTS} attempts to try and guess it.\nDon't worry! I'll give you hints along the way.\nIf you're quick enough you might even make the leaderboard!\nGood Luck!`);
}

const saveHighscore = function (user_name, duration) {
    if (duration <= 0)
        return;

    highscore = 1(duration / 1000);

    let save_key = `${user_name}` + HIGHSCORE_KEY;
    console.log("save_key " + save_key + " highscore " + highscore);
    
    let user_found = false;
    for (let i = 0; i < leaderboard.length; i++) {
        let user = leaderboard[i];
        if (user.name === user_name) {
            user_found = true;

            if (highscore > user.score)
                user.score = highscore;

            break;
        }
    }

    if (user_found){
        if (leaderboard.length > 1) {
            leaderboard.sort((a, b) => b.score - a.score);
        }

        return;
    }

    leaderboard[leaderboard.length] = new LeaderboardItem(user_name, highscore);

    if (leaderboard.length > 1) {
        leaderboard.sort((a, b) => b.score - a.score);
    }

    if (leaderboard.length > LEADERBOARD_COUNT)
        leaderboard.pop();

    SaveManager.save(LEADERBOARD_KEY, leaderboard);
}

const game = function () {
    leaderboard = SaveManager.read(LEADERBOARD_KEY);

    while (is_game_over) {
        let user_option = true;
        if (guess_state != GUESS_STATES.UNKNOWN)
            user_option = confirm("Would you like to try again?");

        if (!user_option)
            return;

        resetGame();
        let user_name = getUserName();

        if (user_name === null)
            return;

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

        game_end_time = new Date().getTime();
        let game_duration = game_end_time - game_start_time;

        saveHighscore(user_name, game_duration);

        if (guesses_attempted < MAX_ATTEMPTS) {
            let message = `YAAY! You won the game! Congratulations!`;
            if (guesses_attempted < MAX_ATTEMPTS / 2)
                message += `\nAaaand you managed to do it in only ${guesses_attempted} attempts! Impressive!`;

            notifyUser(message);
        }
        else
            notifyUser(`Ahhh! Sorry, you lost!\nYou have used up all ${MAX_ATTEMPTS} attempts! Better luck next time :)`);
    }
}

let last_player_guess = null;
let guesses_attempted = 0;
let is_game_over = true;
let guess_state = GUESS_STATES.UNKNOWN;
let game_start_time = 0;
let game_end_time = 0;
let leaderboard = new Array();

game();