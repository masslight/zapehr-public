import { PersonAddAlt1 } from "@mui/icons-material";
import {
  Button,
  Card,
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import {
  DataGridPro,
  GridColDef,
  LicenseInfo,
  useGridApiRef,
} from "@mui/x-data-grid-pro";
import { Patient } from "fhir/r4";
import { DateTime } from "luxon";
import React, {
  FormEvent,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";

function chooseJson(json: any, appEnv: string): any {
  return appEnv === "local" ? json : json.output;
}

function App(): ReactElement {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [addPatientFormOpen, setAddPatientFormOpen] = useState<boolean>(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentPatient, setCurrentPatient] = useState<Patient | undefined>(
    undefined
  );
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<DateTime | null>(null);
  const [address, setAddress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const dataGridApiRef = useGridApiRef();
  const theme = useTheme();

  if (process.env.REACT_APP_MUI_X_LICENSE_KEY != null) {
    LicenseInfo.setLicenseKey(process.env.REACT_APP_MUI_X_LICENSE_KEY);
  }

  const addLog = useCallback((message: string) => {
    setLogs((logs) => [...logs, message]);
  }, []);

  const handleAddPatient = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!firstName || !lastName || !dateOfBirth || !address) {
      setError("Error: All fields are required");
      return;
    }

    addLog(
      `Calling zapEHR function ${process.env.REACT_APP_CREATE_PATIENT_URL} to create patient. This function validates the parameters and then calls zapEHR's FHIR API to create a patient.`
    );
    let response = undefined;
    try {
      response = await fetch(process.env.REACT_APP_CREATE_PATIENT_URL || "", {
        method: "post",
        body: JSON.stringify({
          firstName,
          lastName,
          dateOfBirth: dateOfBirth.toISODate(),
          address,
        }),
        headers: {
          "x-zapehr-project-id": process.env.REACT_APP_PROJECT_ID || "",
        },
      });
    } catch (error) {
      addLog("Error saving patient to zapEHR");
      console.log("Error saving patient: ", response);
      setIsLoading(false);
      return;
    }

    if (response.ok) {
      addLog("Successfully created patient in zapEHR");
      setFirstName("");
      setLastName("");
      setDateOfBirth(null);
      setAddress("");
      setAddPatientFormOpen(false);
      setError(null);
      await searchPatients();
    }
  };

  const searchPatients = useCallback(async () => {
    addLog(
      `Calling zapEHR function ${process.env.REACT_APP_GET_PATIENTS_URL} to get patients. This function searches patients using zapEHR's FHIR API.`
    );
    setIsLoading(true);
    let response = undefined;
    try {
      response = await fetch(process.env.REACT_APP_GET_PATIENTS_URL || "", {
        method: "post",
        headers: {
          "x-zapehr-project-id": process.env.REACT_APP_PROJECT_ID || "",
        },
      });
    } catch (error) {
      addLog("Error getting patients from zapEHR");
      console.log("Error getting patients: ", response);
      setIsLoading(false);
      return;
    }
    if (response && response.ok) {
      addLog("Successfully got patients from zapEHR");
      const data = await response.json();
      const patientsTemp: Patient[] = chooseJson(
        data,
        process.env.REACT_APP_ENV || ""
      );
      setPatients(patientsTemp);
    } else {
      addLog("Error getting patients from zapEHR");
      console.log("Error getting patients: ", response);
    }
    setIsLoading(false);
  }, [addLog]);

  useEffect(() => {
    // select the first patient
    if (dataGridApiRef.current && patients.length > 0) {
      dataGridApiRef.current.setRowSelectionModel(
        patients[0].id ? [patients[0].id] : []
      );
    }
  }, [dataGridApiRef, patients]);

  const getPatientName = (patient: Patient): null | string => {
    if (!patient.name) {
      return null;
    }

    return `${patient.name[0]["given"]} ${patient.name[0]["family"]}`;
  };

  const getPatientAddress = (patient: Patient): null | string => {
    if (
      !patient.address ||
      patient.address.length === 0 ||
      !patient.address[0].line
    ) {
      return null;
    }

    return patient.address[0].line[0];
  };

  const columns: GridColDef[] = [
    { field: "patient", headerName: "Patient" },
    {
      field: "dateOfBirth",
      headerName: "Date of Birth",
    },
  ];

  const rows = patients.map((patient) => {
    return {
      id: patient.id,
      patient: getPatientName(patient),
      dateOfBirth: patient.birthDate,
    };
  });

  useEffect(() => {
    searchPatients().catch((error) => {
      console.log("Error getting patients: ", error);
    });
  }, [searchPatients]);

  return (
    <Container disableGutters>
      <Grid container marginTop={4}>
        <Grid item xs={7.5}>
          <Grid container justifyContent="space-between">
            <Grid item>
              <Typography variant="h5">Patients</Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<PersonAddAlt1 />}
                onClick={() => setAddPatientFormOpen(true)}
              >
                Add patient
              </Button>
            </Grid>
          </Grid>
          {addPatientFormOpen && (
            <Card sx={{ marginTop: 2, padding: 4, borderRadius: 2 }}>
              <form onSubmit={handleAddPatient}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6">Add patient</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="First name"
                      name="firstName"
                      required
                      variant="outlined"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Last name"
                      name="lastName"
                      required
                      variant="outlined"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <LocalizationProvider dateAdapter={AdapterLuxon}>
                      <DatePicker
                        label="Date of birth"
                        value={dateOfBirth}
                        onChange={(value) => setDateOfBirth(value)}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      required
                      variant="outlined"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                    />
                  </Grid>
                  {error && (
                    <Grid item xs={12}>
                      <Typography color="error">{error}</Typography>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Button variant="contained" type="submit">
                      Submit
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Card>
          )}
          <DataGridPro
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                  page: 0,
                },
              },
            }}
            autoHeight
            columnHeaderHeight={52}
            disableColumnFilter
            disableColumnMenu
            hideFooterSelectedRowCount
            loading={isLoading}
            pageSizeOptions={[5, 25, 50, 100]}
            pagination
            apiRef={dataGridApiRef}
            onRowSelectionModelChange={(rowSelectionModel) => {
              if (rowSelectionModel.length > 0 && patients.length > 0) {
                addLog(`Selected patient with id ${rowSelectionModel}`);
                setCurrentPatient(
                  patients.find(
                    (patient) => patient.id === rowSelectionModel[0]
                  )
                );
              }
            }}
            rows={rows ?? []}
            columns={columns.map((column) => ({ ...column, flex: 1 }))}
            sx={{
              "& .MuiDataGrid-row:hover": {
                cursor: "pointer",
                backgroundColor: alpha(theme.palette.primary.light, 0.08),
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: "bold",
              },
              marginTop: 2,
              backgroundColor: "white",
            }}
          />
          {currentPatient && (
            <Card sx={{ marginTop: 4, padding: 4, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {getPatientName(currentPatient)}
              </Typography>
              <Typography variant="subtitle1">
                Patient ID: {currentPatient.id}
              </Typography>
              <Typography variant="subtitle1">
                Date of birth: {currentPatient.birthDate}
              </Typography>
              <Typography variant="subtitle1">
                Address: {getPatientAddress(currentPatient)}
              </Typography>

              <Typography variant="subtitle1">
                FHIR resource:
                <pre>{JSON.stringify(currentPatient, null, 4)}</pre>
              </Typography>
            </Card>
          )}
        </Grid>
        <Grid item xs={0.5}></Grid>
        <Grid item xs={4}>
          <Typography variant="h5">Logs</Typography>
          <List
            id="logs"
            sx={{
              height: "501px",
              overflow: "scroll",
              border: "1px solid black",
              marginTop: 2,
              borderRadius: 2,
              backgroundColor: "#212A3B",
              color: "white",
              "*": { overflowAnchor: "none" },
            }}
          >
            {logs.map((log, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={log}
                  sx={{
                    ".MuiTypography-root": {
                      fontFamily: "monospace !important",
                    },
                  }}
                />
              </ListItem>
            ))}
            <div
              id="anchor"
              style={{ overflowAnchor: "auto", height: "1px" }}
            ></div>
          </List>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
