// format float to closest int
var format = d3.format(",.0f");

// set global variables here
var xScale;
var rScale;

var distance = {
	top: 0,
	right: 0.02,
	bottom: 25,
	left: 0.15,
};

// set colors
var colors = [
	"#466e12", "#77bc1f", "#C5E0B4",
	"#FFD166", "#A9DDEB", "#009bde",
	"#002060"
].reverse();
