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
  d3.selectAll("rect").style("fill", "#69b3a2");

  d3.selectAll("rect")
    .filter(function (d) {
      return d.name === serviceName;
    })
    .style("fill", "red");
}

// Set dimensions and margin
var margin = { top: 10, right: 30, bottom: 30, left: 40 },
  width = 500 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// Append svg object
var svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("data.json", function (data) {
  // Initialize dependencies
  var dependency = svg
    .selectAll("line")
    .data(data.dependencies)
    .enter()
    .append("line")
    .style("stroke", "#aaa");

  // Initialize services
  var service = svg
    .selectAll("rect")
    .data(data.services)
    .enter()
    .append("rect")
    .attr("width", 120)
    .attr("height", 20)
    .style("fill", "#69b3a2");

    var serviceLabels = svg
        .selectAll("text.label")
        .data(data.services)
        .enter()
        .append("text")
        .attr("fill", "black")
        .text(function(d) { return d.name; });

  // Let's list the force we wanna apply on the network
  var simulation = d3
    .forceSimulation(data.services) // Force algorithm is applied to data.nodes
    .force("link",
        d3.forceLink() // This force provides links between nodes
            .id(function (d) { return d.id; }) // This provide  the id of a node
            .links(data.dependencies) // and this the list of links     
            .distance(75)       
    )
    .force("charge", d3.forceManyBody().strength(-400).distanceMax([150])) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
    .force("center", d3.forceCenter(width / 2, height / 2)) // This force attracts nodes to the center of the svg area
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
      .attr("x", function (d) {
        return d.x - 10;
      })
      .attr("y", function (d) {
        return d.y - 10;
      });

      serviceLabels.attr("transform", function(d) {
          return "translate(" + (d.x - 10) + "," + (d.y + 5) + ")";
      });
  }
});
