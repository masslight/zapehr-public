import { Close, Search } from "@mui/icons-material";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import React, {
  ChangeEvent,
  Dispatch,
  ReactElement,
  SetStateAction,
} from "react";

interface PatientSearchProps {
  state?: string | null;
  setState: Dispatch<SetStateAction<string | null>>;
}

export default function PatientSearch({
  state,
  setState,
}: PatientSearchProps): ReactElement {
  return (
    <TextField
      id="patient-name"
      label="Patient"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {state && state?.length > 0 ? (
              <IconButton
                aria-label="clear patient search"
                onClick={() => setState("")}
                onMouseDown={(event) => event.preventDefault()}
                sx={{ p: 0 }}
              >
                <Close />
              </IconButton>
            ) : (
              <Search />
            )}
          </InputAdornment>
        ),
      }}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        if (setState) {
          setState(event.target.value);
        }
      }}
      sx={{ mr: 2, mb: 2 }}
      value={state ?? ""}
    />
  );
}
