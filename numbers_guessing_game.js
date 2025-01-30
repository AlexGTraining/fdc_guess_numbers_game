const DEBUG_MODE = true;
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
const PLAYER_FEEDBACK_STATES = Object.freeze({
    QUIT: "quit",
    RETRY: "retry",
    CONTINUE: "continue"
});

const ADVICE_PARAM_KEY = "-advice-param-";
const OPTION_PARAM_KEY = "-option-param-";
const GUESSES_PARAM_KEY = "-guesses-param-";
const HIGHSCORE_PARAM_KEY = "-highscore-param-"
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
    "Welcome to \“Escape from Isengard Tower\”!\n\nThis GAME is only for the brave!\nAre you ready to PLAY?",
    "INTRO\n\nDuring one of your hikes through Middle Earth, you suddenly find yourself trapped in Saruman's tower together with Gandalf! As you're trying to escape your fait Saruman's orcs are closing in on you.",
    "SARUMAN\n\n\"HAHAHA! It seems you have locked yourself in my TOWER! You are doomed! My orcs will make a feast out of you now!\"",
    "GANDALF\n\n\"OH NO! We’re trapped and there’s only one ESCAPE! You have to UNLOCK the cipher on the main door. But HURRY! The orcs will lose no time, I reckon we have about 10 TRIES before they arrive.\"",
    "SARUMAN\n\n\"You’ll NEVER guess the code human.. I’ve made it nearly impossible MWHAHAHA\"",
    "GANDALF\n\n\"Don’t worry, Saruman can only count up to 100 and I might be able to hear the cogs move and give you hints along the way.\"",
];

const ADVIDE_MESSAGES = [
    `Give it your first shot, I’m sure it’s anywhere between 0 and 100`,
    `That was not it, but you’ve made progress. Try a ${ADVICE_PARAM_KEY}er number`,
    `Getting closer, endeavor to go ${ADVICE_PARAM_KEY}er still`,
    `Too ${OPTION_PARAM_KEY}, try again`,
    `Good work! We’re narrowing it down now! Go ${ADVICE_PARAM_KEY}er`,
    `We must be getting close, it’s somewhere in the ${ADVICE_PARAM_KEY}er range`,
    `Hmm.. it was a bit too ${OPTION_PARAM_KEY} that time, maybe somewhere in between`,
    `Come on, I can hear the orcs coming. It’s somewhere ${ADVICE_PARAM_KEY}er`,
    `We can’t let Saruman win, try again, ${ADVICE_PARAM_KEY}er this time`,
    `HURRY! The orcs are at the door! Go ${ADVICE_PARAM_KEY}er`
];

const END_GAME_SUCCESS = [
    `GANDALF\n\n\"YES! That’s ${ADVICE_PARAM_KEY}! We’re out of here! Take that Saruman!\"`,
    "SARUMAN\n\n\"Damn you human! I should have known you were smart. My orcs will get you next time!\"",
    "GAME OVER!\n\nYou WIN!"
];

const END_GAME_LOSE = [
    "GANDALF\n\n\"AAAARRGH! They’ve got us! We’re doomed!\"",
    "SARUMAN\n\n\"HAHAHA! That will teach you to mess with this GREAT wizard!\"",
    "GAME OVER!\n\nYou LOSE!"
];

const ATTEMPT_COUNTER_MESSAGE = `Attempt ${GUESSES_PARAM_KEY}\\${MAX_ATTEMPTS}\n\n\n`;
const ADDITIONAL_PLAYER_FEEDBACK = "Hmm.. I didn't understand that message, try a number between 0 and 100.";
const MADE_LEADERBOARD_MESSAGE = `Congrats CHAMP!\nYou've made the leaderboard!\nScore: ${HIGHSCORE_PARAM_KEY}\n\nNow give me your player name so I can place you in there.`
const VALID_PLAYER_NAME_FEEDBACK = `Please give me a valid name. Max 20 characters`;
const TRY_AGAIN_MESSAGE = "Would you like to try again?";
const SKIP_INTRO_MESSAGE = "Would you like to skip the intro?";
const YOU_QUIT_MESSAGE = "You QUIT!\n\nThanks for playing! See you next time!";
const LEADERBOARD_TITLE = "Leaderboard\n\n";

class LeaderboardItem {
    constructor(name, score) {
        this.name = name;
        this.score = score;
    }
};

const generateRandomNumber = function (min = MIN_GUESS, max = MAX_GUESS) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

const buildMessageToPlayer = function (guesses_attempted, give_additional_player_feedback) {
    let message_to_player = ATTEMPT_COUNTER_MESSAGE.replace(GUESSES_PARAM_KEY, guesses_attempted + 1);

    if (guesses_attempted == 0) {
        if (give_additional_player_feedback)
            message_to_player += ADDITIONAL_PLAYER_FEEDBACK;
        else
            message_to_player += ADVIDE_MESSAGES[0];
    }
    else if (guesses_attempted < MAX_ATTEMPTS - 1) {
        let array_selection = _last_random_selection;
        while (array_selection == _last_random_selection) {
            //Use the first half of the adivce options array for the first half of attempts. Then use the second half for the second half of the attempts
            array_selection = generateRandomNumber((guesses_attempted < MAX_ATTEMPTS / 2) ? 1 : ADVIDE_MESSAGES.length / 2,
                (guesses_attempted < MAX_ATTEMPTS / 2) ? ADVIDE_MESSAGES.length / 2 : ADVIDE_MESSAGES.length - 2);
        }
        _last_random_selection = array_selection;

        if (give_additional_player_feedback)
            message_to_player += (ADDITIONAL_PLAYER_FEEDBACK + "\n\n");

        message_to_player += ADVIDE_MESSAGES[array_selection];
    }
    else {
        if (give_additional_player_feedback)
            message_to_player += (ADDITIONAL_PLAYER_FEEDBACK + "\n\n");

        message_to_player += ADVIDE_MESSAGES[ADVIDE_MESSAGES.length - 1];
    }

    return message_to_player;
}

const getPlayerGuess = function (message) {
    let player_input = promptPlayer(message);

    if (player_input === null)
        return PLAYER_FEEDBACK_STATES.QUIT;

    let parsed_input = parseInt(player_input, 10);

    return isNaN(parsed_input) ? PLAYER_FEEDBACK_STATES.RETRY : parsed_input;
};

const checkPlayerGuess = function (playerGuess, numberGenerated) {
    if (playerGuess == numberGenerated)
        return GUESS_STATES.CORRECT;
    else if (playerGuess > numberGenerated)
        return GUESS_STATES.HIGH;
    else
        return GUESS_STATES.LOW;
}

const generatePlayerAdvice = function (guess_state) {
    switch (guess_state) {
        case GUESS_STATES.CORRECT:
            _next_player_advice = GUESS_STATES.CORRECT;
            _last_player_choice = GUESS_STATES.CORRECT;
            break;
        case GUESS_STATES.HIGH:
            _last_player_choice = GUESS_STATES.HIGH;
            _next_player_advice = GUESS_STATES.LOW;
            break;
        case GUESS_STATES.LOW:
            _last_player_choice = GUESS_STATES.LOW;
            _next_player_advice = GUESS_STATES.HIGH;
            break;
    }
}

const notifyPlayer = function (message) {
    alert(message);
}

const promptPlayer = function (message) {
    return prompt(message);
}

const confirmPlayer = function (message) {
    return confirm(message);
}

const log = function (message) {
    if (DEBUG_MODE)
        console.log(message);
}

const getPlayerName = function (highscore) {
    let message = MADE_LEADERBOARD_MESSAGE.replace(HIGHSCORE_PARAM_KEY, highscore);

    let new_player_name = promptPlayer(message);

    if (new_player_name === null)
        return null;

    while (new_player_name === null || new_player_name === undefined || new_player_name.trim().length === 0) {
        new_player_name = promptPlayer(VALID_PLAYER_NAME_FEEDBACK);
    }

    new_player_name = new_player_name.substring(0, 20);

    return new_player_name;
}

let calculateHighscore = function (duration) {
    if (duration <= 0)
        return;

    let duration_in_seconds = duration / 1000;
    let score = parseInt((1 / duration_in_seconds) * 100000);
    log("duration: " + duration);
    log("score: " + score);
    return score;
}

const loadLeaderboard = function () {
    _leaderboard = JSON.parse(SaveManager.read(LEADERBOARD_KEY));
}

const saveHighscore = function (player_name, highscore) {
    if (player_name == null || highscore == null)
        return

    let existing_player = null;
    if (_leaderboard != null) {
        for (let i = 0; i < _leaderboard.length; i++) {
            if (_leaderboard[i].name === player_name) {
                existing_player = _leaderboard[i];
                break;
            }
        }
    }

    if (existing_player == null) {
        if (_leaderboard == null)
            _leaderboard = new Array(new LeaderboardItem(player_name, highscore));
        else
            _leaderboard[_leaderboard.length] = new LeaderboardItem(player_name, highscore);
    }

    else if (highscore > existing_player.score)
        existing_player.score = highscore;

    if (_leaderboard.length > 1) {
        _leaderboard.sort((a, b) => b.score - a.score);
    }

    if (_leaderboard.length > LEADERBOARD_COUNT)
        _leaderboard.pop();

    SaveManager.save(LEADERBOARD_KEY, JSON.stringify(_leaderboard));
}

const playIntro = function () {
    for (let i = 0; i < INTRO_MESSAGES.length; i++) {
        notifyPlayer(INTRO_MESSAGES[i]);
    }

    _intro_complete = true;
}

const playEndSequence = function (won_game) {
    let collection = won_game ? END_GAME_SUCCESS : END_GAME_LOSE;
    for (let i = 0; i < collection.length; i++)
        notifyPlayer(replaceParams(collection[i]));
}

const replaceParams = function (message) {
    if (message.includes(ADVICE_PARAM_KEY)) {
        message = message.replaceAll(ADVICE_PARAM_KEY, _next_player_advice);
    }

    if (message.includes(OPTION_PARAM_KEY)) {
        message = message.replaceAll(OPTION_PARAM_KEY, _last_player_choice);
    }

    return message;
}

const resetGame = function () {
    _next_player_advice = null;
    _guesses_attempted = 0;
    _is_game_over = false;
    _guess_state = GUESS_STATES.UNKNOWN;
    _game_start_time = new Date().getTime();
    _game_end_time = _game_start_time;
}

const game = function () {
    loadLeaderboard();

    while (true) {
        let player_quit;

        if (!_intro_complete)
            playIntro();
        else {
            if (!confirmPlayer(TRY_AGAIN_MESSAGE)) {
                notifyPlayer(YOU_QUIT_MESSAGE)
                return;
            }


            if (!confirmPlayer(SKIP_INTRO_MESSAGE))
                playIntro();
        }

        resetGame();

        let generatedNumber = generateRandomNumber();
        log("generatedNumber " + generatedNumber);

        let give_additional_player_feedback = false;
        while (!_is_game_over && _guesses_attempted < MAX_ATTEMPTS) {
            let message_to_player = buildMessageToPlayer(_guesses_attempted, give_additional_player_feedback);
            let player_input = getPlayerGuess(replaceParams(message_to_player));

            if (player_input == PLAYER_FEEDBACK_STATES.QUIT) {
                give_additional_player_feedback = false;
                player_quit = true;
                break;
            }
            else if (player_input == PLAYER_FEEDBACK_STATES.RETRY) {
                give_additional_player_feedback = true;
                continue;
            }
            else
                give_additional_player_feedback = false;

            _guess_state = checkPlayerGuess(player_input, generatedNumber);

            _is_game_over = _guess_state == GUESS_STATES.CORRECT;

            generatePlayerAdvice(_guess_state);

            _guesses_attempted++;
        }

        if (player_quit)
            continue;

        _game_end_time = new Date().getTime();
        let won_game = _guesses_attempted < MAX_ATTEMPTS;
        playEndSequence(won_game);

        if (!won_game)
            continue;

        let game_duration = _game_end_time - _game_start_time;
        let new_highscore = calculateHighscore(game_duration);

        let is_qualified_for_leaderboard = true;
        if (_leaderboard.length >= LEADERBOARD_COUNT)
            is_qualified_for_leaderboard = new_highscore > _leaderboard[_leaderboard.length - 1];

        if (is_qualified_for_leaderboard) {
            let player_name = getPlayerName(new_highscore);
            if (player_name === null)
                continue;

            saveHighscore(player_name, new_highscore);
        }

        displayLeaderboard();
    }
}

const displayLeaderboard = function () {
    let message = LEADERBOARD_TITLE;
    for (let i = 0; i < _leaderboard.length; i++) {
        let player = _leaderboard[i];
        message += `${player.name} : ${player.score}`
        if (i < _leaderboard.length - 1)
            message += "\n";
    }
    notifyPlayer(message);
}

let _intro_complete = false;
let _guesses_attempted = 0;
let _last_random_selection = -1;
let _next_player_advice = null;
let _last_player_choice = null;
let _is_game_over = true;
let _guess_state = GUESS_STATES.UNKNOWN;
let _game_start_time = 0;
let _game_end_time = 0;
let _leaderboard = null;

game();