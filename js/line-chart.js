
var parseDate = d3.timeParse("%m/%Y");
var formatDate = d3.timeFormat("%B %Y");


/*
 * Linechart - Object constructor function
 * @param _parentElement -- the HTML element in which to draw the line chart
 * @param _data	-- the data
 */

Linechart = function(_parentElement, _data) {
	this.parentElement = _parentElement;
	this.data = _data;
	this.measure = "HeroinCrimes";
	this.dateAHOPE = parseDate("10/2016");
    this.dateBILL4056 = parseDate("03/2016");
    this.dateMARIJUANABALLOT = parseDate("12/2016");

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

    // Trend lines (policy lines defined later because they need to be deleted depending on user selection)
    vis.trendPath = vis.svg.append("path");

	// Line labels
	vis.policyTextAHOPE = vis.svg.append("text")
    vis.policyTextBILL4056 = vis.svg.append("text")
    vis.policyTextMARIJUANABALLOT = vis.svg.append("text")

    // Tooltips
    vis.trendTip = d3.tip()
        .attr('class', 'trend-tip')
        .offset([-10, 0]);
    vis.svg.call(vis.trendTip);

    vis.policyTipAHOPE = d3.tip()
        .attr('class', 'policy-tip')
        .offset([-10, 0]);
    vis.svg.call(vis.policyTipAHOPE);

    vis.policyTipBILL4056 = d3.tip()
        .attr('class', 'policy-tip')
        .offset([-10, 0]);
    vis.svg.call(vis.policyTipBILL4056);

    vis.policyTipMARIJUANABALLOT = d3.tip()
        .attr('class', 'policy-tip')
        .offset([-10, 0]);
    vis.svg.call(vis.policyTipMARIJUANABALLOT);

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
	vis.yAxisGroup.transition().duration(1000).call(vis.yAxis);

    // Draw paths
    vis.trendPath.datum(vis.data)
        .attr("class", "trend-line")
		.transition()
		.duration(700)
        .attr("d", vis.line(vis.data));

    // Remove irrelevant policy lines and redraw appropriate ones
    d3.selectAll(".policy-line").remove();
    vis.policyPathAHOPE = vis.svg.append("line");
    vis.policyPathBILL4056 = vis.svg.append("line");
    vis.policyPathMARIJUANABALLOT = vis.svg.append("line");


    if (vis.measure==="HeroinCrimes" || vis.measure==="NumbNeedleReports") {
        // AHOPE - Oct 2016
        vis.policyPathAHOPE
            .attr("class", "policy-line")
            .attr("x1", vis.x(vis.dateAHOPE))
            .attr("y1", 0)
            .attr("x2", vis.x(vis.dateAHOPE))
            .attr("y2", vis.height);

        // Bill H.4056 (An Act relative to substance use, treatment, education and prevention) -- March 2016
        vis.policyPathBILL4056
            .attr("class", "policy-line")
            .attr("x1", vis.x(vis.dateBILL4056))
            .attr("y1", 0)
            .attr("x2", vis.x(vis.dateBILL4056))
            .attr("y2", vis.height);
    }
    else {
        // Recreational marijuana - Dec 2016
        vis.policyPathMARIJUANABALLOT
            .attr("class", "policy-line")
            .attr("x1", vis.x(vis.dateMARIJUANABALLOT))
            .attr("y1", 0)
            .attr("x2", vis.x(vis.dateMARIJUANABALLOT))
            .attr("y2", vis.height);
    }


    // Update tooltips
    if (vis.measure==="HeroinCrimes" || vis.measure==="WeedCrimes") {
        vis.trendTip.html(function(d) { return "<strong>" + formatDate(d.date) + "</strong>: " + d[vis.measure] + " reported incidents"; });
    }
    else {
        vis.trendTip.html(function(d) { return "<strong>" + formatDate(d.date) + "</strong>: " + d[vis.measure] + " requests"; });
    }
    vis.policyTipAHOPE.html("Access, Harm Reduction, Overdose Prevention<br>and Education (AHOPE) services began.");
    vis.policyTipBILL4056.html("Act Relative to Substance Use, Treatment,<br>Education and Prevention (Bill H.4056) enacted.");
    vis.policyTipMARIJUANABALLOT.html("Recreational marijuana legalized via ballot measure.");

    // Draw circles
    vis.trendCircles = vis.svg.selectAll("circle")
        .data(vis.data);
    vis.trendCircles.exit().remove();
    vis.trendCircles.enter()
        .append("circle")
        .attr("class", "trend-circle")
		.attr("r", 4.5)
        .on("mouseover", vis.trendTip.show)
        .on("mouseout", vis.trendTip.hide)
        .merge(vis.trendCircles)
        .transition()
        .duration(1500)
        .attr("cx", function(d) { return vis.x(d.date); })
        .attr("cy", function(d) { return vis.y(d[vis.measure]); });

    if (vis.measure==="HeroinCrimes" || vis.measure==="NumbNeedleReports") {
        vis.policyCircleAHOPE = vis.svg
            .append("circle")
            .attr("class", "policy-circle")
            .attr("cx", vis.x(vis.dateAHOPE))
            .attr("cy", 0)
            .attr("r", 4.5)
            .on("mouseover", vis.policyTipAHOPE.show)
            .on("mouseout", vis.policyTipAHOPE.hide)

        vis.policyCircleBILL4056 = vis.svg
            .append("circle")
            .attr("class", "policy-circle")
            .attr("cx", vis.x(vis.dateBILL4056))
            .attr("cy", 0)
            .attr("r", 4.5)
            .on("mouseover", vis.policyTipBILL4056.show)
            .on("mouseout", vis.policyTipBILL4056.hide)
    }
    else {
        vis.policyCircleMARIJUANABALLOT = vis.svg
            .append("circle")
            .attr("class", "policy-circle")
            .attr("cx", vis.x(vis.dateMARIJUANABALLOT))
            .attr("cy", 0)
            .attr("r", 4.5)
            .on("mouseover", vis.policyTipMARIJUANABALLOT.show)
            .on("mouseout", vis.policyTipMARIJUANABALLOT.hide)
    }

};

