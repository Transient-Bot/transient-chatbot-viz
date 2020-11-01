socket.onmessage = function (e) {
  const data = JSON.parse(e.data);
  const intent = data.intent;
  const params = data.params;
  console.log('Received intent: ' + intent + ' with param: ' + params);

  if (intent === null || params === null) {
    return;
  }

  switch (intent) {
    case Intent.SELECT_SERVICE:
      if (params.service_name !== null) {
        highlightService(params.service_name);
      }
      break;
    case Intent.SHOW_SPECIFIACTION:
      showSpecification(params.tb_cause);
      break;
    case Intent.DELETE_SPECIFICATION:
      handleDeleteSpecification(params.service_name, params.tb_cause);
      break;
    case Intent.EDIT_SPECIFICATION_LOSS:
      handleEditSpecification(params.service_name, params.tb_cause)
      break;
    case Intent.EDIT_SPECIFICATION_RECOVERY_TIME:
      handleEditSpecification(params.service_name, params.tb_cause)
      break;
    default:
      break;
  }

  if (
    intent === 'Select Service' &&
    params !== null &&
    params.service_name !== null
  ) {
    highlightService(params.service_name);
  }
};

socket.onclose = function (e) {
  console.error('Chat socket closed');
};

function highlightService(serviceName) {
  // deselect possible selected services
  d3.selectAll('#service-rect').style('stroke', 'none');

  // select service
  d3.selectAll('#service-rect')
    .filter(function (d) {
      return d.name === serviceName;
    })
    .style('stroke', 'red')
    .attr('stroke-width', '4.0');

  // load data and create chart for service
  var filteredServices = services.filter((service) => {
    return service.name == serviceName;
  });

  var service = filteredServices[0];
  selectedService = service;

  populateEndpointsSelect(service);
}

function handleDeleteSpecification(service_name, cause) {
  if (service_name === null || cause === null) {
    return;
  }

  // Check if specification is visualized right now
  if (
    service_name === selectedService.name &&
    cause === specification.cause
  ) {
    var deleteBtn = document.getElementById('deleteSpecBtn');
    var editBtn = document.getElementById('editSpecBtn');
    var addBtn = document.getElementById('addSpecBtn');

    removeSpecificationPath();
    deleteBtn.style.display = 'none';
    editBtn.style.display = 'none';
    addBtn.style.display = 'inline';
  }
}

function handleEditSpecification(service_name, cause) {
  if (service_name === null || cause === null) {
    return;
  }

  // Check if specification is visualized right now
  if (
    service_name === selectedService.name &&
    cause === specification.cause
  ) {
    removeSpecificationPath();
    fetchSpecification(selectedService.id, cause)
  }
}