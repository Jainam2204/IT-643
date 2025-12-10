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
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Link,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ChatIcon from "@mui/icons-material/Chat";
import DescriptionIcon from "@mui/icons-material/Description";
import PeopleIcon from "@mui/icons-material/People";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
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
    const fetchConnections = async () => {
      try {
        const res = await api.get("/connect/connections");
        setConnections(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    if (user) fetchConnections();
  }, [user]);

  useEffect(() => {
    const fetchIncomingRequests = async () => {
      if (!user) return;
      try {
        const res = await api.get("/connect/incoming-requests");
        setIncomingRequests(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchIncomingRequests();
  }, [user]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user) return;
      try {
        const res = await api.get("/connect/suggestions");
        const filtered = res.data.filter((s) => s.status !== "accepted");
        setSuggestions(filtered);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSuggestions();
  }, [user]);

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
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  const handleAccept = async (senderId) => {
    try {
      await api.post("/connect/accept", { senderId, receiverId: user._id });
      toast.success("You're now connected!");
      setIncomingRequests((prev) => prev.filter((r) => r._id !== senderId));
      setStatuses((prev) => ({ ...prev, [senderId]: "accepted" }));
      // Refresh connections
      const res = await api.get("/connect/connections");
      setConnections(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept request");
    }
  };

  const handleReject = async (senderId) => {
    try {
      await api.post("/connect/reject", { senderId, receiverId: user._id });
      toast.info("Connection request rejected!");
      setIncomingRequests((prev) => prev.filter((r) => r._id !== senderId));
      setStatuses((prev) => ({ ...prev, [senderId]: "none" }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject request");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#e3f2fd",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: "#e3f2fd",
        minHeight: "100vh",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1e293b",
              mb: 1,
            }}
          >
            Welcome back, {user?.name || "User"}!
          </Typography>
          <Typography variant="body1" sx={{ color: "#64748b" }}>
            Connect with people who have the skills you want and want the skills you already know.
          </Typography>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 0,
              borderRadius: 2,
              backgroundColor: "#ffffff",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <TextField
              fullWidth
              placeholder="Search messages, resources, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    border: "none",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#64748b" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              sx={{
                m: 1,
                px: 3,
                py: 1.5,
                borderRadius: 1,
                backgroundColor: "#1976d2",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#1565c0",
                },
              }}
            >
              Search
            </Button>
          </Paper>
        </Box>

        {/* Action Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                backgroundColor: "#ffffff",
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                textAlign: "center",
                p: 3,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.12)",
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => navigate("/chat")}
            >
              <ChatIcon sx={{ fontSize: 40, color: "#1976d2", mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b", mb: 0.5 }}>
                Start Chat
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Send a message
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                backgroundColor: "#ffffff",
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                textAlign: "center",
                p: 3,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.12)",
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => navigate("/connections")}
            >
              <PeopleIcon sx={{ fontSize: 40, color: "#1976d2", mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b", mb: 0.5 }}>
                Connections
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                View connections
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                backgroundColor: "#ffffff",
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                textAlign: "center",
                p: 3,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.12)",
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => navigate("/profile")}
            >
              <DescriptionIcon sx={{ fontSize: 40, color: "#1976d2", mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b", mb: 0.5 }}>
                Profile
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                View your profile
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                backgroundColor: "#ffffff",
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                textAlign: "center",
                p: 3,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.12)",
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => navigate("/connections")}
            >
              <AddIcon sx={{ fontSize: 40, color: "#1976d2", mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b", mb: 0.5 }}>
                Find Connections
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Discover new people
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activity Sections */}
        <Grid container spacing={3}>
          {/* Incoming Connection Requests */}
          {incomingRequests.length > 0 && (
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: "#ffffff",
                  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                  mb: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b", mb: 2 }}>
                  Connection Requests
                </Typography>
                <Grid container spacing={2}>
                  {incomingRequests.map((request) => (
                    <Grid item xs={12} sm={6} md={4} key={request._id}>
                      <Card
                        elevation={0}
                        sx={{
                          borderRadius: 2,
                          border: "1px solid #e2e8f0",
                          p: 2,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              backgroundColor: "#1976d2",
                              color: "white",
                              fontWeight: 600,
                            }}
                          >
                            {request.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                              {request.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748b" }}>
                              {request.email}
                            </Typography>
                          </Box>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<CheckIcon />}
                            onClick={() => handleAccept(request._id)}
                            sx={{
                              flex: 1,
                              textTransform: "none",
                              borderRadius: 1,
                              backgroundColor: "#10b981",
                              "&:hover": {
                                backgroundColor: "#059669",
                              },
                            }}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CloseIcon />}
                            onClick={() => handleReject(request._id)}
                            sx={{
                              flex: 1,
                              textTransform: "none",
                              borderRadius: 1,
                              borderColor: "#ef4444",
                              color: "#ef4444",
                              "&:hover": {
                                borderColor: "#dc2626",
                                backgroundColor: "#fef2f2",
                              },
                            }}
                          >
                            Reject
                          </Button>
                        </Stack>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* Recent Connections */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: "#ffffff",
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                height: "100%",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
                  Recent Connections
                </Typography>
                <Link
                  component="button"
                  onClick={() => navigate("/connections")}
                  sx={{
                    color: "#1976d2",
                    textDecoration: "none",
                    fontWeight: 500,
                    cursor: "pointer",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  View all
                </Link>
              </Box>
              {connections.length === 0 ? (
                <Typography align="center" sx={{ color: "#64748b", py: 4 }}>
                  No connections yet
                </Typography>
              ) : (
                <Box>
                  {connections.slice(0, 3).map((conn) => (
                    <Box
                      key={conn._id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        py: 1.5,
                        borderBottom: "1px solid #e2e8f0",
                        "&:last-child": {
                          borderBottom: "none",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          backgroundColor: "#1976d2",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 600,
                        }}
                      >
                        {conn.name?.charAt(0).toUpperCase()}
                      </Box>
                      <Box flex={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                          {conn.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                          {conn.email}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Suggested Connections */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: "#ffffff",
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                height: "100%",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
                  Suggested Connections
                </Typography>
                <Link
                  component="button"
                  onClick={() => navigate("/connections")}
                  sx={{
                    color: "#1976d2",
                    textDecoration: "none",
                    fontWeight: 500,
                    cursor: "pointer",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  View all
                </Link>
              </Box>
              {!suggestions.length ? (
                <Typography align="center" sx={{ color: "#64748b", py: 4 }}>
                  No suggestions yet
                </Typography>
              ) : (
                <Box>
                  {suggestions.slice(0, 3).map((s) => {
                    const status = statuses[s._id] || "none";
                    return (
                      <Box
                        key={s._id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          py: 1.5,
                          borderBottom: "1px solid #e2e8f0",
                          "&:last-child": {
                            borderBottom: "none",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            backgroundColor: "#1976d2",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600,
                          }}
                        >
                          {s.name?.charAt(0).toUpperCase()}
                        </Box>
                        <Box flex={1}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                            {s.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#64748b" }}>
                            {s.email}
                          </Typography>
                        </Box>
                        {status === "none" && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleConnect(s._id)}
                            sx={{
                              textTransform: "none",
                              borderRadius: 1,
                              backgroundColor: "#1976d2",
                              "&:hover": {
                                backgroundColor: "#1565c0",
                              },
                            }}
                          >
                            Connect
                          </Button>
                        )}
                        {status === "pending" && (
                          <Button
                            size="small"
                            variant="outlined"
                            disabled
                            sx={{
                              textTransform: "none",
                              borderRadius: 1,
                            }}
                          >
                            Pending
                          </Button>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
