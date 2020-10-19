function fetchServices() {
  fetch("https://transient-chatbot-service.herokuapp.com/api/services/")
    .then((res) => res.json())
    .then(
      (result) => {
        services = result;
        if (services != null && dependencies != null) {
          createArchitectureGraph();
        }
      },
      (error) => {
        console.log("Error while fetching services: " + error);
      }
    );
}

function fetchDependencies() {
  fetch("https://transient-chatbot-service.herokuapp.com/api/dependencies/")
    .then((res) => res.json())
    .then(
      (result) => {
        dependencies = result;
        if (services != null && dependencies != null) {
          createArchitectureGraph();
        }
      },
      (error) => {
        console.log("Error while fetching dependencies: " + error);
      }
    );
}

function fetchServiceData(serviceId) {
  var callId;
  if (serviceId == 5) {
    callId = 2;
  } else {
    callId = 5;
  }

  fetch(
    "https://transient-chatbot-service.herokuapp.com/api/servicedata?service=" +
      serviceId +
      "&callid=" +
      callId
  )
    .then((res) => res.json())
    .then(
      (result) => {
        serviceData = result;
        if (serviceData != null) {
          createDataGraph();
        }
        if (specification != null) {
            drawSpecification(specification);
        }
      },
      (error) => {
        console.log(
          "Error while fetching service data for service " +
            serviceId +
            ": " +
            error
        );
      }
    );
}

function fetchSpecification(serviceId, cause) {
  fetch(
    "https://transient-chatbot-service.herokuapp.com/api/specifications?service=" +
      serviceId +
      "&cause=" +
      cause
  )
    .then((res) => res.json())
    .then(
      (result) => {
          specification = result[0];
          if (serviceData != null && specification != null) {
            drawSpecification(specification);
          }
      },
      (error) => {
        console.log(
          "Error while fetching specification for service " +
            serviceId +
            " and cause " +
            cause +
            ": " +
            error
        );
      }
    );
}
