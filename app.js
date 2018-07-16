var width = 800;
var height = 700;
var padding = 100;

d3.queue()
	.defer(d3.csv, './data/data.csv')
  .awaitAll(function(error, data) {
    if (error) throw error;
    var yearObj = formatData(data);
    var yearRange = d3.extent(Object.keys(yearObj).map(year=>+year));


	var svg = d3.select('svg')
					.attr("width", width)
					.attr("height", height);


	svg.append('g')
        .attr('transform', 'translate(0, ' + (height - padding + 30) + ')')
        .classed('x-axis', true)
        .style('font-family', 'Rubik');

    svg.append('g')
        .attr('transform', 'translate(' + (padding - 30) + ',0)')
        .classed('y-axis', true)
        .style('font-family', 'Rubik');


    //xAxis label
    svg.append('text')
        .text('Internet Usage (% of population)')
        .attr('x', width / 2)
        .attr('y', height)
        .attr('dy', '-1.5em')
        .attr('text-anchor', 'middle')
        .style('font-family', 'Rubik');

    //yAxis Label
    svg.append('text')
        .text('Urban Population (% of population)')
        .attr('transform', 'rotate(-90)')
        .attr('x', - width / 2)
        .attr('y', '1.5em')
        .attr('text-anchor', 'middle')
        .style('font-family', 'Rubik');

    //Title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', '2em')
        .attr('text-anchor', 'middle')
        .style('font-size', '1.5em')
        .classed('title', true)
        .style('font-family', 'Rubik');

	drawGraph(yearRange[0]);


	var input = d3.select('input')
					.property('min', yearRange[0])
					.property('max', yearRange[1])
					.property('value', yearRange[0])
					.on('input',()=> drawGraph(+d3.event.target.value));



	function drawGraph(year){

		var yearData = yearObj[year];

		var xScale = d3.scaleLinear()
						.domain(d3.extent(yearData, d=>d.internetUsage))
						.range([padding, width - padding]);

		var yScale = d3.scaleLinear()
						.domain(d3.extent(yearData, d=>d.urbanPopulation))
						.range([height-padding, padding]);

		var rScale = d3.scaleLinear()
						.domain(d3.extent(yearData, d=>d.mobileSubscription))
						.range([1,30]);

		var fScale = d3.scaleLinear()
		               .domain(d3.extent(yearData, d => d.broadbandSubscription))
		               .range([d3.rgb("#007AFF"), d3.rgb('#FFF500')]);

		d3.select('.x-axis')
	        .call(d3.axisBottom(xScale));

	    d3.select('.y-axis')
	          .call(d3.axisLeft(yScale));

	   	d3.select('.title')
          .text('Internet usage vs. Urban population (' + year + ')');

	    var update = svg.selectAll('circle')
	    				.data(yearData, d=>d.country);

		update
			.exit()
			    .transition()
          		.duration(500)
          		.attr('r', 0)
			.remove();

		update
			.enter()
			.append('circle')
				.on('mousemove touchmove', showTooltip)
				.on('mouseout touchend', hideTooltip)
				.attr("cx", d => xScale(d.internetUsage))
		    	.attr("cy", d => yScale(d.urbanPopulation))

		    	.attr("stroke", "#fff")
		    .merge(update)
		       .transition()
	           .duration(500)
	           .delay((d, i) => i * 5)
		    	.attr("cx", d => xScale(d.internetUsage))
		    	.attr("cy", d => yScale(d.urbanPopulation))
		    	.attr("r", d => rScale(d.mobileSubscription))
		    	.attr("fill", d => fScale(d.broadbandSubscription));
	}	


	function showTooltip(d){
		var tooltip = d3.select('.tooltip');
		tooltip
			.style('opacity',1)
			.style('left', (d3.event.pageX - tooltip.node().offsetWidth /2) + 'px')
			.style('top', (d3.event.pageY - tooltip.node().offsetHeight -10) + 'px')
			.html(`
				<p>Country: ${d.country}</p>
	            <p>Internet Usage: ${(d.internetUsage.toFixed(2))}%</p>
	            <p>Mobile Subscription per 100: ${(d.mobileSubscription.toFixed(2))}%</p>
	            <p>Broadband Subscription per 100: ${d.broadbandSubscription.toFixed(2)}%</p>
	            <p>Urban population: ${(d.urbanPopulation.toFixed(2))}%</p>
          `)
	}

	function hideTooltip(d){
		d3.select('.tooltip')
			.style('opacity', 0);
	}
});




function formatData(data){

	var yearObj = {};

    for(let i =0; i< data[0].length; i++){
    	var arr = [];

    	//if the year does not exist in yearObj, create a new key with empty array.
    	if(!yearObj[data[0][i].year]) {
    		yearObj[data[0][i].year] = arr;
    		arr.push(parseObject(data[0][i]));
    	//If it does, just push that line to the corresponding uear
    	}else{
    		yearObj[data[0][i].year].push(parseObject(data[0][i]));
    	}
    }

    return yearObj;
}




function parseObject(data){
	var obj = {};
	obj.country = data.country;
	obj.internetUsage = +data.internetUsage;
	obj.mobileSubscription = +data.mobileSubscription;
	obj.literacyRate = +data.literacyRate;
	obj.urbanPopulation = +data.urbanPopulation;
	obj.broadbandSubscription = +data.broadbandSubscription;

	return obj;
}

