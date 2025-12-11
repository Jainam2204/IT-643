import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { toast } from "react-toastify";

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = location.state || {};

  const [code, setCode] = useState("");

  if (!userId) {
    navigate("/signup");
  }

  const handleVerify = async () => {
    try {
      await api.post("/auth/verify", {
        userId,
        verificationCode: code,
      });

      toast.success("Email verified! You can now login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
      navigate("/signup");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#eaf7ff",
        p: 2,
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: "420px",
            maxWidth: "100%",
            p: { xs: 4, sm: 5 },
            borderRadius: 2,
            backgroundColor: "#ffffff",
            boxShadow: "0 12px 30px rgba(16, 24, 40, 0.08)",
          }}
        >
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ fontWeight: 700, color: "#0f1724" }}
          >
            Verify Your Email
          </Typography>

          <Typography
            variant="body2"
            align="center"
            sx={{
              mb: 3,
              color: "text.secondary",
              maxWidth: "90%",
              mx: "auto",
            }}
          >
            Enter the verification code sent to your email.
          </Typography>

          <TextField
            placeholder="Enter your verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            fullWidth
            margin="normal"
            size="small"
          />

          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              py: 1.3,
              fontSize: "1rem",
              fontWeight: 700,
              borderRadius: 1,
              backgroundColor: "#0B75C9",
              textTransform: "none",
              "&:hover": { backgroundColor: "#0962a8" },
            }}
            onClick={handleVerify}
          >
            Confirm
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
