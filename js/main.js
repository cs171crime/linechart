
// Create variables to store chart
var linechart;

// Date parsing
var parseDate = d3.timeParse("%m/%Y");


d3.csv("data/lineChartData.csv", function(data) {

    // Data processing
    data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.HeroinCrimes = +d.HeroinCrimes;
        d.WeedCrimes = +d.WeedCrimes;
        d.NumbNeedleReports = +d.NumbNeedleReports;
    });

    // Sanity check
    console.log(data)

    // Instantiate line chart object
    linechart = new Linechart("line-chart", data);

    // Reach to new user input and update line chart
    d3.select("#var").on("change", updateVisualization);
});

function updateVisualization() {

    // Grab user input and save it to measure attribute
    linechart.measure = d3.select("#var").property("value");

    // update visual
    linechart.wrangleData();

};