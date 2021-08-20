const privateDebtCategories = [
	["Private debt, loans and debt securities", "pvd_ls"],
	["Household debt, loans and debt securities", "hh_ls"],
	["Nonfinancial corporate debt, loans and debt securities","nfc_ls"],
	["Private debt, all instruments","pvd_all"],
	["Household debt, all instruments","hh_all"],
	["Nonfinancial corporate debt, all instruments","nfc_all"],
];

const publicDebtCategories = [
	["Central Government Debt","cg_debt"],
	["General Government Debt","gg_debt"],
	["Nonfinancial Public Sector Debt","nfps_debt"],
	["Public Sector Debt","ps_debt"],
];

const viewCategories = [
	["All Countries", "displayAll"],
	["By Income Group", "byIncGroup"],
	["By Region", "byRegion"],
];

function addOptionCategories(selectId, selectArray){
	selectArray.forEach(function(item, index){
		if (index == 0) {
			$("#"+selectId).append($("<option>", {
				value: item[1],
				text: item[0],
			}).prop("selected", true));

		} else {
			$("#"+selectId).append($("<option>", {
				value: item[1],
				text: item[0],
			}));
		}
	});
}


$(document).ready(function() {
	console.log("working...");

	const start=1950, end=2020; // end =-1
	const yearRange = Array.from({length: end - start}, (v, k) => [k+start, k+start]).reverse();

	// populate select groups
	addOptionCategories("privateDebt", privateDebtCategories);
	addOptionCategories("publicDebt", publicDebtCategories);
	addOptionCategories("years", yearRange);
	addOptionCategories("viewCategory", viewCategories);

	// default options
	var prvDebtSelect = privateDebtCategories[0][1];
	var pblDebtSelect = publicDebtCategories[0][1];
	var yearSelect = yearRange[0][0];
	var displayView = viewCategories[0][1];

	// when page is created draw chart with default values
	createChart(data[yearSelect], pblDebtSelect, prvDebtSelect);
	createBubbleLegend(data[yearSelect], pblDebtSelect, prvDebtSelect);
	createColorLegend(data[yearSelect], pblDebtSelect, prvDebtSelect);

	$("#privateDebt").on("change", function(){
		// get updated values from form groups
		var prvDebtSelect = this.value;
		var pblDebtSelect = $("#publicDebt").find(":selected").attr("value");
		var yearSelect = $("#years").find(":selected").attr("value");
		var displayView = $("#viewCategory").find(":selected").attr("value");

		console.log("private>>", displayView);

		//
		// UPDATE CHART HERE!!
		//
		createChart(data[yearSelect], pblDebtSelect, prvDebtSelect);
		createBubbleLegend(data[yearSelect], pblDebtSelect, prvDebtSelect);
		createColorLegend(data[yearSelect], pblDebtSelect, prvDebtSelect);
	});

	$("#publicDebt").on("change", function(){
		var pblDebtSelect = this.value;
		var prvDebtSelect = $("#privateDebt").find(":selected").attr("value");
		var yearSelect = $("#years").find(":selected").attr("value");
		var displayView = $("#viewCategory").find(":selected").attr("value");

		console.log("public>>", displayView);

		//
		// UPDATE CHART HERE!!
		//
		createChart(data[yearSelect], pblDebtSelect, prvDebtSelect);
		createBubbleLegend(data[yearSelect], pblDebtSelect, prvDebtSelect);
		createColorLegend(data[yearSelect], pblDebtSelect, prvDebtSelect);
	});

	$("#years").on("change", function(){
		var yearSelect = this.value;
		var prvDebtSelect = $("#privateDebt").find(":selected").attr("value");
		var pblDebtSelect = $("#publicDebt").find(":selected").attr("value");
		var displayView = $("#viewCategory").find(":selected").attr("value");

		console.log("year>>", displayView);
		//
		// UPDATE CHART HERE!!
		//
		createChart(data[yearSelect], pblDebtSelect, prvDebtSelect);
		createBubbleLegend(data[yearSelect], pblDebtSelect, prvDebtSelect);
		createColorLegend(data[yearSelect], pblDebtSelect, prvDebtSelect);
	});

	$("#viewCategory").on("change", function(){
		var displayView = this.value;
		var prvDebtSelect = $("#privateDebt").find(":selected").attr("value");
		var pblDebtSelect = $("#publicDebt").find(":selected").attr("value");
		var yearSelect = $("#years").find(":selected").attr("value");

		if (displayView == "displayAll") {
			// transition back to displaying all countries

			////////////////////////////////////////
			////////////// COMPLETE!! //////////////
			////////////////////////////////////////
			console.log("ALL!!");
		} else if (displayView == "byIncGroup") {
			// transition to displaying by income group


			////////////////////////////////////////
			////////////// completing //////////////
			////////////////////////////////////////

			console.log("INCOME!!");
			updateIncomeChart(
				data[yearSelect],
				pblDebtSelect,
				prvDebtSelect,
			);


		} else {
			// displayView == "byRegion"
			// transition to displaying by region

			////////////////////////////////////////
			////////////// COMPLETE!! //////////////
			////////////////////////////////////////
			console.log("REGION");
		}

	});

});
