import React, { ReactElement } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Breadcrumbs, Link } from "@mui/material";

interface ChainProps {
  link: string;
  children: ReactElement | string;
}

interface CustomBreadcrumbsProps {
  chain: ChainProps[];
}

export default function CustomBreadcrumbs({
  chain,
}: CustomBreadcrumbsProps): ReactElement {
  return (
    <Breadcrumbs aria-label="breadcrumb">
      {chain.map((child) => (
        <Link
          key={child.link}
          underline="hover"
          color="inherit"
          sx={
            child.link === "#"
              ? { fontWeight: "bold", color: "rgba(0, 0, 0, 0.8)" }
              : {}
          }
          component={RouterLink}
          to={child.link}
        >
          {child.children}
        </Link>
      ))}
    </Breadcrumbs>
  );
}
