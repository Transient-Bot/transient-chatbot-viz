// Set dimensions and margin
var margin = { top: 10, right: 30, bottom: 30, left: 40 },
  width = 2500 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom,
  rectWidth = 120,
  rectHeight = 42;

var x;
var y;

function createArchitectureGraph() {
  // Append svg object
  var archSvg = d3
    .select("#arch_viz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Initialize dependencies
  var dependency = archSvg
    .selectAll("line")
    .data(dependencies)
    .enter()
    .append("line")
    .style("stroke", "#aaa");

  // Initialize services
  var service = archSvg
    .append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(services)
    .enter()
    .append("g")
    .on("click", selectService);

  service
    .append("rect")
    .attr("id", "service-rect")
    .attr("width", rectWidth)
    .attr("height", rectHeight)
    .attr("fill", "#74abed")
    .attr("x", -(rectWidth / 2))
    .attr("y", -(rectHeight / 2));

  service
    .append("text")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .text(function (d) {
      return d.name;
    });

  // Let's list the force we wanna apply on the network
  var simulation = d3
    .forceSimulation(services) // Force algorithm is applied to data.nodes
    .force(
      "link",
      d3
        .forceLink() // This force provides links between nodes
        .id(function (d) {
          return d.id;
        }) // This provide  the id of a node
        .links(dependencies) // and this the list of links
        .distance(100)
    )
    .force("charge", d3.forceManyBody().strength(-400).distanceMax([150])) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
    .force("center", d3.forceCenter(width / 2, height / 2)) // This force attracts nodes to the center of the svg area
    .force("collision", d3.forceCollide(rectWidth))
    .on("end", ticked);

  // This function is run at each iteration of the force algorithm, updating the nodes position.
  function ticked() {
    dependency
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });

    service.attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  }

  function selectService(service) {
    highlightService(service.name);
  }
}

function createDataGraph() {
  // Remove old graphs
  d3.selectAll("#data-svg").remove();

  // Append svg object
  var dataSvg = d3
    .select("#data_viz")
    .append("svg")
    .attr("id", "data-svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("id", "data-svg-g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Add x axis
  x = d3
    .scaleLinear()
    .domain(
      d3.extent(serviceData, function (d) {
        return d.time;
      })
    )
    .range([0, width])
    .nice();
  var xGrid = dataSvg
    .append("g")
    .attr("class", "grid")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(-height).tickFormat(""));
  var xAxis = dataSvg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add y axis
  y = d3.scaleLinear().domain([0, 110]).range([height, 0]).nice();
  dataSvg
    .append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y).tickSize(-width).tickFormat(""));
  dataSvg.append("g").call(d3.axisLeft(y));

  // Get closest x index of mouse
  var bisect = d3.bisector(function (d) {
    return d.time;
  }).left;


  // Add clip path
  var clip = dataSvg
    .append("defs")
    .append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", width)
    .attr("height", height)
    .attr("x", 0)
    .attr("y", 0);

  // Create brush
  var brush = d3
    .brushX()
    .extent([
      [0, 0],
      [width, height],
    ])
    .on("end", updateChart);

  var lineChart = dataSvg
    .append('g')
    .attr('clip-path', "url(#clip)")
    .attr('id', 'line-chart');

  // Add line
  lineChart
    .append("path")
    .attr('id', 'data-line')
    .datum(serviceData)
    .attr("fill", "rgba(116,171,237,0.2)")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.0)
    .attr(
      "d",
      d3
        .area()
        .x(function (d) {
          return x(d.time);
        })
        .y0(y(0))
        .y1(function (d) {
          return y(d.qos);
        })
    );

  // Add brush
  lineChart.append("g").attr("class", "brush").call(brush);

  var idleTimeout;
  function idled() {
    idleTimeout = null;
  }

  function updateChart() {
    extent = d3.event.selection;

    // Update domain
    if(!extent){
      if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
      x.domain(
        d3.extent(serviceData, function (d) {
          return d.time;
        })
      )
    } else {
      x.domain([x.invert(extent[0]), x.invert(extent[1])]);
      lineChart.select(".brush").call(brush.move, null);
    }

    // Update axis and line
    xGrid.transition().duration(1000).call(d3.axisBottom(x).tickSize(-height).tickFormat(""));
    xAxis.transition().duration(1000).call(d3.axisBottom(x));

    // Update data line
    lineChart
      .select("#data-line")
      .transition()
      .duration(1000)
      .attr(
        "d",
        d3
          .area()
          .x(function (d) {
            return x(d.time);
          })
          .y0(y(0))
          .y1(function (d) {
            return y(d.qos);
          })
      );
    
    // Update specification line
    lineChart
      .select('#specification-line')
      .transition()
      .duration(1000)
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return x(d.time);
          })
          .y(function (d) {
            return y(d.qos);
          })
      );
  }

  if (specificationIsHidden === false) {   
    var cause = document.getElementById('causes').value;         
    fetchSpecification(selectedService.id, cause);
  }
}

function drawSpecification(specification) {
  const max_initial_loss = specification.max_initial_loss;
  const max_recovery_time = specification.max_recovery_time;

  data = [
    {
      qos: 100,
      time: 0.0,
    },
  ];

  // Create dataset
  for (var i = 0; i < serviceData.length; i++) {
    var elem = serviceData[i];
    if (elem.qos < expected_qos) {
      if (isInitialLoss(i, max_initial_loss)) {
        var initialLoss = getInitialLoss(i);
        data.push({ qos: 100, time: initialLoss.time });
        data.push({
          qos: parseFloat(100 - max_initial_loss),
          time: initialLoss.time,
        });
        break;
      }
    }
  }

  var startpoint = parseFloat(data[data.length - 1].time);
  var endpoint = startpoint + parseFloat(max_recovery_time);

  data.push({ qos: 100, time: endpoint });
  data.push({ qos: 100, time: serviceData[serviceData.length - 1].time });

  d3.select("#line-chart")
    .append("path")
    .attr('id', 'specification-line')
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 2.0)
    .attr(
      "d",
      d3
        .line()
        .x(function (d) {
          return x(d.time);
        })
        .y(function (d) {
          return y(d.qos);
        })
    );

  function isInitialLoss(index, max_initial_loss) {
    const lastIndex =
      serviceData.length >= index + 5 ? index + 5 : serviceData.length - 1;
    var nextValues = serviceData.slice(index, lastIndex);
    var qosValues = nextValues.map((service) => service.qos);
    var avg = qosValues.reduce((a, b) => a + b) / qosValues.length;
    var loss = expected_qos - avg;

    if (loss > max_initial_loss) {
      return true;
    }
    return false;
  }

  function getInitialLoss(index) {
    const lastIndex =
      serviceData.length >= index + 5 ? index + 5 : serviceData.length - 1;
    var nextValues = serviceData.slice(index, lastIndex);

    var minimum = serviceData[index];
    for (var j = 0; j < nextValues.length; j++) {
      if (nextValues[j].qos < minimum.qos) {
        minimum = nextValues[j];
      }
    }

    return minimum;
  }
}

function removeSpecificationPath() {
  d3.selectAll('#specification-line').remove();
  specification = null;
}

// Draws a histogram of the resilience loss
function drawTransientLossGraph() {
  // Remove old graphs
  d3.selectAll("#loss-svg").remove();

  // Append svg object
  var lossSvg = d3
    .select("#loss_viz")
    .append("svg")
    .attr("id", "loss-svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("id", "loss-svg-g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Add x axis
  var xAxis = d3
    .scaleBand()
    .domain(
      d3.extent(serviceData, function (d) {
        return d.time;
      })
    )
    .range([0, width]);

  lossSvg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add y axis
  var y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

  lossSvg.append("g").call(d3.axisLeft(y));

  // function createResilienceLossData(input) {

  // }
}
