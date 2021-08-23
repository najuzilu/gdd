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
