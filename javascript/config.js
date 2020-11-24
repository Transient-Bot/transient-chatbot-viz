const baseUrl = 'https://transient-chatbot-service.herokuapp.com/api/';
const socketUrl = 'wss://transient-chatbot-service.herokuapp.com/ws/test/';
const servicesPath = 'services/';
const dependenciesPath = 'dependencies/';
const serviceDataPath = 'servicedata/';
const specificationsPath = 'specifications/';

const expected_qos = 100;
const qos_threshold = 90;

const Intent = {
    SELECT_SERVICE: 'Select Service',
    SHOW_SPECIFIACTION: 'Show Specification',
    ADD_SPECIFICATION: 'Add Specification',
    DELETE_SPECIFICATION: 'Delete Specification',
    EDIT_SPECIFICATION_LOSS: 'Edit specification loss',
    EDIT_SPECIFICATION_RECOVERY_TIME: 'Edit Specification recovery time',
}