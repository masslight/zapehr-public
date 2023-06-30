import { Appointment, Patient } from "fhir/r4";
import { DateTime } from "luxon";
import React, { Dispatch, ReactElement, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Box, capitalize } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import {
  LocalizationProvider,
  DateRangePicker,
  DateRange,
} from "@mui/x-date-pickers-pro";
import {
  GridColDef,
  GridFilterModel,
  GridLogicOperator,
} from "@mui/x-data-grid-pro";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { convertFhirNameToDisplayName } from "../helpers/convertFhirNameToDisplayName";
import { formatDateTime } from "../helpers/formatDateTime";
import CustomTable, { dateTimeEqualsOperator } from "./CustomTable";
import PatientSearch from "./PatientSearch";
import AppointmentStatusDropdown from "./AppointmentStatusDropdown";

const columns: GridColDef[] = [
  { field: "patient", headerName: "Patient" },
  {
    field: "patientDob",
    headerName: "Patient Date of Birth",
    valueFormatter: ({ value }) => formatDateTime(value, "date"),
  },
  {
    field: "appointment",
    headerName: "Appointment",
    filterOperators: [dateTimeEqualsOperator],
    valueFormatter: ({ value }) => formatDateTime(value, "time"),
  },
  {
    field: "status",
    headerName: "Status",
  },
  {
    field: "created",
    headerName: "Created",
    valueFormatter: ({ value }) => formatDateTime(value, "time"),
  },
];

interface AppointmentsInformationProps {
  appointments: Appointment[] | null;
  appointmentDateFilter?: DateTime | null;
  setAppointmentDateFilter?: Dispatch<SetStateAction<DateTime | null>>;
  appointmentDateRangeFilter?: DateRange<DateTime> | [null, null];
  setAppointmentDateRangeFilter?: Dispatch<
    SetStateAction<DateRange<DateTime> | [null, null]>
  >;
  appointmentStatus?: string[];
  setAppointmentStatus?: Dispatch<SetStateAction<string[]>>;
  isLoading?: boolean;
  emptyMessage: string;
  patients: Patient[] | null;
  patientNameFilter?: string | null;
  setPatientNameFilter?: Dispatch<SetStateAction<string | null>>;
}

export default function AppointmentsInformation({
  appointments,
  appointmentDateFilter,
  setAppointmentDateFilter,
  appointmentDateRangeFilter,
  setAppointmentDateRangeFilter,
  appointmentStatus,
  setAppointmentStatus,
  isLoading,
  emptyMessage,
  patients,
  patientNameFilter,
  setPatientNameFilter,
}: AppointmentsInformationProps): ReactElement {
  const navigate = useNavigate();

  const nameSearch = setPatientNameFilter && (
    <PatientSearch state={patientNameFilter} setState={setPatientNameFilter} />
  );
  const dateSearch = setAppointmentDateFilter && (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <DatePicker
        label="Appointment date"
        onChange={(updateAppointmentDateFilter) => {
          setAppointmentDateFilter(updateAppointmentDateFilter ?? null);
        }}
        disablePast
        inputFormat="MM/dd/yyyy"
        value={appointmentDateFilter}
        renderInput={(params) => (
          <TextField
            id="appointment-date"
            label="Appointment date"
            {...params}
          />
        )}
      />
    </LocalizationProvider>
  );
  const dateRangeSearch = setAppointmentDateRangeFilter && (
    <LocalizationProvider
      dateAdapter={AdapterLuxon}
      localeText={{ start: "Start Date", end: "End Date" }}
    >
      {appointmentDateRangeFilter && (
        <DateRangePicker
          value={appointmentDateRangeFilter}
          onChange={(newValue) => {
            setAppointmentDateRangeFilter(newValue);
          }}
          inputFormat="MM/dd/yyyy"
          renderInput={(startProps, endProps) => (
            <React.Fragment>
              <TextField {...startProps} />
              <Box sx={{ mx: 2 }}> to </Box>
              <TextField {...endProps} />
            </React.Fragment>
          )}
        />
      )}
    </LocalizationProvider>
  );

  const onClick = (id: number | string): void => navigate(`/appointment/${id}`);

  if (isLoading === undefined) {
    isLoading = appointments == null || patients == null;
  }

  const rows =
    appointments &&
    patients &&
    appointments
      .map((appointment) =>
        patients
          .map((patient) => {
            if (
              patient.id !==
                appointment.participant[0].actor?.reference?.replace(
                  "Patient/",
                  ""
                ) ||
              !patient.name ||
              !patient.name[0].given ||
              !patient.birthDate ||
              !appointment.start ||
              !appointment.meta ||
              !appointment.meta.lastUpdated
            ) {
              return;
            }
            return {
              id: appointment.id,
              patient: convertFhirNameToDisplayName(patient.name[0]),
              patientDob: patient.birthDate,
              appointment: appointment.start,
              status: capitalize(appointment.status),
              created: appointment.meta.lastUpdated,
            };
          })
          // Filters out unwanted data from the conditional above
          .find(Boolean)
      )
      .filter((row) => row !== undefined);

  const filterModel: GridFilterModel = {
    items: [
      {
        id: 1,
        field: "patient",
        operator: "contains",
        value: patientNameFilter,
      },
      {
        id: 2,
        field: "appointment",
        operator: "dtequals",
        value: appointmentDateFilter,
      },
    ],
    logicOperator: GridLogicOperator.And,
  };
  return (
    <>
      {nameSearch}
      {dateSearch}
      {dateRangeSearch}
      {appointmentStatus && (
        <AppointmentStatusDropdown
          appointmentStatus={appointmentStatus}
          setAppointmentStatus={setAppointmentStatus}
        />
      )}
      <CustomTable
        defaultSort={{ field: "created", sort: "desc" }}
        emptyMessage={emptyMessage}
        filterModel={filterModel}
        isLoading={isLoading}
        onClick={onClick}
        rows={rows}
        columns={columns}
      />
    </>
  );
}
