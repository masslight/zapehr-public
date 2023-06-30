import { Appointment, Bundle, FhirResource, Patient } from "fhir/r4";
import { DateRange } from "@mui/x-date-pickers-pro/DateRangePicker";
import { DateTime } from "luxon";
import React, { ReactElement, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { TabPanel } from "@mui/lab";
import { Paper } from "@mui/material";
import { searchFhirResources } from "../api/api";
import AppointmentsInformation from "../components/AppointmentsInformation";
import PageContainer from "../layout/PageContainer";

export default function AppointmentsSearch(): ReactElement {
  const { getAccessTokenSilently } = useAuth0();

  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [patientNameFilter, setPatientNameFilter] = useState<string | null>(
    null
  );
  const [appointmentDateRangeFilter, setAppointmentDateRangeFilter] = useState<
    DateRange<DateTime>
  >([null, null]);
  const [appointmentStatus, setAppointmentStatus] = useState<string[]>([]);

  const [patients, setPatients] = useState<Patient[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const statusKeys = appointmentStatus
      .map((status) => status.toLowerCase())
      .join();

    async function getAppointmentsAndPatients(): Promise<void> {
      setIsLoading(true);
      const accessToken = await getAccessTokenSilently();
      const searchResults = await searchFhirResources<Bundle>(
        "Appointment",
        [
          { key: "_count", value: "1000" },
          { key: "_sort", value: "date" },
          {
            key: "date",
            value: appointmentDateRangeFilter[0]
              ? `ge${appointmentDateRangeFilter[0].toJSDate().toISOString()}`
              : null,
          },
          {
            key: "date",
            value: appointmentDateRangeFilter[1]
              ? `le${appointmentDateRangeFilter[1].toJSDate().toISOString()}`
              : null,
          },
          { key: "status", value: statusKeys },
          {
            key: "_include",
            value: "Appointment:patient",
          },
        ],
        accessToken
      );
      if (searchResults == null) {
        setIsLoading(false);
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

      setIsLoading(false);
    }

    getAppointmentsAndPatients().catch((error) => {
      console.log(error);
    });
  }, [getAccessTokenSilently, appointmentDateRangeFilter, appointmentStatus]);

  return (
    <PageContainer title="Appointments Search">
      <TabPanel value={"Appointments"} sx={{ p: 0 }}>
        <Paper sx={{ p: 2 }}>
          <AppointmentsInformation
            appointments={appointments}
            appointmentDateRangeFilter={appointmentDateRangeFilter}
            setAppointmentDateRangeFilter={setAppointmentDateRangeFilter}
            appointmentStatus={appointmentStatus}
            setAppointmentStatus={setAppointmentStatus}
            isLoading={isLoading}
            emptyMessage="There are no appointments on this date for these patients. Please update your filters above."
            patients={patients}
            patientNameFilter={patientNameFilter}
            setPatientNameFilter={setPatientNameFilter}
          />
        </Paper>
      </TabPanel>
    </PageContainer>
  );
}
