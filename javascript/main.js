var services;
var dependencies;
var serviceData;
var selectedService;
var specification;
var specificationIsHidden = true;

// Open websocket
const socket = new WebSocket(socketUrl);

// Fetch the components of the architecture diagram
fetchServices().then((servs) => {
  if (servs != null) {
    services = servs;
    fetchDependencies().then((deps) => {
      if (deps != null) {
        dependencies = deps;
        createArchitectureGraph();
      }
    });
  }
});

// Change service data visualization when an endpoint is selected
document.getElementById('endpoints').addEventListener('change', (e) => {
  const callId = e.target.value;
  fetchServiceData(selectedService.id, callId).then((res) => {
    if (res != null && res != undefined) {
      serviceData = res;
      createDataGraph(res);
    } else {
      removeDataViz();
      removeLossViz();
    }
  });
});

// Change specification visualization when a cause for transient behavior is selected
document.getElementById('causes').addEventListener('change', (e) => {
  const cause = e.target.value;
  removeSpecificationPath();

  fetchSpecification(selectedService.id, cause).then((res) => {
    if (res != null) {
      handleSpecification(res);
    } else {
      const lossContainer = document.getElementById('loss-viz-container');
      const addBtn = document.getElementById('addSpecBtn');
      const deleteBtn = document.getElementById('deleteSpecBtn');
      // const editBtn = document.getElementById('editSpecBtn');

      lossContainer.style.display = 'none';
      deleteBtn.style.display = 'none';
      // editBtn.style.display = 'none';
      addBtn.style.display = 'inline';
    }
  });
});

// change architecture visualization when a scenario is selected
document.getElementById('scenarios').addEventListener('change', (e) => {
  changeArchitectureViz();
});

function changeArchitectureViz() {
  const vizContainer = document.getElementById('service-viz-container');
  const lossContainer = document.getElementById('loss-viz-container');

  vizContainer.style.display = 'none';
  lossContainer.style.display = 'none';

  services = null;
  dependencies = null;

  fetchServices().then((servs) => {
    if (servs != null) {
      services = servs;
      fetchDependencies().then((deps) => {
        if (deps != null) {
          dependencies = deps;
          createArchitectureGraph();
        }
      });
    }
  });
}

// Adds options to endpoint select
function populateEndpointsSelect(service) {
  if (service === null || service.endpoints === undefined) {
    return;
  }

  toggleDataVizContainer();

  var select = document.getElementById('endpoints');
  select.options.length = 0;

  if (service.endpoints.length === 0) {
    removeDataViz();
    removeLossViz();
    var serviceContainer = document.getElementById('service-viz-container');
    serviceContainer.style.display = 'none';
  } else {
    if (service.name === 'payslip2') {
      // Service payslip2 has only one endpoint with callid 5
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
  }

  if (select.options.length > 0) {
   // Select the first value
  select.value = select.options[0].value;
  select.dispatchEvent(new Event('change')); 
  }
}

// Show the transient behavior specification
function showSpecification(tb_cause) {
  var btn = document.getElementById('specification-toggle');
  var causesContainer = document.getElementById('causes-select-container');
  var cause = document.getElementById('causes').value;

  if (tb_cause !== null) {
    cause = tb_cause;
    document.getElementById('causes').value = tb_cause;
  }

  causesContainer.style.display = 'flex';
  btn.innerHTML = 'Hide specification';
  specificationIsHidden = false;

  removeSpecificationPath();
  fetchSpecification(selectedService.id, cause).then((res) => {
    handleSpecification(res);
  });
}

function hideSpecification() {
  var btn = document.getElementById('specification-toggle');
  var addBtn = document.getElementById('addSpecBtn');
  var deleteBtn = document.getElementById('deleteSpecBtn');
  // var editBtn = document.getElementById('editSpecBtn');
  var causesContainer = document.getElementById('causes-select-container');
  var lossContainer = document.getElementById('loss-viz-container');

  lossContainer.style.display = 'none';
  causesContainer.style.display = 'none';
  addBtn.style.display = 'none';
  deleteBtn.style.display = 'none';
  // editBtn.style.display = 'none';
  btn.innerHTML = 'Show specification';
  specificationIsHidden = true;
  removeSpecificationPath();
}

// Toggle the transient behavior specification visualization
function toggleSpecification() {
  var btn = document.getElementById('specification-toggle');

  if (btn.innerHTML === 'Show specification') {
    showSpecification(null);
  } else {
    hideSpecification();
  }
}

// Show data viz containers
function toggleDataVizContainer() {
  var serviceContainer = document.getElementById('service-viz-container');
  serviceContainer.style.display = 'block';
}

function handleSpecification(spec) {
  var deleteBtn = document.getElementById('deleteSpecBtn');
  // var editBtn = document.getElementById('editSpecBtn');
  var addBtn = document.getElementById('addSpecBtn');
  var lossContainer = document.getElementById('loss-viz-container');

  if (spec != null && spec != undefined) {
    specification = spec;
    deleteBtn.style.display = 'inline';
    // editBtn.style.display = 'inline';
    addBtn.style.display = 'none';
    lossContainer.style.display = 'block';

    drawTransientLossGraph();
    drawSpecification(spec);
  } else {
    addBtn.style.display = 'inline';
    deleteBtn.style.display = 'none';
    // editBtn.style.display = 'none';
    lossContainer.style.display = 'none';
  }
}

function deleteSpecification() {
  if (specification === null || specification === undefined) {
    return;
  }
  var deleteBtn = document.getElementById('deleteSpecBtn');
  // var editBtn = document.getElementById('editSpecBtn');
  var addBtn = document.getElementById('addSpecBtn');
  var lossContainer = document.getElementById('loss-viz-container');

  const deletionConfirmed = confirm(
    'Are you sure that you want to delete the transient behavior specification for ' +
      specification.cause +
      ' of ' +
      selectedService.name +
      '?'
  );

  if (deletionConfirmed) {
    deleteSpecificationRequest(specification.id);
    removeSpecificationPath();
    deleteBtn.style.display = 'none';
    // editBtn.style.display = 'none';
    addBtn.style.display = 'inline';
    lossContainer.style.display = 'none';
  }
}
