async function fetchServices() {
  const system = 'accounting-system';
  const scenario = document.getElementById('scenarios').value;

  try {
    let response = await fetch(baseUrl + servicesPath + '?system=' + system + '&scenario=' + scenario);
    let data = await response.json();
    return data;
  } catch(err) {
    console.error(
      'Error while fetching services: ' + err
    );
  }
}

async function fetchDependencies() {
  const system = 'accounting-system';
  const scenario = document.getElementById('scenarios').value;

  try {
    let response = await fetch(baseUrl + dependenciesPath + '?system=' + system + '&scenario=' + scenario);
    let data = await response.json();
    return data;
  } catch(err) {
    console.error(
      'Error while fetching dependencies: ' + err
    );
  }
}

async function fetchServiceData(serviceId, callId) {
  try {
    let response = await fetch(
      baseUrl + serviceDataPath + '?service=' + serviceId + '&callid=' + callId
    );
    let data = await response.json();
    return data;
  } catch (err) {
    console.error(
      'Error while fetching service data for service ' +
        serviceId +
        ': ' +
        err
    );
  }
}

async function fetchSpecification(serviceId, cause) {
  try {
    let response = await fetch(baseUrl + specificationsPath + '?service=' + serviceId + '&cause=' + cause);
    let data = await response.json();
    return data[0];
  } catch(err) {
    console.error(
      'Error while fetching specification for service ' +
            serviceId +
            ' and cause ' +
            cause +
            ': ' +
            err
    );
  }
}

function deleteSpecificationRequest(specificationId) {
  fetch(baseUrl + specificationsPath + specificationId + '/', {
    method: 'DELETE',
  });
}

async function postSpecification(serviceId,
  cause,
  initialLoss,
  recoveryTime,
  resilienceLoss
) {
  let headers = {
    'Accept': 'application/json',
    'Content-type': 'application/json',
  };

  let body = JSON.stringify({
    service: serviceId,
    cause: cause,
    max_initial_loss: initialLoss,
    max_recovery_time: recoveryTime,
    max_lor: resilienceLoss,
  });

  try {
    let response = await fetch(baseUrl + specificationsPath, {
      method: 'POST',
      headers: headers,
      body: body
    });
    let data = await response.json();
    return data;
  } catch(err) {
    'Error while posting specification for service ' +
    serviceId +
    ' and cause ' +
    cause +
    ': ' +
    err
  }
}
