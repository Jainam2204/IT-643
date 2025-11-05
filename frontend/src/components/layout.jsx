import React from "react";
import { Box } from "@mui/material";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const Layout = ({ onLogout }) => {
  return (
    <Box
      sx={{
        m: 0,
        p: 0,
        width: "100%",
        minHeight: "100vh",
        overflowX: "hidden",
        backgroundColor: "#f8fafc",
      }}
    >
      <Navbar onLogout={onLogout} />
      <Box
        component="main"
        sx={{
          mt: 10,
          px: { xs: 2, sm: 4, md: 8 },
          py: 2,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
