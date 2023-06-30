import { Patient } from "fhir/r4";
import React, { ReactElement } from "react";
import { AssignmentIndOutlined } from "@mui/icons-material";
import { formatDateTime } from "../helpers/formatDateTime";
import PatientInformation, { PatientProps } from "./PatientInformation";

interface PatientDetailsProps {
  patient: Patient | null;
  description?: string | null;
}

export default function PatientDetails({
  patient,
  description,
}: PatientDetailsProps): ReactElement {
  const patientDetails: PatientProps = patient
    ? {
        "First name": patient.name ? patient.name?.[0].given?.[0] : null,
        "Last name": patient.name ? patient.name[0].family : null,
        "Date of birth": patient.birthDate
          ? `${formatDateTime(patient.birthDate || "", "date")}`
          : null,
        Sex: patient.gender,
        ZIP: patient.address?.[0].postalCode,
        // State: patient.contact?.[0].address?.state,
      }
    : {
        "First name": null,
        "Last name": null,
        "Date of birth": null,
        Sex: null,
        ZIP: null,
        // State: null,
      };

  if (description !== undefined) {
    patientDetails["Reason for visit"] = description;
  }

  return (
    <PatientInformation
      TitleIcon={AssignmentIndOutlined}
      title="Patient Information"
      patientDetails={patientDetails}
    />
  );
}
