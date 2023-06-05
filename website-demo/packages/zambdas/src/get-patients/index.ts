import { APIGatewayProxyResult } from "aws-lambda";
import { Patient } from "fhir/r4";
import {
  Secrets,
  ZambdaInput,
  getAuthToken,
  searchFhirResources,
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
    const secrets = input.secrets;
    console.groupEnd();
    console.log("validateRequestParameters success");

    if (token == null) {
      console.group("getAuth0Token");
      token = await getAuthToken(secrets);
      console.groupEnd();
      console.debug("getAuth0Token success");
    }

    console.group("searchFhirResources");
    const patients = await searchFhirResources<Patient>(
      "Patient",
      [
        { key: "_count", value: "1000" },
        { key: "_sort", value: "_lastUpdated" },
      ],
      token,
      secrets
    );
    console.groupEnd();
    console.debug(
      `searchFhirResources success: returned ${patients?.length} patients`
    );

    if (patients) {
      return {
        statusCode: 200,
        body: JSON.stringify(patients.reverse()),
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Error getting available patients",
        }),
      };
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal service error" }),
    };
  }
};
