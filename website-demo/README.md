# zapEHR Demo

This has code for a demo of zapEHR. It's a micro EHR with functionality for listing information about patients and creating new patients. It's deployed on <https://zapehr-demo.s3.us-east-1.amazonaws.com/index.html> and included on <https://zapehr.com/demo>.

The project is written in TypeScript, and is divided into two parts: a frontend React website, and a backend using [zapEHR Zambdas](https://docs.zapehr.com/docs/zambdas-introduction).

## Running locally

### Backend locally

1. Contact us to sign up for a zapEHR account on [zapehr.com](https://zapehr.com)
1. Go to <https://console.zapehr.com/iam/m2m-clients>, click on an M2M Client, note the Client ID, click the "Rotate" to rotate secret, and note the Client Secret.
1. Create a file at `packages/zambdas/.env/local.json`:

    ```text
    {
      "FHIR_API": "https://fhir-api.zapehr.com/r4"
      "ZAPEHR_AUTH_ENDPOINT": "https://auth.zapehr.com/oauth/token",
      "ZAPEHR_AUTH_AUDIENCE": "https://api.zapehr.com",
      "ZAPEHR_AUTH_CLIENT": "THE_CLIENT_ID_FROM_EARLIER",
      "ZAPEHR_AUTH_SECRET": "THE_CLIENT_SECRET_FROM_EARLIER",
    }
    ```

1. Run `cd packages/zambdas && npm install && sls offline` in a terminal

### Frontend locally

1. Run `cd packages/website && npm install && npm run start:local` in a terminal

## Deploying

### Deploy backend

1. Contact us to sign up for a zapEHR account on [zapehr.com](https://zapehr.com)
1. Go to <https://console.zapehr.com/iam/m2m-clients>, click on an M2M Client, note the Client ID, click the "Rotate" to rotate secret, and note the Client Secret.
1. Go to <https://console.zapehr.com/zambdas> and create two Zambdas, get-patients and create-patient, with method `http_open`.
1. Go to <https://console.zapehr.com/zambdas/secrets> and create secrets:

    ```text
    FHIR_API: https://fhir-api.zapehr.com/r4
    ZAPEHR_AUTH_ENDPOINT: https://auth.zapehr.com/oauth/token
    ZAPEHR_AUTH_AUDIENCE: https://api.zapehr.com
    ZAPEHR_AUTH_CLIENT: THE_CLIENT_ID_FROM_EARLIER
    ZAPEHR_AUTH_SECRET: THE_CLIENT_SECRET_FROM_EARLIER
    ```

1. Run `cd packages/zambdas && npm install && npm run package` in a terminal
1. Go to your Zambdas on <https://console.zapehr.com/zambdas>, select the zip files in `packages/zambdas/.dist` and upload to deploy the Zambdas.

### Deploy frontend

#### Test frontend on local

1. Update the `PROJECT_ID`, `ZAMBDA_GET_PATIENTS_ID`, and `ZAMBDA_CREATE_PATIENT_ID` variables in [`packages/website/.env/testing.env.js`](packages/website/.env/testing.env.js) with your zapEHR Project ID and Zambda IDs.

1. Run `cd packages/website && npm install && npm run start:testing` in a terminal
