// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "smokes";

// function used for updating x-scale var upon click on axis label
function xScale(smokedata, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(smokedata, d => d[chosenXAxis]) * 0.8,
      d3.max(smokedata, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);
  
  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "smokes") {
    label = "Smoke:";
  }
  else {
    label = "income";
  }


  if (chartGroup.id === "age") {
    label2 = "ID:";
  }
  else {
    label2 = "ID: ";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`<br>${label2}${d.id}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(smokedata, err) {
  if (err) throw err;

  console.log(smokedata)

  // parse data
  smokedata.forEach(function(data) {
    data.smokes = +data.smokes;
    data.age = +data.age;
    data.income = +data.income;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(smokedata, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(smokedata, d => d.age) *.8, d3.max(smokedata, d => d.age)*1.1])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(smokedata)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.age))
    .attr("r", 20)
    .attr("fill", "lightblue")
    .attr("opacity", ".5")
    
  var circleLabels = chartGroup.selectAll(".stateText").data(smokedata).enter().append("text");

    circleLabels.transition()
      .duration(1000)
      .attr("x", function(d) {
        return xLinearScale(d[chosenXAxis]);
      })
      .attr("y", function(d) {
        return yLinearScale(d.age);
      })
      .text(function(d) {
        return d.state;
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", "10px")
      .attr("text-anchor", "middle")
      .attr("fill", "darkgray")
      .attr("class", "stateText");
      
    
    
    
    
   


  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var smokesLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "smokes") // value to grab for event listener
    .classed("active", true)
    .text("Smokers");

  var circlelable = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Income");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Age");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with valu/////////////////e
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(smokedata, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        var circleLabels = chartGroup.selectAll(".stateText");

        circleLabels.transition()  
          .duration(1000)
          .attr("x", function(d) {
            return xLinearScale(d[chosenXAxis]);
          })
          .attr("y", function(d) {
            return yLinearScale(d.age);
          })
          .text(function(d) {
            return d.state;
          })
 

        // changes classes to change bold text
        if (chosenXAxis === "income") {
          circlelable
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          circlelable
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
// }).catch(function(error) {
//   console.log(error);
});
