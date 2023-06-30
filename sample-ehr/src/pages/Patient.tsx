import { Appointment, Bundle, FhirResource, Patient } from "fhir/r4";
import React, { ReactElement, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  CardMembership,
  EventNoteOutlined,
  MedicalInformation,
} from "@mui/icons-material";
import { Grid, Skeleton, Typography } from "@mui/material";
import { searchFhirResources } from "../api/api";
import { SidebarItem } from "../components/navigation/Sidebar";
import ContactDetails from "../components/ContactDetails";
import CustomBreadcrumbs from "../components/CustomBreadcrumbs";
import AppointmentsInformation from "../components/AppointmentsInformation";
import PatientDetails from "../components/PatientDetails";
import PatientInformation from "../components/PatientInformation";
import { formatDateTime } from "../helpers/formatDateTime";
import PageContainer from "../layout/PageContainer";

export const patientSidebarItems: SidebarItem[][] = [
  [
    {
      label: "Details",
      icon: <MedicalInformation />,
      path: ".",
    },
    {
      label: "Insurance",
      icon: <CardMembership />,
      path: "insurance",
    },
  ],
];

export default function PatientPage(): ReactElement {
  const { id: patientId } = useParams();
  const { getAccessTokenSilently } = useAuth0();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);

  useEffect(() => {
    async function getPatientInformation(): Promise<void> {
      if (!patientId) {
        return;
      }

      const accessToken = await getAccessTokenSilently();
      const searchResults = await searchFhirResources<Bundle>(
        "Patient",
        [
          { key: "_id", value: patientId },
          {
            key: "_revinclude",
            value: "Appointment:patient",
          },
        ],
        accessToken
      );
      if (searchResults == null) {
        return;
      }

      const patientIndex = searchResults.findIndex(
        (result: FhirResource) => result.resourceType === "Patient"
      );
      const patientTemp = searchResults.splice(
        patientIndex,
        1
      )[0] as unknown as Patient;
      setPatient(patientTemp);

      // Since we've removed the only Patient result.
      const appointmentsTemp = searchResults as unknown as Appointment[];
      setAppointments(appointmentsTemp);
    }

    getPatientInformation().catch((error) => {
      console.log(error);
    });
  }, [getAccessTokenSilently, patientId]);

  const patientName = `${patient?.name?.[0].given?.[0]} ${patient?.name?.[0].family}`;

  return (
    <PageContainer
      tabTitle={patient ? patientName : "Patient"}
      // sidebarItems={patientSidebarItems}
    >
      <>
        <CustomBreadcrumbs
          chain={[
            { link: "/patients", children: "Patients" },
            {
              link: "#",
              children: patient?.name ? (
                patientName
              ) : (
                <Skeleton aria-busy="true" width={200} />
              ),
            },
          ]}
        />
        <Grid container mt={0} spacing={3}>
          <Grid item xs={8}>
            <Typography variant="h3" color="primary.dark">
              {patient?.name ? (
                patientName
              ) : (
                <Skeleton aria-busy="true" width={200} />
              )}
            </Typography>
          </Grid>
          <Grid item xs={4} alignSelf="center">
            <Typography
              variant="body2"
              color="rgba(0, 0, 0, 0.6)"
              sx={{
                float: "right",
              }}
            >
              Last updated:{" "}
              {patient ? (
                formatDateTime(patient?.meta?.lastUpdated || "", "time")
              ) : (
                <Skeleton aria-busy="true" width={200} />
              )}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <PatientDetails patient={patient} />
          </Grid>
          <Grid item xs={6}>
            <ContactDetails contact={patient?.contact} />
          </Grid>
          <Grid item xs={12}>
            <PatientInformation
              TitleIcon={EventNoteOutlined}
              title="Appointments"
              element={
                <AppointmentsInformation
                  appointments={appointments}
                  emptyMessage="This patient does not have any appointments."
                  patients={patient ? [patient] : []}
                />
              }
            />
          </Grid>
        </Grid>
      </>
    </PageContainer>
  );
}
