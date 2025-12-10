import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    skillsHave: "",
    skillsWant: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
        setFormData({
          name: res.data.name || "",
          skillsHave: res.data.skillsHave?.join(", ") || "",
          skillsWant: res.data.skillsWant?.join(", ") || "",
        });
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch user data");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleUpdateProfile = async () => {
    if (!user?._id) return;

    try {
      const res = await api.put(`/user/update-profile/${user._id}`, {
        name: formData.name,
        skillsHave: formData.skillsHave.split(",").map((s) => s.trim()).filter(s => s),
        skillsWant: formData.skillsWant.split(",").map((s) => s.trim()).filter(s => s),
      });

      toast.success("Profile updated successfully!");
      setUser(res.data);
      setOpenEdit(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
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

  if (!user) return null;

  return (
    <>
      <Box
        sx={{
          backgroundColor: "#e3f2fd",
          minHeight: "100vh",
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 2,
              backgroundColor: "#ffffff",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
              position: "relative",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
                Profile
              </Typography>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setOpenEdit(true)}
                sx={{
                  textTransform: "none",
                  borderRadius: 1,
                  backgroundColor: "#1976d2",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                  },
                }}
              >
                Edit
              </Button>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  fontSize: "2rem",
                  backgroundColor: "#1976d2",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
                    {user.name}
                  </Typography>
                  <Chip
                    label="USER"
                    size="small"
                    sx={{
                      backgroundColor: "#1976d2",
                      color: "white",
                      fontWeight: 600,
                      height: 20,
                      fontSize: "0.7rem",
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                  <EmailIcon sx={{ fontSize: 16, color: "#64748b" }} />
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    {user.email}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>
                    Skills Have
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {user.skillsHave?.length ? (
                      user.skillsHave.map((skill, i) => (
                        <Chip
                          key={i}
                          label={skill}
                          size="small"
                          sx={{
                            backgroundColor: "#e3f2fd",
                            color: "#1976d2",
                            fontWeight: 500,
                          }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ color: "#64748b" }}>
                        No skills added
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box>
                  <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>
                    Skills Want
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {user.skillsWant?.length ? (
                      user.skillsWant.map((skill, i) => (
                        <Chip
                          key={i}
                          label={skill}
                          size="small"
                          sx={{
                            backgroundColor: "#e3f2fd",
                            color: "#1976d2",
                            fontWeight: 500,
                          }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ color: "#64748b" }}>
                        No skills added
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: "#1e293b" }}>Edit Profile</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label="Skills Have (comma separated)"
            fullWidth
            value={formData.skillsHave}
            onChange={(e) => setFormData({ ...formData, skillsHave: e.target.value })}
            placeholder="e.g., React, JavaScript, Python"
          />
          <TextField
            label="Skills Want (comma separated)"
            fullWidth
            value={formData.skillsWant}
            onChange={(e) => setFormData({ ...formData, skillsWant: e.target.value })}
            placeholder="e.g., Node.js, TypeScript, AWS"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenEdit(false)}
            sx={{ textTransform: "none", color: "#64748b" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateProfile}
            variant="contained"
            sx={{
              textTransform: "none",
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
