var title_first_width = 0;
var DEBUG = false;
var playstate = 0; // 0 means initial, 1 means playing, 2 means paused, 3 means stopped, 4 means completed
var set_time = 0; // the time set by user
var current_time = 0; // the current time
var timer = null; // the clock timer
var display_timer = null; // the display timer for updating clock
var first_run = true;
var prev_announcement_placeholder = ""; // save the announcement placeholder

var second_progress = 0; // for keeping track of partial timer progress
var UPDATE_MS = 100; // the timer is updated this number of ms


$(document).ready(() => {
    // get the initial title width
    if ($("#course_title").length) {
        title_first_width = parseInt($("#course_title").css("width"), 10);
    }

    // allow only numbers
    $(".number").on('keypress', (key) => {
        if (key.charCode < 48 || key.charCode > 57) return false;
    })
    // prevent overflow
    $(".number").on('blur', function (e) {
        if (parseInt(e.target.value, 10) >= parseInt(e.target.max, 10)) e.target.value = e.target.max;
    });
    // prevent more than 2 digits
    $(".number").on('input', function (e) {
        if (e.target.value.length > e.target.maxLength) e.target.value = e.target.value.slice(0, e.target.maxLength);
        increment_input($(e.target), true);
        // hide or show the play/pause button based on input or lack thereof
        if (is_input_zero()) $(".startpause").css("opacity", "0");
        else $(".startpause").css("opacity", "1");
    });


    // hide title placeholder when in focus
    $("#course_title").on('focus', function (e) {
        e.target.placeholder = "";
    });

    $("#course_title").on('blur', (e) => {
        e.target.placeholder = "Course title";
        // set width
        if (e.target.value.length == 0) $(e.target).css("width", title_first_width + "px")

    });
    // set the title input width
    $("#course_title").on('input', (e) => {
        $(e.target).css("width", (e.target.value.length + 1) * (e.target.size - 4) + "px");
    });

    $("#announcement").on('input', function (e) {
        //        console.log($(e.target)[0].offsetHeight);
        //        console.log(getLineCount($(e.target)));
    });

    // the two control buttons
    $(".startpause").on("mouseup", function () {
        if (playstate == 0 || playstate == 2 || playstate == 3) {
            // if initial, paused, or stopped, start playing
            set_playstate(1);
            update_clock();
        } else if (playstate == 1) {
            // was playing, now pause
            set_playstate(2);
        } else if (playstate == 4) {
            // restart timer
            current_time = set_time;
            update_clock();
            set_playstate(1);
        }
    });

    $(".stopclear").on("mouseup", function () {
        if (playstate == 2) {
            // clicked while already paused, show the clear button
            $(".stopclear > .fa-times").css("display", "block");
            $(".stopclear > .fa-stop").css("display", "none");
            set_playstate(3); // stopped
        } else if (playstate == 3 || playstate == 4) {
            // stopped already, reset to initial
            set_playstate(0);
            $(".stopclear").css("opacity", "0");
        }
    });

    $(".moretime").on("mousedown", function () {
        moretime_expand();
    });

});

function moretime_expand() {

}

function is_input_zero() {
    return get_clock_time() == 0;
}

function get_clock_time() {
    var h = parseInt($("#hours").val(), 10);
    var m = parseInt($("#minutes").val(), 10);
    var s = parseInt($("#seconds").val(), 10);
    if (!h) h = 0;
    if (!m) m = 0;
    if (!s) s = 0;
    return milliseconds(h, m, s);
}

function set_playstate(new_playstate) {
    playstate = new_playstate; // set the global playstate
    if (new_playstate == 0) {
        // initial state
        $(".number").val("");
        current_time = 0;
        set_time = 0;
        show_announcement_placeholder(true);
    } else if (new_playstate == 1) {
        // playing state
        // get numbers from inputs and save
        $(".startpause > .fa-play").css("display", "none");
        $(".startpause > .fa-pause").css("display", "block");
        $(".startpause > .fa-undo-alt").css("display", "none");
        // hide the clear stop
        $(".stopclear").css("opacity", "0");
        var millis = get_clock_time();
        if (millis == 0) return;

        // if running for the first time, remember first set time
        if (first_run) {
            set_time = millis
            first_run = false;
        }
        // current time is updated if changed
        // set current time but remember progress from previous timer
        current_time = millis - second_progress;
        if (current_time <= 0) current_time = 0;

        clearInterval(timer);
        clearInterval(display_timer);
        timer = setInterval(function () {
            // decrement current time every 1 
            if (playstate == 1) {
                current_time -= UPDATE_MS;
                if (second_progress >= 1000) second_progress = 0;
                second_progress += UPDATE_MS
                if (current_time <= 0) set_playstate(4);
            }
        }, 100);

        display_timer = setInterval(function () {
            set_clock(current_time);
        }, 1000);
        // if announcements are empty, hide the section
        if ($("#announcement")[0].value.length == 0) show_announcement_placeholder(false);


    } else if (new_playstate == 2) {
        // paused state
        // interval will automaticaly pause
        clearInterval(timer);
        clearInterval(display_timer);
        show_announcement_placeholder(true);
        $(".startpause > .fa-play").css("display", "block");
        $(".startpause > .fa-pause").css("display", "none");
        $(".startpause > .fa-undo-alt").css("display", "none");

        // show the clear stop
        $(".stopclear").css("opacity", "1");
        $(".stopclear > .fa-times").css("display", "none");
        $(".stopclear > .fa-stop").css("display", "block");
        $(".startpause > .fa-undo-alt").css("display", "none");
    } else if (new_playstate == 3) {
        // stopped state
        //        console.log("timer stopped");
        show_announcement_placeholder(true);
        first_run = true;
        clearTimeout(timer);
        clearTimeout(display_timer);
        set_clock(set_time); // reset the time to what user set
        current_time = set_time;
    } else if (new_playstate == 4) {
        // timer completed
        console.log("Timer is finished!");
        show_announcement_placeholder(true);
        clearInterval(timer);
        clearInterval(display_timer);
        update_clock();

        $(".startpause > .fa-play").css("display", "none");
        $(".startpause > .fa-pause").css("display", "none");
        $(".startpause > .fa-undo-alt").css("display", "block");
        $(".stopclear").css("opacity", "1");
        $(".stopclear > .fa-times").css("display", "block");
        $(".stopclear > .fa-stop").css("display", "none");


    } else {
        // this has not been programmed, do nothing
    }
}


function show_announcement_placeholder(state) {
    if (state) {
        $("#announcement")[0].placeholder = prev_announcement_placeholder;
    } else {
        prev_announcement_placeholder = $("#announcement")[0].placeholder;
        $("#announcement")[0].placeholder = "";
    }
}

function update_clock() {
    set_clock(current_time);
}


function set_clock(ms) {
    // set the time in the clock by breaking down hours, minutes, seconds
    var max = milliseconds(23, 59, 59);
    if (ms >= max) ms = max;
    var h = Math.floor(ms / (60 * 60 * 1000));
    var hr = ms % (60 * 60 * 1000);
    var mr = hr % (60 * 1000);
    var m = Math.floor(hr / (60 * 1000));
    var s = Math.round(mr / 1000);

    $("#hours").val(h);
    $("#minutes").val(m);
    $("#seconds").val(s);
}

function milliseconds(h, m, s) {
    return (h * 60 * 60 + m * 60 + s) * 1000;
}


function increment_input(which, clicked) {
    // if not clicked, check for double overflow
    if ((!clicked && parseInt($(which).val(), 10) + 1) == parseInt($(which).attr('max'), 10)) {
        // reset the counter first
        $(which).val(0);
        if ($(which).attr("id") == "seconds") {
            // check minutes
            increment_input($("#minutes"), false);
        } else if ($(which).attr("id") == "minutes") {
            // check hours only
            increment_input($("#hours"), false);
        } else if ($(which).attr('id') == "hours") {
            // hours overflowed, so stop
            $("#hours").val(parseInt($("#hours").attr("max"), 10) - 1);
            $("#minutes").val(parseInt($("#minutes").attr("max"), 10) - 1);
            $("#seconds").val(parseInt($("#seconds").attr("max"), 10) - 1);
        } else {
            console.log($(which).attr("id"));
        }
    } else if (parseInt($(which).val(), 10) == parseInt($(which).attr("max"), 10)) {
        // overflow
        $(which).val("0");
        // increment next numbers
        if ($(which).attr("id") == "seconds") {
            // check minutes and hours
            increment_input($("#minutes"), false);
        } else if ($(which).attr("id") == "minutes") {
            increment_input($("#hours"), false);
            // check hours only
        } else if ($(which).attr('id') == "hours") {
            $("#hours").val(parseInt($("#hours").attr("max"), 10) - 1);
        } else {
            console.log($(which).attr("id"));
        }

    } else if (parseInt($(which).val(), 10) > parseInt($(which).attr('max'), 10)) {
        // if user typed in a larger than max number, set to 1 below max
        $(which).val(parseInt($(which).attr("max"), 10) - 1);
    } else {
        // do nothing
        if (!clicked) {
            $(which).val(function (i, oldval) {
                return ++oldval;
            });
        }
    }
}
