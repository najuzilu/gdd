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
