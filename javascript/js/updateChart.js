// Things to do
// 4. create text info for each category which will be displayed
//		below the axis label text for each category.
// 			checkout var labelsByIncGroup = [];

function toTitleCase(str) {
	return str.replace(
		/\w\S*/g,
		function(txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		}
	);
}

function cleanAllCountries(){
	// change opacity of previous gaussian dist line
	d3.select(".gaussian_line")
		.attr("opacity", 0);
	// change opacity of gaussian dist line text
	d3.select(".gaussian_line_text")
		.attr("opacity", 0);
	// change opacity of average vertical line
	d3.select(".mean line")
		.attr("opacity", 0);
	d3.selectAll(".mean text")
		.attr("opacity", 0);
	// change opacity of text at bottom of chart
	d3.select(".debtRatioStat path")
		.attr("opacity", 0);
	d3.selectAll(".debtRatioStat text")
		.attr("opacity", 0);
	d3.select(".circleRepText line")
		.attr("opacity", 0);
	d3.selectAll(".circleRepText text")
		.attr("opacity", 0);
}


function updateIncomeChart(data, pubDebt, prvDebt){

	// change opacity of all country groups;
	cleanAllCountries();
	// clean any existing incGroup text
	$(".incomeGroups-distLines").remove();
	$(".incomeGroups").remove();

	var x_indicator = pubDebt;
	var r_indicator = prvDebt;

	// Clean data
	data = cleanData(data, x_indicator, r_indicator);

	// group data by income group
	var groupByIncome = d3.group(data,
		d => d["incomeLevel"]
	);

	// Get data values > needed for scales
	var x_max = d3.max(data, d => d[x_indicator]);
	var x_min = d3.min(data, d => d[x_indicator]);
	var r_max = d3.max(data, d => d[r_indicator]);

	// set height and width
	var oldHeight = d3.select(".chart").select("svg").style("height");
	oldHeight = parseInt(oldHeight.substring(0, oldHeight.length-2));

	var height = oldHeight * groupByIncome.size * 0.62 ; // 2.31
	var width = $(".chart").parent().width();

	var svg = d3.select(".chart")
		.select("svg");

	var svgDistance_x = distance.left * width;
	var svgDistance_y = distance.top;

	// set group income group
	// insert prior to countryAll
	// because otherwise, gaussian dist
	// lines will appear over bubbles
	var gDistLines = d3.select("svg#chart")
		.insert("g", ":first-child")
		.attr("class", "incomeGroups-distLines")
		.attr("transform", "translate(" + svgDistance_x + "," + svgDistance_y + ")");

	// new g element neeeded to display
	// average vertical line above bubbles
	var g = svg.insert("g", ".tooltip-group")
		.attr("class", "incomeGroups")
		.attr("transform", "translate(" + svgDistance_x + "," + svgDistance_y + ")");

	// change height
	svg.style("height", height + "px");

	// create new gaussian dist lines
	var xAxisDistance_x = 0;
	var xAxisDistance_y = oldHeight * 0.15;

	var gaussLineAdv_x = xAxisDistance_x;
	var gaussLineAdv_y = xAxisDistance_y + width * 0.13;

	var gaussNames = [
		"gaussian_line_adv",
		"gaussian_line_up_mid",
		"gaussian_line_low_mid",
		"gaussian_line_low",
	];


	var gaussGroup = gDistLines.append("g")
		.attr("class", "gauss_lines_incGroup");
	var meanGroup = g.append("g")
		.attr("class", "means_incGroup");

	var labelsByIncGroup = [];								////// TO DO!!!

	// variables needed for simulation
	var strength = 1;
	var alpha = 1;


	groupByIncome.forEach(function(group, key){
		var i = incomeGroups[key];
		// calculate mean for each group to visualize
		var mean = d3.mean(group, d=> d[x_indicator]);
		var elem = gaussNames[i];

		// transition time
		var durationTime = 600;
		// y coordinate of gaussian distribution
		var gauss_y = gaussLineAdv_y * (i + 1) + (i * 51);
		// new gaussian dist lines
		var line = gaussGroup.append("g")
			.attr("class", elem)
			.attr("transform", "translate(" +
			gaussLineAdv_x + ", " + gauss_y + ")"
		);
		line.append("line")
			.attr("x1", xScale.range()[0])
			.attr("x2", xScale.range()[1]);

		// append the gauss dist labels by income group
		gaussGroup.append("text")
			.attr("class", elem + "_label")
			.text(toTitleCase(key))
			.attr("text-anchor", "end")
			.attr("x", -10)
			.attr("y", gauss_y)
			.style("font-weight", "bold");

		var mean_y1 = gauss_y - 90;
		var mean_y2 = gauss_y + 90;

		// append mean line
		var meanLine = meanGroup.append("line")
			.attr("class", "means_inc_group")
			.attr("x1", xScale(mean))
			.attr("x2", xScale(mean))
			.attr("y1", mean_y1)
			.attr("y2", mean_y2)
			.attr("stroke", "#000")
			.attr("stroke-width", 2)
			.attr("opacity", 0);

		// append mean text
		var meanLineAvgText = meanGroup.append("text")
			.attr("class", "means_inc_group_text")
			.text("Average")
			.attr("x", xScale(mean))
			.attr("y", mean_y1 - 25)
			.style("font-weight", "bold")
			.style("text-anchor", "middle")
			.attr("opacity", 0);
		var meanLineAvgVal = meanGroup.append("text")
			.attr("class", "means_inc_group_text")
			.text(format(mean) + "%")
			.attr("x", xScale(mean))
			.attr("y", mean_y1 - 10)
			.style("font-weight", "bold")
			.style("text-anchor", "middle")
			.attr("opacity", 0);

		// transition the above
		meanLine.transition()
			.duration(durationTime)
			.style("opacity", 1);
		meanLineAvgText.transition()
			.duration(durationTime)
			.style("opacity", 1);
		meanLineAvgVal.transition()
			.duration(durationTime)
			.style("opacity", 1);

		// group simulation
		var sim = d3.forceSimulation()
			.force("x", d3.forceX(
				d => xScale(d[x_indicator])
			).strength(strength))
			.force("y", d3.forceY(gauss_y))
			.force("collide",
				d3.forceCollide()
				.radius(d => rScale(d[r_indicator]))
			)
			.alpha(alpha);

		sim.nodes(group)
			.on("tick", function(d){
				bubbles
					.attr("cx", d => d.x)
					.attr("cy", d => d.y);
			});

		// debt ratio text for inc group
		var distanceFromGauss = 80;
		debtRatioText(sim.nodes(),
			x_indicator,
			r_indicator,
			gauss_y,
			distanceFromGauss
		);
	});

}
