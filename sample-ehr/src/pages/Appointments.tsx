import { Appointment, Bundle, FhirResource, Patient } from "fhir/r4";
import { DateTime } from "luxon";
import React, { ReactElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { TabPanel } from "@mui/lab";
import { Paper, Button } from "@mui/material";
import { searchFhirResources } from "../api/api";
import AppointmentsInformation from "../components/AppointmentsInformation";
import PageContainer from "../layout/PageContainer";

export default function Appointments(): ReactElement {
  const { getAccessTokenSilently } = useAuth0();

  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [patientNameFilter, setPatientNameFilter] = useState<string | null>(
    null
  );
  const [appointmentDateFilter, setAppointmentDateFilter] =
    useState<DateTime | null>(null);

  const [patients, setPatients] = useState<Patient[] | null>(null);

  useEffect(() => {
    async function getAppointmentsAndPatients(): Promise<void> {
      const accessToken = await getAccessTokenSilently();
      const searchResults = await searchFhirResources<Bundle>(
        "Appointment",
        [
          { key: "_count", value: "1000" },
          { key: "_sort", value: "date" },
          {
            key: "date",
            value: `ge${DateTime.now().toISO()}`,
          },
          { key: "status", value: "booked" },
          {
            key: "_include",
            value: "Appointment:patient",
          },
        ],
        accessToken
      );
      if (searchResults == null) {
        return;
      }

      const appointmentsTemp = searchResults.filter(
        (result: FhirResource) => result.resourceType === "Appointment"
      ) as unknown as Appointment[];
      setAppointments(appointmentsTemp);

      const patientsTemp = searchResults.filter(
        (result: FhirResource) => result.resourceType === "Patient"
      ) as unknown as Patient[];
      setPatients(patientsTemp);
    }

    getAppointmentsAndPatients().catch((error) => {
      console.log(error);
    });
  }, [getAccessTokenSilently]);

  return (
    <PageContainer title="Appointments">
      <TabPanel value={"Appointments"} sx={{ p: 0 }}>
        <Paper sx={{ p: 2 }}>
          <AppointmentsInformation
            appointments={appointments}
            appointmentDateFilter={appointmentDateFilter}
            setAppointmentDateFilter={setAppointmentDateFilter}
            emptyMessage="There are no appointments on this date for these patients. Please update your filters above."
            patients={patients}
            patientNameFilter={patientNameFilter}
            setPatientNameFilter={setPatientNameFilter}
          />
        </Paper>
        <Link to="/appointments/search">
          <Button variant="contained" sx={{ my: 2 }}>
            Past Appointments
          </Button>
        </Link>
      </TabPanel>
    </PageContainer>
  );
}
