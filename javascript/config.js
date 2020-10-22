const baseUrl = 'https://transient-chatbot-service.herokuapp.com/api/';
const servicesPath = 'services/';
const dependenciesPath = 'dependencies/';
const serviceDataPath = 'servicedata/';
const specificationsPath = 'specifications/';

const expected_qos = 100;

const Intent = {
    SELECT_SERVICE: 'Select Service',
    SHOW_SPECIFIACTION: 'Show Specification',
    ADD_SPECIFICATION: 'Add Specification',
    DELETE_SPECIFICATION: 'Delete Specification',
}