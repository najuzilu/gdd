// Create bubbles
	var colors=['#FFD166','#C6DABF','rgb(125, 207, 182)','rgb(0, 178, 202)','rgb(29, 78, 137)'];

	// Create force simulation
	var simDistribution = gaussianDistance_y;
	var dotDistance_x = gaussianDistance_x;
	var dotDistance_y = gaussianDistance_y;

	var simulation = d3.forceSimulation(data)
		.force("x",
			d3.forceX()
				.strength(0.2)
				.x(d => xScale(d[pubDebt]))
		)
		.force("y",
			d3.forceY()
				.strength(0.2)
				.y(d => simDistribution)
		)
		.force("collide",
			d3.forceCollide()
				.radius(function(d){
					return rScale(d[r_indicator]);
				})
				.strength(0.8)
		)
		.alpha(1.5);

	// setup bubbles
	var g = svg.selectAll("g.node")
		.data(simulation.nodes())
		.join("g")
		.attr("class", "node")
		.call(g => g
			.append("circle")
				.attr("r", d => rScale(d[r_indicator]))
				.style("fill", function(d){
					// set color on desired variable
					// but first convert to %
					color_var = d[r_indicator] * 100;
		  			if (color_var >= 0 & color_var < 100) {
		  				return colors[0];
		  			} else if (color_var >= 100 & color_var < 200) {
		  				return colors[1];
		  			} else if (color_var >= 200 & color_var < 300) {
		  				return colors[2];
		  			} else if (color_var >= 300 & color_var < 400) {
		  				return colors[3];
		  			} else {
		  				return colors[4];
		  			};
				})
				.style("opacity", 0.85)
		);

	simulation.on("tick", () => g.attr('transform', d => `translate(${ d.x },${ d.y })`) );