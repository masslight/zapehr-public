import { Patient } from "fhir/r4";
import React, { ReactElement, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { TabPanel } from "@mui/lab";
import { Paper } from "@mui/material";
import { searchFhirResources } from "../api/api";
import PatientsInformation from "../components/PatientsInformation";
import PageContainer from "../layout/PageContainer";

export default function Appointments(): ReactElement {
  const { getAccessTokenSilently } = useAuth0();

  const [patientNameFilter, setPatientNameFilter] = useState<string | null>(
    null
  );
  const [patients, setPatients] = useState<Patient[] | null>(null);

  useEffect(() => {
    async function getPatients(): Promise<void> {
      const accessToken = await getAccessTokenSilently();

      const patientsTemp = await searchFhirResources<Patient>(
        "Patient",
        [{ key: "_count", value: "1000" }],
        accessToken
      );
      setPatients(patientsTemp);
    }

    getPatients().catch((error) => {
      console.log(error);
    });
  }, [getAccessTokenSilently]);

  return (
    <PageContainer title="Patients">
      <TabPanel value={"Patients"} sx={{ p: 0 }}>
        <Paper sx={{ p: 2 }}>
          <PatientsInformation
            patients={patients}
            patientNameFilter={patientNameFilter}
            setPatientNameFilter={setPatientNameFilter}
          />
        </Paper>
      </TabPanel>
    </PageContainer>
  );
}
