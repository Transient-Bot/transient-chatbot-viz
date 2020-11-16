socket.onmessage = function (e) {
  const data = JSON.parse(e.data);
  const messageType = data.type;

  switch (messageType) {
    case "interaction":
      handleVisInteraction(data);
      break;
    case "service.update":
      handleServiceUpdate(data);
      break;
    default:
      console.log("Received message but cannot handle it: " + data.type);
      break;
  }
};

socket.onclose = function (e) {
  console.error("Chat socket closed");
};

function handleVisInteraction(data) {
  const intent = data.intent;
  const params = data.params;
  console.log("Received intent: " + intent + " with param: " + params);

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
      handleShowSpecification(params.service_name, params.tb_cause);
      break;
    case Intent.ADD_SPECIFICATION:
      handleAddSpecification(params.service_name, params.tb_cause);
      break;
    case Intent.DELETE_SPECIFICATION:
      handleDeleteSpecification(params.service_name, params.tb_cause);
      break;
    case Intent.EDIT_SPECIFICATION_LOSS:
      handleAddSpecification(params.service_name, params.tb_cause);
      break;
    case Intent.EDIT_SPECIFICATION_RECOVERY_TIME:
      handleAddSpecification(params.service_name, params.tb_cause);
      break;
    default:
      break;
  }

  if (
    intent === "Select Service" &&
    params !== null &&
    params.service_name !== null
  ) {
    highlightService(params.service_name);
  }
}

function handleServiceUpdate(data) {
  const id = data.id;
  const name = data.name;
  const system = data.system;
  const endpoints = data.endoints;
  const violationDetected = data.violation_detected;

  console.log("Received service-update for service " + name);

  if (services != null && services != undefined) {
    const service = services.filter((service) => {
      return service.id == id;
    })[0];

    service.name = name;
    service.system = system;
    service.endoints = endpoints;
    service.violation_detected = violationDetected;

    const fillColor = violationDetected ? "orange" : "#74abed";
    d3.selectAll("#service-rect")
      .filter(function (d) {
        return d.id == id;
      })
      .style("fill", fillColor);
  }
}

function highlightService(serviceName) {
  // deselect possible selected services
  d3.selectAll("#service-rect").style("stroke", "none");

  // select service
  d3.selectAll("#service-rect")
    .filter(function (d) {
      return d.name === serviceName;
    })
    .style("stroke", "red")
    .attr("stroke-width", "4.0");

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
  if (service_name === selectedService.name && cause === specification.cause) {
    var deleteBtn = document.getElementById("deleteSpecBtn");
    // var editBtn = document.getElementById("editSpecBtn");
    var addBtn = document.getElementById("addSpecBtn");
    var lossContainer = document.getElementById("loss-viz-container");

    removeSpecificationPath();
    removeLossViz();
    deleteBtn.style.display = "none";
    // editBtn.style.display = "none";
    addBtn.style.display = "inline";
    lossContainer.style.display = "none";
  }
}

function handleAddSpecification(service_name, cause) {
  if (service_name === null || cause === null) {
    return;
  }

  // Check if specification is visualized right now
  if (
    service_name === selectedService.name &&
    !specificationIsHidden &&
    cause === document.getElementById("causes").value
  ) {
    removeSpecificationPath();
    removeLossViz();
    fetchSpecification(selectedService.id, cause).then((res) => {
      if (res != null) {
        const callId = document.getElementById("endpoints").value;
        fetchServiceData(selectedService.id, callId).then((data) => {
          if (data != null) {
            serviceData = data;
            createDataGraph(serviceData);
          }
          handleSpecification(res);
        });
      } else {
        const lossContainer = document.getElementById("loss-viz-container");
        const addBtn = document.getElementById("addSpecBtn");
        const deleteBtn = document.getElementById("deleteSpecBtn");
        // const editBtn = document.getElementById("editSpecBtn");

        lossContainer.style.display = "none";
        deleteBtn.style.display = "none";
        // editBtn.style.display = "none";
        addBtn.style.display = "inline";
      }
    });
  }
}

function handleShowSpecification(service_name, cause) {
  if (service_name === null || cause === null) {
    return;
  }

  if (selectedService.name !== service_name) {
    highlightService(service_name);
  }
  showSpecification(cause);
}