function createIncGroup(data, pubDebt, prvDebt){
	console.log("createIncGroup...")
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
	var width = $(".chart").parent().width();
	var height = groupByIncome.size * width / 2.75; 		// >> play around with coef to change height

	// Set all other vars
	var svgDistance_x = distance.left * width;
	var svgDistance_y = distance.top;

	// remove svg if exists
	// remove svg if exists
	$("svg#chart").remove();

	var svg = d3.select("body")
		.select(".chart")
		.append("svg")
		.attr("id", "chart")
		.style("width", width)
		.style("height", height)
		.style("overflow", "visible")
		.style("padding-top", "30px")
		.style("background-color", "rgba(240, 240, 240, 0.5)")
	  .append("g")
	  	.attr("class", "byIncomeGroup")
	  	.attr("transform", `translate(${svgDistance_x},${svgDistance_y})`);

	// Create scale for xaxis
	var xDomain_min = 0;
	var xDomain_max = x_max + 50;
	var xRange_min = 0;
	var xRange_max = width - svgDistance_x - (distance.right*width) - (distance.left*width);

	xScale = d3.scaleLinear()
		.domain([xDomain_min, xDomain_max])
		.range([xRange_min, xRange_max]);


	// Create scale for yaxis
	var yDomain_min = 0;
	var yDomain_max = 100;
	var yRange_min = 0;
	var yRange_max = height;

	var yScale = d3.scaleLinear()
		.domain([yDomain_min, yDomain_max])
		.range([yRange_min, yRange_max]);


	// Create scale for radius
	var rDomain_min = 0;
	var rDomain_max = r_max;
	var rRange_min = width / 240;
	var rRange_max = width / 55;

	rScale = d3.scaleSqrt()
		.domain([rDomain_min, rDomain_max])
		.range([rRange_min, rRange_max]);


	// Create x axis
	var tickNo = 5;

	var xAxis = d3.axisTop()
		.scale(xScale)
		.ticks(tickNo, d3.format(',d'))
		.tickFormat(d => `${d}%`);

	// append x axis
	var labelDistance = 0; //distance of label with axis, gaussian line, dots and tooltip
	var xAxisDistance_x = 0;
	var xAxisDistance_y = height/groupByIncome.size * 0.15;

	svg.append("g")
		.attr("class", "axis")
		.attr("transform", `translate(${xAxisDistance_x},${xAxisDistance_y})`)
		.call(xAxis);

	// create xAxis label
	var labelDistance_lx = width / 2.35;
	var labelDistance_ly = xAxisDistance_y - 50;
	var underlabelDistance_lx = width / 2;
	var underlabelDistance_ly = xAxisDistance_y - 30;

	svg.append("text")
		.attr("class", "x label center")
		.text(`${meta[pubDebt]["label"]} (${meta[pubDebt]["unit"]})`)
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

	// setup gaussian line varibles
	var gaussLineAdv_x = xAxisDistance_x;
	var gaussLineAdv_y = xAxisDistance_y + width * 0.18;			// >> play around with distance

	var gaussNames = [
		"gaussian_line_adv",
		"gaussian_line_up_mid",
		"gaussian_line_low_mid",
		"gaussian_line_low",
	];

	var gaussGroup = svg.append("g")
		.attr("class", "gaussian_lines");

	var bubbles = svg.append("g")
		.attr("class", "all_bubbles");

	var meanGroup = svg.append("g")
		.attr("class", "means");

	var labelsByIncGroup = [];								////// TO DO!!!


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

	// variables for tooltip on bubbles
	var rectWidth = 330;
	var splitTextLength = 40;

	if (meta[prvDebt]["label"].length > splitTextLength) {
		var rectHeight = 100;
	} else{
		var rectHeight = 90;
	}

	var triangleHeight = rectHeight / 7;
	var tooltipDistance_x = rectWidth / 2;
	var tooltipDistance_y = rectHeight + triangleHeight;

	// Create bubbles
	var bubDistance_x = 0;
	var bubDistance_y = 0;


	// variables needed for simulation
	var strength = 1;
	var alpha = 1;


	groupByIncome.forEach(function(group, key){
		var i = incomeGroups[key];
		// calculate mean for each group to visualize
		var mean = d3.mean(group, d=> d[x_indicator]);
		var elem = gaussNames[i];

		// y coordinate of gaussian distribution
		var gauss_y = gaussLineAdv_y * (i + 1) + (i * 51);
		// new gaussian dist lines
		var line = gaussGroup.append("g")
			.attr("class", elem)
			.attr("transform", `translate(${gaussLineAdv_x},${gauss_y})`);
		line.append("line")
			.attr("x1", xScale.range()[0])
			.attr("x2", xScale.range()[1]);

		// append the gauss dist labels by income group
		gaussGroup.append("text")
			.attr("class", `${elem}_label`)
			.text(toTitleCase(key))
			.attr("text-anchor", "end")
			.attr("x", -10)
			.attr("y", gauss_y)
			.style("font-weight", "bold");


		// group simulation
		var sim = d3.forceSimulation(group)
			.force("x", d3.forceX(
				d => xScale(d[x_indicator])
			).strength(strength))
			.force("y", d3.forceY(gauss_y))
			.force("collide",
				d3.forceCollide()
				.radius(d => rScale(d[r_indicator]))
			)
			.alpha(alpha);

		// setup bubbles
		var bubbles_inc = bubbles.append("g")
			.attr("class", `bubbles_${i}`)
			.attr("transform", `translate(${bubDistance_x},${bubDistance_y})`)
			.selectAll(`.bubble_${i}`)
			.data(sim.nodes())
			.enter()
				.append("circle")
				.attr("class", d => `bubble_${i} ${d.country}`)
				.style("stroke", "#000")
				.style("stroke-width", 0.1)
				.attr("cx", d => d.x)
				.attr("cy", d => d.y)
				.attr("r", d => rScale(d[r_indicator]))
				.style("fill", d => colors[regions[d["region"]]])
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
					// start x,y coordinates of tooltip titles
					//   and indicator names
					var tooltipTitle_x = 1/25 * rectWidth;
					var tooltipInd1_x = tooltipTitle_x; 			// country name
					var tooltipInd2_x = tooltipInd1_x;				// region
					var tooltipInd3_x = tooltipInd2_x;				// pub
					var tooltipInd4_x = tooltipInd3_x;				// prv


					// fix tooltip coordinates if private debt indicator
					// 	name is too long
					if (meta[prvDebt]["label"].length > splitTextLength){
						var tooltipTitle_y = 1/6 * rectHeight; 		// country name
						var tooltipInd1_y = 2 * tooltipTitle_y; 	// region
						var tooltipInd2_y = 3 * tooltipTitle_y; 	// pub
						var tooltipInd3_y = 4 * tooltipTitle_y; 	// prv
						var tooltipInd4_y = 5 * tooltipTitle_y; 	// second prv line
						// fix indicator value y coordinate
						var tooltipInd3_val_y = tooltipInd4_y;		// prv value to next line
					} else {
						var tooltipTitle_y = 1/5 * rectHeight; 		// country name
						var tooltipInd1_y = 2 * tooltipTitle_y;		// region
						var tooltipInd2_y = 3 * tooltipTitle_y;		// pub
						var tooltipInd3_y = 4 * tooltipTitle_y;		// prv
						// fix indicator value y coordinate
						var tooltipInd3_val_y = tooltipInd3_y;		// prv value
					}

					// start coordinates of tooltip indicator values
					var tooltipInd1_val_x = rectWidth - tooltipInd1_x;
					var tooltipInd1_val_y = tooltipInd1_y;
					var tooltipInd2_val_x = tooltipInd1_val_x;
					var tooltipInd2_val_y = tooltipInd2_y;
					var tooltipInd3_val_x = tooltipInd2_val_x;

					// on mouse position get cx, cy, and r of hover bubble
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
						.attr("x", tooltipTitle_x)
						.attr("y",tooltipTitle_y)
						.style("font-weight","bold")
						.style("fill","#262626")
						.text(d.countryName + " (" + d.year +")");

					tooltip.select("text.region")
						.attr("x", tooltipInd1_x)
						.attr("y", tooltipInd1_y)
						.style("fill", "#262626")
						.text("Region");

					tooltip.select("text.pubdebt")
						.attr("x", tooltipInd2_x)
						.attr("y", tooltipInd2_y)
						.style("fill", "#262626")
						.text(meta[pubDebt]["label"] + " (% of GDP)");

					// private debt variables too long, append unit below
					if (meta[prvDebt]["label"].length > splitTextLength) {
						var indi3Text = meta[prvDebt]["label"] + " (% of GDP)";
						var arr = indi3Text.split(" ")
						var firstHalf = arr.slice(0, arr.length/2).join(" ");
						var secondHalf = arr.slice(arr.length/2, arr.length).join(" ");

						tooltip.select("text.prvdebt")
							.attr("x", tooltipInd3_x)
							.attr("y",tooltipInd3_y)
							.style("fill","#262626")
							.text(firstHalf);

						tooltip.select("text.prvdebt_unit")
							.attr("x", tooltipInd4_x)
							.attr("y",tooltipInd4_y)
							.style("fill","#262626")
							.text(secondHalf);
					} else {
						// prv can fit in one line
						tooltip.select("text.prvdebt")
							.attr("x", tooltipInd3_x)
							.attr("y",tooltipInd3_y)
							.style("fill","#262626")
							.text(meta[prvDebt]["label"]+ " (% of GDP)");
					}

					tooltip.select("text.region_value")
						.attr("x", tooltipInd1_val_x)
						.attr("y", tooltipInd1_val_y)
						.style("font-weight", "bold")
						.style("fill", "#262626")
						.text(d["region"]);

					tooltip.select("text.pubdebt_value")
						.attr("x", tooltipInd2_val_x)
						.attr("y", tooltipInd2_val_y)
						.style("font-weight","bold")
						.style("fill", "#262626")
						.text(format(d[pubDebt]));

					tooltip.select("text.prvdebt_value")
						.attr("x", tooltipInd3_val_x)
						.attr("y", tooltipInd3_val_y)
						.style("font-weight","bold")
						.style("fill", "#262626")
						.text(format(d[prvDebt]));
				});

		// Feed the force simulation all our data
		function tick(){
			bubbles_inc.attr("cx", d => d.x)
				.attr("cy", d => d.y);
		}

		sim.nodes(group)
			.on("tick", tick);

		// add means
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
			.attr("stroke-width", 2);

		// append mean text
		var meanLineAvgText = meanGroup.append("text")
			.attr("class", "means_inc_group_text")
			.text("Average")
			.attr("x", xScale(mean))
			.attr("y", mean_y1 - 25)
			.style("font-weight", "bold")
			.style("text-anchor", "middle");
		var meanLineAvgVal = meanGroup.append("text")
			.attr("class", "means_inc_group_text")
			.text(`${format(mean)}%`)
			.attr("x", xScale(mean))
			.attr("y", mean_y1 - 10)
			.style("font-weight", "bold")
			.style("text-anchor", "middle");

		// debt ratio text for inc group
		var distanceFromGauss = 80;
		debtRatioText(sim.nodes(),
			x_indicator,
			r_indicator,
			gauss_y,
			distanceFromGauss
		);
	});



	// Create tooltip
	// keep tooltip code here to lay over bubbles
	var rectOpacity = 0.92;
	// tooltip triangle coordinates
	var triangleA_x = 3/7 * rectWidth;
	var triangleA_y = rectHeight;
	var triangleB_x = 4/7 * rectWidth;
	var triangleB_y = rectHeight;
	var triangleC_x = 1/2 * rectWidth;
	var triangleC_y = rectHeight + triangleHeight;

	var tooltipG = d3.select("svg#chart")
		.append("g")
		.attr("class", "tooltip-group")
		.attr("transform", "translate(" + svgDistance_x + ", " + svgDistance_y + ")");

	var tooltip = tooltipG.append("g")
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
		.attr("text-anchor", "start")
		.attr("class", "name");
	tooltip.append("text")
		.attr("dy", ".35em")
		.attr("text-anchor", "start")
		.attr("class", "region");
	tooltip.append("text")
		.attr("dy", ".35em")
		.attr("text-anchor", "start")
		.attr("class", "pubdebt");

	tooltip.append("text")
		.attr("dy", ".35em")
		.attr("text-anchor", "start")
		.attr("class", "prvdebt");

	// if indicator name too long, add append text to
	//   split indicator to lines
	if (meta[prvDebt]["label"].length > splitTextLength){
		tooltip.append("text")
		.attr("dy", ".35em")
		.attr("text-anchor", "start")
		.attr("class", "prvdebt_unit");
	}

	tooltip.append("text")
		.attr("dy", ".35em")
		.attr("text-anchor", "end")
		.attr("class", 'region_value');
	tooltip.append("text")
		.attr("dy", ".35em")
		.attr("text-anchor", "end")
		.attr("class", "pubdebt_value");
	tooltip.append("text")
		.attr("dy", ".35em")
		.attr("text-anchor", "end")
		.attr("class", "prvdebt_value");

}
