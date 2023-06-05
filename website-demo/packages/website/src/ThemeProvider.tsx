import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import React, { FC, ReactNode } from "react";
import WorkSans from "./fonts/Work_Sans/static/WorkSans-Regular.ttf";
import WorkSansSemiBold from "./fonts/Work_Sans/static/WorkSans-SemiBold.ttf";

const workSans = {
  fontFamily: "Work Sans",
  fontStyle: "normal",
  src: `url(${WorkSans})`,
};

const workSansSemiBold = {
  fontFamily: "Work Sans",
  fontStyle: "normal",
  fontWeight: "400",
  src: `url(${WorkSansSemiBold})`,
};

const theme = createTheme({
  palette: {
    background: {
      default: "#F9FAFB",
    },
  },
  typography: {
    h4: {
      fontFamily: "Work Sans",
    },
    h5: {
      fontFamily: "Work Sans",
      fontWeight: 500,
    },
    h6: {
      fontFamily: "Work Sans",
    },
    body1: {
      fontFamily: "Work Sans",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "@font-face": [workSans, workSansSemiBold],
      },
    },
  },
});

export const WebsiteThemeProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
