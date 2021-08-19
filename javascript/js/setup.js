const privateDebtCategories = [
	["Private debt, loans and debt securities", "pvd_ls"],
	["Household debt, loans and debt securities", "hh_ls"],
	["Nonfinancial corporate debt, loans and debt securities","nfc_ls"],
	["Private debt, all instruments","pvd_all"],
	["Household debt, all instruments","hh_all"],
	["Nonfinancial corporate debt, all instruments","nfc_all"],
]

const publicDebtCategories = [
	["Central Government Debt","cg_debt"],
	["General Government Debt","gg_debt"],
	["Nonfinancial Public Sector Debt","nfps_debt"],
	["Public Sector Debt","ps_debt"],
]

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


function cleanData(data, x, r){
	var new_data = [];

	data.forEach(function(item, index) {
		if (!(isNaN(item[x]) || isNaN(item[r]))){
			new_data.push(item);
		}
	})
	return new_data;
}


$(document).ready(function() {
	console.log("working...");

	const start=1950, end=2020; // end =-1
	const yearRange = Array.from({length: end - start}, (v, k) => [k+start, k+start]).reverse();

	// populate select groups
	addOptionCategories("privateDebt", privateDebtCategories);
	addOptionCategories("publicDebt", publicDebtCategories);
	addOptionCategories("years", yearRange);

	// default options
	var prvDebtSelect = privateDebtCategories[0][1];
	var pblDebtSelect = publicDebtCategories[0][1];
	var yearSelect = yearRange[0][0];

	// draw chart
	createChart(data[yearSelect], pblDebtSelect, prvDebtSelect);
	createBubbleLegend(data[yearSelect], pblDebtSelect, prvDebtSelect);
	createColorLegend(data[yearSelect], pblDebtSelect, prvDebtSelect);

	$("#privateDebt").on("change", function(){
		// get updated values from form groups
		var prvDebtSelect = this.value;
		var pblDebtSelect = $("#publicDebt").find(":selected").attr("value");
		var yearSelect = $("#years").find(":selected").attr("value");

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

		//
		// UPDATE CHART HERE!!
		//
		createChart(data[yearSelect], pblDebtSelect, prvDebtSelect);
		createBubbleLegend(data[yearSelect], pblDebtSelect, prvDebtSelect);
		createColorLegend(data[yearSelect], pblDebtSelect, prvDebtSelect);
	});


});
