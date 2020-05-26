var title_first_width = 0;
var title_width = 0;
var DEBUG = false;
var playstate = 0; // 0 means initial, 1 means playing, 2 means paused, 3 means stopped

$(document).ready(() => {
    if ($("#course_title").length) {
        title_first_width = parseInt($("#course_title").css("width"), 10);
    }

    // allow only numbers
    $(".number").on('keypress', (key) => {
        if (key.charCode < 48 || key.charCode > 57) return false;
    })
    // prevent overflow
    $(".number").on('blur', (e) => {
        var myval = parseInt(e.target.value, 10);
        var mymax = parseInt(e.target.max, 10);


        if (myval >= mymax) {
            e.target.value = e.target.max;
        }
    });
    // prevent more than 2 digits
    $(".number").on('input', (e) => {
        if (e.target.value.length > e.target.maxLength) e.target.value = e.target.value.slice(0, e.target.maxLength);

        increment_input($(e.target), true);
    });


    // hide title placeholder when in focus
    $("#course_title").on('focus', (e) => {
        e.target.placeholder = "";
    });
    $("#course_title").on('blur', (e) => {
        e.target.placeholder = "Course title";
        // set width
        if (e.target.value.length == 0) {
            $(e.target).css("width", title_first_width + "px")
        }
    });
    // set the title input width
    $("#course_title").on('input', (e) => {
        var pix_length = (e.target.value.length + 1) * (e.target.size - 4) + "px";
        title_width = pix_length;
        $(e.target).css("width", pix_length);
    });

    $("#announcement").on('input', function (e) {
        console.log($(e.target)[0].offsetHeight);
        console.log(getLineCount($(e.target)));
    });

    // the two control buttons
    $(".startpause").on("mouseup", function () {
        console.log(playstate);
        if (playstate == 0 || playstate == 2 || playstate == 3) {
            // if initial, paused, or stopped, start playing
            playstate = 1;
            $(".startpause > .fa-play").css("display", "none");
            $(".startpause > .fa-pause").css("display", "block")
            // hide the clear stop
            $(".stopclear").css("opacity", "0");
        } else if (playstate == 1) {
            // was playing, now pause
            playstate = 2;
            $(".startpause > .fa-play").css("display", "block");
            $(".startpause > .fa-pause").css("display", "none")
            // show the clear stop
            $(".stopclear").css("opacity", "1");
            $(".stopclear > .fa-times").css("display", "none");
            $(".stopclear > .fa-stop").css("display", "block");
        }
        // do action with the new playstate
        parse_playstate(playstate);
    });

    $(".stopclear").on("mouseup", function () {
        if (playstate == 2) {
            // clicked while already paused, show the clear button
            $(".stopclear > .fa-times").css("display", "block");
            $(".stopclear > .fa-stop").css("display", "none");
            playstate = 3; // stopped
        } else if (playstate == 3) {
            // stopped already, reset to initial
            playstate = 0;
            $(".stopclear").css("opacity", "0");
        }
        
        // do action with the new playstate
        parse_playstate(playstate);
    });

});


function parse_playstate(playstate) {
    if (playstate == 0) {
        // initial state
        
    } else if (playstate == 1) {
        // playing state
        // get numbers from inputs and save
        
        
    } else if (playstate == 2) {
        // paused state
        
    } else if (playstate == 3) {
        // stopped state
        
    } else {
        // this has not been programmed, do nothing
    }
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
            console.log("which clause");
            console.log($(which).attr("id"));
        }
    } else if (parseInt($(which).val(), 10) == parseInt($(which).attr("max"), 10)) {
        // overflow
        $(which).val("0");
        // increment next numbers
        if ($(which).attr("id") == "seconds") {
            console.log("seconds");
            // check minutes and hours
            increment_input($("#minutes"), false);
        } else if ($(which).attr("id") == "minutes") {
            console.log("minutes");
            increment_input($("#hours"), false);
            // check hours only
        } else if ($(which).attr('id') == "hours") {
            $("#hours").val(parseInt($("#hours").attr("max"), 10) - 1);

        } else {
            console.log("which clause");
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
