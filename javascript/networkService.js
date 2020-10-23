function fetchServices() {
  fetch(baseUrl + servicesPath)
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
  fetch(baseUrl + dependenciesPath)
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

function fetchServiceData(serviceId, callId) {
  fetch(
    baseUrl + serviceDataPath + "?service=" + serviceId + "&callid=" + callId
  )
    .then((res) => res.json())
    .then(
      (result) => {
        serviceData = result;
        if (serviceData != null) {
          createDataGraph();
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
    baseUrl + specificationsPath + "?service=" + serviceId + "&cause=" + cause
  )
    .then((res) => res.json())
    .then(
      (result) => {
        specification = result[0];
        handleSpecification();
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

function deleteSpecificationRequest(specificationId) {
  fetch(baseUrl + specificationsPath + specificationId + "/", {
    method: "DELETE",
  });
}

function postSpecification(
  serviceId,
  cause,
  initialLoss,
  recoveryTime,
  resilienceLoss
) {
  fetch(baseUrl + specificationsPath, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      service: serviceId,
      cause: cause,
      max_initial_loss: initialLoss,
      max_recovery_time: recoveryTime,
      max_lor: resilienceLoss,
    }),
  })
    .then((res) => res.json())
    .then(
      (result) => {
        specification = result;
        handleSpecification();
      },
      (error) => {
        console.log(
          "Error while posting specification for service " +
            serviceId +
            " and cause " +
            cause +
            ": " +
            error
        );
      }
    );
}
