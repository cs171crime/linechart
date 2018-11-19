
var parseDate = d3.timeParse("%m/%Y");
var formatDate = d3.timeFormat("%m/%Y");


/*
 * Linechart - Object constructor function
 * @param _parentElement -- the HTML element in which to draw the line chart
 * @param _data	-- the data
 */

Linechart = function(_parentElement, _data) {
	this.parentElement = _parentElement;
	this.data = _data;
	this.measure = "HeroinCrimes";

    this.initVis();
};


Linechart.prototype.initVis = function() {
	var vis = this;

	// Set up SVG drawing area 
	var colWidth = $("#line-chart").width();

	vis.margin = {top: 40, right: 40, bottom: 40, left: 40};

    vis.width = colWidth - vis.margin.left - vis.margin.right,
        vis.height = 300 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Axes
    vis.x = d3.scaleTime()
        .range([0, vis.width]);
    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom();
    vis.yAxis = d3.axisLeft();

    vis.xAxisGroup = vis.svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0," + vis.height + ")");
    vis.yAxisGroup = vis.svg.append("g")
        .attr("class", "axis y-axis")

    // Lines
    vis.trendPath = vis.svg.append("path");
    vis.policyPathAHOPE = vis.svg.append("line");
    vis.policyPathBILL4056 = vis.svg.append("line");
    vis.policyPathMARIJUANABALLOT = vis.svg.append("line");
    vis.policyPathNEEDLEPICKUP = vis.svg.append("line"); // need to add this to the plot

	// Line labels
	vis.policyTextAHOPE = vis.svg.append("text")
    vis.policyTextBILL4056 = vis.svg.append("text")
    vis.policyTextMARIJUANABALLOT = vis.svg.append("text")
    vis.policyTextNEEDLEPICKUP = vis.svg.append("text")

    // Tooltip
    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0]);
    vis.svg.call(vis.tip);

    // call wrangleData
    vis.wrangleData();
};


Linechart.prototype.wrangleData = function() {
	var vis = this;

	// Update domains
	vis.x.domain([
		d3.min(vis.data, function(d) { return d.date; }),
		d3.max(vis.data, function(d) { return d.date; })
	]);
    vis.y.domain([
        d3.min(vis.data, function(d) { return d[vis.measure]; }),
        d3.max(vis.data, function(d) { return d[vis.measure]; })
    ]);

    // Update axes
	vis.xAxis.scale(vis.x);
	vis.yAxis.scale(vis.y);

	// Create path generator
    vis.line = d3.line()
        .curve(d3.curveMonotoneX)
        .x(function(d) { return vis.x(d.date); })
        .y(function(d) { return vis.y(d[vis.measure]); });

	// call updateVis
	vis.updateVis();
};


Linechart.prototype.updateVis = function() {
	var vis = this;

	// Draw axes
	vis.xAxisGroup.call(vis.xAxis);
	vis.yAxisGroup.transition().duration(3000).call(vis.yAxis);

    // Draw paths
    vis.trendPath.datum(vis.data)
        .attr("class", "trend-line")
		.transition()
		.duration(2000)
        .attr("d", vis.line(vis.data));

    // TO ADD
	// if statements to draw and label line for the policy based on selected measure
	//

	// AHOPE - Oct 2016
    vis.policyPathAHOPE
		.attr("class", "policy-line")
		.attr("x1", vis.x(parseDate("10/2016")))
        .attr("y1", 0)
        .attr("x2", vis.x(parseDate("10/2016")))
        .attr("y2", vis.height);
	// vis.policyTextAHOPE
	// 	.attr("class", "policy-text")
    //     .attr("x", vis.x(parseDate("10/2016")))
    //     .attr("y", 0)
	// 	.text("AHOPE created")


    // Bill H.4056 (An Act relative to substance use, treatment, education and prevention) -- March 2016
    vis.policyPathBILL4056
        .attr("class", "policy-line")
        .attr("x1", vis.x(parseDate("03/2016")))
        .attr("y1", 0)
        .attr("x2", vis.x(parseDate("03/2016")))
        .attr("y2", vis.height);

    // Recreational marijuana - Dec 2016
    vis.policyPathMARIJUANABALLOT
        .attr("class", "policy-line")
        .attr("x1", vis.x(parseDate("12/2016")))
        .attr("y1", 0)
        .attr("x2", vis.x(parseDate("12/2016")))
        .attr("y2", vis.height);

    // Needle pickup


    // Update tooltip
    vis.tip.html(function(d) { return "<strong>" + formatDate(d.date) + "</strong>: " + d[vis.measure]; });

    // Draw circles
    vis.circles = vis.svg.selectAll("circle")
        .data(vis.data);
    vis.circles.exit().remove();
    vis.circles.enter()
        .append("circle")
        .attr("class", "circle")
		.attr("r", 4.5)
.on("mouseover", vis.tip.show)
        .on("mouseout", vis.tip.hide)
        .merge(vis.circles)
        .transition()
        .duration(3500)
        .attr("cx", function(d) { return vis.x(d.date); })
        .attr("cy", function(d) { return vis.y(d[vis.measure]); });
};

