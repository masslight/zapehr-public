import { Patient } from "fhir/r4";
import React, { ReactElement, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Grid, Skeleton, Typography } from "@mui/material";
import { getFhirResource } from "../api/api";
import CustomBreadcrumbs from "../components/CustomBreadcrumbs";
import PageContainer from "../layout/PageContainer";
import { patientSidebarItems } from "./Patient";

export default function InsurancePage(): ReactElement {
  const { id: patientId } = useParams();
  const { getAccessTokenSilently } = useAuth0();

  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    async function getPatientInformation(): Promise<void> {
      if (!patientId) {
        return;
      }

      const accessToken = await getAccessTokenSilently();

      const patientTemp = await getFhirResource<Patient>(
        "Patient",
        patientId,
        accessToken
      );
      setPatient(patientTemp);
    }

    getPatientInformation().catch((error) => {
      console.log(error);
    });
  }, [getAccessTokenSilently, patientId]);

  const patientName = `${patient?.name?.[0].given?.[0]} ${patient?.name?.[0].family}`;

  return (
    <PageContainer sidebarItems={patientSidebarItems}>
      <>
        <CustomBreadcrumbs
          chain={[
            { link: "/patients", children: "Patients" },
            {
              link: `/patient/${patientId}`,
              children: patient?.name ? (
                patientName
              ) : (
                <Skeleton aria-busy="true" width={200} />
              ),
            },
            { link: "#", children: "Insurance" },
          ]}
        />
        <Grid container mt={0} spacing={3}>
          <Grid item xs={8}>
            <Typography variant="h3" color="primary.dark">
              Your first component!
            </Typography>
          </Grid>
          <Grid item xs={12}>
            Start adding things here!
          </Grid>
        </Grid>
      </>
    </PageContainer>
  );
}
