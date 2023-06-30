import React from "react";
import { createTheme, ThemeProvider } from "@mui/material";
import { TypographyOptions } from "@mui/material/styles/createTypography";

const palette = {
  background: {
    default: "#F9FAFB",
    paper: "#FFFFFF",
  },
  primary: {
    main: "#3548c2",
    light: "#3548c2",
    dark: "#3548c2",
    contrast: "#FFFFFF",
  },
  secondary: {
    main: "#f4ae36",
    light: "#f9dd49",
    dark: "#ef8826",
    contrast: "#0A0A0A",
  },
  error: {
    main: "#D32F2F",
    light: "#EF5350",
    dark: "#C62828",
    contrast: "#FFFFFF",
  },
  warning: {
    main: "#ED6C02",
    light: "#FF9800",
    dark: "#E65100",
    contrast: "#FFFFFF",
  },
  info: {
    main: "#0288D1",
    light: "#03A9F4",
    dark: "#01579B",
    contrast: "#FFFFFF",
  },
  success: {
    main: "#2E7D32",
    light: "#4CAF50",
    dark: "#1B5E20",
    contrast: "#FFFFFF",
  },
};

export const otherColors = {
  ratingActive: "#FFB400",
  focusRingColor: "#005FCC",
  dottedLine: "#BFC2C6",
};

const textFonts = ["Tahoma"];
const headerFonts = ["Tahoma"];

const typography: TypographyOptions = {
  fontFamily: textFonts.join(","),
  fontWeightMedium: 500,
  // Headers. Gotta have the "!important" in the fontWeight.
  h1: {
    fontSize: 42,
    fontWeight: "500 !important",
    fontFamily: headerFonts.join(","),
    lineHeight: "140%",
  },
  h2: {
    fontSize: 36,
    fontWeight: "500 !important",
    fontFamily: headerFonts.join(","),
    lineHeight: "140%",
  },
  h3: {
    fontSize: 32,
    fontWeight: "500 !important",
    fontFamily: headerFonts.join(","),
    lineHeight: "140%",
  },
  h4: {
    fontSize: 24,
    fontWeight: "500 !important",
    fontFamily: headerFonts.join(","),
    lineHeight: "140%",
  },
  h5: {
    fontSize: 18,
    fontWeight: "500 !important",
    fontFamily: headerFonts.join(","),
    lineHeight: "140%",
  },
  h6: {
    fontSize: 16,
    fontWeight: "500 !important",
    fontFamily: headerFonts.join(","),
    lineHeight: "140%",
  },
  // Other
  subtitle1: {
    fontSize: 16,
    fontWeight: 700,
    fontFamily: textFonts.join(","),
    lineHeight: "140%",
  },
  subtitle2: {
    fontSize: 12,
    fontWeight: 700,
    fontFamily: textFonts.join(","),
    lineHeight: "140%",
  },
  body1: {
    fontSize: 16,
    fontWeight: 400,
    fontFamily: textFonts.join(","),
    lineHeight: "140%",
  },
  body2: {
    fontSize: 14,
    fontWeight: 400,
    fontFamily: textFonts.join(","),
    lineHeight: "140%",
  },
  caption: {
    fontSize: 12,
    fontWeight: 400,
    fontFamily: textFonts.join(","),
    lineHeight: "140%",
  },
  overline: {
    fontSize: 12,
    fontWeight: 400,
    fontFamily: textFonts.join(","),
    lineHeight: "140%",
  },
};

const theme = createTheme({
  palette: palette,
  typography: typography,
});

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
