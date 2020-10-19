const expected_qos = 100;

var services;
var dependencies;
var serviceData;
var specification;

const socket = new WebSocket(
  "ws://transient-chatbot-service.herokuapp.com/ws/test/"
);

fetchServices();
fetchDependencies();

