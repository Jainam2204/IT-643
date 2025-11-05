import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Grid,
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { BadgeCheck, Users, Code, Target, PencilLine } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [formData, setFormData] = useState({ name: "", skillsHave: "", skillsWant: "" });

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("You must be logged in");
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
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

  // Handle profile update
  const handleUpdateProfile = async () => {
    const token = localStorage.getItem("token");
    if (!user?._id) return;

    try {
      const res = await axios.put(
        `http://localhost:3000/user/update-profile/${user._id}`,
        {
          name: formData.name,
          skillsHave: formData.skillsHave.split(",").map((s) => s.trim()),
          skillsWant: formData.skillsWant.split(",").map((s) => s.trim()),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
          height: "100vh",
          background: "linear-gradient(135deg, #f3f0ff, #f8f7ff)",
        }}
      >
        <CircularProgress size={60} sx={{ color: "#5e35b1" }} />
      </Box>
    );
  }

  if (!user) return null;

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 12, mb: 8, display: "flex", justifyContent: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: "100%", maxWidth: 700 }}
        >
          <Paper
            elevation={10}
            sx={{
              p: { xs: 4, sm: 6 },
              borderRadius: 6,
              backdropFilter: "blur(12px)",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,255,0.8))",
            }}
          >
            <Grid container spacing={4} alignItems="center" justifyContent="center">
              <Grid item xs={12} md={4} textAlign="center">
                <Avatar
                  sx={{
                    width: 130,
                    height: 130,
                    fontSize: "3rem",
                    mx: "auto",
                    bgcolor: "#6d28d9",
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>

                <Typography variant="h5" sx={{ mt: 2, fontWeight: 700 }}>
                  {user.name}
                </Typography>

                <Typography variant="body2" sx={{ color: "#666" }}>
                  {user.email}
                </Typography>

                <Button
                  startIcon={<PencilLine />}
                  variant="contained"
                  sx={{ mt: 2, borderRadius: "30px" }}
                  onClick={() => setOpenEdit(true)}
                >
                  Edit Profile
                </Button>
              </Grid>

              <Grid item xs={12} md={8}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Chip
                    icon={<BadgeCheck size={18} />}
                    label={user.isVerified ? "Verified" : "Not Verified"}
                    sx={{
                      bgcolor: user.isVerified ? "#16a34a" : "#dc2626",
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    icon={<Users size={18} />}
                    label={`Free Connections: ${user.freeConnectionLeft ?? 0}`}
                    sx={{
                      bgcolor: "#3b82f6",
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="body1" fontWeight={600}>
                    <Code size={18} /> Skills Have:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {user.skillsHave?.length ? (
                      user.skillsHave.map((skill, i) => (
                        <Chip key={i} label={skill} sx={{ bgcolor: "#a855f7", color: "white" }} />
                      ))
                    ) : (
                      <Typography variant="body2">None</Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="body1" fontWeight={600}>
                    <Target size={18} /> Skills Want:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {user.skillsWant?.length ? (
                      user.skillsWant.map((skill, i) => (
                        <Chip key={i} label={skill} sx={{ bgcolor: "#f97316", color: "white" }} />
                      ))
                    ) : (
                      <Typography variant="body2">None</Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>
      </Container>

      {/* EDIT PROFILE DIALOG */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
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
          />
          <TextField
            label="Skills Want (comma separated)"
            fullWidth
            value={formData.skillsWant}
            onChange={(e) => setFormData({ ...formData, skillsWant: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleUpdateProfile} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
