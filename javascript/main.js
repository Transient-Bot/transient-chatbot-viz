const expected_qos = 100;

var services;
var dependencies;
var serviceData;
var specification;
var selectedService;

// Open websocket
const socket = new WebSocket(
  'ws://transient-chatbot-service.herokuapp.com/ws/test/'
);

// Fetch the components of the architecture diagram
fetchServices();
fetchDependencies();

// Change service data visualization when another endpoint is selected
document.getElementById('endpoints').addEventListener('change', (e) => {
  const callId = e.target.value;
  fetchServiceData(selectedService.id, callId);
  fetchSpecification(selectedService.id, 'failure');
});

// 
function populateEndpointsSelect(service) {
  if (service === null || service.endpoints === null) { return; }

  var select = document.getElementById('endpoints');
  select.options.length = 0;

  if (service.id === 6) {
    // Service 6 has only one endpoint with callid 5
    var option = document.createElement('option');
    option.value = 5;
    option.text = service.endpoints[0];
    select.add(option);
  } else { 
    service.endpoints.forEach((endpoint, i) => {
      var option = document.createElement('option');
      option.value = i;
      option.text = endpoint;
      select.add(option);
    });
  }

  // Select the first value
  select.value = select.options[0].value;
  select.dispatchEvent(new Event('change'));
}