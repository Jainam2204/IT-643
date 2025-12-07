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
// import Navbar from "../../components/Navbar";
import api from "../../utils/api"

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
const [reportStats, setReportStats] = useState({
  reportCount: 0,
  isBanned: false,
  maxAllowedBeforeBan: 3,
});

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
useEffect(() => {
  const fetchReportStats = async () => {
    if (!user) return;

    try {
      const res = await api.get("/report/my-stats");
      setReportStats(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch report stats");
    }
  };

  fetchReportStats();
}, [user]);


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
    <Box
      sx={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%)",
      }}
    >
      <Container sx={{ mt: 10, pb: 6 }}>
        {/* ================= DASHBOARD SUMMARY ================= */}
       {user && (
  <Grid container spacing={3} sx={{ mb: 4 }}>
    {/* 👤 Profile */}
    <Grid item xs={12} sm={6} md={3}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          textAlign: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 24px rgba(102, 126, 234, 0.3)",
          },
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          👤 Profile
        </Typography>
        <Typography sx={{ mt: 1, fontWeight: 700, fontSize: "1.1rem" }}>
          {user.name}
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem", mt: 0.5 }}>
          {user.email}
        </Typography>
      </Paper>
    </Grid>

    {/* 🧩 Skills Have */}
    <Grid item xs={12} sm={6} md={3}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          textAlign: "center",
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 24px rgba(16, 185, 129, 0.3)",
          },
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          🧩 Skills Have
        </Typography>
        <Typography sx={{ mt: 1, fontWeight: 600, fontSize: "0.95rem" }}>
          {user.skillsHave?.join(", ") || "N/A"}
        </Typography>
      </Paper>
    </Grid>

    {/* 🎯 Skills Want */}
    <Grid item xs={12} sm={6} md={3}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          textAlign: "center",
          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          color: "white",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 24px rgba(59, 130, 246, 0.3)",
          },
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          🎯 Skills Want
        </Typography>
        <Typography sx={{ mt: 1, fontWeight: 600, fontSize: "0.95rem" }}>
          {user.skillsWant?.join(", ") || "N/A"}
        </Typography>
      </Paper>
    </Grid>

    {/* 🤝 Connections */}
    <Grid item xs={12} sm={6} md={3}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          textAlign: "center",
          background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
          color: "white",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 24px rgba(139, 92, 246, 0.3)",
          },
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          🤝 Connections
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "white", my: 1 }}
        >
          {connections.length}
        </Typography>
        <Typography sx={{ fontSize: "0.875rem", opacity: 0.9 }}>
          Free Left: {user.freeConnectionLeft}
        </Typography>
      </Paper>
    </Grid>

    {/* 🚨 Reports */}
    <Grid item xs={12} sm={6} md={3}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          textAlign: "center",
          background: reportStats.isBanned
            ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
            : reportStats.reportCount >= 3
            ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            : "linear-gradient(135deg, #64748b 0%, #475569 100%)",
          color: "white",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: reportStats.isBanned
              ? "0 12px 24px rgba(239, 68, 68, 0.3)"
              : "0 12px 24px rgba(100, 116, 139, 0.3)",
          },
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          🚨 Reports
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
          {reportStats.reportCount}
        </Typography>
        <Typography sx={{ fontSize: "0.875rem", opacity: 0.9 }}>
          Reports on your account
        </Typography>

        {reportStats.reportCount >= 3 && !reportStats.isBanned && (
          <Typography
            sx={{
              mt: 1.5,
              fontSize: "0.75rem",
              color: "white",
              fontWeight: 600,
              opacity: 0.95,
            }}
          >
            ⚠ Warning: Multiple reports detected
          </Typography>
        )}

        {reportStats.isBanned && (
          <Typography
            sx={{
              mt: 1.5,
              fontSize: "0.75rem",
              color: "white",
              fontWeight: 700,
            }}
          >
            🚫 Account Banned
          </Typography>
        )}
      </Paper>
    </Grid>
  </Grid>
)}


        {/* ================= SUGGESTED CONNECTIONS ================= */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 4,
            background: "white",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
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
