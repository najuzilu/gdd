// $("#private_debt_cat")
// $("#public_debt_cat")

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


function range(size, startAt=0) {
	return [...Array(size).keys()].map(i => i+startAt);
}


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
		if (!(isNaN(item[x]))){
			// // calculate share of prv to pub
			// item["share_"+r+"_"+x] = item[r]/item[x];
			new_data.push(item);
		}
	})
	return new_data;
}

function createChart(data, pubDebt, prvDebt){

	x_indicator = pubDebt;
	r_indicator = prvDebt;
	// r_indicator = "share_" + prvDebt + "_" + pubDebt;

	// Clean data
	data = cleanData(data, x_indicator, r_indicator);

	// Get data values > needed for scales
	var x_max = d3.max(data, function(d){
		return d[x_indicator];
	});
	var x_min = d3.min(data, function(d){
		return d[x_indicator];
	});
	var r_max = d3.max(data, function(d){
		return d[r_indicator];
	});
	var r_min = d3.min(data, function(d){
		return d[r_indicator];
	});

	// Function creates a distance threshold
	var originCheck = function(a,b){
		if (a < b){
			return b;
		} else {
			return a;
		}
	}

	// Get width and set height
	var width = $(".chart").parent().width();
	var height = width / 2;
	var format = d3.format(",.0f");

	// Set all other vars
	var distance = {
		top: 0,
		right: width*0.02,
		bottom: 25,
		left: width*0.15,
	};
	var svgDistance_x = distance.left;
	var svgDistance_y = distance.top;

	// Create SVG element
	var svg = d3.select("body")
		.select(".chart")
		.append("svg")
		.style("width", width)
		.style("height", height)
		.style("overflow", "visible")
	  .append("g")
	  	.attr("transform", "translate(" + svgDistance_x + "," + svgDistance_y + ")");

	// Create scale for xaxis
	var xDomain_min = 0;
	var xDomain_max = x_max + 50; // !!FIX
	var xRange_min = 0;
	var xRange_max = width - svgDistance_x - distance.right - distance.left;

	var xScale = d3.scaleLinear()
		.domain([xDomain_min,xDomain_max])
		.range([xRange_min,xRange_max]);

	// Create scale for yaxis
	var yDomain_min = 0;
	var yDomain_max = 100;
	var yRange_min = 0;
	var yRange_max = height;

	var yScale = d3.scaleLinear()
		.domain([yDomain_min,yDomain_max])
		.range([yRange_min,yRange_max]);

	// Create scale for radius
	var rDomain_min = r_min;
	var rDomain_max = r_max;
	var rRange_min = width / 240;
	var rRange_max= width / 70;

	var rScale = d3.scaleSqrt()
		.domain([rDomain_min,rDomain_max])
		.range([rRange_min,rRange_max]);

	// Create x axis
	var tickNo = 5;

	var xAxis = d3.axisTop()
		.scale(xScale)
		.ticks(tickNo, d3.format(',d'))
		.tickFormat(d => d + "%");

	// append x axis
	var labelDistance = 0; //distance of label with axis, gaussian line, dots and tooltip
	var xAxisDistance_x = 0;
	var xAxisDistance_y = height * 0.15;

	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + xAxisDistance_x + "," + xAxisDistance_y + ")")
		.call(xAxis);

	var labelDistance_lx;
	var labelDistance_ly;
	var underlabelDistance_lx;
	var underlabelDistance_ly;

	// create xAxis label
	if (pubDebt == "cg_debt"){
		var labelDistance_lx = width / 2.35;
		var labelDistance_ly = xAxisDistance_y - 50;
		var underlabelDistance_lx = width / 2;
		var underlabelDistance_ly = xAxisDistance_y - 30;
	} else if (pubDebt == "gg_debt"){
		// do something
	} else if (pubDebt == "nfps_debt"){
		// do something
	} else {
		// do something
	}

	svg.append("text")
		.attr("class", "x label center")
		.text(meta[pubDebt]["label"] + " (" + meta[pubDebt]["unit"] + ")")
		.attr("text-anchor", "end")
		.attr("font-weight", "bold")
		.attr("x", labelDistance_lx)
		.attr("y", labelDistance_ly);


	svg.append("text")
		.attr("class", "x label center")
		.text(meta[pubDebt]["description"])
		.attr("text-anchor", "end")
		.attr("font-style", "italic")
		.attr("x", underlabelDistance_lx)
		.attr("y", underlabelDistance_ly);

	// Create grey bands for overview
	// programmatic way to calc xAxis ranges
	var bandsCollection = Array.from(
	{length: tickNo}, (v, k) => k * parseInt(((xDomain_max - xDomain_min) / tickNo) + xDomain_min)
	);

	var bands_height = xAxisDistance_y * 3.5;

	var band_view_all = svg.append("g")
		.attr("class", "band_view_all");

	bandsCollection.forEach(function(item, index){
		// alternate colors
		if (index % 2 == 0) {
			var bands_color = "#e6e6e6";
			if (index == 0) {
				var bands_width = bandsCollection[index+1] - bandsCollection[index];
			} else {
				var bands_width = bandsCollection[index] - bandsCollection[index-1];
			}
		} else {
			var bands_color = "#F0F0F0";
			var bands_width = bandsCollection[index] - bandsCollection[index-1];
		}

		band_view_all.append("rect")
			.attr("x", xScale(item))
			.attr("y", xAxisDistance_y)
			.attr("width", xScale(bands_width))
			.attr("height",bands_height)
			.attr("fill", bands_color)
			.style("opacity", 0.5);
	});

	// Setting line for distribution
	var gaussianDistance_x = xAxisDistance_x;
	var gaussianDistance_y = xAxisDistance_y + width * 0.125;
	var line = svg.append("g")
		.attr("class", "gaussian_line")
		.attr("transform", "translate(" + gaussianDistance_x + "," + gaussianDistance_y + ")");

	line.append("line")
		.attr("x1", xScale.range()[0])
		.attr("x2", xScale.range()[1]);

	//Create the Glow Filter
	var stdDeviation = 2.5;
	var defs = svg.append('defs');

	var filter = defs.append('filter')
		.attr('id','glow');
	filter.append('feGaussianBlur')
		.attr('class','blur')
		.attr('stdDeviation',stdDeviation)
		.attr('result','coloredBlur');

	var feMerge = filter.append('feMerge');
	feMerge.append('feMergeNode')
		.attr('in','coloredBlur');
	feMerge.append('feMergeNode')
		.attr('in','SourceGraphic');

	// Create force simulation
	var simDistribution = gaussianDistance_y;
	var strength = 0.9;
	var alpha = 0.7;

	var simulation = d3.forceSimulation(data)
		.force("x",
			d3.forceX(d => xScale(d[x_indicator]))
				.strength(strength)
		)
		.force("y", d3.forceY(simDistribution))
		.force("collide",
			d3.forceCollide(d => rScale(d[r_indicator]))
		)
		.alpha(alpha);

	//Feed the force simulation all our data
	function ticked(d){
		bubbles
			.attr("cx",function(d){return d.x;})
			.attr("cy",function(d){return d.y;})
	}
	simulation.nodes(data).on('tick',ticked);

	// create bubbles
	var bubDistance_x = 0;
	var bubDistance_y = 0;
	var colors = ['#466e12','#77bc1f','#C5E0B4','#A9DDEB','#009bde','#002060'].reverse();
	// var colors = ['#FFD166','#C6DABF','rgb(125, 207, 182)','rgb(0, 178, 202)','rgb(29, 78, 137)'];
	var rDiv = Array.from(
	{length: tickNo}, (v, k) => k * parseInt(((rDomain_max - rDomain_min) / tickNo) + rDomain_min)
	);

	// variables for tooltip on bubbles
	var rectWidth = 315;
	var rectHeight = 70;
	var triangleHeight = rectHeight / 7;
	var tooltipDistance_x = rectWidth / 2;
	var tooltipDistance_y = rectHeight + triangleHeight;

	// setup bubbles
	var bubbles = svg.append("g")
		.attr("class", "bubbles")
		.attr("transform", "translate(" + bubDistance_x + ", " + bubDistance_y + ")")
		.selectAll(".bubble")
		.data(simulation.nodes())
		.enter()
			.append("circle")
			.attr("class", d => "bubble " + d.country)
			.style("stroke", "#000")
			.style("stroke-width", 0.1)
			.attr("x", d => d.x)
			.attr("y", d => d.y)
			.attr("r", d => rScale(d[r_indicator]))
			.style("fill", function(d){
				color_var = d[r_indicator];
				if (color_var == null) {
					return "#707C7C";
				} else if (color_var>=rDiv[0] & color_var<rDiv[1]) {
					return colors[0];
				} else if (color_var>=rDiv[1] & color_var<rDiv[2]){
					return colors[1];
				} else if (color_var>=rDiv[2] & color_var<rDiv[3]){
					return colors[2];
				} else if (color_var>=rDiv[3] & color_var<rDiv[4]){
					return colors[3];
				} else {
					return colors[4];
				}
			})
			.on("mouseover", function(){
				tooltip.style("display", null);
				d3.select(this).style("filter", "url(#glow)");
			})
			.on("mouseout", function(){
				tooltip.style("display", "none");
				d3.select(this).style("filter", "none");
			})
			.on("mousemove", function(obj, d){
				var fontSize = 12 + "px";
				var textA_x = 1/25 * rectWidth;
				var textA_y = 1/4 * rectHeight;
				var textB_x = textA_x;
				var textB_y = 2 * textA_y;
				var textC_x = textA_x;
				var textC_y = 3 * textA_y;

				var text1_x = rectWidth - textA_x;
				var text1_y = textB_y;
				var text2_x = text1_x;
				var text2_y = textC_y;

				var xPos = d3.select(this).attr("cx");
				var yPos = d3.select(this).attr("cy");
				var rPos = d3.select(this).attr("r");

				var transform_x = parseFloat(xPos) - tooltipDistance_x;
				var transform_y = parseFloat(yPos) - parseFloat(rPos) - tooltipDistance_y;

				tooltip.attr("transform", "translate(" + transform_x + ", " + transform_y + ")");
				tooltip.selectAll("text")
					.style("font-size", fontSize)
					.style("color", "black");
				tooltip.select("text.name")
					.attr("x", textA_x)
					.attr("y",textA_y)
					.style("font-weight","bold")
					.style("fill","#262626")
					.text(d.countryName + " (" + d.year +")");
				tooltip.select("text.pubdebt")
					.attr("x", textB_x)
					.attr("y", textB_y)
					.style("fill", "#262626")
					.text(meta[pubDebt]["label"]+" (% of GDP):");
				tooltip.select("text.prvdebt")
					.attr("x", textC_x)
					.attr("y",textC_y)
					.style("fill","#262626")
					.text(meta[prvDebt]["label"]+" (% of GDP):");

				tooltip.select("text.pubdebt_value")
					.attr("x", text1_x)
					.attr("y", text1_y)
					.style("font-weight","bold")
					.style("fill", "#262626")
					.text(format(d[pubDebt]));

				tooltip.select("text.prvdebt_value")
					.attr("x", text2_x)
					.attr("y", text2_y)
					.style("font-weight","bold")
					.style("fill", "#262626")
					.text(format(d[prvDebt]));
			});

	// create tooltip
	// keep tooltip code here to lay over bubbles
	var rectOpacity = 0.92;
	var triangleA_x = 3/7 * rectWidth;
	var triangleA_y = rectHeight;
	var triangleB_x = 4/7 * rectWidth;
	var triangleB_y = rectHeight;
	var triangleC_x = 1/2 * rectWidth;
	var triangleC_y = rectHeight + triangleHeight;


	var tooltip = svg.append("g")
		.attr("class", "tooltips")
		.style("display", "none");
	tooltip.append("path")
		.attr("fill", "white")
		.attr("stroke", "grey")
		.attr("filter", "url(#glow)")
		.style("opacity", rectOpacity)
		.attr("d", function(){
			return "M "+ 0 + " " + 0 +
				" L" + rectWidth + " " + 0 +
				" L" + rectWidth + " " + rectHeight +
				" L" + (triangleB_x) + " " + (triangleB_y) +
				" L" + (triangleC_x) + " " + (triangleC_y) +
				" L" + (triangleA_x) + " " + (triangleA_y) +
				" L" + 0 + " " + rectHeight+
				" z";
		});
	// append all text elements of tooltip
	tooltip.append("text")
		.attr("dy", ".35em")
		.attr("text-anchor", "right")
		.attr("class", "name");
	tooltip.append("text")
		.attr("dy", ".35em")
		.attr("text-anchor", "start")
		.attr("class", "iso3");
	tooltip.append("text")
		.attr("dy", ".35em")
		.attr("text-anchor", "start")
		.attr("class", "pubdebt");
	tooltip.append("text")
		.attr("dy", ".35em")
		.attr("text-anchor", "start")
		.attr("class", "prvdebt");

	tooltip.append("text")
		.attr("dy", ".35em")
		.attr("text-anchor", "end")
		.attr("class", "iso3_value");
	tooltip.append("text")
		.attr("dy", ".35em")
		.attr("text-anchor", "end")
		.attr("class", "pubdebt_value");
	tooltip.append("text")
		.attr("dy", ".35em")
		.attr("text-anchor", "end")
		.attr("class", "prvdebt_value");




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
	var prvDebtSelect = privateDebtCategories[0][0];
	var prvDebtSelectVal = privateDebtCategories[0][1];
	var pblDebtSelect = publicDebtCategories[0][0];
	var pblDebtSelectVal = publicDebtCategories[0][1];
	var yearSelect = yearRange[0][0];

	// draw chart
	createChart(data[yearSelect], pblDebtSelectVal, prvDebtSelectVal);

	$("#privateDebt").on("change", function(){
		var prvDebtSelect = $(this).find("option:selected").text();
		var prvDebtSelectVal = this.value;

		//
		// UPDATE CHART HERE!!
		//
		createChart(data[yearSelect], pblDebtSelectVal, prvDebtSelectVal);
	});

	$("#publicDebt").on("change", function(){
		var pblDebtSelect = $(this).find("option:selected").text();
		var pblDebtSelectVal = this.value;

		//
		// UPDATE CHART HERE!!
		//
		createChart(data[yearSelect], pblDebtSelectVal, prvDebtSelectVal);
	});

	$("#years").on("change", function(){
		var yearSelect = this.value;

		//
		// UPDATE CHART HERE!!
		//
		$("svg").remove();
		createChart(data[yearSelect], pblDebtSelectVal, prvDebtSelectVal);
	});


});

