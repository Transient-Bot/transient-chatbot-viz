var services;
var dependencies;
var serviceData;
var specification;
var selectedService;
var specificationIsHidden = true;

// Open websocket
const socket = new WebSocket(
  'ws://transient-chatbot-service.herokuapp.com/ws/test/'
);

// Fetch the components of the architecture diagram
fetchServices();
fetchDependencies();

// Change service data visualization when an endpoint is selected
document.getElementById('endpoints').addEventListener('change', (e) => {
  const callId = e.target.value;
  fetchServiceData(selectedService.id, callId);
});

// Change specification visualization when a cause for transient behavior is selected
document.getElementById('causes').addEventListener('change', (e) => {
  const cause = e.target.value;
  removeSpecificationPath();
  fetchSpecification(selectedService.id, cause);
  drawTransientLossGraph();
});

// Adds options to endpoint select
function populateEndpointsSelect(service) {
  if (service === null || service.endpoints === null) {
    return;
  }

  toggleDataVizContainer();

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
  fetchSpecification(selectedService.id, cause);
}

function hideSpecification() {
  var btn = document.getElementById('specification-toggle');
  var addBtn = document.getElementById('addSpecBtn');
  var deleteBtn = document.getElementById('deleteSpecBtn');
  var editBtn = document.getElementById('editSpecBtn');
  var causesContainer = document.getElementById('causes-select-container');

  causesContainer.style.display = 'none';
  addBtn.style.display = 'none';
  deleteBtn.style.display = 'none';
  editBtn.style.display = 'none';
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
  var lossContainer = document.getElementById('loss-viz-container');

  serviceContainer.style.display = 'block';
  lossContainer.style.display = 'block';
}

function handleSpecification() {
  var deleteBtn = document.getElementById('deleteSpecBtn');
  var editBtn = document.getElementById('editSpecBtn');
  var addBtn = document.getElementById('addSpecBtn');

  if (
    serviceData != null &&
    specification != null &&
    specification != undefined
  ) {
    deleteBtn.style.display = 'inline';
    editBtn.style.display = 'inline';
    addBtn.style.display = 'none';

    drawSpecification(specification);
  } else if (specification === null || specification == undefined) {
    addBtn.style.display = 'inline';
    deleteBtn.style.display = 'none';
    editBtn.style.display = 'none';
  }
}

function deleteSpecification() {
  if (specification === null || specification === undefined) {
    return;
  }
  var deleteBtn = document.getElementById('deleteSpecBtn');
  var editBtn = document.getElementById('editSpecBtn');
  var addBtn = document.getElementById('addSpecBtn');

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
    editBtn.style.display = 'none';
    addBtn.style.display = 'inline';
  }
}
