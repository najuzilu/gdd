// Main methods

// global variables
// format float to closest int
var format = d3.format(",.0f");

// set global variables here
var xScale;
var rScale;

// set colors
var regionColors = ["#466e12", "#77bc1f", "#C5E0B4",
	"#FFD166", "#A9DDEB", "#009bde","#002060"].reverse();

var incomeColors = ["#9a9ad2", "#afbfda",
	"#ee9e29", "#ee6d2b", "#cbcbcb"];

$(document).ready(function() {
	console.log("working...");

	const start=1950, end=2020;
	const yearRange = Array.from(
		{length: end - start}, (v, k) => [k+start, k+start]
	).reverse();

	// populate select groups
	addOptionCategories("privateDebt", privateDebtCategories);
	addOptionCategories("publicDebt", publicDebtCategories);
	addOptionCategories("years", yearRange);

	// default options
	var prvDebtSelect = privateDebtCategories[0][1];
	var pblDebtSelect = publicDebtCategories[0][1];
	var yearSelect = yearRange[0][0];
	var displayView = "region";

	// when page is created draw chart with default values
	createChart(data[yearSelect], pblDebtSelect, prvDebtSelect, displayView);
	createBubbleLegend(data[yearSelect], pblDebtSelect, prvDebtSelect, displayView);
	// createColorLegend(data[yearSelect], pblDebtSelect, prvDebtSelect); >>>>>>> TODO

	$("#privateDebt").on("change", function(){
		// get updated values from form groups
		var prvDebtSelect =  $(this).val();
		var pblDebtSelect = $("#publicDebt").find(":selected").attr("value");
		var yearSelect = $("#years").find(":selected").attr("value");
		var displayView = $("#buttonWrapper").find(".active").attr("id");

		createChart(
			data[yearSelect],
			pblDebtSelect,
			prvDebtSelect,
			displayView,
		);

	});

	$("#publicDebt").on("change", function(){
		var pblDebtSelect =  $(this).val();
		var prvDebtSelect = $("#privateDebt").find(":selected").attr("value");
		var yearSelect = $("#years").find(":selected").attr("value");
		var displayView = $("#buttonWrapper").find(".active").attr("id");

		createChart(
			data[yearSelect],
			pblDebtSelect,
			prvDebtSelect,
			displayView,
		);
	});

	$("#years").on("change", function(){
		var yearSelect =  $(this).val();
		var prvDebtSelect = $("#privateDebt").find(":selected").attr("value");
		var pblDebtSelect = $("#publicDebt").find(":selected").attr("value");
		var displayView = $("#buttonWrapper").find(".active").attr("id");

		createChart(
			data[yearSelect],
			pblDebtSelect,
			prvDebtSelect,
			displayView,
		);

	});

	$(".btn-group[role='group'] button").on("click", function(){
		if (! $(this).attr("class").includes("active")){
			$(this).siblings().removeClass("active");
			$(this).toggleClass("active");
			var view = $(this).attr("id");

			if (view == "region") {
				d3.selectAll(".bubble")
					.transition()
  					.duration(600)
					.style("fill", d=> regionColors[regions[d["region"]]]);
			} else {
				d3.selectAll(".bubble")
					.transition()
  					.duration(600)
					.style("fill", d=> incomeColors[incomeGroups[d["incomeLevel"]]]);
			};
		}
	});

});
