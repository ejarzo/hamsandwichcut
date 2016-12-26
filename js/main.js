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

var bluePoints = r.set();
var redPoints = r.set();

var blueLines = r.set();
var redLines = r.set();

var GLOBAL_MARGIN_x = 305;
var GLOBAL_MARGIN_y = 5;

var circleAtMouse = r.circle(0,0,5).attr(circleAtMouseAttr);

// p = (a,b)
// y = ax + b
// 

function convert_to_dual_line(a,b){
        console.log("new dual line:", a,b);
        var theta = Math.atan(a/50) * (-180/Math.PI);
        console.log("theta:", theta);
        this.pathString = "M"+coord_to_x(-2000)+","+coord_to_y(0)+"L"+coord_to_x(2000)+","+coord_to_y(0)
        return r.path(this.pathString).translate(0,-b).rotate(theta);
}
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

$(document).ready(function() {
    initAxes();

    $( "#holder" ).on( "mousemove", function( event ) {
        var x = event.pageX - GLOBAL_MARGIN_x;
        var y = event.pageY - GLOBAL_MARGIN_y;

//        var endpoint = "L" + x + "," + y;

        circleAtMouse.attr({cx: x, cy: y});

    });

  $( "#holder" ).on( "mousedown", function( event ) {

        //if (CURR_TOOL == "draw") {

            var x = event.pageX - GLOBAL_MARGIN_x;
            var y = event.pageY - GLOBAL_MARGIN_y;  
            console.log(x, y);

        if (STATUS == "inputred") {
            redPoints.push(r.circle(x,y,5).attr(redPointAtrr));
            var dualLine = convert_to_dual_line(x_to_coord(x),y_to_coord(y));
            dualLine.attr(redLineAtrr);
            redLines.push(dualLine);
            updateCounts();
        }
        if (STATUS == "inputblue") {
            if (bluePoints.length < redPoints.length) {
                bluePoints.push(r.circle(x,y,5).attr(bluePointAtrr));
                var dualLine = convert_to_dual_line(x_to_coord(x),y_to_coord(y));
                dualLine.attr(blueLineAtrr);
                blueLines.push(dualLine);
                updateCounts();
            }
            if (bluePoints.length == redPoints.length) {
                endInputBlue();
            }
        }
        if (redPoints.length >= 2) {
            $("#end-input-red").removeClass("hidden");
        }

        //}
    });

});


function endInputRed() {
    STATUS = "inputblue";
    circleAtMouse.attr("stroke", blueColor);
    $("#end-input-red").hide();
    $(".user-hint").html("Click to add <span class='text-blue'>blue</span> points");
}

function endInputBlue() {
    STATUS = "inputdone";
    $(".user-hint").html("Finished adding points");
    circleAtMouse.hide();
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