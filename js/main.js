var r = Raphael("holder", "100%", "100%");
var redColor = "#f22";
var blueColor = "#22f";
var greyColor = "#CCC";
var circleAtMouseAttr   = {"fill-opacity": 0, "stroke-width": 1, stroke: redColor};
var redPointAtrr   = {fill: redColor, stroke: redColor};
var bluePointAtrr   = {fill: blueColor, stroke: blueColor};

var redLineAtrr   = {fill: redColor, stroke: redColor, opacity: .2};
var blueLineAtrr   = {fill: blueColor, stroke: blueColor, opacity: .2};

var axesAttr = {stroke: greyColor};

var bluePoints = [];
var redPoints = [];

var blueLines = [];
var redLines = [];

var GLOBAL_MARGIN_x = 305;
var GLOBAL_MARGIN_y = 5;

var COUNT = 0;

var circleAtMouse = r.circle(0,0,5).attr(circleAtMouseAttr);
var dualAtMouse = r.path(circleAtMouseAttr);

// p = (a,b)
// y = ax + b
// 


/*class DualLine {
    constructor(a,b) {

    }
}*/

//var origin = r.circle(coord_to_x(0), coord_to_y(0), 2);

function initAxes(){
    var xPath = "M"+coord_to_x(-2000)+","+coord_to_y(0)+"L"+coord_to_x(2000)+","+coord_to_y(0);
    var yPath = "M"+coord_to_x(0)+","+coord_to_y(-2000)+"L"+coord_to_x(0)+","+coord_to_y(2000);

    var xAxis = r.path(xPath).attr(axesAttr);
    var yAxis = r.path(yPath).attr(axesAttr);
}

STATUS = "inputred";
//var redPoint = r.circle(0,0,5).attr(redPointArrr);
//var bluePoint = r.circle(0,0,5).attr(bluePointArrr);
function pointHoverIn(i, color){
    if (color == "red") {
        console.log(i);
        var line = redLines[i];
        line.attr({/*"stroke": "#000", */opacity: 1});
    } else {
        var line = blueLines[i];
        line.attr({/*"stroke": "#000", */opacity: 1});
    }
}

function pointHoverOut(i, color){
    if (color == "red") {
        var line = redLines[i];
        line.attr(redLineAtrr);
    } else {
        var line = blueLines[i];
        line.attr(blueLineAtrr);
    }
}

$(document).ready(function() {
    initAxes();

    $( "#holder" ).on( "mousemove", function( event ) {
        if (STATUS != "inputdone") {
            var x = event.pageX - GLOBAL_MARGIN_x;
            var y = event.pageY - GLOBAL_MARGIN_y;

    //        var endpoint = "L" + x + "," + y;

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

        //if (CURR_TOOL == "draw") {

            var x = event.pageX - GLOBAL_MARGIN_x;
            var y = event.pageY - GLOBAL_MARGIN_y;  
            console.log(x, y);

        if (STATUS == "inputred") {
                var i = COUNT;
                redPoints.push(r.circle(x,y,5).attr(redPointAtrr).hover(function(){pointHoverIn(i,"red")}, function(){pointHoverOut(i,"red")}));
            //};
            
            var dualLine = convert_to_dual_line(x_to_coord(x),y_to_coord(y));
            dualLine.attr(redLineAtrr);
            redLines.push(dualLine);
            
            COUNT++;
            updateCounts();
        }
        if (STATUS == "inputblue") {
            //if (bluePoints.length < redPoints.length) {
                var i = COUNT;
                bluePoints.push(r.circle(x,y,5).attr(bluePointAtrr).hover(function(){pointHoverIn(i,"blue")}, function(){pointHoverOut(i,"blue")}));
                var dualLine = convert_to_dual_line(x_to_coord(x),y_to_coord(y));
                dualLine.attr(blueLineAtrr);
                blueLines.push(dualLine);
                updateCounts();
                COUNT++;
            //}
/*            if (bluePoints.length == redPoints.length) {
                endInputBlue();
            }*/
        }
        if (redPoints.length >= 2) {
            $("#end-input-red").removeClass("hidden");
        }


        //}
    });

});


function endInputRed() {
   /* if (redPoints.length % 2 == 0) {*/
        STATUS = "inputblue";
        circleAtMouse.attr("stroke", blueColor);
        $("#end-input-red").hide();
        $(".user-hint").html("Click to add <span class='text-blue'>blue</span> points");
        COUNT = 0;
        $("#end-input-blue").removeClass("hidden");

   /* } 
    else {
        $(".main em").css({"border-bottom": "2px solid #777", "font-weight": "bold"});
    }*/
}

function endInputBlue() {
    STATUS = "inputdone";
    $(".user-hint").html("We will begin by drawing the <strong>median line</strong> that separates the <span class='text-red'>red</span> points in half.");
    circleAtMouse.hide();
    dualAtMouse.hide();

    $("#end-input-blue").hide();

    $("#begin-walkthrough").removeClass("hidden"); 
}

function hideIntro() {
    $(".intro-screen").animate({"margin-top": "100vh"}, 200, function(){
        $(".intro-screen").hide();
    });
}
function beginWalkthrough(){
    var sortedRedPoints = mergeSort(redPoints);
    console.log(sortedRedPoints);
    var medianPoint = sortedRedPoints[Math.floor(redPoints.length / 2)];
    var medianPoint2 = medianPoint;
    if (redPoints.length % 2 == 0) {
        medianPoint2 = sortedRedPoints[Math.floor(redPoints.length / 2) - 1];
    }

    medianPoint.animate({"stroke-width": 10}, 200, function(){
        medianPoint.animate({"stroke-width": 1}, 200);
    });
    medianPoint2.animate({"stroke-width": 10}, 200, function(){
        medianPoint2.animate({"stroke-width": 1}, 200);
    });


    var medianLineX = (medianPoint.attr("cx") + medianPoint2.attr("cx")) / 2;
    console.log("MX", medianLineX);
    var medianLinePath = "M"+medianLineX+","+coord_to_y(-2000)+"L"+medianLineX+","+coord_to_y(2000);
    var medianLine = r.path(medianLinePath).attr({"stroke-width": 3, stroke: "#666", opacity: 0});
    medianLine.animate({"opacity": 1}, 500);
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
    console.log(x);

    var width = $("#holder").width() / 2;
    console.log(width)
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
        console.log("new dual line:", a,b);
        var theta = Math.atan(a/100) * (-180/Math.PI);
        console.log("theta:", theta);
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
        result.push(a[0].attr("cx") < b[0].attr("cx")? a.shift() : b.shift());
    return result.concat(a.length? a : b);
}
