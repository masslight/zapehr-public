import React, { ReactElement } from "react";
import { Check, Close, SvgIconComponent } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Link,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { otherColors } from "../CustomThemeProvider";

const { REACT_APP_ORGANIZATION_CONSENTS_DOMAIN: ORGANIZATION_CONSENTS_DOMAIN } =
  process.env;
if (ORGANIZATION_CONSENTS_DOMAIN == null) {
  throw new Error("Could not load env variable");
}

export interface PatientProps {
  [key: string]: string | null | undefined;
}

export enum PatientCheckTitles {
  "Provider Terms & Conditions and Privacy Policy." = "Provider Terms & Conditions and Privacy Policy.",
  "HIPAA Acknowledgement" = "HIPAA Acknowledgement",
  "Consent to Treat and Guarantee of Payment" = "Consent to Treat and Guarantee of Payment",
  "Financial Agreement" = "Financial Agreement",
}

// Automatically use the enum to create the type.
// https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type
export type PatientChecks = Record<PatientCheckTitles, boolean | undefined>;

const forms: { [key in PatientCheckTitles]: ReactElement } = {
  "Provider Terms & Conditions and Privacy Policy.": (
    <>
      Provider{" "}
      <Link
        href={`${ORGANIZATION_CONSENTS_DOMAIN}/terms-and-conditions/`}
        target="_blank"
      >
        Terms & Conditions
      </Link>{" "}
      and{" "}
      <Link
        href={`${ORGANIZATION_CONSENTS_DOMAIN}/privacy-policy/`}
        target="_blank"
      >
        Privacy Policy
      </Link>
      .
    </>
  ),
  "HIPAA Acknowledgement": (
    <Link
      href={`${ORGANIZATION_CONSENTS_DOMAIN}/notice-of-privacy-practices/`}
      target="_blank"
    >
      HIPAA Acknowledgement
    </Link>
  ),
  "Consent to Treat and Guarantee of Payment": (
    <Link href={`${ORGANIZATION_CONSENTS_DOMAIN}/BH-consent/`} target="_blank">
      Consent to Treat and Guarantee of Payment
    </Link>
  ),
  "Financial Agreement": (
    <Link
      href={`${ORGANIZATION_CONSENTS_DOMAIN}/BH-financial-policy/`}
      target="_blank"
    >
      Financial Agreement
    </Link>
  ),
};

interface PatientInformationProps {
  element?: ReactElement;
  patientChecks?: PatientChecks;
  patientDetails?: PatientProps;
  title: string;
  TitleIcon: SvgIconComponent;
}

export default function PatientInformation({
  element,
  patientChecks,
  patientDetails,
  title,
  TitleIcon,
}: PatientInformationProps): ReactElement {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 4,
      }}
    >
      <Typography
        variant="h4"
        color="primary.dark"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Avatar sx={{ backgroundColor: theme.palette.secondary.main }}>
          <TitleIcon sx={{ color: theme.palette.background.paper }} />
        </Avatar>
        {title}
      </Typography>
      {patientDetails && (
        <Table
          size="small"
          sx={{
            mt: 1,
          }}
        >
          <TableBody>
            {Object.keys(patientDetails).map((patientDetail) => {
              return (
                <TableRow
                  key={patientDetail}
                  sx={{
                    td: {
                      border: "none",
                    },
                  }}
                >
                  <>
                    <TableCell
                      sx={{
                        width: "40%",
                        fontWeight: "bold",
                        color: theme.palette.primary.dark,
                        pl: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                      }}
                    >
                      <>
                        {patientDetail}
                        <div
                          style={{
                            display: "inline-block",
                            height: "1px",
                            width: "100%",
                            backgroundImage: `linear-gradient(to right, ${otherColors.dottedLine} 33%, rgba(255, 255, 255, 0) 0%)`,
                            backgroundSize: "10px",
                            marginLeft: 5,
                          }}
                        />
                      </>
                    </TableCell>
                    <TableCell
                      sx={{
                        pl: 1,
                      }}
                    >
                      {patientDetails[patientDetail] || (
                        <Skeleton aria-busy="true" width={200} />
                      )}
                    </TableCell>
                  </>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
      {patientChecks && (
        <Table
          size="small"
          sx={{
            mt: 1,
          }}
        >
          <TableBody>
            {Object.keys(patientChecks).map((patientCheck) => {
              // Typecast it because we can't iterate over the object itself, unfortunately, so it becomes a string.
              const patientCheckTitle = patientCheck as PatientCheckTitles;
              return (
                <TableRow
                  key={patientCheck}
                  sx={{
                    td: {
                      border: "none",
                    },
                  }}
                >
                  <>
                    <TableCell
                      sx={{
                        p: 0,
                        width: "1%",
                      }}
                    >
                      {patientChecks[patientCheckTitle] ? (
                        <>
                          <Check color="primary" />
                          <Box component="span" sx={visuallyHidden}>
                            Yes
                          </Box>
                        </>
                      ) : patientChecks[patientCheckTitle] === false ? (
                        <>
                          <Close color="error" />
                          <Box component="span" sx={visuallyHidden}>
                            No
                          </Box>
                        </>
                      ) : (
                        <>
                          <Skeleton
                            variant="circular"
                            width={20}
                            height={20}
                            aria-busy="true"
                          />
                          <Box component="span" sx={visuallyHidden}>
                            Loading
                          </Box>
                        </>
                      )}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 1,
                        pr: 0,
                      }}
                    >
                      {forms[patientCheckTitle]}
                    </TableCell>
                  </>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
      {element}
    </Paper>
  );
}
