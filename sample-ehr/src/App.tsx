import React, { ReactElement, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { CssBaseline } from "@mui/material";
import { TabContext } from "@mui/lab";
import { LicenseInfo } from "@mui/x-data-grid-pro";
import Navbar from "./components/navigation/Navbar";
import AppointmentPage from "./pages/Appointment";
import AppointmentsPage from "./pages/Appointments";
import AppointmentsSearch from "./pages/AppointmentsSearch";
import Logout from "./pages/Logout";
import InsurancePage from "./pages/Insurance";
import PatientPage from "./pages/Patient";
import PatientsPage from "./pages/Patients";
import { CustomThemeProvider } from "./CustomThemeProvider";

const MUI_X_LICENSE_KEY = process.env.REACT_APP_MUI_X_LICENSE_KEY;
if (MUI_X_LICENSE_KEY != null) {
  LicenseInfo.setLicenseKey(MUI_X_LICENSE_KEY);
}

function App(): ReactElement {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const [currentTab, setCurrentTab] = useState("Appointments");

  if (!isAuthenticated && !isLoading) {
    loginWithRedirect().catch((error) => {
      throw new Error("Error calling loginWithRedirect Auth0", error);
    });
  }

  if (!isAuthenticated) {
    return <span>Loading</span>;
  }

  return (
    <CustomThemeProvider>
      <CssBaseline />
      {/* <div className="app"> */}
      <BrowserRouter>
        <TabContext value={currentTab}>
          <Navbar setCurrentTab={setCurrentTab} />
          <Routes>
            <Route path="/" element={<Navigate to="/appointments" />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route
              path="/appointments/search"
              element={<AppointmentsSearch />}
            />
            <Route path="/appointment/:id" element={<AppointmentPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patient/:id" element={<PatientPage />} />
            <Route path="/patient/:id/insurance" element={<InsurancePage />} />
          </Routes>
        </TabContext>
      </BrowserRouter>
      {/* </div> */}
    </CustomThemeProvider>
  );
}

export default App;
