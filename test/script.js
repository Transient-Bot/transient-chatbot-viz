// Websocket stuff
const socket = new WebSocket(
  "ws://transient-chatbot-service.herokuapp.com/ws/test/"
);

socket.onmessage = function (e) {
  const data = JSON.parse(e.data);
  const intent = data.intent;
  const param = data.param;
  console.log("Received intent: " + intent + " with param: " + param);

  if (intent === "Select Service" && param !== null) {
    highlightService(param);
  }
};

socket.onclose = function (e) {
  console.error("Chat socket closed");
};

function highlightService(serviceName) {
  d3.selectAll("#service-rect").style("fill", "#74abed");

  d3.selectAll("#service-rect")
    .filter(function (d) {
      return d.name === serviceName;
    })
    .style("fill", "red");
}

// Set dimensions and margin
var margin = { top: 10, right: 30, bottom: 30, left: 40 },
  width = 2500 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom,
  rectWidth = 120,
  rectHeight = 42;

// Append svg object
var archSvg = d3
  .select("#arch_viz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var dataSvg = d3
  .select("#data_viz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


d3.queue()
  .defer(d3.json, 'https://transient-chatbot-service.herokuapp.com/api/services/')
  .defer(d3.json, 'https://transient-chatbot-service.herokuapp.com/api/dependencies/')
  .await(createArchitectureGraph);

const service = 5;
d3.queue()
  .defer(d3.json, 'https://transient-chatbot-service.herokuapp.com/api/servicedata?service=' + service)
  .await(createDataGraph);

function createArchitectureGraph(err, ...data) {
  const serviceData = data[0];
  const dependencyData = data[1];

  // Initialize dependencies
  var dependency = archSvg
    .selectAll("line")
    .data(dependencyData)
    .enter()
    .append("line")
    .style("stroke", "#aaa");

  // Initialize services
  var service = archSvg.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(serviceData)
    .enter()
    .append("g")
    .on("click", selectService);

  service.append("rect")
    .attr("id", "service-rect")
    .attr("width", rectWidth)
    .attr("height", rectHeight)
    .attr("fill", "#74abed")
    .attr("x", -(rectWidth / 2))
    .attr("y", -(rectHeight / 2));
  
  service.append("text")
    .attr("text-anchor", "middle")  
    .attr("dominant-baseline", "middle")
    .text(function(d) { return d.name; });

  // Let's list the force we wanna apply on the network
  var simulation = d3
    .forceSimulation(serviceData) // Force algorithm is applied to data.nodes
    .force("link",
        d3.forceLink() // This force provides links between nodes
            .id(function (d) { return d.id; }) // This provide  the id of a node
            .links(dependencyData) // and this the list of links     
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
    
    service
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
  }

  function selectService(service) {
    highlightService(service.name);
  }
}

function createDataGraph(err, ...data) {
  serviceData = data[0];
  
  // Add x axis
  var x = d3.scaleLinear()
    .domain(d3.extent(serviceData, function(d) { return d.time; }))
    .range([0, width]);
  dataSvg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add y axis
  var y = d3.scaleLinear()
    .domain([0, d3.max(serviceData, function(d) { return +d.avgResponseTime; })])
    .range([height, 0]);
  dataSvg.append("g")
    .call(d3.axisLeft(y));

  // Get closest x index of mouse
  var bisect = d3.bisector(function(d) { return d.time; }).left;

  // Add line
  dataSvg.append("path")
    .datum(serviceData)
    .attr("fill", "#8eb6e6")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(function(d) { return x(d.time) })
      .y(function(d) { return y(d.avgResponseTime) })
    );

  // Create circle that travels along chart
  var focus = dataSvg
    .append("g")
    .append("circle")
      .style("fill", "steelblue")
      .attr("r", 3.5)
      .style("opacity", 0);
  
  // Create text that travels along chart curve
  var focusText = dataSvg
    .append("g")
    .append("text")
      .style("opacity", 0)
      .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle");

  // Creat rect on top of svg that covers mouse position
  dataSvg.append("rect")
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('width', width)
    .attr('height', height)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);
  
  // What happens when the mouse move -> show the annotations at the right positions.
  function mouseover() {
    focus.style("opacity", 1)
    focusText.style("opacity",1)
  }

  function mousemove() {
    // recover coordinate we need
    var x0 = x.invert(d3.mouse(this)[0]);
    var i = bisect(serviceData, x0, 1);
    selectedData = serviceData[i]
    focus
      .attr("cx", x(selectedData.time))
      .attr("cy", y(selectedData.avgResponseTime))
    focusText
      .html(parseFloat(selectedData.time).toFixed(1) + ", " + parseFloat(selectedData.avgResponseTime).toFixed(0))
      .attr("x", x(selectedData.time)+15)
      .attr("y", y(selectedData.avgResponseTime))
  }

  function mouseout() {
    focus.style("opacity", 0)
    focusText.style("opacity", 0)
  }
}
