socket.onmessage = function (e) {
  const data = JSON.parse(e.data);
  const intent = data.intent;
  const params = data.params;
  console.log('Received intent: ' + intent + ' with param: ' + params);

  if (intent === 'Select Service' && params !== null && params.service_name !== null) {
    highlightService(params.service_name);
  }
};

socket.onclose = function (e) {
  console.error('Chat socket closed');
};

function highlightService(serviceName) {
  // deselect possible selected services
  d3.selectAll('#service-rect').style('fill', '#74abed');

  // select service
  d3.selectAll('#service-rect')
    .filter(function (d) {
      return d.name === serviceName;
    })
    .style('fill', 'red');

  // load data and create chart for service
  var filteredServices = services.filter((service) => {
    return service.name == serviceName;
  });
  
  var service = filteredServices[0];
  fetchServiceData(service.id);
  fetchSpecification(service.id, 'failure');
}
