var r = Raphael("holder", "100%", "100%");

var redColor = "#FF1919";
var blueColor = "#195AFF";
var altRedColor = "#7F1616";
var altBlueColor = "#16347F";
var greyColor = "#CCC";

var posSideAttr = {fill: "#FFF"};
var negSideAttr = {fill: "#222"};

var circleAtMouseAttr   = {"fill-opacity": 0, "stroke-width": 1, stroke: redColor};
var redPointAtrr   = {fill: redColor, stroke: redColor, r: 5, "stroke-width": 2};
var bluePointAtrr   = {fill: blueColor, stroke: blueColor, r: 5, "stroke-width": 2};

var redLineAtrr   = {fill: redColor, stroke: redColor, opacity: .2};
var blueLineAtrr   = {fill: blueColor, stroke: blueColor, opacity: .2};

var axesAttr = {stroke: greyColor};
var knifeTopAttr = {stroke: "#111", "stroke-width": 3};
var knifeBotAttr = {stroke: "#111", "stroke-width": 3};

var bluePoints = [];
var redPoints = [];

var blueLines = r.set();
var redLines = r.set();

var GLOBAL_MARGIN_x = 355;
var GLOBAL_MARGIN_y = 5;
var STATUS = "inputred";

var COUNT = 0;

var circleAtMouse = r.circle(0,0,5).attr(circleAtMouseAttr);
var dualAtMouse = r.path(circleAtMouseAttr);

var MEDIANLINE;

var KNIFE_TOP = r.path().attr(knifeTopAttr);
var KNIFE_BOT = r.path().attr(knifeBotAttr);

var LINESHIDDEN = false;
var ANCHOR;
var ANCHOR2;
var INIT_DIR;

var redPosPoints = [];
var redNegPoints = [];
var bluePosPoints = [];
var blueNegPoints = [];


var SWITCH = true
var PREV_ANCHOR;
var PREV_ANCHOR2;

var WEDGE;

// p = (a,b)
// y = ax + b
// 

function initAxes(){
    var xPath = "M"+coord_to_x(-2000)+","+coord_to_y(0)+"L"+coord_to_x(2000)+","+coord_to_y(0);
    var yPath = "M"+coord_to_x(0)+","+coord_to_y(-2000)+"L"+coord_to_x(0)+","+coord_to_y(2000);

    var xAxis = r.path(xPath).attr(axesAttr);
    var yAxis = r.path(yPath).attr(axesAttr);
}

function pointHoverIn(i, color){
    if (LINESHIDDEN == false) {
        if (color == "red") {
            console.log(i);
            var line = redLines[i];
            line.attr({/*"stroke": "#000", */opacity: 1});
        } else {
            var line = blueLines[i];
            line.attr({/*"stroke": "#000", */opacity: 1});
        }
    }
}

function pointHoverOut(i, color){
    if (LINESHIDDEN == false) {
        if (color == "red") {
            var line = redLines[i];
            line.attr(redLineAtrr);
        } else {
            var line = blueLines[i];
            line.attr(blueLineAtrr);
        }
    }
}

$(document).ready(function() {
    initAxes();

    // hovering point and dual line
    $( "#holder" ).on( "mousemove", function( event ) {
        if (STATUS != "inputdone") {
            var x = event.pageX - GLOBAL_MARGIN_x;
            var y = event.pageY - GLOBAL_MARGIN_y;
            circleAtMouse.attr({cx: x, cy: y});
            dualAtMouse.remove();
            dualAtMouse = convert_to_dual_line(x_to_coord(x),y_to_coord(y));
            if (STATUS == "inputred") {
                dualAtMouse.attr({"stroke": redColor, opacity: .5});
            }
            if (STATUS == "inputblue") {
                dualAtMouse.attr({"stroke": blueColor, opacity: .5});
            }
        }
    });

    $( "#holder" ).on( "mousedown", function( event ) {
        if (STATUS != "inputdone") {
            var x = event.pageX - GLOBAL_MARGIN_x;
            var y = event.pageY - GLOBAL_MARGIN_y;  
            console.log(x, y);

            if (STATUS == "inputred") {
                var i = COUNT;
                redPoints.push(r.circle(x,y,5).attr(redPointAtrr).hover(function(){pointHoverIn(i,"red")}, function(){pointHoverOut(i,"red")}));
                
                var dualLine = convert_to_dual_line(x_to_coord(x),y_to_coord(y));
                dualLine.attr(redLineAtrr);
                redLines.push(dualLine);
                
                COUNT++;
                updateCounts();
            }
            if (STATUS == "inputblue") {
                var i = COUNT;
                bluePoints.push(r.circle(x,y,5).attr(bluePointAtrr).hover(function(){pointHoverIn(i,"blue")}, function(){pointHoverOut(i,"blue")}));
                var dualLine = convert_to_dual_line(x_to_coord(x),y_to_coord(y));
                dualLine.attr(blueLineAtrr);
                blueLines.push(dualLine);
                updateCounts();
                COUNT++;
            }
            if (redPoints.length >= 2) {
                $("#user-prompt").html("<button onclick='endInputRed()'> Finished adding <span class='text-red'>red</span> points</button>");
            }
            if (bluePoints.length >= 2) {
                $("#user-prompt").html("<button onclick='endInputBlue()'> Finished adding <span class='text-blue'>blue</span> points</button>");
                $("#user-prompt").show();
            }
        }
    });

});


function endInputRed() {
    if (redPoints.length % 2 == 0) {
        STATUS = "inputblue";
        circleAtMouse.attr("stroke", blueColor);
        $("#user-prompt").hide();
        $(".user-hint").html("<p>Click to add <span class='text-blue'>blue</span> points<br><br> For simplicity's sake please add an <em class='highlight'>even number</em> of points.</p></p></p>");
        COUNT = 0;
    } 
    else {
        $(".highlight").css({"border-bottom": "2px solid #777", "font-weight": "bold"});
    }
}

function endInputBlue() {
    if (bluePoints.length % 2 == 0) {
        STATUS = "inputdone";
        $(".user-hint").html("\
            <p>\
            We will now show that it is always possible to draw a Ham Sandwich Cut using the \"Rotating Knife\" approach.<br><br>\
            We begin by drawing the <strong>median line</strong> that separates the <span class='text-red'>red</span> points in half.\
            We will rotate the line 180 degrees, maintaining a 50/50 split of <span class='text-red'>red</span> points. After a 180 degree rotation, the number of <span class='text-blue'>blue</span> points on each side will be the opposite of our initial state. By the Intermediate Value Theorem, the number of <span class='text-blue'>blue</span> points must be 1/2 of the total at some point during the rotation.<br><br>\
            For now, we will hide the dual plane.<br><br>\
            </p>\
            ");
        circleAtMouse.hide();
        dualAtMouse.hide();
        $("#end-input-blue").hide();
        $("#user-prompt").html("<button onclick='draw_median()'> Draw median line</button>");
    }
    else {
        $(".highlight").css({"border-bottom": "2px solid #777", "font-weight": "bold"});
    }
}

function ivt_description() {
    
    $(".user-hint").append("\
        <p>We will rotate the line 180 degrees, maintaining a 50/50 split of <span class='text-red'>red</span> points. After a 180 degree rotation, the number of <span class='text-blue'>blue</span> points on each side will be the opposite of our initial state. By the Intermediate Value Theorem, the number of <span class='text-blue'>blue</span> points must be 1/2 of the total at some point during the rotation.</p>\
            ");
    
    $("#user-prompt").html("<button onclick='move_cut_to_first_point()'>Begin rotation</button>");
}

function hideIntro() {
    $(".intro-screen").animate({"margin-top": "100vh"}, 200, function(){
        $(".intro-screen").hide();
    });
}


/* ===========================================================================*/
/* ===========================================================================*/
/* ===========================================================================*/


function draw_median(){

    var sortedRedPoints = mergeSort_by_x(redPoints);

    var medianPoint = sortedRedPoints[redPoints.length/2];
    var medianPoint2 = sortedRedPoints[(redPoints.length/2) - 1];
    var avgX = (medianPoint.attr("cx") + medianPoint2.attr("cx")) / 2;
    var avgY = (medianPoint.attr("cy") + medianPoint2.attr("cy")) / 2;

    KNIFE_TOP.attr("path", "M" + avgX + "," + avgY + "L" + avgX + "," + (avgY+2000));
    KNIFE_BOT.attr("path", "M" + avgX+ "," + avgY + "L" + avgX + "," + (avgY-2000));

    update_point_counts();
    ANCHOR = medianPoint;
    ANCHOR2 = ANCHOR;

    LINESHIDDEN = true;

    // hide dual lines
    redLines.animate({"opacity": 0}, 100);
    blueLines.animate({"opacity": 0}, 100, function () {
        
        medianPoint.animate({"stroke-width": 10}, 200, function(){
            medianPoint.animate({"stroke-width": 2}, 200);
        });
        
        medianPoint2.animate({"stroke-width": 10}, 200, function(){
           medianPoint2.animate({"stroke-width": 2}, 200);
        });
        
        $("#user-prompt").html("<button onclick='move_cut_to_first_point()'>Begin rotation</button>");
    });

}

function move_cut_to_first_point () {
    ANCHOR.attr({"stroke": "#000", "r": 10});

    console.log("CURRENT ANCHOR", ANCHOR);
    //var med = get_line_data();

    var x = ANCHOR.attr("cx");
    var y = ANCHOR.attr("cy");

    KNIFE_TOP.animate({
        path: ["M" + x + "," + y + "L" + x + "," + (y+2000)]
    }, 500);
    KNIFE_BOT.animate({
        path: ["M" + x + "," + y + "L" + x + "," + (y-2000)]
    }, 500, function(){
        ANCHOR2 = find_new_anchor();

        rotate_medianline_to(ANCHOR, ANCHOR2, function(){
            console.log("done rotating");
            update_point_counts();
            $("#user-prompt").html("<button onclick='rotate()'>Rotate</button>");
        });
    });

}

// centered at p1
function rotate_medianline_to(p1, p2, callback) {

    var p1x = p1.attr("cx");
    var p1y = p1.attr("cy");
    var p2x = p2.attr("cx");
    var p2y = p2.attr("cy");

    var xdiff = p2x - p1x;
    var ydiff = p2y - p1y;

    var m = ydiff/xdiff;
    /* y = mx + b 
    b = y - mx
    x = (y-b)/m
    */
    var b = p1y - (p1x * m)

    var x1_offscreen = -5;
    var x2_offscreen = 2000;
    var y1_offscreen = (m*x1_offscreen) + b
    var y2_offscreen = (m*x2_offscreen) + b

    var theta = to_degrees(Math.atan(m)) + 90;
    console.log("THETA:", theta);

//    var newPath = "M" + x1_offscreen + "," + y1_offscreen + "L" + x2_offscreen + "," + y2_offscreen;

    var newPathTop = "M" + p2x + "," + p2y + "L" + x1_offscreen + "," + y1_offscreen;
    var newPathBot = "M" + p2x + "," + p2y + "L" + x2_offscreen + "," + y2_offscreen;
    ANCHOR = p2;
    ANCHOR2 = p1;
    KNIFE_TOP.animate({
        //transform: "r"+theta+" "+p1x+" "+p1y,
        path: newPathTop
    }, 500, function(){
        KNIFE_TOP.attr("path", newPathTop).transform([]);
    });
    KNIFE_BOT.animate({
        //transform: "r"+theta+" "+p1x+" "+p1y,
        path: newPathBot
    }, 500, function(){
        KNIFE_BOT.attr("path", newPathBot).transform([]);

        callback();
    });
}

function rotate(){

    PREV_ANCHOR = ANCHOR;
    PREV_ANCHOR2 = ANCHOR2;
    
    $('#user-prompt button').prop('disabled', true);

    reset_attrs();
    ANCHOR.attr({r: 8});
    
    update_point_counts();
    
    var newAnchor = find_new_anchor();
    //newAnchor.attr({r: 6, fill: "#ff0"});
    ANCHOR2 = newAnchor;

    rotate_medianline_to(ANCHOR, newAnchor, function(){
        reset_attrs();
        update_point_counts();
        ANCHOR.attr({r: 8});
        ANCHOR.attr({"r": 8, fill: "#fff"});
        ANCHOR2.attr({"r": 8, fill: "#000"});
        $('#user-prompt button').prop('disabled', false);
    });
}


function get_sides(){
    //console.log("anchor 2 =============>", ANCHOR2);
    var resultRed = {
        pos: [],
        neg: []
    };
    
    var resultBlue = {
        pos: [],
        neg: []
    };

    var knifeTopEnd = get_knife_end("top");
    var knifeBotEnd = get_knife_end("bot");

    for (var i = redPoints.length - 1; i >= 0; i--) {
        if (point_is_anchor(redPoints[i]) == false && point_is_anchor2(redPoints[i]) == false) {
            var side =  det(knifeBotEnd.x, knifeBotEnd.y, knifeTopEnd.x, knifeTopEnd.y, redPoints[i].attr("cx"), redPoints[i].attr("cy"));
            if (side > 0) {
                //console.log("POS SIDE:", redPoints[i].attr("cx"), redPoints[i].attr("cy"));
                redPoints[i].attr(posSideAttr);
                resultRed.pos.push(redPoints[i]);
            } else if (side < 0) {
                redPoints[i].attr(negSideAttr);
                resultRed.neg.push(redPoints[i]);
            }
        }
    }

    for (var i = bluePoints.length - 1; i >= 0; i--) {
        var side =  det(knifeBotEnd.x, knifeBotEnd.y, knifeTopEnd.x, knifeTopEnd.y, bluePoints[i].attr("cx"), bluePoints[i].attr("cy"));
        if (side > 0) {
            //console.log("POS SIDE:", bluePoints[i].attr("cx"), bluePoints[i].attr("cy"));
            bluePoints[i].attr(posSideAttr);
            resultBlue.pos.push(bluePoints[i]);
        } else if (side < 0) {
            bluePoints[i].attr(negSideAttr);
            resultBlue.neg.push(bluePoints[i]);
        }
    }

    return {
        red: resultRed,
        blue: resultBlue
    };
}






/* ===========================================================================*/
/* ===========================================================================*/
/* ===========================================================================*/


var FIRST_CALC = true;
var INIT_BLUE_POS;
var INIT_BLUE_NEG;
var LEAST;

var PREV_COUNT_SAME = false;
function update_point_counts(){
    if (WEDGE) {
        WEDGE.remove()
    }
    var sides = get_sides();

    var posRed = sides.red.pos;
    var posBlue = sides.blue.pos;        
    var negRed = sides.red.neg;
    var negBlue = sides.blue.neg;

    if (FIRST_CALC) {
        INIT_BLUE_POS = posBlue.length;
        INIT_BLUE_NEG = negBlue.length;
        if (INIT_BLUE_POS < INIT_BLUE_NEG) {
            LEAST = "POS";
        } else {
            LEAST = "NEG";
        }
        FIRST_CALC = false;
    }

    $(".user-hint").html("\
        <table>\
            <tr>\
                <td>Positive Side:</td>\
                <td><div class='circle-red circle-pos'></div><span class='text-red'>" + (negRed.length+1) + "</span>, <div class='circle-blue circle-pos'></div><span class='text-blue'>" + posBlue.length + "</span></td>\
            </tr>\
            <tr>\
                <td>Negative Side:</td>\
                <td><div class='circle-red circle-neg'></div><span class='text-red'>" + (posRed.length+1) + "</span>, <div class='circle-blue circle-neg'></div><span class='text-blue'>" + negBlue.length + "</span></td>\
            </tr>\
        </table>\
        ");
    console.log("INIT least:", LEAST);

    
    if (posRed.length == negRed.length) {
        $(".user-hint").append("<p>The <span class='text-red'>red</span> points are split in half.</p>");
        if (posBlue.length == negBlue.length) {
            $(".user-hint").append("<p>The <span class='text-blue'>blue</span> points are also split in half.<br><br><strong>We have found the Ham Sandwich Cut</strong></p>");
            $("#user-prompt").html("<button onclick='window.location.reload()'>Restart</button>");
        }
        if (LEAST == "POS") {
            if (posBlue.length > (bluePoints.length / 2)) {
                if (SEARCHING_BLUE == false) {
                    $(".user-hint").append("<p>Initially less than half of the <span class='text-blue'>blue</span> points were on the positive side. Now more than half are, so the change must have happened during the last rotation.</p>");
                    make_wedge_from_points(PREV_ANCHOR, PREV_ANCHOR2);
                    $("#user-prompt").html("<button onclick='rotate_within_wedge()'>Find Split of <span class='text-blue'>Blue</span> Points</button>");
                    //find_points_within_wedge();
                    console.log("SWAP YO");
                }
            }
        } else {
            if (negBlue.length > (bluePoints.length / 2)) {
                if (SEARCHING_BLUE == false) {
                    $(".user-hint").append("<p>Initially less than half of the <span class='text-blue'>blue</span> points were on the negative side. Now more than half are, so the change must have happened during the last rotation.</p>");
                    make_wedge_from_points(PREV_ANCHOR, PREV_ANCHOR2);
                    $("#user-prompt").html("<button onclick='rotate_within_wedge()'>Find Split of <span class='text-blue'>Blue</span> Points</button>");
                    //find_points_within_wedge()
                    console.log("SWAP YO");
                }
            }
        }
    } else {
        if (SEARCHING_BLUE) {
            $(".user-hint").append("<p>Keep rotating to divide the <span class='text-blue'>blue</span> points in half.</p>");
        } else {
            $(".user-hint").append("<p>Keep rotating to divide the <span class='text-red'>red</span> points in half.</p>");
        }
    }
    //if (!FIRST_CALC) {
        if (posRed.length == negRed.length) {
            PREV_COUNT_SAME = true;
        } else {
            PREV_COUNT_SAME = false;
        }
    //}

}
var blueCOUNT = 0;
var sortedBlueMidPoints = [];
var SEARCHING_BLUE = false;
function rotate_to_find_blue_split(){
    rotate_medianline_to(PREV_ANCHOR, sortedBlueMidPoints[blueCOUNT], function(){
        update_point_counts();
        blueCOUNT++;
        $("#user-prompt").html("<button onclick='rotate_to_find_blue_split()'>Continue</button>");
    });
}
function rotate_within_wedge(){
    var sides = get_sides();
    
    var posRed = sides.red.pos;
    var posBlue = sides.blue.pos;        
    var negRed = sides.red.neg;
    var negBlue = sides.blue.neg;

    SEARCHING_BLUE = true;
    // blue points
    console.log(WEDGE);
    var wedgeMinX = WEDGE.attr("path")[0][1];
    var wedgeMinY = WEDGE.attr("path")[0][2];
    var wedgeMaxX = WEDGE.attr("path")[1][1];
    var wedgeMaxY = WEDGE.attr("path")[1][2];

    if (LEAST == "POS") {
        var sortedPosByTheta = mergeSort_by_theta(posBlue, PREV_ANCHOR, wedgeMinX, wedgeMinY);
        var sortedNegByTheta = mergeSort_by_theta(negBlue, PREV_ANCHOR, wedgeMinX, wedgeMinY);

    } else {
        var sortedPosByTheta = mergeSort_by_theta(posBlue, PREV_ANCHOR, wedgeMaxX, wedgeMaxY);
        var sortedNegByTheta = mergeSort_by_theta(negBlue, PREV_ANCHOR, wedgeMaxX, wedgeMaxY);        
    }
    for (var i = 0; i < sortedPosByTheta.length; i++) {
        var side = det(wedgeMinX, wedgeMinY, wedgeMaxX, wedgeMaxY, sortedPosByTheta[i].attr("cx"), sortedPosByTheta[i].attr("cy"));
        if (side > 1) {
            //sortedPosByTheta[i].attr("fill", "#ff0")
            //sortedPosByTheta[i].attr("r", (i+2));
    
            sortedPosByTheta[i].animate({"stroke-width": 10}, 200, function(){
               this.animate({"stroke-width": 2}, 200);
            });
        }
    }

    for (var i = 0; i < sortedNegByTheta.length; i++) {
        var side = det(wedgeMinX, wedgeMinY, wedgeMaxX, wedgeMaxY, sortedNegByTheta[i].attr("cx"), sortedNegByTheta[i].attr("cy"));
        //console.log("SIDE -----------", side);
        if (side < 1) {
            //sortedNegByTheta[i].attr("fill", "#ff0")
            //sortedNegByTheta[i].attr("r", (i+2));
            
            sortedNegByTheta[i].animate({"stroke-width": 10}, 200, function(){
               this.animate({"stroke-width": 2}, 200);
            });
        }
    }

    var midpointPos = sortedPosByTheta[sortedPosByTheta.length/2];
    var midpointNeg = sortedNegByTheta[sortedNegByTheta.length/2];

    //sortedBluePoints = sortedByTheta;
    
    //console.log(sortedByTheta);
    //console.log(sortedNegByTheta);
    //rotate_to_find_blue_split();
/*    rotate_medianline_to(PREV_ANCHOR, sortedBlueMidPoints[blueCOUNT], function(){
        update_point_counts();
        blueCOUNT++;
        $("#user-prompt").html("<button onclick='rotate_to_find_blue_split()'>Continue</button>");

    });*/
/*    for (var i = 0; i < sortedNegByTheta.length; i++) {
        sortedNegByTheta[i].attr("r", (i+2));
    }*/

}

function make_wedge_from_points(p1, p2){
    var p1x = p1.attr("cx");
    var p1y = p1.attr("cy");
    var p2x = p2.attr("cx");
    var p2y = p2.attr("cy");

    var xdiff = p2x - p1x;
    var ydiff = p2y - p1y;

    var m = ydiff/xdiff;

    var b = p1y - (p1x * m)

    var x1_offscreen = -5;
    var x2_offscreen = 2000;
    var y1_offscreen = (m*x1_offscreen) + b
    var y2_offscreen = (m*x2_offscreen) + b

    var newPath = "M" + x1_offscreen + "," + y1_offscreen + "L" + x2_offscreen + "," + y2_offscreen;

    //var pathFull = "M" + x1_offscreen + "," + y1_offscreen + "L" + p2x + "," + p2y + "L" + ANCHOR.attr('cx') + "," + ANCHOR.attr("cy") + "L" + med.x1 + "," + med.y1 + "L" + x2_offscreen + "," + y2_offscreen + "L" + p1x + "," + p1y + "L" + ANCHOR2.attr('cx') + "," + ANCHOR2.attr("cy");
    WEDGE = r.path(newPath).attr({"stroke-width": 2, opacity: .3});
//    WEDGE = r.path(pathFull).attr({fill: "#999", "stroke-width": 2, opacity: .3});

}





function find_new_anchor () {
    var sides = get_sides();
    var posPoints = sides.red.pos;
    var negPoints = sides.red.neg;

    var knifeTopEnd = get_knife_end("top");
    var knifeBotEnd = get_knife_end("bot");

    console.log(knifeTopEnd);
    console.log(knifeBotEnd);

    var sortedPosByTheta = mergeSort_by_theta(posPoints, ANCHOR, knifeTopEnd.x, knifeTopEnd.y);
    var sortedNegByTheta = mergeSort_by_theta(negPoints, ANCHOR, knifeBotEnd.x, knifeBotEnd.y);

  /*  for (var i = 0; i < sortedPosByTheta.length; i++){
        sortedPosByTheta[i].attr("r", (i+1));
    }
    for (var i = 0; i < sortedNegByTheta.length; i++){
        sortedNegByTheta[i].attr("r", (i+1));
    }*/

    var theta1 = find_angle(knifeTopEnd.x, knifeTopEnd.y, ANCHOR, sortedPosByTheta[0])
    var theta2 = find_angle(knifeBotEnd.x, knifeBotEnd.y, ANCHOR, sortedNegByTheta[0])
    sortedPosByTheta[0].attr({r: 8});
    sortedNegByTheta[0].attr({r: 8});
    var result;
    if (theta1 < theta2) {
        //sortedPosByTheta[0].attr({"fill": "#0ff", r: 8});
        result = sortedPosByTheta[0];
    } else {
        //sortedNegByTheta[0].attr({"fill": "#0ff", r: 8});
        result = sortedNegByTheta[0];
    }
    return result;
}

/* ===========================================================================*/
/* ===========================================================================*/
/* ===========================================================================*/

function x_to_coord(x){
    var width = $("#holder").width() / 2;
    return x - width;
}
function coord_to_x(x){
    var width = $("#holder").width() / 2;
    return x + width;
}
function y_to_coord(y){
    var width = $("#holder").height() / 2;
    return (y - width) * -1;
}
function coord_to_y(y){
    var width = $("#holder").height() / 2;
    return y + width;
}

function convert_to_dual_line(a,b){
        //console.log("new dual line:", a,b);
        var theta = Math.atan(a/100) * (-180/Math.PI);
        //console.log("theta:", theta);
        this.pathString = "M"+coord_to_x(-2000)+","+coord_to_y(0)+"L"+coord_to_x(2000)+","+coord_to_y(0)
        return r.path(this.pathString).translate(0,-b).rotate(theta);
}

function updateCounts(){
    $(".blue-count").text(bluePoints.length);
    $(".red-count").text(redPoints.length);
}

function get_midpoint(x1,y1,x2,y2) {
    return {
        x: (x1+x2) / 2,
        y: (y1+y2) / 2
    }
}

function find_angle(mx,my,anch,p) {
    var A = {
        x: mx,
        y: my
    }
    var B = {
        x: anch.attr("cx"),
        y: anch.attr("cy")
    }
    var C = {
        x: p.attr("cx"),
        y: p.attr("cy")
    }
    var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));    
    var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2)); 
    var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
    return Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
}

function mergeSort_by_x (arr) {    
    if (arr.length < 2) return arr;
    
    var mid = Math.floor(arr.length /2);
    var subLeft = mergeSort_by_x(arr.slice(0,mid));
    var subRight = mergeSort_by_x(arr.slice(mid));
    
    return merge_by_x(subLeft, subRight);
}

function merge_by_x (a,b) {
    var result = [];
    while (a.length >0 && b.length >0)
        result.push(a[0].attr("cx") < b[0].attr("cx")? a.shift() : b.shift());
    return result.concat(a.length? a : b);
}

function mergeSort_by_theta (arr, anchor, endX, endY) {    
    if (arr.length < 2) return arr;
    
    var mid = Math.floor(arr.length /2);
    var subLeft = mergeSort_by_theta(arr.slice(0,mid), anchor, endX, endY);
    var subRight = mergeSort_by_theta(arr.slice(mid), anchor, endX, endY);
    
    return merge_by_theta(subLeft, subRight, anchor, endX, endY);
}

function merge_by_theta (a,b, anchor, endX, endY) {
    var result = [];
    while (a.length >0 && b.length >0) {
        var thetaA = find_angle(endX, endY, anchor, a[0]);
        var thetaB = find_angle(endX, endY, anchor, b[0]);
        result.push(thetaA < thetaB ? a.shift() : b.shift());
    } 
    return result.concat(a.length? a : b);
}

function det(x0,y0,x1,y1,x2,y2) {
    //console.log(x0,y0,x1,y1,x2,y2);
    return ((x1 - x0)*(y2 - y0) - (x2 - x0)*(y1 - y0));
}

function point_is_anchor(p){
    if (ANCHOR) {
        var x = p.attr("cx");
        var y = p.attr("cy");
        var ax = ANCHOR.attr("cx");
        var ay = ANCHOR.attr("cy");

        if (x == ax && y == ay) {
            console.log("FOUND ANCHOR");
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function point_is_anchor2(p){
    if (ANCHOR2) {
        var x = p.attr("cx");
        var y = p.attr("cy");
        var ax = ANCHOR2.attr("cx");
        var ay = ANCHOR2.attr("cy");

        if (x == ax && y == ay) {
            console.log("FOUND ANCHOR2");
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function get_knife_end(side){
    if (side == "top") {
        return {
            x: KNIFE_TOP.attr("path")[1][1],
            y: KNIFE_TOP.attr("path")[1][2],
        }
    } else {
        return {
            x: KNIFE_BOT.attr("path")[1][1],
            y: KNIFE_BOT.attr("path")[1][2],
        }   
    }
}

function reset_attrs(){
    for (var i = redPoints.length - 1; i >= 0; i--) {
        redPoints[i].attr(redPointAtrr);
    }
}

function to_degrees(theta){
    return theta * 180/Math.PI;
}

/*function get_line_data(){
    //console.log(MEDIANLINE);
    var data = MEDIANLINE.matrix.split();
    console.log("========== DATA", data);
    var medianx1 = MEDIANLINE.attr("path")[0][1];
    var mediany1 = MEDIANLINE.attr("path")[0][2];
    var medianx2 = MEDIANLINE.attr("path")[1][1];
    var mediany2 = MEDIANLINE.attr("path")[1][2];

    var result = {
        x1: medianx1 + data.dx,
        y1: mediany1 + data.dy,
        x2: medianx2 + data.dx,
        y2: mediany2 + data.dy
    }
    console.log("RESULT:", result);
    return result;
}*/





/*function find_theta_to_anchor(p, anchor){
    var xdiff = (anchor.attr("cx")) - (p.attr("cx"));
    var ydiff = (anchor.attr("cy")) - (p.attr("cy"));
    console.log("xdiff, ydiff:", xdiff, ydiff);
    if (xdiff == 0 && ydiff == 0) {
        return 0;
    }
    return Math.atan(ydiff/xdiff);
}*/

/*function update_thetas(anchor){
    for (var i = redPoints.length - 1; i >= 0; i--) {
        var theta = find_theta_to_anchor(redPoints[i], anchor);
        redPoints[i].data("theta", theta);
    }
}*/

/*function number_of_points_on_each_side(x1,y1,x2,y2){

    var redCount = 0;
    var blueCount = 0;
    console.log("MEDIAN LINE:", MEDIANLINE);
    //var med = get_line_data();

    for (var i = redPoints.length - 1; i >= 0; i--) {
        var px = redPoints[i].attr("cx");
        var py = redPoints[i].attr("cy");
        var side = det(x1, y1, x2, y2, px, py);
        if (side > 0) {
            //redPoints[i].attr({"fill": altRedColor, "stroke": altRedColor});
            if (INIT_DIR == "L") {
                redPosPoints.push(redPoints[i]);  
            } else {
                redNegPoints.push(redPoints[i]);
            }
            redCount++;
        } else {
            if (INIT_DIR == "L") {
                redNegPoints.push(redPoints[i]);
            } else {
                redPosPoints.push(redPoints[i]);
            }
        }
        //console.log(side);
    }
    for (var i = bluePoints.length - 1; i >= 0; i--) {
        var px = bluePoints[i].attr("cx");
        var py = bluePoints[i].attr("cy");
        var side = det(x1, y1, x2, y2, px, py);
        if (side > 0) {
            //bluePoints[i].attr({"fill": altBlueColor, "stroke": altBlueColor});
            if (INIT_DIR == "L") {
                bluePosPoints.push(bluePoints[i]);  
            } else {
                blueNegPoints.push(bluePoints[i]);
            }
            blueCount++;
        } else {
            if (INIT_DIR == "L") {
                blueNegPoints.push(bluePoints[i]);
            } else {
                bluePosPoints.push(bluePoints[i]);
            }
        }
        //console.log(side);
    }
}*/
/*

function swap_and_rotate2() {

    for (var i = redPoints.length - 1; i >= 0; i--) {
        redPoints[i].attr(redPointAtrr);
    }

    PREV_ANCHOR = ANCHOR;
    PREV_ANCHOR2 = ANCHOR2;
    
    var posPoints = get_pos_side().red;
    var negPoints = get_neg_side().red;

    var sortedPosByTheta = mergeSort_by_theta(posPoints);
    var sortedNegByTheta = mergeSort_by_theta2(negPoints);

    //console.log(sortedByTheta);
    var p1 = sortedPosByTheta[0];
    var p2 = sortedNegByTheta[0];
    var theta1 = find_angle(ANCHOR2.attr("cx"), ANCHOR2.attr("cy"), ANCHOR, p1)
    var theta2 = find_angle(ANCHOR.attr("cx"), ANCHOR.attr("cy"), ANCHOR2, p2)
    var target;
    var anchor_moved = true
    if (theta2 < theta1) {
        console.log("moving to NEGATIVE side");
        target = p2;
        anchor_moved = false;
        var sortedNegByTheta2 = mergeSort_by_theta(posPoints);

    } else {
        target = p1;
        var sortedNegByTheta2 = mergeSort_by_theta2(negPoints);
    }

    var target2 = sortedNegByTheta2[0];
    
    target.attr("fill", "#ff0")
    target2.attr("fill", "#0f0")

    if (anchor_moved) {
        ANCHOR = target;
        ANCHOR2 = target2;
    } else {
        ANCHOR = target2;
        ANCHOR2 = target;
    }



    ANCHOR.attr({"r": 8, fill: "#fff"});
    ANCHOR2.attr({"r": 8, fill: "#000"});

    rotate_medianline_to(ANCHOR2, ANCHOR, function(){
        update_point_counts();
    });
}
*/