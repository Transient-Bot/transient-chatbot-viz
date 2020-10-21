const expected_qos = 100;

var services;
var dependencies;
var serviceData;
var specification;

// Open websocket
const socket = new WebSocket(
  'ws://transient-chatbot-service.herokuapp.com/ws/test/'
);

// Fetch the components of the architecture diagram
fetchServices();
fetchDependencies();

// Change service data visualization when another endpoint is selected
document.getElementById('endpoints').addEventListener('change', (e) => {
  console.log(e.target.value);
});