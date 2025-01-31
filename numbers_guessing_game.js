const DEBUG_MODE = false;
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
const SCORE_PARAM_KEY = "-score-param-"
const PLAYER_NAME_PARAM_KEY = "-player-name-param-"
const LEADERBOARD_SAVE_KEY = "leaderboard";
const SaveManager = Object.freeze({
    save: function (key, value) {
        if (isLocalStorageEnabled())
            localStorage.setItem(key, value);
        else
            console.error("Unable to save to localstorage. It might be disabled.");
    },
    read: function (key) {
        if (isLocalStorageEnabled())
            return localStorage.getItem(key);
        else
            console.error("Unable to read from localstorage. It might be disabled.");
        return null;
    },
    remove: function (key) {
        if (isLocalStorageEnabled())
            localStorage.removeItem(key);
        else
            console.error("Unable to remove from localstorage. It might be disabled.");
    },
    clear: function () {
        if (isLocalStorageEnabled)
            localStorage.clear();
        else
            console.error("Unable to clear localstorage. It might be disabled.");
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
    `GANDALF\n\n\"Give it your best shot, I’m sure it’s anywhere between 0 and 100\"`,
    `Try a ${ADVICE_PARAM_KEY}er number.\"`,
    `Endeavor to go ${ADVICE_PARAM_KEY}er.\"`,
    `Too ${OPTION_PARAM_KEY}, try again.\"`,
    `Go ${ADVICE_PARAM_KEY}er.\"`,
    `It’s somewhere in the ${ADVICE_PARAM_KEY}er range.\"`,
    `Too ${OPTION_PARAM_KEY} that time.\"`,
    `QUICK! I can hear the orcs coming. It’s somewhere ${ADVICE_PARAM_KEY}er.\"`,
    `We can’t let Saruman win, try again, ${ADVICE_PARAM_KEY}er this time.\"`,
    `HURRY! The orcs are at the door! Go ${ADVICE_PARAM_KEY}er.\"`
];

const ENCOURAGE_MESSAGES = [
    "GANDALF\n\n\"Good work! ",
    "GANDALF\n\n\"Yes! We're narrowing it down now! ",
    "GANDALF\n\n\"I think we're getting closer. ",
    "GANDALF\n\n\"Great! We're on the right track. ",
    "GANDALF\n\n\"Good good. Keep going. ",
    "GANDALF\n\n\"That was not it, but you’ve made progress. "
];

const DISCOURAGE_MESSAGES = [
    "GANDALF\n\n\"That was the wrong way around. ",
    "GANDALF\n\n\"Doesn't seem to work.. ",
    "GANDALF\n\n\"Hmm... that was the wrong way. ",
    "GANDALF\n\n\"No, not that way. ",
    "GANDALF\n\n\"Oh, I think that was not the right way. "
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

const ATTEMPT_COUNTER_MESSAGE = `Attempt ${GUESSES_PARAM_KEY}\\${MAX_ATTEMPTS}\n\n`;
const ADDITIONAL_PLAYER_FEEDBACK = "Hmm.. I didn't understand that message, try a number between 0 and 100.";
const MADE_LEADERBOARD_MESSAGE = `٩(^‿^)۶\nCongrats CHAMP!\nYou've made the leaderboard!\nScore: ${HIGHSCORE_PARAM_KEY}\n\nNow give me your player name so I can place you in there.`
const VALID_PLAYER_NAME_FEEDBACK = `Please give me a valid name, try using letters and numbers`;
const TRY_AGAIN_MESSAGE = "Would you like to take another stab at defeating Saruman?";
const SKIP_INTRO_MESSAGE = "Would you like to skip the intro?";
const YOU_QUIT_MESSAGE = "Sorry to see you go!\n\nThanks for playing! See you next time!";
const YOU_QUIT_RETRY_MESSAGE = "Oh no, you QUIT the game!\n\n";
const PLAYER_NAME_ALREADY_EXISTS_MESSAGE = `Player name ${PLAYER_NAME_PARAM_KEY} already exists in the leaderboard. Would you like to use a different player name?`;
const LEADERBOARD_TITLE = "Leaderboard\n\n";
const YOUR_HIGHSCORE_MESSAGE = `\n\nYour score is ${SCORE_PARAM_KEY}`

class LeaderboardItem {
    constructor(name, score) {
        this.name = name;
        this.score = score;
    }
};

const isLocalStorageEnabled = () => {
    try {
        const key = `__storage__test`;
        window.localStorage.setItem(key, null);
        window.localStorage.removeItem(key);
        return true;
    } catch (e) {
        return false;
    }
};

const generateRandomNumber = function (min = MIN_GUESS, max = MAX_GUESS) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

const buildMessageToPlayer = function (guesses_attempted, give_additional_player_feedback) {
    let message_to_player = ATTEMPT_COUNTER_MESSAGE.replace(GUESSES_PARAM_KEY, guesses_attempted + 1);

    let message_direction_selection = getMessageDirectionIndex();

    if (guesses_attempted == 0) {
        if (give_additional_player_feedback)
            message_to_player += ADDITIONAL_PLAYER_FEEDBACK;
        else
            message_to_player += ADVIDE_MESSAGES[0];
    }
    else if (guesses_attempted < MAX_ATTEMPTS - 1) {
        let array_selection = getMainMessageIndex(guesses_attempted);

        if (give_additional_player_feedback)
            message_to_player += (ADDITIONAL_PLAYER_FEEDBACK + "\n\n");
        else
            message_to_player += _guess_good_direction ? ENCOURAGE_MESSAGES[message_direction_selection] : DISCOURAGE_MESSAGES[message_direction_selection];

        message_to_player += ADVIDE_MESSAGES[array_selection];

        if (give_additional_player_feedback)
            message_to_player = message_to_player.slice(0, -1);
    }
    else {
        if (give_additional_player_feedback)
            message_to_player += (ADDITIONAL_PLAYER_FEEDBACK + "\n\n");

        message_to_player += _guess_good_direction ? ENCOURAGE_MESSAGES[message_direction_selection] : DISCOURAGE_MESSAGES[message_direction_selection];

        message_to_player += ADVIDE_MESSAGES[ADVIDE_MESSAGES.length - 1];
    }

    return replaceMessageAdviceParams(message_to_player);
}

const getMainMessageIndex = function (guesses_attempted) {
    let array_selection = _last_random_message_selection;
    while (array_selection == _last_random_message_selection) {
        //Use the first half of the adivce options array for the first half of attempts. Then use the second half for the second half of the attempts
        array_selection = generateRandomNumber((guesses_attempted < MAX_ATTEMPTS / 2) ? 1 : ADVIDE_MESSAGES.length / 2,
            (guesses_attempted < MAX_ATTEMPTS / 2) ? ADVIDE_MESSAGES.length / 2 : ADVIDE_MESSAGES.length - 2);
    }
    _last_random_message_selection = array_selection;

    return array_selection;
}

const getMessageDirectionIndex = function () {
    let message_direction_selection = _last_random_message_direction_selection;
    while (message_direction_selection == _last_random_message_direction_selection) {
        message_direction_selection = generateRandomNumber(0, _guess_good_direction ? ENCOURAGE_MESSAGES.length - 1 : DISCOURAGE_MESSAGES.length - 1);
    }
    _last_random_message_direction_selection = message_direction_selection;

    return message_direction_selection;
}

const getPlayerGuess = function (give_extra_player_feedback) {
    let message = buildMessageToPlayer(_guesses_attempted, give_extra_player_feedback);

    let player_input = prompt(message);
    if (player_input === null)
        return PLAYER_FEEDBACK_STATES.QUIT;

    let parsed_input = parseInt(player_input, 10);

    return isNaN(parsed_input) ? PLAYER_FEEDBACK_STATES.RETRY : parsed_input;
};

const checkGuess = function (playerGuess, numberGenerated) {
    _guess_good_direction = Math.abs(numberGenerated - _previous_guess) > Math.abs(numberGenerated - playerGuess);
    _previous_guess = playerGuess;

    _guesses_attempted++;

    if (playerGuess == numberGenerated)
        return GUESS_STATES.CORRECT;
    else if (playerGuess > numberGenerated)
        return GUESS_STATES.HIGH;
    else
        return GUESS_STATES.LOW;
}

const generateFeedbackForThePlayer = function (guess_state) {
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

const log = function (message) {
    if (DEBUG_MODE)
        console.log(message);
}

const getPlayerName = function (highscore) {
    let message = MADE_LEADERBOARD_MESSAGE.replace(HIGHSCORE_PARAM_KEY, highscore);

    let new_player_name = prompt(message);
    if (new_player_name === null)
        return null;

    while (new_player_name.trim().length === 0) {
        new_player_name = prompt(VALID_PLAYER_NAME_FEEDBACK);

        if (new_player_name == null)
            break;
    }

    if (new_player_name != null) {
        new_player_name = new_player_name.substring(0, 20);
        _current_player_name = new_player_name;
    }

    return new_player_name;
}

let calculateHighscore = function (game_start_time, game_end_time) {
    let duration = game_end_time - game_start_time;
    if (duration <= 0)
        return;

    let duration_in_seconds = duration / 1000;
    let score = parseInt((1 / duration_in_seconds) * 100000);

    if (score < 1)
        score = 1;

    return score;
}

const loadLeaderboard = function () {
    _leaderboard = JSON.parse(SaveManager.read(LEADERBOARD_SAVE_KEY));
}

const checkPlayerExists = function (player_name) {
    let existing_player = null;
    if (_leaderboard != null) {
        for (let i = 0; i < _leaderboard.length; i++) {
            if (_leaderboard[i].name == player_name) {
                existing_player = _leaderboard[i];
                break;
            }
        }
    }
    return existing_player;
}

const saveHighscore = function (player_name, highscore) {
    if (player_name == null || highscore == null)
        return

    let existing_player = checkPlayerExists(player_name);

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

    SaveManager.save(LEADERBOARD_SAVE_KEY, JSON.stringify(_leaderboard));
}

const addPlayerToLeaderboard = function (new_highscore) {
    let player_name = getPlayerName(new_highscore);
    if (player_name == null)
        return;

    while (true) {
        let existing_player = checkPlayerExists(player_name);
        if (existing_player == null)
            break;
        else {
            if (confirm(PLAYER_NAME_ALREADY_EXISTS_MESSAGE.replace(PLAYER_NAME_PARAM_KEY, player_name))) {
                player_name = getPlayerName(new_highscore);
                if (player_name == null)
                    break;
            }
            else
                break;
        }
    }
    saveHighscore(player_name, new_highscore);
}

const displayLeaderboard = function (score, is_on_leaderboard) {
    if (_leaderboard == null)
        return;

    let message = LEADERBOARD_TITLE;
    for (let i = 0; i < _leaderboard.length; i++) {
        let player = _leaderboard[i];
        message += `${(i + 1)}. ${player.name} : ${player.score}`

        if (player.name == _current_player_name)
            message += " <-- (•̀ᴗ•́)و ̑̑"

        if (i < _leaderboard.length - 1)
            message += "\n";
    }

    if (!is_on_leaderboard)
        message += YOUR_HIGHSCORE_MESSAGE.replace(SCORE_PARAM_KEY, score);

    alert(message);
}

const playIntro = function () {
    for (let i = 0; i < INTRO_MESSAGES.length; i++) {
        alert(INTRO_MESSAGES[i]);
    }

    _intro_complete = true;
}

const playEndSequence = function (won_game) {
    let collection = won_game ? END_GAME_SUCCESS : END_GAME_LOSE;
    for (let i = 0; i < collection.length; i++)
        alert(replaceMessageAdviceParams(collection[i]));
}

const replaceMessageAdviceParams = function (message) {
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
    _won_game = false;
    _game_start_time = new Date().getTime();
    _game_end_time = _game_start_time;
    _guess_direction = 0;
    _guess_good_direction = true;
    _previous_guess = -1;
    _current_player_name = "";
}

const game = function () {
    loadLeaderboard();

    let player_quit = false;
    while (true) {

        if (!_intro_complete)
            playIntro();
        else {
            if (!confirm(player_quit ? YOU_QUIT_RETRY_MESSAGE + TRY_AGAIN_MESSAGE : TRY_AGAIN_MESSAGE)) {
                alert(YOU_QUIT_MESSAGE)
                return;
            }

            if (!confirm(SKIP_INTRO_MESSAGE))
                playIntro();
        }

        resetGame();

        let generatedNumber = generateRandomNumber();
        log("generatedNumber " + generatedNumber);

        let give_extra_feedback = false;
        while (!_won_game && _guesses_attempted < MAX_ATTEMPTS) {
            let player_input = getPlayerGuess(give_extra_feedback);

            player_quit = player_input == PLAYER_FEEDBACK_STATES.QUIT;
            give_extra_feedback = player_input == PLAYER_FEEDBACK_STATES.RETRY;

            if (player_quit)
                break;
            else if (give_extra_feedback)
                continue;

            let guess_state = checkGuess(player_input, generatedNumber);
            _won_game = guess_state == GUESS_STATES.CORRECT;

            generateFeedbackForThePlayer(guess_state);
        }

        if (player_quit)
            continue;

        _game_end_time = new Date().getTime();
        playEndSequence(_won_game);

        if (!_won_game)
            continue;

        let new_highscore = calculateHighscore(_game_start_time, _game_end_time);

        let is_qualified_for_leaderboard = true;
        if (_leaderboard != null && _leaderboard.length >= LEADERBOARD_COUNT)
            is_qualified_for_leaderboard = new_highscore > _leaderboard[_leaderboard.length - 1].score;

        if (is_qualified_for_leaderboard) {
            addPlayerToLeaderboard(new_highscore);
        }

        displayLeaderboard(new_highscore, is_qualified_for_leaderboard);
    }
}

let _intro_complete = false;
let _guesses_attempted = 0;
let _last_random_message_selection = -1;
let _last_random_message_direction_selection = -1;
let _next_player_advice = null;
let _last_player_choice = null;
let _previous_guess = -1;
let _guess_good_direction = true;
let _won_game = true;
let _game_start_time = 0;
let _game_end_time = 0;
let _current_player_name = "";
let _leaderboard = null;

game();