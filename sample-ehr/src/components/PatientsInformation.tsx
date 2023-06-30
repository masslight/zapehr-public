import { Patient } from "fhir/r4";
import React, { Dispatch, ReactElement, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import {
  GridColDef,
  GridFilterModel,
  GridLogicOperator,
} from "@mui/x-data-grid-pro";
import { convertFhirNameToDisplayName } from "../helpers/convertFhirNameToDisplayName";
import { formatDateTime } from "../helpers/formatDateTime";
import CustomTable, { dateTimeEqualsOperator } from "./CustomTable";
import PatientSearch from "./PatientSearch";

const columns: GridColDef[] = [
  { field: "patient", headerName: "Patient" },
  {
    field: "dateOfBirth",
    headerName: "Date of Birth",
    filterOperators: [dateTimeEqualsOperator],
    valueFormatter: ({ value }) => formatDateTime(value, "date"),
  },
];

interface PatientsInformationProps {
  patients: Patient[] | null;
  patientNameFilter: string | null;
  setPatientNameFilter: Dispatch<SetStateAction<string | null>>;
}

export default function PatientsInformation({
  patients,
  patientNameFilter,
  setPatientNameFilter,
}: PatientsInformationProps): ReactElement {
  const navigate = useNavigate();

  const nameSearch = (
    <PatientSearch state={patientNameFilter} setState={setPatientNameFilter} />
  );

  const emptyMessage =
    "There are no patients. Please update the search filter above.";

  const onClick = (id: number | string): void => navigate(`/patient/${id}`);

  const isLoading = patients == null;

  const rows =
    patients &&
    patients
      .map((patient) => {
        if (!patient.name || !patient.name[0].given || !patient.birthDate) {
          return;
        }
        return {
          id: patient.id,
          patient: convertFhirNameToDisplayName(patient.name[0]),
          dateOfBirth: patient.birthDate,
        };
      })
      // Filters out unwanted data from the conditional above
      .filter(Boolean);

  const filterModel: GridFilterModel = {
    items: [
      {
        id: 1,
        field: "patient",
        operator: "contains",
        value: patientNameFilter,
      },
    ],
    logicOperator: GridLogicOperator.And,
  };

  return (
    <>
      {nameSearch}
      <CustomTable
        defaultSort={{ field: "patient", sort: "asc" }}
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
