import React, {
  Dispatch,
  MouseEvent,
  ReactElement,
  SetStateAction,
  SyntheticEvent,
  useEffect,
  useState,
} from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  AccountCircle,
  KeyboardArrowDown,
  // Settings,
} from "@mui/icons-material";
import { TabList } from "@mui/lab";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  // IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Tab,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { getUser } from "../../api/api";
import logo from "../../assets/logo.png";

const { REACT_APP_ORGANIZATION_NAME_SHORT: ORGANIZATION_NAME_SHORT } =
  process.env;
if (ORGANIZATION_NAME_SHORT == null) {
  throw new Error("Could not load env variable");
}

interface NavbarItems {
  [key: string]: { url: string; paths: string[] };
}

export const navbarItems: NavbarItems = {
  Appointments: { url: "/appointments", paths: ["appointment"] },
  Patients: { url: "/patients", paths: ["patient"] },
};

interface NavbarProps {
  setCurrentTab: Dispatch<SetStateAction<string>>;
}

export interface zapEHRUser {
  email: string;
  name: string;
}

export default function Navbar({ setCurrentTab }: NavbarProps): ReactElement {
  const theme = useTheme();
  const location = useLocation();
  const { getAccessTokenSilently } = useAuth0();
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [user, setUser] = useState<zapEHRUser | null>(null);

  // on page load set the tab to the opened page
  useEffect(() => {
    const currentUrl = location.pathname;

    Object.keys(navbarItems).forEach((navbarItem) => {
      if (navbarItems[navbarItem].url === currentUrl) {
        setCurrentTab(navbarItem);
      }
    });
  }, [location.pathname, setCurrentTab]);

  useEffect(() => {
    async function getZapEHRUser(): Promise<void> {
      const accessToken = await getAccessTokenSilently();
      setUser(await getUser(accessToken));
    }

    getZapEHRUser().catch((error) => {
      console.log(error);
    });
  }, [getAccessTokenSilently]);

  return (
    <AppBar
      position="static"
      color="transparent"
      sx={{
        boxShadow: "none",
        borderBottom: `1px solid ${theme.palette.primary.light}`,
        backgroundColor: "white", // theme.palette.secondary.main
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters variant="dense">
          <Link to="/">
            <img
              src={logo}
              alt={`${ORGANIZATION_NAME_SHORT} logo`}
              style={{
                marginRight: 20,
                marginTop: 10,
                width: 150,
              }}
            />
          </Link>
          <TabList
            onChange={(_: SyntheticEvent, value: string) => {
              setCurrentTab(value);
            }}
            sx={{
              mt: 2.5,
              minHeight: 60,
              flexGrow: 1,
            }}
          >
            {Object.keys(navbarItems).map((navbarItem, index) => (
              <Tab
                key={navbarItem}
                label={navbarItem}
                value={navbarItem}
                id={`navbar-tab-${index}`}
                aria-controls={`hello-${index}`} // `tabpanel-${index}`
                component={Link}
                to={navbarItems[navbarItem].url}
                sx={{
                  fontSize: 16,
                  fontWeight: 400,
                  textTransform: "capitalize",
                }}
              />
            ))}
          </TabList>
          {/* <IconButton color="primary" sx={{ mr: 2 }}>
            <Settings />
          </IconButton> */}
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user?.name || <Skeleton width={100} aria-busy="true" />}
          </Typography>
          <Button
            color="primary"
            aria-label="open user account menu"
            aria-controls="user-menu"
            aria-haspopup="true"
            onClick={(event: MouseEvent<HTMLElement>) =>
              setAnchorElement(event.currentTarget)
            }
            endIcon={<KeyboardArrowDown />}
          >
            <AccountCircle />
          </Button>
          <Menu
            id="user-menu"
            anchorEl={anchorElement}
            open={anchorElement !== null}
            onClose={() => setAnchorElement(null)}
          >
            <MenuItem>
              <Box>
                <Typography variant="body1">
                  {ORGANIZATION_NAME_SHORT} Admin
                </Typography>
                <Typography variant="caption">{user?.email}</Typography>
              </Box>
            </MenuItem>
            <Divider />
            <Link to="/logout" style={{ textDecoration: "none" }}>
              <MenuItem>
                <Typography
                  variant="body1"
                  color="primary"
                  sx={{ fontWeight: "bold" }}
                >
                  Log out
                </Typography>
              </MenuItem>
            </Link>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
