var r = Raphael("holder", "100%", "100%");

var redColor = "#FF1919";
var blueColor = "#195AFF";
var altRedColor = "#7F1616";
var altBlueColor = "#16347F";
var greyColor = "#CCC";


var circleAtMouseAttr   = {"fill-opacity": 0, "stroke-width": 1, stroke: redColor};
var redPointAtrr   = {fill: redColor, stroke: redColor, r: 5, "stroke-width": 2};
var bluePointAtrr   = {fill: blueColor, stroke: blueColor, r: 5, "stroke-width": 2};

var redLineAtrr   = {fill: redColor, stroke: redColor, opacity: .2};
var blueLineAtrr   = {fill: blueColor, stroke: blueColor, opacity: .2};

var axesAttr = {stroke: greyColor};

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
var LINESHIDDEN = false;
var ANCHOR;
var ANCHOR2;
var INIT_DIR;

var redPosPoints = [];
var redNegPoints = [];
var bluePosPoints = [];
var blueNegPoints = [];

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

        //}
    });

});


function endInputRed() {
    if (redPoints.length % 2 == 0) {
        STATUS = "inputblue";
        circleAtMouse.attr("stroke", blueColor);
        $("#user-prompt").hide();
        $(".user-hint").html("<p>Click to add <span class='text-blue'>blue</span> points<br><br> For simplicity's sake please add an <em class='highlight'>even number</em> of points.</p></p></p>");
        COUNT = 0;
      //  $("#end-input-blue").removeClass("hidden");

    } 
    else {
        $(".highlight").css({"border-bottom": "2px solid #777", "font-weight": "bold"});
    }
}

function endInputBlue() {
    if (bluePoints.length % 2 == 0) {
        STATUS = "inputdone";
        $(".user-hint").html("\
            <p>We will now show that it is always possible to draw a Ham Sandwich Cut using the \"Rotating Knife\" approach.<br><br>\
            For now, we will hide the dual plane.<br><br>\
            We begin by drawing the <strong>median line</strong> that separates the <span class='text-red'>red</span> points in half.</p>\
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

function hideIntro() {
    $(".intro-screen").animate({"margin-top": "100vh"}, 200, function(){
        $(".intro-screen").hide();
    });
}
function draw_median(){

    var sortedRedPoints = mergeSort_by_x(redPoints);

    var medianPoint = sortedRedPoints[redPoints.length/2];
    var medianPoint2 = sortedRedPoints[(redPoints.length/2) - 1];

    if (medianPoint.attr("cy") > medianPoint2.attr("cy")){
        ANCHOR = medianPoint2;
        console.log("======= WENT LEFT");
        INIT_DIR = "L"
    } else {
        ANCHOR = medianPoint;
        console.log("======= WENT RIGHT");
        INIT_DIR = "R"
    }
    ANCHOR2 = ANCHOR;

    var avgX = (medianPoint.attr("cx") + medianPoint2.attr("cx")) / 2;

/*    var medianLineX1 = medianLineX;
    var medianLineY1 = coord_to_y(x_to_coord(ANCHOR.attr("cy")) + 20);
    var medianLineX2 = medianLineX;
    var medianLineY2 = coord_to_y(x_to_coord(ANCHOR.attr("cy")) + -20);
*/
    //var medianLinePath = "M"+0+","+20+"L"+0+","+-20;
    

    var medianLinePath = "M"+avgX+",2000L"+avgX+",-2000";


    MEDIANLINE = r.path(medianLinePath).attr({"stroke-width": 2, stroke: "#444", opacity: 0})
    //MEDIANLINE.transform("t" + avgX + "," + ANCHOR.attr("cy"));
    
/*    MEDIANLINE.animate({
        transform: "t" + avgX + "," + ANCHOR.attr("cy")
    }, 100); */

    LINESHIDDEN = true;

    // hide dual lines
    redLines.animate({"opacity": 0}, 100);
    blueLines.animate({"opacity": 0}, 100, function () {
        
        medianPoint.animate({"stroke-width": 10}, 200, function(){
            medianPoint.animate({"stroke-width": 1}, 200);
        });
        
        medianPoint2.animate({"stroke-width": 10}, 200, function(){
           medianPoint2.animate({"stroke-width": 1}, 200);
        });
        
        MEDIANLINE.animate({"opacity": 1}, 200, function(){

        });
        
        $("#user-prompt").html("<button onclick='move_cut_to_first_point()'>Begin rotation</button>");
    });

}
function get_line_data(){
    console.log(MEDIANLINE);

    var data = MEDIANLINE.matrix.split();
    console.log("========== DATA", data);
    var medianx1 = MEDIANLINE.attr("path")[0][1];
    var mediany1 = MEDIANLINE.attr("path")[0][2];
    var medianx2 = MEDIANLINE.attr("path")[1][1];
    var mediany2 = MEDIANLINE.attr("path")[1][2];

/*    
    var x = y*sin(a) + x*cos(a)
    var y = y*cos(a) - x*sin(a)
    */
    
    var a = data.rotate * Math.PI / 180;
    var cosA = Math.cos(a);
    var sinA = Math.sin(a);
    var lastP = MEDIANLINE.attrs.path[MEDIANLINE.attrs.path.length - 1];

    var x1 = (mediany1 * cosA) + (medianx1 * cosA);
    var x2 = (mediany2 * cosA) + (medianx2 * cosA);
    var y1 = (mediany1 * cosA) - (medianx1 * cosA);
    var y2 = (mediany2 * cosA) - (medianx2 * cosA);

    var pt = MEDIANLINE.getPointAtLength(MEDIANLINE.getTotalLength());
    console.log(pt, lastP);

/*    var result = {
        x1: ((medianx1 + data.dx) * sinA) + ((medianx1 + data.dx) * cosA),
        y1: ((mediany1 + data.dy) * cosA) - ((mediany1 + data.dy) * sinA),
        x2: ((medianx2 + data.dx) * sinA) + ((medianx2 + data.dx) * cosA),
        y2: ((mediany2 + data.dy) * cosA) - ((mediany2 + data.dy) * sinA)
    }*/
    var result = {
        x1: medianx1 + data.dx,
        y1: mediany1 + data.dy,
        x2: medianx2 + data.dx,
        y2: mediany2 + data.dy
    }
/*    var result = {
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2
    }*/
    console.log("RESULT:", result);
    return result;
}

function to_degrees(theta){
    return theta * 180/Math.PI;
}

function get_min_pos(){
    var med = get_line_data();
    var minThetaPos = 400;
        var minThetaPosPoint;
        for (var i = redPosPoints.length - 1; i >= 0; i--) {
            //redPosPoints[i].attr("fill", "#550")
            var theta = find_angle(med.x1, med.y1, ANCHOR, redPosPoints[i]);
            //console.log(theta);
            if (theta < minThetaPos && theta != 0 && redPosPoints[i].attr("cx") != ANCHOR.attr("cx") && redPosPoints[i].attr("cy") != ANCHOR.attr("cy")) {
                minThetaPos = theta;
                minThetaPosPoint = redPosPoints[i];
            }
        }
    var result = {
        point: minThetaPosPoint,
        theta: minThetaPos
    };
    console.log(result);
    return result
}

function get_min_neg(){
    var med = get_line_data();
    var minThetaNeg = 400;
        var minThetaNegPoint;
        for (var i = redNegPoints.length - 1; i >= 0; i--) {
            //redNegPoints[i].attr("fill", "#550")
            var theta = find_angle(med.x2, med.y2, ANCHOR, redNegPoints[i]);
            //console.log(theta);
            if (theta < minThetaNeg && theta != 0 && redNegPoints[i].attr("cx") != ANCHOR.attr("cx") && redNegPoints[i].attr("cy") != ANCHOR.attr("cy")) {
                minThetaNeg = theta;
                minThetaNegPoint = redNegPoints[i];
            }
        }
    return {
        point: minThetaNegPoint,
        theta: minThetaNeg
    };
}


function get_min_pos2(){
    var minThetaPos = 400;
        var minThetaPosPoint;
        for (var i = redPosPoints.length - 1; i >= 0; i--) {
            var theta = find_angle(ANCHOR2.attr("cx"), ANCHOR2.attr("cy"), ANCHOR, redPosPoints[i]);
            if (theta < minThetaPos && theta != 0 && redPosPoints[i].attr("cx") != ANCHOR.attr("cx") && redPosPoints[i].attr("cy") != ANCHOR.attr("cy")) {
                minThetaPos = theta;
                minThetaPosPoint = redPosPoints[i];
            }
        }
    return {
        point: minThetaPosPoint,
        theta: minThetaPos
    };
}

function get_min_neg2(){
    var minThetaNeg = 400;
        var minThetaNegPoint;
        for (var i = redNegPoints.length - 1; i >= 0; i--) {
            var theta = find_angle(ANCHOR.attr("cx"), ANCHOR.attr("cy"), ANCHOR2, redNegPoints[i]);
            if (theta < minThetaNeg && theta != 0 && redNegPoints[i].attr("cx") != ANCHOR.attr("cx") && redNegPoints[i].attr("cy") != ANCHOR.attr("cy")) {
                minThetaNeg = theta;
                minThetaNegPoint = redNegPoints[i];
            }
        }
    return {
        point: minThetaNegPoint,
        theta: minThetaNeg
    };
}


function mergeSort_by_theta (arr) {    
    if (arr.length < 2) return arr;
    
    var mid = Math.floor(arr.length /2);
    var subLeft = mergeSort_by_theta(arr.slice(0,mid));
    var subRight = mergeSort_by_theta(arr.slice(mid));
    
    return merge_by_theta(subLeft, subRight);
}

function merge_by_theta (a,b) {
    var result = [];
    while (a.length >0 && b.length >0) {
        var thetaA = find_angle(ANCHOR.attr("cx"), ANCHOR.attr("cy"), ANCHOR2, a[0]);
        var thetaB = find_angle(ANCHOR.attr("cx"), ANCHOR.attr("cy"), ANCHOR2, b[0]);

        result.push(thetaA < thetaB ? a.shift() : b.shift());
    }
        
    return result.concat(a.length? a : b);
}


function mergeSort_by_theta2 (arr) {    
    if (arr.length < 2) return arr;
    
    var mid = Math.floor(arr.length /2);
    var subLeft = mergeSort_by_theta2(arr.slice(0,mid));
    var subRight = mergeSort_by_theta2(arr.slice(mid));
    
    return merge_by_theta2(subLeft, subRight);
}

function merge_by_theta2 (a,b) {
    var result = [];
    while (a.length >0 && b.length >0) {
        var thetaA = find_angle(ANCHOR2.attr("cx"), ANCHOR2.attr("cy"), ANCHOR, a[0]);
        var thetaB = find_angle(ANCHOR2.attr("cx"), ANCHOR2.attr("cy"), ANCHOR, b[0]);

        result.push(thetaA < thetaB ? a.shift() : b.shift());
    }
        
    return result.concat(a.length? a : b);
}

function get_min_all(){
    var minTheta = 400;
        var minThetaPoint;
        for (var i = redPoints.length - 1; i >= 0; i--) {
            var theta = find_angle(ANCHOR.attr("cx"), ANCHOR.attr("cy"), ANCHOR2, redPoints[i]);
            if (theta < minTheta && theta != 0 && redPoints[i].attr("cx") != ANCHOR.attr("cx") && redPoints[i].attr("cy") != ANCHOR.attr("cy")) {
                minTheta = theta;
                minThetaPoint = redPoints[i];
            }
        }
    return {
        point: minThetaPoint,
        theta: minTheta
    };
}

function move_cut_to_first_point () {
    ANCHOR.attr({"stroke": "#000", "r": 10});

    console.log("CURRENT ANCHOR", ANCHOR);
    var med = get_line_data();

    var x = ANCHOR.attr("cx");
    var y = ANCHOR.attr("cy");

    //var y = mediany2 - ANCHOR.attr("cy");
    //MEDIANLINE.transform("t"+x+","+0);
    MEDIANLINE.animate({
        path: "M"+x+","+(y+2000) +"L"+x+","+(y-2000)
    }, 500, function(){
        number_of_points_on_each_side(med.x1, med.y1, med.x2, med.y2);
        var nextOnPos = get_min_pos();
        var nextOnNeg = get_min_neg();

        //nextOnPos.point.attr("fill", "#0f0");
        //nextOnNeg.point.attr("fill", "#0ff");

        var newAnchor = nextOnPos.point;
        var newTheta = nextOnPos.theta;
        
        console.log("theta pos side:", to_degrees(nextOnPos.theta));
        console.log("theta neg side:", to_degrees(nextOnNeg.theta));
       
        var onNegSide = false;
        if (nextOnNeg.theta < nextOnPos.theta) {
            newAnchor = nextOnNeg.point;
            newTheta = nextOnNeg.theta;
            onNegSide = true;
            console.log("ON NEGATIVE SIDE");
        }
        //newAnchor.attr("fill", "#000");
        
        if (onNegSide) {
            ANCHOR = nextOnPos.point;
        } 

        ANCHOR2 = newAnchor;


        ANCHOR.attr({"r": 8, fill: "#fff"});
        ANCHOR2.attr({"r": 8, fill: "#000"});

        rotate_medianline_to(ANCHOR2, ANCHOR, function(){
            update_point_counts();
        });

        console.log(MEDIANLINE);
        console.log("uooooooo");
        $("#user-prompt").html("<button onclick='swap_and_rotate()'>Swap and Rotate</button>");
    });
}

function get_pos_side(){
    var resultRed = [];
    var resultBlue = [];

    for (var i = redPoints.length - 1; i >= 0; i--) {
        var side =  det(ANCHOR.attr("cx"), ANCHOR.attr("cy"), ANCHOR2.attr("cx"), ANCHOR2.attr("cy"), redPoints[i].attr("cx"), redPoints[i].attr("cy"));
        if (side > 0) {
            console.log("POS SIDE:", redPoints[i].attr("cx"), redPoints[i].attr("cy"));
            redPoints[i].attr("fill", "#EEE");
            resultRed.push(redPoints[i]);
        }
    }

    for (var i = bluePoints.length - 1; i >= 0; i--) {
        var side =  det(ANCHOR.attr("cx"), ANCHOR.attr("cy"), ANCHOR2.attr("cx"), ANCHOR2.attr("cy"), bluePoints[i].attr("cx"), bluePoints[i].attr("cy"));
        if (side > 0) {
            console.log("POS SIDE:", bluePoints[i].attr("cx"), bluePoints[i].attr("cy"));
            bluePoints[i].attr("fill", "#EEE");
            resultBlue.push(bluePoints[i]);
        }
    }

    return {
        red: resultRed,
        blue: resultBlue
    };}

function get_neg_side(){
    var resultRed = [];
    var resultBlue = [];

    for (var i = redPoints.length - 1; i >= 0; i--) {
        var side =  det(ANCHOR.attr("cx"), ANCHOR.attr("cy"), ANCHOR2.attr("cx"), ANCHOR2.attr("cy"), redPoints[i].attr("cx"), redPoints[i].attr("cy"));
        if (side < 0) {
            console.log("NEG SIDE:", redPoints[i].attr("cx"), redPoints[i].attr("cy"));
            redPoints[i].attr("fill", "#222");
            resultRed.push(redPoints[i]);
        }
    }

    for (var i = bluePoints.length - 1; i >= 0; i--) {
        var side =  det(ANCHOR.attr("cx"), ANCHOR.attr("cy"), ANCHOR2.attr("cx"), ANCHOR2.attr("cy"), bluePoints[i].attr("cx"), bluePoints[i].attr("cy"));
        if (side < 0) {
            console.log("NEG SIDE:", bluePoints[i].attr("cx"), bluePoints[i].attr("cy"));
            bluePoints[i].attr("fill", "#222");
            resultBlue.push(bluePoints[i]);
        }
    }

    return {
        red: resultRed,
        blue: resultBlue
    };
}
var SWITCH = true
var PREV_ANCHOR;
var PREV_ANCHOR2;
function swap_and_rotate() {

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

var FIRST_CALC = true;
var INIT_BLUE_POS;
var INIT_BLUE_NEG;
var LEAST;
function update_point_counts(){
    if (WEDGE) {
        WEDGE.remove()
    }

    var posPoints = get_pos_side();
    var negPoints = get_neg_side();
    
    var posRed = posPoints.red;
    var posBlue = posPoints.blue;        
    var negRed = negPoints.red;
    var negBlue = negPoints.blue;

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
        <p>Positive side:\
            <div class='circle-red circle-pos'></div><span class='text-red'>" + (negRed.length+1) + "</span>, <div class='circle-blue circle-pos'></div><span class='text-blue'>" + posBlue.length + "</span>\
        </p>\
        <p>Negative side:\
            <div class='circle-red circle-neg'></div><span class='text-red'>" + (posRed.length+1) + "</span>, <div class='circle-blue circle-neg'></div><span class='text-blue'>" + negBlue.length + "</span>\
        </p>");
    console.log("INIT least:", LEAST);

    
    if (posRed.length != negRed.length) {
        $("#alert-message").show();
    }
    if (posBlue.length == negBlue.length) {
        $(".user-hint").append("<p>The points are split evenly. We have found the Ham Sandwich Cut");
    } else if (LEAST == "POS") {
        if (posBlue.length >= (bluePoints.length / 2)) {
            $(".user-hint").append("<p>Initially less than half of the blue points were on the positive side. Now more than half are. Since that swap happened during the last rotation, we can find the ham sandwich cut by splitting the blue points within this wedge. </p>");
            /*PREV_ANCHOR.attr("fill", "#ff0");
            PREV_ANCHOR2.attr("fill", "#ff0");*/
            make_wedge_from_points(PREV_ANCHOR, PREV_ANCHOR2);
            find_points_within_wedge();
            console.log("SWAP YO");
        }
    } else {
        if (negBlue.length >= (bluePoints.length / 2)) {
            $(".user-hint").append("<p>Initially less than half of the blue points were on the negative side. Now more than half are. Since that swap happened during the last rotation, we can find the ham sandwich cut by splitting the blue points within this wedge. </p>");
            /*PREV_ANCHOR.attr("fill", "#ff0");
            PREV_ANCHOR2.attr("fill", "#ff0");*/
            make_wedge_from_points(PREV_ANCHOR, PREV_ANCHOR2);
            find_points_within_wedge()
            console.log("SWAP YO");
        }
    }
}
var WEDGE;

function find_points_within_wedge () {
    var center = Raphael.pathIntersection(WEDGE.attr("path"), MEDIANLINE.attr("path"));
    console.log(center);
}
function make_wedge_from_points(p1, p2){
    var p1x = p1.attr("cx");
    var p1y = p1.attr("cy");
    var p2x = p2.attr("cx");
    var p2y = p2.attr("cy");
    var med = get_line_data();
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

    var newPath = "M" + x1_offscreen + "," + y1_offscreen + "L" + x2_offscreen + "," + y2_offscreen;

    var pathFull = "M" + x1_offscreen + "," + y1_offscreen + "L" + p2x + "," + p2y + "L" + ANCHOR.attr('cx') + "," + ANCHOR.attr("cy") + "L" + med.x1 + "," + med.y1 + "L" + x2_offscreen + "," + y2_offscreen + "L" + p1x + "," + p1y + "L" + ANCHOR2.attr('cx') + "," + ANCHOR2.attr("cy");
    WEDGE = r.path(newPath).attr({"stroke-width": 2, opacity: .3});
//    WEDGE = r.path(pathFull).attr({fill: "#999", "stroke-width": 2, opacity: .3});

}


function get_midpoint(x1,y1,x2,y2) {
    return {
        x: (x1+x2) / 2,
        y: (y1+y2) / 2
    }
}

function find_angle(mx,my,anch,p) {

    var B = {
        x: anch.attr("cx"),
        y: anch.attr("cy")
    }
    var A = {
        x: mx,
        y: my
    }
    var C = {
        x: p.attr("cx"),
        y: p.attr("cy")
    }
    //console.log("A B C:", A,B,C);

    var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));    
    var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2)); 
    var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
    return Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
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

    var angle_to_p2 = to_degrees(find_angle(p1x, p2y, p1, p2));
    if (INIT_DIR == "R"){
        angle_to_p2 *= -1;
    }
//    console.log("=================", angle_to_p2);
    MEDIANLINE.animate({transform: []}, 10)
//    var newPath = "M" + p1x + "," + p1y + "L" + p2x + "," + p2y;

    var newPath = "M" + x1_offscreen + "," + y1_offscreen + "L" + x2_offscreen + "," + y2_offscreen;

    MEDIANLINE.animate({path: newPath}, 700, callback)
//    MEDIANLINE.attr("path", newPath);
    //MEDIANLINE.scale(100,100);
    /*MEDIANLINE.animate({
        transform: "t" + [p1.attr("cx") , p1.attr("cy")] + "r" + (-angle_to_p2)
    }, 700, function(){
        number_of_points_on_each_side();
    });*/
}




function find_theta_to_anchor(p, anchor){
    var xdiff = (anchor.attr("cx")) - (p.attr("cx"));
    var ydiff = (anchor.attr("cy")) - (p.attr("cy"));
    console.log("xdiff, ydiff:", xdiff, ydiff);
    if (xdiff == 0 && ydiff == 0) {
        return 0;
    }
    return Math.atan(ydiff/xdiff);
}

function update_thetas(anchor){
    for (var i = redPoints.length - 1; i >= 0; i--) {
        var theta = find_theta_to_anchor(redPoints[i], anchor);
        redPoints[i].data("theta", theta);
    }
}

function number_of_points_on_each_side(x1,y1,x2,y2){

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
}

function updateCounts(){
    $(".blue-count").text(bluePoints.length);
    $(".red-count").text(redPoints.length);
}

function x_to_coord(x){
    var width = $("#holder").width() / 2;
    return x - width;
}

function coord_to_x(x){
    //console.log(x);

    var width = $("#holder").width() / 2;
    //console.log(width)
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

function mergeSort (arr) {    
    if (arr.length < 2) return arr;
    
    var mid = Math.floor(arr.length /2);
    var subLeft = mergeSort(arr.slice(0,mid));
    var subRight = mergeSort(arr.slice(mid));
    
    return merge(subLeft, subRight);
}

function merge (a,b) {
    var result = [];
    while (a.length >0 && b.length >0)
        result.push(a[0].data("theta") < b[0].data("theta")? a.shift() : b.shift());
    return result.concat(a.length? a : b);
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

// line: x0,y0,x1,y1
// point: x2,y2

/*function det(p){
    console.log("P:", p.attrs.cx);
    var medianx1 = MEDIANLINE.attr("path")[0][1];
    var mediany1 = MEDIANLINE.attr("path")[0][2];
    var medianx2 = MEDIANLINE.attr("path")[1][1];
    var mediany2 = MEDIANLINE.attr("path")[1][2];
    var px = p.attrs.cx;
    var py = p.attrs.cy;
    return ((medianx2 - medianx1)*(px - mediany1) - (py - medianx1)*(mediany2 - mediany1));

}*/


function det(x0,y0,x1,y1,x2,y2) {
    //console.log(x0,y0,x1,y1,x2,y2);
    return ((x1 - x0)*(y2 - y0) - (x2 - x0)*(y1 - y0));
}


/*
function mergeSortRadial (arr) {    
    if (arr.length < 2) return arr;
    
    var mid = Math.floor(arr.length /2);
    var subLeft = mergeSort(arr.slice(0,mid));
    var subRight = mergeSort(arr.slice(mid));
    
    return mergeRadial(subLeft, subRight);
}

function mergeRadial (a,b) {
    var result = [];
    
    var medianx1 = MEDIANLINE.attr("path")[0][1];
    var mediany1 = MEDIANLINE.attr("path")[0][2];
    var medianx2 = MEDIANLINE.attr("path")[1][1];
    var mediany2 = MEDIANLINE.attr("path")[1][2];
    
    while (a.length >0 && b.length >0)
        result.push(less(a[0], b[0])? a.shift() : b.shift());
        //result.push(det(ANCHOR.attr("cx"), ANCHOR.attr("cy"), 303, 350, a[0].attr("cx"), a[0].attr("cy")) < det(ANCHOR.attr("cx"), ANCHOR.attr("cy"), 303, 350, b[0].attr("cx"), b[0].attr("cy")) ? a.shift() : b.shift());

    return result.concat(a.length? a : b);
}
*/



/*

function less(a, b) {
    //ANCHOR.attr({cx: 303, cy: 350});
    if (a.attr("cx") - ANCHOR.attr("cx") >= 0 && b.attr("cx") - ANCHOR.attr("cx") < 0)
        return true;
    if (a.attr("cx") - ANCHOR.attr("cx") < 0 && b.attr("cx") - ANCHOR.attr("cx") >= 0)
        return false;
    if (a.attr("cx") - ANCHOR.attr("cx") == 0 && b.attr("cx") - ANCHOR.attr("cx") == 0) {
        if (a.attr("cy") - ANCHOR.attr("cy") >= 0 || b.attr("cy") - ANCHOR.attr("cy") >= 0)
            return a.attr("cy") > b.attr("cy");
        return b.attr("cy") > a.attr("cy");
    }

    // compute the cross product of vectors (center -> a) x (center -> b)
    var det = (a.attr("cx") - ANCHOR.attr("cx")) * (b.attr("cy") - ANCHOR.attr("cy")) - (b.attr("cx") - ANCHOR.attr("cx")) * (a.attr("cy") - ANCHOR.attr("cy"));
    if (det < 0)
        return true;
    if (det > 0)
        return false;

    // points a and b are on the same line from the center
    // check which point is closer to the center
    var d1 = (a.attr("cx") - ANCHOR.attr("cx")) * (a.attr("cx") - ANCHOR.attr("cx")) + (a.attr("cy") - ANCHOR.attr("cy")) * (a.attr("cy") - ANCHOR.attr("cy"));
    var d2 = (b.attr("cx") - ANCHOR.attr("cx")) * (b.attr("cx") - ANCHOR.attr("cx")) + (b.attr("cy") - ANCHOR.attr("cy")) * (b.attr("cy") - ANCHOR.attr("cy"));
    return d1 > d2;
}*/