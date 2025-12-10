import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  Link,
  Stepper,
  Step,
  StepLabel,
  Grid,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const steps = ["Create Account", "Add Skills"];

export default function SignupForm() {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    skillsHave: "",
    skillsWant: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setError("");
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        skillsHave: formData.skillsHave.split(",").map(s => s.trim()).filter(s => s),
        skillsWant: formData.skillsWant.split(",").map(s => s.trim()).filter(s => s),
      });

      toast.success(res.data.message || "Signup successful!");
      navigate("/verify-email", { state: { userId: res.data.userId } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
      }}
    >
      {/* Left Panel - Promotional Content */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flex: 1,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 6,
          color: "white",
        }}
      >
        <Box sx={{ maxWidth: 500 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: "white",
            }}
          >
            Join SkillXchange and Grow Together
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 6,
              fontSize: "1.1rem",
              lineHeight: 1.8,
              color: "rgba(255, 255, 255, 0.9)",
            }}
          >
            Match with people who have the skills you want and want the skills
            you already know. Practice, pair-program, mock interview, and level
            up together.
          </Typography>

          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 3,
                color: "white",
              }}
            >
              HOW SKILLXCHANGE WORKS
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                "1 Create your profile",
                "2 Match with learners",
                "3 Swap & grow together",
              ].map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: 2,
                    p: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <Typography variant="body1" sx={{ color: "white" }}>
                    {item}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography
              variant="body2"
              sx={{
                mb: 2,
                color: "rgba(255, 255, 255, 0.8)",
                fontWeight: 600,
              }}
            >
              TRUSTED BY LEARNERS LIKE YOU
            </Typography>
            <Box
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: 2,
                p: 3,
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <Typography
                variant="body1"
                sx={{ mb: 2, fontStyle: "italic", color: "white" }}
              >
                "I swapped my React skills for DSA guidance. It felt like a
                dedicated study buddy — but smarter."
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                — SkillXchange user, JS
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Right Panel - Form */}
      <Box
        sx={{
          flex: { xs: 1, md: 1 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          p: { xs: 2, sm: 4 },
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 2,
              backgroundColor: "#ffffff",
            }}
          >
            <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      "& .MuiStepLabel-label": {
                        fontSize: "0.875rem",
                        fontWeight: step === steps.indexOf(label) ? 600 : 400,
                        color:
                          step === steps.indexOf(label)
                            ? "#1976d2"
                            : "#94a3b8",
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <Typography
              variant="body2"
              align="center"
              sx={{
                mb: 3,
                color: "#64748b",
                fontSize: "0.9rem",
              }}
            >
              {step === 0
                ? "Become part of a community where your skills inspire progress — while the brilliance of others fuels your own."
                : "Tell us about your skills"}
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              {step === 0 && (
                <>
                  <TextField
                    label="Full Name *"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Email *"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Password *"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Confirm Password *"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                    error={!!error}
                    helperText={error}
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            edge="end"
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    fullWidth
                    sx={{
                      mt: 2,
                      py: 1.5,
                      fontSize: "1rem",
                      fontWeight: 600,
                      borderRadius: 1,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      textTransform: "none",
                      "&:hover": {
                        background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                      },
                    }}
                  >
                    Next
                  </Button>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748b", mt: 2 }}
                    align="center"
                  >
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      underline="hover"
                      sx={{
                        color: "#1976d2",
                        fontWeight: 600,
                        "&:hover": { color: "#1565c0" },
                      }}
                    >
                      Log in instead
                    </Link>
                  </Typography>
                </>
              )}

              {step === 1 && (
                <>
                  <TextField
                    label="Skills Have (comma separated)"
                    name="skillsHave"
                    value={formData.skillsHave}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    sx={{ mb: 2 }}
                    placeholder="e.g., React, JavaScript, Python"
                  />
                  <TextField
                    label="Skills Want (comma separated)"
                    name="skillsWant"
                    value={formData.skillsWant}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    sx={{ mb: 2 }}
                    placeholder="e.g., Node.js, TypeScript, AWS"
                  />

                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      mt: 3,
                    }}
                  >
                    <Button
                      onClick={handleBack}
                      variant="outlined"
                      fullWidth
                      sx={{
                        py: 1.5,
                        fontSize: "1rem",
                        fontWeight: 600,
                        borderRadius: 1,
                        textTransform: "none",
                        borderColor: "#cbd5e1",
                        color: "#64748b",
                        "&:hover": {
                          borderColor: "#94a3b8",
                          backgroundColor: "#f8fafc",
                        },
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      sx={{
                        py: 1.5,
                        fontSize: "1rem",
                        fontWeight: 600,
                        borderRadius: 1,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        textTransform: "none",
                        "&:hover": {
                          background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                        },
                      }}
                    >
                      Sign Up
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
