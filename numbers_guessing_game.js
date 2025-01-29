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

const ADVICE_PARAM_KEY = "-advice-param-";
const OPTION_PARAM_KEY = "-option-param-";
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

const INTRO_MESSAGES = [
    "\t\t\tWelcome to \“Escape from Isengard Tower\”!\n\n\t\t\t\tThis GAME is only for the brave!\n\t\t\t\t\tAre you ready to PLAY?",
    "\t\t\t\t\t\t\tINTRO\n\nDuring one of your hikes through Middle Earth, you suddently find yourself trapped in Saruman's tower in Isengard together with Gandalf! As you're trying to escape your fait Saruman's orcs are closing in on you.",
    "\t\t\t\t\t\t\tINTRO\n\nSARUMAN: HAHAHA! It seems you have locked yourself in my TOWER! You are doomed! My orcs will make a feast out of you now!",
    "\t\t\t\t\t\t\tINTRO\n\nGANDALF: OH NO! We’re trapped and there’s only one ESCAPE! You have to UNLOCK the cipher on the main door. But HURRY! The orcs will lose no time, I reckon we have about 10 TRIES before they arrive.",
    "\t\t\t\t\t\t\tINTRO\n\nSARUMAN: You’ll NEVER guess the code human.. I’ve made it nearly impossible MWHAHAHA",
    "\t\t\t\t\t\t\tINTRO\n\nGANDALF: Don’t worry, Saruman can only count up to 100 and I might be able to hear the cogs move and give you hints along the way."
];

const ADVIDE_MESSAGES = [
    `Give it your first shot, I’m sure it’s somewhere between 0 and 100`,
    `That was not it, but you’ve made progress. Try a ${ADVICE_PARAM_KEY}er number`,
    `Getting closer, ${ADVICE_PARAM_KEY} still`,
    `Too ${OPTION_PARAM_KEY}, try again`,
    `Good work! We’re narrowing it down now! Go ${ADVICE_PARAM_KEY}er`,
    `We must be getting close, it’s ${ADVICE_PARAM_KEY}er`,
    `Hmm.. it was a bit too ${OPTION_PARAM_KEY} that time, maybe somewhere in between`,
    `Come on, I can hear the orcs coming. It’s somewhere ${ADVICE_PARAM_KEY}er`,
    `We can’t let Saruman win, try again, ${ADVICE_PARAM_KEY}er this time`,
    `HURRY! The orcs are at the door! Go ${ADVICE_PARAM_KEY}er`
];

const END_GAME_SUCCESS = [
    `Gandalf: YES! That’s ${ADVICE_PARAM_KEY}! We’re out of here! Take that Saruman!`,
    "Saruman:Damn you human! I should have known you were smart. My orcs will get you next time!",
    "\t\t\t\t\t\tGAME OVER!\n\t\t\t\t\t\t   You WIN!"
];

const END_GAME_LOSE = [
    "Gandalf: AAAARRGH! They’ve got us! We’re doomed!",
    "Saruman: HAHAHA! That will teach you to mess with this GREAT wizard!",
    "\t\t\t\t\t\tGAME OVER!\n\t\t\t\t\t\t   You LOSE!"
];

class LeaderboardItem {
    constructor(name, score) {
        this.name = name;
        this.score = score;
    }
};

const generateRandomNumber = function (min = MIN_GUESS, max = MAX_GUESS) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

const getPlayerGuess = function (message) {
    let user_input = promptUser(message);

    return user_input === null ? 'quit' : parseInt(user_input);
};

const checkPlayerGuess = function (playerGuess, numberGenerated) {
    if (playerGuess == numberGenerated)
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
    return prompt(message);
}

const confirmUser = function (message) {
    return confirm(message);
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

let calculateHighscore = function (duration) {
    if (duration <= 0)
        return;

    let duration_in_seconds = duration / 1000;
    let score = parseInt((1 / duration_in_seconds) * 100000);
    console.log("duration: " + duration);
    console.log("score: " + score);
    return score;
}

const loadLeaderboard = function () {
    leaderboard = JSON.parse(SaveManager.read(LEADERBOARD_KEY));
}

const saveHighscore = function (user_name, highscore) {
    if (user_name == null || highscore == null)
        return

    let existing_user = null;
    if (leaderboard != null) {
        for (let i = 0; i < leaderboard.length; i++) {
            if (leaderboard[i].name === user_name) {
                existing_user = leaderboard[i];
                break;
            }
        }
    }

    if (existing_user == null) {
        if (leaderboard == null)
            leaderboard = new Array(new LeaderboardItem(user_name, highscore));
        else
            leaderboard[leaderboard.length] = new LeaderboardItem(user_name, highscore);
    }

    else if (highscore > existing_user.score)
        existing_user.score = highscore;

    if (leaderboard.length > 1) {
        leaderboard.sort((a, b) => b.score - a.score);
    }

    if (leaderboard.length > LEADERBOARD_COUNT)
        leaderboard.pop();

    SaveManager.save(LEADERBOARD_KEY, JSON.stringify(leaderboard));
}

const playIntro = function () {
    for (let i = 0; i < INTRO_MESSAGES.length; i++) {
        notifyUser(INTRO_MESSAGES[i]);
    }
}

const replaceParams = function (message) {
    if (message.includes(ADVICE_PARAM_KEY)) {
        message = message.replace(ADVICE_PARAM_KEY, next_player_advice);
    }

    if (message.includes(OPTION_PARAM_KEY)) {
        message = message.replace(OPTION_PARAM_KEY, last_player_choice);
    }

    return message;
}

const resetGame = function () {
    next_player_advice = null;
    guesses_attempted = 0;
    is_game_over = false;
    guess_state = GUESS_STATES.UNKNOWN;
    game_start_time = new Date().getTime();
    game_end_time = game_start_time;
}

const game = function () {
    loadLeaderboard();

    while (is_game_over) {
        let user_retry;
        let user_quit;
        if (guess_state == GUESS_STATES.UNKNOWN)
            playIntro();
        else {
            user_retry = confirm("Would you like to try again?");

            if (!user_retry)
                return;
        }

        resetGame();

        let generatedNumber = generateRandomNumber();
        console.log("generatedNumber " + generatedNumber);

        while (!is_game_over && guesses_attempted < MAX_ATTEMPTS) {
            let message_to_user = `\t\t\t\t\t\tAttempt ${guesses_attempted + 1}\\${MAX_ATTEMPTS}\n\n\n`;
            if (guesses_attempted == 0)
                message_to_user += ADVIDE_MESSAGES[0];
            else if (guesses_attempted < MAX_ATTEMPTS - 1) {
                let array_selection = last_random;
                while (array_selection == last_random) {
                    //Use the first half of the adivce options array for the first half of attempts. Then use the second half for the second half of the attempts
                    array_selection = generateRandomNumber((guesses_attempted < MAX_ATTEMPTS / 2) ? 1 : ADVIDE_MESSAGES.length / 2,
                        (guesses_attempted < MAX_ATTEMPTS / 2) ? ADVIDE_MESSAGES.length / 2 : ADVIDE_MESSAGES.length - 2);
                }
                last_random = array_selection;
                message_to_user += ADVIDE_MESSAGES[array_selection];
            }
            else {
                message_to_user += ADVIDE_MESSAGES[ADVIDE_MESSAGES.length - 1];
            }

            let player_input = getPlayerGuess(replaceParams(message_to_user));

            if (player_input == 'quit') {
                user_quit = true;
                break;
            }

            guess_state = checkPlayerGuess(player_input, generatedNumber);

            switch (guess_state) {
                case GUESS_STATES.CORRECT:
                    is_game_over = true;
                    next_player_advice = GUESS_STATES.CORRECT;
                    last_player_choice = GUESS_STATES.CORRECT;
                    break;
                case GUESS_STATES.HIGH:
                    last_player_choice = GUESS_STATES.HIGH;
                    next_player_advice = GUESS_STATES.LOW;
                    break;
                case GUESS_STATES.LOW:
                    last_player_choice = GUESS_STATES.LOW;
                    next_player_advice = GUESS_STATES.HIGH;
                    break;
            }
            guesses_attempted++;
        }

        is_game_over = true;

        if (user_quit)
            continue;

        game_end_time = new Date().getTime();
        let won_game = guesses_attempted < MAX_ATTEMPTS;
        let collection = won_game ? END_GAME_SUCCESS : END_GAME_LOSE;
        for (let i = 0; i < collection.length; i++)
            notifyUser(replaceParams(collection[i]));

        if (!won_game)
            continue;

        let game_duration = game_end_time - game_start_time;
        let new_highscore = calculateHighscore(game_duration);

        let is_qualified_for_leaderboard = false;
        if (leaderboard.length >= LEADERBOARD_COUNT)
            is_qualified_for_leaderboard = new_highscore > leaderboard[leaderboard.length - 1];

        if (is_qualified_for_leaderboard) {
            let user_name = getUserName();
            if (user_name === null)
                continue;

            saveHighscore(user_name, new_highscore);
        }

        displayLeaderboard();
    }
}

const displayLeaderboard = function () {
    let message = "\t\t\t\t\t\tLeaderboard\n\n";
    for (let i = 0; i < leaderboard.length; i++) {
        let user = leaderboard[i];
        message += `${user.name} : ${user.score}`
        if (i < leaderboard.length - 1)
            message += "\n";
    }
    notifyUser(message);
}

let guesses_attempted = 0;
let last_random = -1;
let next_player_advice = null;
let last_player_choice = null;
let is_game_over = true;
let guess_state = GUESS_STATES.UNKNOWN;
let game_start_time = 0;
let game_end_time = 0;
let leaderboard = null;

game();