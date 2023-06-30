import { Address, PatientContact } from "fhir/r4";
import React, { ReactElement } from "react";
import { ContactPhoneOutlined } from "@mui/icons-material";
import { formatDateTime } from "../helpers/formatDateTime";
import PatientInformation from "./PatientInformation";

interface ContactDetailsProps {
  contact: PatientContact[] | undefined;
}

export default function ContactDetails({
  contact,
}: ContactDetailsProps): ReactElement {
  let contactAddress: Address = {};
  if (contact?.[0].address != null) {
    contactAddress = contact[0].address;
  }

  const contactPhone =
    contact &&
    contact?.[0].telecom?.find((telecom) => telecom.system === "phone")?.value;
  const contactEmail =
    contact &&
    contact?.[0].telecom?.find((telecom) => telecom.system === "email")?.value;
  const contactDetails = contact
    ? {
        "First name": contact ? contact?.[0].name?.given?.join(" ") : null,
        "Last name": contact ? contact?.[0].name?.family : null,
        "Date of birth": contact
          ? `${formatDateTime(
              contact?.[0].extension?.[0].valueDate || "",
              "date"
            )}`
          : null,
        "Phone number": contactPhone,
        Email: contactEmail,
        "Street address": contactAddress.line?.join(", ") ?? null,
        City: contactAddress.city ?? null,
        State: contactAddress.state ?? null,
        ZIP: contactAddress.postalCode ?? null,
      }
    : {
        "First name": null,
        "Last name": null,
        "Phone number": null,
        Email: null,
        "Street address": null,
        City: null,
        State: null,
        ZIP: null,
      };

  return (
    <PatientInformation
      TitleIcon={ContactPhoneOutlined}
      title="Contact Information"
      patientDetails={contactDetails}
    />
  );
}
