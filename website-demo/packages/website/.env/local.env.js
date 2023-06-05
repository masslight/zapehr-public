const APP_ENV = 'local';
const API_URL = 'http://localhost:3001/local';
const ZAMBDA_GET_PATIENTS_NAME = 'get-patients';
const ZAMBDA_CREATE_PATIENT_NAME = 'create-patient';
const MUI_X_LICENSE_KEY = '';

const createZambdaEndpoint = (zambdaId) => {
  return `${API_URL}/${zambdaId}`;
};

module.exports = {
  REACT_APP_ENV: APP_ENV,
  REACT_APP_GET_PATIENTS_URL: createZambdaEndpoint(ZAMBDA_GET_PATIENTS_NAME),
  REACT_APP_CREATE_PATIENT_URL: createZambdaEndpoint(ZAMBDA_CREATE_PATIENT_NAME),
  REACT_APP_MUI_X_LICENSE_KEY: MUI_X_LICENSE_KEY
}
