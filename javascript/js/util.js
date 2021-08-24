function cleanData(data, x, r){
	var new_data = [];

	data.forEach(function(item, index) {
		if (!(isNaN(item[x]) || isNaN(item[r]))){
			new_data.push(item);
		}
	})
	return new_data;
}

function debtRatioStat(data, pubDebt, prvDebt, xValue){
	// count how many bubbles are to the left
	// of xValue
	var totalCount = data.length;
	var count = d3.count(data, function(d){
		if (d[pubDebt] <= xValue){
			return d[prvDebt];
		}
	});
	return [count, totalCount];
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

function calculateDividers(r_max){
	var start = 1;
	var end = Math.ceil(r_max / 100) * 100;
	if (r_max < 100) {
		var count = parseInt(end/50);
	} else if (r_max < 200) {
		var count = parseInt(end/100);
	} else if (r_max < 300) {
		var count = parseInt(end/100);
	} else {
		var count = parseInt(end/200);
	}
	var circlesCount = d3.ticks(start, end, count);
	return circlesCount;
}
