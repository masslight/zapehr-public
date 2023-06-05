const APP_ENV = 'testing';
const API_URL = 'https://project-api.zapehr.com/v1';
const PROJECT_ID = '7fec3b01-0954-4623-a26f-f8c458221630';
const ZAMBDA_GET_PATIENTS_ID = '844cec93-a8c6-43d3-a579-c4d61d226537';
const ZAMBDA_CREATE_PATIENT_ID = '6e6f0e8e-56fe-421d-ba02-019f1a673998';
const MUI_X_LICENSE_KEY = '';

const createZambdaEndpoint = (zambdaId) => {
  return `${API_URL}/zambda/${zambdaId}/execute-public`;
};

module.exports = {
  REACT_APP_ENV: APP_ENV,
  REACT_APP_PROJECT_ID: PROJECT_ID,
  REACT_APP_GET_PATIENTS_URL: createZambdaEndpoint(ZAMBDA_GET_PATIENTS_ID),
  REACT_APP_CREATE_PATIENT_URL: createZambdaEndpoint(ZAMBDA_CREATE_PATIENT_ID),
  REACT_APP_MUI_X_LICENSE_KEY: MUI_X_LICENSE_KEY
}
