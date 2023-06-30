import { Bundle } from "fhir/r4";
import { zapEHRUser } from "../components/navigation/Navbar";

interface SearchParameter {
  key: string;
  value: string | null;
}

export interface PatchOperation {
  // https://www.hl7.org/fhir/fhirpatch.html
  op: "add" | "insert" | "delete" | "replace" | "move";
  path: string;
  value: string | object | boolean;
}

export const getUser = async (token: string): Promise<zapEHRUser> => {
  return fetch(`${process.env.REACT_APP_ZAPEHR_PLATFORM_URL}/user/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => {
    return response.json();
  });
};

export const searchFhirResources = async <FhirType>(
  resourceType: string,
  searchParameters: SearchParameter[],
  token: string
): Promise<FhirType[] | null> => {
  const searchUrl = new URL(
    `${process.env.REACT_APP_ZAPEHR_FHIR_URL}/${resourceType}`
  );
  searchParameters.forEach((searchParameter) => {
    if (searchParameter.value) {
      searchUrl.searchParams.append(searchParameter.key, searchParameter.value);
    }
  });
  return fetch(searchUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw Error("Error searching FHIR resources");
      }
      return response.json();
    })
    .then((responseJson) => {
      const fhirBundle = responseJson as unknown as Bundle;
      const fhirElements: FhirType[] = [];

      if (fhirBundle.entry != null) {
        fhirBundle.entry.forEach((fhirElement) => {
          if (fhirElement.resource) {
            fhirElements.push(fhirElement.resource as FhirType);
          }
        });
      }

      return fhirElements;
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
};

export const getFhirResource = async <FhirType>(
  resourceType: string,
  resourceId: string,
  token: string
): Promise<FhirType | null> => {
  const resourceUrl = new URL(
    `${process.env.REACT_APP_ZAPEHR_FHIR_URL}/${resourceId}`
  );
  return fetch(resourceUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Error getting FHIR resource ${resourceType} ${resourceId}`
        );
      }
      return response.json();
    })
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      console.log(error);
      return undefined;
    });
};

export const patchFhirResource = async <FhirType>(
  resourceType: string,
  resourceId: string,
  patch: PatchOperation[],
  token: string
): Promise<FhirType | null> => {
  const resourceUrl = new URL(
    `${process.env.REACT_APP_ZAPEHR_FHIR_URL}/${resourceId}`
  );

  return await fetch(resourceUrl, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json-patch+json",
    },
    body: JSON.stringify(patch),
  })
    .then((response) => {
      if (!response.ok) {
        console.error("Error patching fhir resource");
        console.error("response status", response.status);
        console.error("response", response);
        throw new Error("An error occurred during the FHIR request");
      }

      return response.json();
    })
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
};
