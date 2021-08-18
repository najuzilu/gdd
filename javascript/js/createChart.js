function createChart(data, pubDebt, prvDebt){

	var x_indicator = pubDebt;
	var r_indicator = prvDebt;
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

	// Function creates a distance threshold
	var originCheck = function(a,b){
		if (a < b){
			return b;
		} else {
			return a;
		}
	}

	// remove svg if exists
	$("svg#chart").remove();

	// Get width and set height
	var width = $(".chart").parent().width();
	var height = width / 2.8;
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
		.attr("id", "chart")
		.style("width", width)
		.style("height", height)
		.style("overflow", "visible")
		.style("padding-top", "30px")
		.style("background-color", "rgba(240, 240, 240, 0.5)")
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
	var rDomain_min = 0;
	var rDomain_max = r_max;
	var rRange_min = width / 240;
	var rRange_max = width / 55;

	var rScale = d3.scaleSqrt()
		.domain([rDomain_min, rDomain_max])
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

	// create xAxis label
	var labelDistance_lx = width / 2.35;
	var labelDistance_ly = xAxisDistance_y - 50;
	var underlabelDistance_lx = width / 2;
	var underlabelDistance_ly = xAxisDistance_y - 30;

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


	// Setting line for distribution
	var gaussianDistance_x = xAxisDistance_x;
	var gaussianDistance_y = xAxisDistance_y + width * 0.14;
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
	var strength = 1;
	var alpha = 1;

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
			.attr("cy",function(d){return d.y;});
	}

	simulation.nodes(data)
		.on('tick',ticked);


	// Create bubbles
	var bubDistance_x = 0;
	var bubDistance_y = 0;
	// var colors = ['#466e12','#77bc1f','#C5E0B4','#A9DDEB','#009bde','#002060'].reverse();
	var colors = ['#FFD166','#C6DABF','rgb(125, 207, 182)','rgb(0, 178, 202)','rgb(29, 78, 137)'];
	var rDiv = Array.from(
	{length: tickNo}, (v, k) => k * parseInt(((rDomain_max - rDomain_min) / tickNo) + rDomain_min)
	);

	// Variables for tooltip on bubbles
	var rectWidth = 330;
	var splitTextLength = 40;

	if (meta[prvDebt]["label"].length > splitTextLength) {
		var rectHeight = 80;
	} else{
		var rectHeight = 70;
	}

	var triangleHeight = rectHeight / 7;
	var tooltipDistance_x = rectWidth / 2;
	var tooltipDistance_y = rectHeight + triangleHeight;

	// Setup bubbles
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
				if (d[r_indicator] < 0) {
					return "grey";
				}
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

				// start x,y coordinates of tooltip titles
				//   and indicator names
				var tooltipTitle_x = 1/25 * rectWidth;
				var tooltipInd1_x = tooltipTitle_x;
				var tooltipInd2_x = tooltipInd1_x;
				var tooltipInd3_x = tooltipInd2_x;


				// fix tooltip coordinates if private debt indicator
				// 	name is too long
				if (meta[prvDebt]["label"].length > splitTextLength){
					var tooltipTitle_y = 1/5 * rectHeight;
					var tooltipInd1_y = 2 * tooltipTitle_y;
					var tooltipInd2_y = 3 * tooltipTitle_y;
					var tooltipInd3_y = 4 * tooltipTitle_y;
					// fix indicator value y coordinate
					var tooltipInd2_val_y = tooltipInd3_y;
				} else {
					var tooltipTitle_y = 1/4 * rectHeight;
					var tooltipInd1_y = 2 * tooltipTitle_y;
					var tooltipInd2_y = 3 * tooltipTitle_y;
					var tooltipInd3_y = null;
					// fix indicator value y coordinate
					var tooltipInd2_val_y = tooltipInd2_y;
				}

				// start coordinates of tooltip indicator values
				var tooltipInd1_val_x = rectWidth - tooltipInd1_x;
				var tooltipInd1_val_y = tooltipInd1_y;
				var tooltipInd2_val_x = tooltipInd1_val_x;

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

				tooltip.select("text.pubdebt")
					.attr("x", tooltipInd1_x)
					.attr("y", tooltipInd1_y)
					.style("fill", "#262626")
					.text(meta[pubDebt]["label"] + " (% of GDP):");

				// private debt variables too long, append unit below
				if (meta[prvDebt]["label"].length > splitTextLength) {
					var indi2Text = meta[prvDebt]["label"] + " (% of GDP):";
					var arr = indi2Text.split(" ")
					var firstHalf = arr.slice(0, arr.length/2).join(" ");
					var secondHalf = arr.slice(arr.length/2, arr.length).join(" ");

					tooltip.select("text.prvdebt")
						.attr("x", tooltipInd2_x)
						.attr("y",tooltipInd2_y)
						.style("fill","#262626")
						.text(firstHalf);

					tooltip.select("text.prvdebt_unit")
						.attr("x", tooltipInd3_x)
						.attr("y",tooltipInd3_y)
						.style("fill","#262626")
						.text(secondHalf);
				} else {
					tooltip.select("text.prvdebt")
						.attr("x", tooltipInd2_x)
						.attr("y",tooltipInd2_y)
						.style("fill","#262626")
						.text(meta[prvDebt]["label"]+ " (% of GDP):");
				}

				tooltip.select("text.pubdebt_value")
					.attr("x", tooltipInd1_val_x)
					.attr("y", tooltipInd1_val_y)
					.style("font-weight","bold")
					.style("fill", "#262626")
					.text(format(d[pubDebt]));

				tooltip.select("text.prvdebt_value")
					.attr("x", tooltipInd2_val_x)
					.attr("y", tooltipInd2_val_y)
					.style("font-weight","bold")
					.style("fill", "#262626")
					.text(format(d[prvDebt]));
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
		.attr("class", "pubdebt_value");
	tooltip.append("text")
		.attr("dy", ".35em")
		.attr("text-anchor", "end")
		.attr("class", "prvdebt_value");

}