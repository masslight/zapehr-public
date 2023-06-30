import {
  Appointment,
  Bundle,
  Consent,
  Coverage,
  FhirResource,
  Organization,
  Patient,
  RelatedPerson,
  Slot,
} from "fhir/r4";
import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { FactCheckOutlined, MonetizationOnOutlined } from "@mui/icons-material";
import { Grid, Skeleton, Typography, useTheme } from "@mui/material";
import { searchFhirResources, patchFhirResource } from "../api/api";
import ContactDetails from "../components/ContactDetails";
import CustomBreadcrumbs from "../components/CustomBreadcrumbs";
import DeleteDialog from "../components/DeleteDialog";
import PatientDetails from "../components/PatientDetails";
import PatientInformation from "../components/PatientInformation";
import { formatDateTime } from "../helpers/formatDateTime";
import PageContainer from "../layout/PageContainer";

const { REACT_APP_ORGANIZATION_NAME_LONG: ORGANIZATION_NAME_LONG } =
  process.env;
if (ORGANIZATION_NAME_LONG == null) {
  throw new Error("Could not load env variable");
}

function formatRelationshipToPatient(relationship: string | null): string {
  switch (relationship) {
    case "ONESELF":
      return "Self";
    case "PRN":
      return "Parent/legal guardian";
    case "O":
      return "Other";
    default:
      return "Unknown";
  }
}

export default function AppointmentPage(): ReactElement {
  const { id: appointmentId } = useParams();
  const { getAccessTokenSilently } = useAuth0();
  const theme = useTheme();
  const navigate = useNavigate();

  const [appointmentInfo, setAppointmentInfo] = useState<Bundle[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  const handleDelete = async (): Promise<void> => {
    const accessToken = await getAccessTokenSilently();
    if (appointmentId) {
      const cancelledAppointment = patchFhirResource<Appointment>(
        "Appointment",
        appointmentId,
        [
          {
            op: "replace",
            path: "/status",
            value: "cancelled",
          },
        ],
        accessToken
      );

      if (!cancelledAppointment) {
        throw new Error("Error changing the appointment status to cancelled");
      }
    }

    if (appointment && appointment.slot) {
      const slotId = (appointment.slot[0].reference as string).split("/")[1];
      const updatedSlot = patchFhirResource<Slot>(
        "Slot",
        slotId,
        [
          {
            op: "replace",
            path: "/status",
            value: "free",
          },
        ],
        accessToken
      );

      if (!updatedSlot) {
        throw new Error("Error freeing the slot");
      }
    }

    setIsDeleteDialogOpen(false);
    navigate("/appointments");
  };

  useEffect(() => {
    async function getAppointmentInformation(): Promise<void> {
      if (!appointmentId) {
        return;
      }

      const accessToken = await getAccessTokenSilently();

      const searchResults = await searchFhirResources<Bundle>(
        "Appointment",
        [
          { key: "_id", value: appointmentId },
          {
            key: "_include",
            value: "Appointment:patient",
          },
          {
            key: "_revinclude:iterate",
            value: "Consent:patient",
          },
          {
            key: "_include:iterate",
            value: "Consent:consentor:RelatedPerson",
          },
          {
            key: "_revinclude:iterate",
            value: "Coverage:patient",
          },
          {
            key: "_include:iterate",
            value: "Coverage:subscriber:RelatedPerson",
          },
          {
            key: "_include:iterate",
            value: "Coverage:payor:Organization",
          },
        ],
        accessToken
      );
      setAppointmentInfo(searchResults ?? []);
    }

    getAppointmentInformation().catch((error) => {
      console.log(error);
    });
  }, [appointmentId, getAccessTokenSilently]);

  const {
    appointment,
    patient,
    consents,
    consentPerformer,
    coverage,
    coveragePayer,
    coverageOrganization,
  } = useMemo(() => {
    function setObjectsFromSearchResults<T>(
      resourceType: string,
      optionalConditional?: string
      // Because returning T | null or T[] | null conditionally isn't allowed
    ): any {
      // Extract this out to have an initial instance and an optional
      // conditional. Optional conditionals are only because Consent.performer
      // and Coverage.subscriber are both RelatedPersons.
      const searchPredicate = (result: FhirResource): boolean => {
        const conditional = result.resourceType === resourceType;
        if (optionalConditional != null) {
          if (optionalConditional === "Consent") {
            return (
              conditional &&
              result.id ===
                consents?.[0]?.performer?.[0].reference?.replace(
                  "RelatedPerson/",
                  ""
                )
            );
          } else if (optionalConditional === "Coverage") {
            return (
              conditional &&
              result.id ===
                coverage?.subscriber?.reference?.replace("RelatedPerson/", "")
            );
          }
        }
        return conditional;
      };

      const results: Bundle[] = appointmentInfo.filter(searchPredicate);
      return resourceType === "Consent"
        ? (results as unknown as T)
        : (results[0] as unknown as T);
    }

    const appointment: Appointment = setObjectsFromSearchResults("Appointment");
    const patient: Patient = setObjectsFromSearchResults("Patient");
    const consents: Consent[] = setObjectsFromSearchResults("Consent");
    const consentPerformer: RelatedPerson = setObjectsFromSearchResults(
      "RelatedPerson",
      "Consent"
    );
    const coverage: Coverage = setObjectsFromSearchResults("Coverage");
    const coveragePayer: RelatedPerson = setObjectsFromSearchResults(
      "RelatedPerson",
      "Coverage"
    );
    const coverageOrganization: Organization =
      setObjectsFromSearchResults("Organization");

    return {
      appointment,
      patient,
      consents,
      consentPerformer,
      coverage,
      coveragePayer,
      coverageOrganization,
    };
  }, [appointmentInfo]);

  const consentTexts = consents.map(
    (consent: Consent) => consent.category[0].text
  );

  const appointmentStartFormatted = formatDateTime(
    appointment?.start || "",
    "time"
  );

  return (
    <PageContainer
      tabTitle={appointment?.start ? appointmentStartFormatted : "Appointment"}
    >
      <>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <CustomBreadcrumbs
              chain={[
                { link: "/appointments", children: "Appointments" },
                {
                  link: "#",
                  children: appointmentId ? (
                    appointmentId
                  ) : (
                    <Skeleton aria-busy="true" width={200} />
                  ),
                },
              ]}
            />
          </Grid>
          <Grid item xs={6} sx={{ alignSelf: "center" }}>
            <Typography
              variant="body2"
              color="rgba(0, 0, 0, 0.6)"
              sx={{
                float: "right",
              }}
            >
              Created:{" "}
              {appointment ? (
                formatDateTime(appointment?.created || "", "time")
              ) : (
                <Skeleton aria-busy="true" width={200} />
              )}
            </Typography>
          </Grid>
          <Grid
            item
            xs={10}
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography variant="h3" color="primary.dark">
              {/* TODO: Get the provider name from the backend instead of using a sample provider */}
              Appointment with Sample Provider
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: "bold",
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                py: 1,
                px: 2,
                ml: 5,
                borderRadius: 2,
              }}
            >
              {appointment?.start ? (
                appointmentStartFormatted
              ) : (
                <Skeleton aria-busy="true" width={200} />
              )}
            </Typography>
          </Grid>
          {/* <Grid item xs={2} alignSelf="center">
            <Button
              variant="outlined"
              sx={{
                fontWeight: "bold",
                backgroundColor: theme.palette.background.default,
                borderColor: theme.palette.error.light,
                borderRadius: 6,
                color: theme.palette.error.main,
                float: "right",
                textTransform: "none",
              }}
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Cancel appointment
            </Button>
          </Grid> */}
          <Grid item xs={6}>
            <PatientDetails
              patient={patient}
              description={appointment?.description ?? null}
            />
          </Grid>
          <Grid item xs={6}>
            <ContactDetails contact={patient?.contact} />
          </Grid>
          <Grid item xs={6}>
            <PatientInformation
              TitleIcon={FactCheckOutlined}
              title="Accepted Consents"
              patientDetails={{
                "Signed by": consentPerformer?.name?.[0].given?.[0] || null,
                "Relationship to patient": formatRelationshipToPatient(
                  consentPerformer?.relationship?.[0].coding?.[0].code || null
                ),
                "Date & Time": consents
                  ? formatDateTime(consents?.[0]?.dateTime || "", "time")
                  : null,
              }}
              patientChecks={{
                "Provider Terms & Conditions and Privacy Policy.":
                  consentTexts.includes(
                    "Terms & Conditions and Privacy Policy"
                  ) || undefined,
                "HIPAA Acknowledgement":
                  consentTexts.includes("Notice of Privacy Practices") ||
                  undefined,
                "Consent to Treat and Guarantee of Payment":
                  consentTexts.includes(
                    "Consent to Treat and Guarantee of Payment"
                  ) || undefined,
                "Financial Agreement":
                  consentTexts.includes("Financial Policy") || undefined,
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <PatientInformation
              TitleIcon={MonetizationOnOutlined}
              title="Payer"
              patientDetails={
                coverageOrganization != null
                  ? {
                      Payer: coverageOrganization?.name,
                      "Policy holder's first name": coveragePayer
                        ? coveragePayer?.name?.[0].given?.[0]
                        : patient.name?.[0].given?.[0],
                      "Policy holder's last name": coveragePayer
                        ? coveragePayer?.name?.[0].family
                        : patient.name?.[0].family,
                      "Policy holder's date of birth": coveragePayer
                        ? formatDateTime(coveragePayer?.birthDate || "", "date")
                        : patient?.birthDate
                        ? formatDateTime(patient?.birthDate || "", "date")
                        : null,
                      "ID number": coverage?.subscriberId,
                    }
                  : {
                      Payer: patient ? "Self-pay" : null,
                      "Cardpointe Identifier":
                        patient &&
                        patient.identifier?.[0].assigner?.display ===
                          "CardPointe"
                          ? patient.identifier?.[0].value
                          : null,
                    }
              }
            />
          </Grid>
        </Grid>
        <DeleteDialog
          open={isDeleteDialogOpen}
          title="Cancel Appointment"
          description={
            <span>
              Are you sure you want to cancel the appointment with{" "}
              <b>
                {ORGANIZATION_NAME_LONG} on{" "}
                {formatDateTime(appointment?.start || "", "time")}
              </b>
              ?
              <br />
              <br />
              Canceling this appointment will open up the slot for another
              patient to book. It will not update anything in eClinicalWorks or
              CardPointe, so be sure to take any manual cancelation steps in
              those applications if you have not already done so.
            </span>
          }
          closeButtonText="Keep"
          deleteButtonText="Cancel Appointment"
          handleClose={() => setIsDeleteDialogOpen(false)}
          handleDelete={handleDelete}
        />
      </>
    </PageContainer>
  );
}
