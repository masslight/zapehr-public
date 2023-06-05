import { APIGatewayProxyResult } from "aws-lambda";
import { Patient } from "fhir/r4";
import {
  Secrets,
  ZambdaInput,
  createFhirResource,
  getAuthToken,
} from "../../shared";

// Lifting the token out of the handler function allows it to persist across warm lambda invocations
let token: string | undefined;
export interface GetSlotsInput {
  secrets: Secrets | null;
}

export const index = async (
  input: ZambdaInput
): Promise<APIGatewayProxyResult> => {
  try {
    console.group("validateRequestParameters");
    if (!input.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Request body is required.",
        }),
      };
    }
    const body = JSON.parse(input.body);
    if (
      !body.firstName ||
      !body.lastName ||
      !body.dateOfBirth ||
      !body.address
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error:
            "Missing required parameters. firstName, lastName, dateOfBirth, and address are required.",
        }),
      };
    }
    const secrets = input.secrets;
    console.groupEnd();
    console.log("validateRequestParameters success");

    if (token == null) {
      console.group("getAuth0Token");
      token = await getAuthToken(secrets);
      console.groupEnd();
      console.debug("getAuth0Token success");
    }

    console.group("createPatient");
    let patient = null;
    try {
      patient = await createFhirResource<Patient>(
        "Patient",
        {
          resourceType: "Patient",
          name: [
            {
              family: body.lastName,
              given: [body.firstName],
            },
          ],
          birthDate: body.dateOfBirth,
          address: [
            {
              line: [body.address],
            },
          ],
        },
        token,
        secrets
      );
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error creating patient",
          errors: JSON.parse(error.message),
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Successfully created a patient with id ${patient.id}`,
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal service error" }),
    };
  }
};
