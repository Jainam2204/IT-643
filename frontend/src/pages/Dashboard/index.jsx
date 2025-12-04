import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Stack,
} from "@mui/material";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../utils/api"

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);

  // ✅ Fetch logged-in user
 useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me"); // 👈 cookie-based
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data)); // optional, for PrivateRoute
    } catch (err) {
      console.error(err);
      toast.error("You must be logged in");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };
  fetchUser();
}, [navigate]);


  // ✅ Fetch existing connections
useEffect(() => {
  const fetchConnections = async () => {
    try {
      const res = await api.get("/connect/connections");
      setConnections(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch connections");
    }
  };
  if (user) fetchConnections();
}, [user]);


  // ✅ Fetch connection suggestions
useEffect(() => {
  const fetchSuggestions = async () => {
    if (!user) return;

    try {
      const res = await api.get("/connect/suggestions");
      const filtered = res.data.filter((s) => s.status !== "accepted");
      setSuggestions(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch connection suggestions");
    }
  };
  fetchSuggestions();
}, [user]);

  // ✅ Fetch statuses
useEffect(() => {
  const fetchStatuses = async () => {
    if (!suggestions.length || !user) return;
    const newStatuses = {};

    await Promise.all(
      suggestions.map(async (s) => {
        try {
          const res = await api.get("/connect/status", {
            params: { senderId: user._id, receiverId: s._id },
          });
          newStatuses[s._id] = res.data.status;
        } catch {
          newStatuses[s._id] = "none";
        }
      })
    );

    setStatuses(newStatuses);
  };

  fetchStatuses();
}, [suggestions, user]);


 const handleConnect = async (receiverId) => {
  try {
    await api.post("/connect/request", { receiverId });
    toast.success("Connection request sent!");
    setStatuses((prev) => ({ ...prev, [receiverId]: "pending" }));
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Failed to send request");
  }
};

const handleAccept = async (senderId) => {
  try {
    await api.post("/connect/accept", { senderId, receiverId: user._id });
    toast.success("You’re now connected!");
    setSuggestions((prev) => prev.filter((s) => s._id !== senderId));
    setStatuses((prev) => ({ ...prev, [senderId]: "accepted" }));
  } catch (err) {
    console.error(err);
    toast.error("Failed to accept request");
  }
};

const handleReject = async (senderId) => {
  try {
    await api.post("/connect/reject", { senderId, receiverId: user._id });
    toast.info("Connection request rejected!");
    setStatuses((prev) => ({ ...prev, [senderId]: "none" }));
  } catch (err) {
    console.error(err);
    toast.error("Failed to reject request");
  }
};


  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ backgroundColor: "#f8faf8", minHeight: "100vh" }}>
      <Navbar />
      <Container sx={{ mt: 6, pb: 6 }}>
        {/* ================= DASHBOARD SUMMARY ================= */}
        {user && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
                <Typography variant="h6" sx={{ color: "#2e7d32" }}>
                  👤 Profile
                </Typography>
                <Typography sx={{ mt: 1, fontWeight: 600 }}>
                  {user.name}
                </Typography>
                <Typography sx={{ color: "gray", fontSize: "0.9rem" }}>
                  {user.email}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
                <Typography variant="h6" sx={{ color: "#388e3c" }}>
                  🧩 Skills Have
                </Typography>
                <Typography sx={{ mt: 1, fontWeight: 500 }}>
                  {user.skillsHave?.join(", ") || "N/A"}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
                <Typography variant="h6" sx={{ color: "#388e3c" }}>
                  🎯 Skills Want
                </Typography>
                <Typography sx={{ mt: 1, fontWeight: 500 }}>
                  {user.skillsWant?.join(", ") || "N/A"}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
                <Typography variant="h6" sx={{ color: "#1b5e20" }}>
                  🤝 Connections
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#2e7d32" }}>
                  {connections.length}
                </Typography>
                <Typography sx={{ mt: 1, fontSize: "0.9rem", color: "gray" }}>
                  Free Left: {user.freeConnectionLeft}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* ================= SUGGESTED CONNECTIONS ================= */}
        <Paper
          elevation={5}
          sx={{
            p: 5,
            borderRadius: 4,
            background: "linear-gradient(135deg, #ffffff, #f4faf5)",
            boxShadow: "0 4px 25px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: "#1b5e20",
              textAlign: "center",
              mb: 3,
            }}
          >
            🌿 Suggested Connections
          </Typography>

          <Divider sx={{ mb: 4 }} />

          {!suggestions.length ? (
            <Typography align="center" sx={{ color: "gray" }}>
              No mutual skill matches found yet 😔
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {suggestions.map((s) => {
                const status = statuses[s._id] || "none";
                return (
                  <Grid item xs={12} sm={6} md={4} key={s._id}>
                    <Card
                      elevation={4}
                      sx={{
                        borderRadius: 4,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 8px 20px rgba(27, 94, 32, 0.1)",
                        },
                      }}
                    >
                      <CardContent>
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          sx={{ color: "#2e7d32", mb: 1 }}
                        >
                          {s.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {s.email}
                        </Typography>

                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Skills Have:</strong>{" "}
                          {s.skillsHave?.join(", ") || "N/A"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Skills Want:</strong>{" "}
                          {s.skillsWant?.join(", ") || "N/A"}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={1.5}
                          sx={{ mt: 2, justifyContent: "center" }}
                        >
                          {status === "none" && (
                            <Button
                              variant="contained"
                              size="small"
                              sx={{
                                textTransform: "none",
                                borderRadius: 3,
                                backgroundColor: "#43a047",
                                px: 3,
                                "&:hover": { backgroundColor: "#2e7d32" },
                              }}
                              onClick={() => handleConnect(s._id)}
                            >
                              Connect
                            </Button>
                          )}

                          {status === "pending" && (
                            <Button
                              variant="outlined"
                              size="small"
                              disabled
                              sx={{
                                borderColor: "#81c784",
                                color: "#388e3c",
                                borderRadius: 3,
                                textTransform: "none",
                                px: 3,
                              }}
                            >
                              Pending
                            </Button>
                          )}

                          {status === "received" && (
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => handleAccept(s._id)}
                                sx={{
                                  borderRadius: 3,
                                  textTransform: "none",
                                  px: 2,
                                }}
                              >
                                Accept
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => handleReject(s._id)}
                                sx={{
                                  borderRadius: 3,
                                  textTransform: "none",
                                  px: 2,
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          )}

                          {status === "accepted" && (
                            <Button
                              variant="contained"
                              size="small"
                              disabled
                              sx={{
                                borderRadius: 3,
                                backgroundColor: "#66bb6a",
                                textTransform: "none",
                                px: 3,
                              }}
                            >
                              Connected
                            </Button>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard;
