import { Bundle } from "fhir/r4";
import fetch from "node-fetch";

export interface Secrets {
  [secretName: string]: string;
}

export interface ZambdaInput {
  headers: any | null;
  body: string | null;
  secrets: Secrets | null;
}

export interface ZapehrSearchParameter {
  key: string;
  value: string;
}

export enum SecretsKeys {
  ZAPEHR_AUTH_ENDPOINT = "ZAPEHR_AUTH_ENDPOINT",
  ZAPEHR_AUTH_CLIENT = "ZAPEHR_AUTH_CLIENT",
  ZAPEHR_AUTH_SECRET = "ZAPEHR_AUTH_SECRET",
  ZAPEHR_AUTH_AUDIENCE = "ZAPEHR_AUTH_AUDIENCE",
  FHIR_API = "FHIR_API",
}

// Throws if secret could not be found
export const getSecret = (
  secretKey: string,
  secrets: Secrets | null
): string => {
  let value: string | undefined;
  if (secrets != null) {
    value = secrets[secretKey];
  } else {
    value = process.env[secretKey];
  }

  if (value == null) {
    throw new Error(
      `Secret or Environment Variable with key ${secretKey} was not set.`
    );
  }

  return value;
};

// Throws if it can't get a token because this is a fatal error
export async function getAuthToken(secrets: Secrets | null): Promise<string> {
  const ZAPEHR_AUTH_ENDPOINT = getSecret(
    SecretsKeys.ZAPEHR_AUTH_ENDPOINT,
    secrets
  );
  const ZAPEHR_AUTH_CLIENT = getSecret(SecretsKeys.ZAPEHR_AUTH_CLIENT, secrets);
  const ZAPEHR_AUTH_SECRET = getSecret(SecretsKeys.ZAPEHR_AUTH_SECRET, secrets);
  const ZAPEHR_AUTH_AUDIENCE = getSecret(
    SecretsKeys.ZAPEHR_AUTH_AUDIENCE,
    secrets
  );

  console.group(`Fetch from ${ZAPEHR_AUTH_ENDPOINT}`);
  return await fetch(ZAPEHR_AUTH_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: ZAPEHR_AUTH_CLIENT,
      client_secret: ZAPEHR_AUTH_SECRET,
      audience: ZAPEHR_AUTH_AUDIENCE,
    }),
  })
    .then((response: any) => {
      if (!response.ok) {
        console.error("response issue", response);
        throw new Error(response);
      }
      console.log("Got a response from ZAPEHR_AUTH");
      return response.json();
    })
    .then((response: any) => {
      console.groupEnd();
      console.debug(`Fetch from ${ZAPEHR_AUTH_ENDPOINT} success`);
      return response.access_token;
    })
    .catch((error: any) => {
      console.error("error", error);
      throw new Error(error.message);
    });
}

export async function searchFhirResources<FhirType>(
  resourceType: string,
  searchParameters: ZapehrSearchParameter[],
  token: string,
  secrets: Secrets | null
): Promise<FhirType[] | null> {
  const FHIR_API = getSecret(SecretsKeys.FHIR_API, secrets);

  const ENDPOINT = `${FHIR_API}/${resourceType}`;

  const searchUrl = new URL(ENDPOINT);
  searchParameters.forEach((searchParameter) => {
    searchUrl.searchParams.append(searchParameter.key, searchParameter.value);
  });
  console.group(`Fetch from ${ENDPOINT}`);
  return fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        console.error("response issue", response);
        console.error("response json", JSON.stringify(await response.json()));
        throw new Error("Error searching FHIR resources");
      }
      return response.json();
    })
    .then((responseJson) => {
      const fhirBundle = responseJson as unknown as Bundle;
      const fhirElements: FhirType[] = [];

      fhirBundle.entry &&
        fhirBundle.entry.forEach((fhirElement) => {
          if (fhirElement.resource) {
            fhirElements.push(fhirElement.resource as FhirType);
          }
        });

      if (fhirElements === undefined) {
        console.log("No elements returned");
        return null;
      }

      console.groupEnd();
      console.debug(`Fetch from ${ENDPOINT} success`);
      return fhirElements;
    })
    .catch((error) => {
      console.error("error", error);
      return null;
    });
}

export async function createFhirResource<FhirType>(
  resourceType: string,
  resource: FhirType,
  token: string,
  secrets: Secrets | null
): Promise<FhirType> {
  const FHIR_API = getSecret(SecretsKeys.FHIR_API, secrets);

  const ENDPOINT = `${FHIR_API}/${resourceType}`;

  console.group(`Fetch from ${ENDPOINT}`);
  return await fetch(ENDPOINT, {
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(resource),
  })
    .then(async (response) => {
      if (!response.ok) {
        const responseJson = await response.json();
        console.log("response issue", responseJson);
        throw new Error(responseJson);
      }

      return response.json();
    })
    .then((responseJson) => {
      console.groupEnd();
      console.debug(`Fetch from ${ENDPOINT} success`);
      return responseJson;
    });
}
