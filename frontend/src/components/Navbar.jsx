import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  alpha,
  Badge,
  Popover,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CloseIcon from "@mui/icons-material/Close";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useNotifications } from "../context/NotificationContext";
import api from "../utils/api";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const navigate = useNavigate();
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
    { name: "Connections", path: "/connections", icon: <PeopleIcon /> },
    { name: "Chat", path: "/chat", icon: <ChatIcon /> },
  ];
  const { meetingNotifications, removeMeetingNotification } = useNotifications();

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleJoinMeet = (meetingId, connectionId) => {
    removeMeetingNotification(meetingId);
    handleNotificationClose();
    navigate(`/meet/${meetingId}`);
  };

  const handleDismissNotification = (meetingId) => {
    removeMeetingNotification(meetingId);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Logout failed");
    }
  };

  const notificationCount = Object.keys(meetingNotifications).length;
  const open = Boolean(notificationAnchorEl);

  // Get current user from localStorage
  const userData = localStorage.getItem("user");
  const currentUser = userData ? JSON.parse(userData) : null;

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#ffffff",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 2, md: 4 },
          }}
        >
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              sx={{ color: "#1e293b", display: { xs: "flex", md: "none" } }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              variant="h6"
              component="a"
              href="/dashboard"
              sx={{
                textDecoration: "none",
                fontWeight: 700,
                color: "#1976d2",
                fontSize: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  backgroundColor: "#1976d2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1.2rem",
                }}
              >
                💬
              </Box>
              SkillXchange
            </Typography>
          </Box>

          {/* Nav Buttons */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5 }}>
            {navItems.map((item) => (
              <Button
                key={item.name}
                href={item.path}
                startIcon={item.icon}
                sx={{
                  color: "#64748b",
                  fontWeight: 500,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#f8fafc",
                    color: "#1976d2",
                  },
                }}
              >
                {item.name}
              </Button>
            ))}
          </Box>

          {/* Right Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              sx={{ color: "#64748b" }}
              onClick={handleNotificationClick}
            >
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsActiveIcon />
              </Badge>
            </IconButton>

            {currentUser && (
              <Button
                startIcon={<AccountCircleIcon />}
                sx={{
                  color: "#1e293b",
                  fontWeight: 500,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#f8fafc",
                  },
                }}
                onClick={() => navigate("/profile")}
              >
                {currentUser.name}
              </Button>
            )}

            <Button
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                color: "#ef4444",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#fef2f2",
                },
              }}
            >
              Logout
            </Button>

            {currentUser && (
              <Chip
                label="USER"
                size="small"
                sx={{
                  backgroundColor: "#1976d2",
                  color: "white",
                  fontWeight: 600,
                  height: 24,
                  fontSize: "0.7rem",
                }}
              />
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer Menu for Mobile */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{
            width: 250,
            backgroundColor: "#ffffff",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              fontWeight: 600,
              mt: 2,
              mb: 1,
              color: "#1e293b",
            }}
          >
            Menu
          </Typography>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.name} disablePadding>
                <ListItemButton
                  component="a"
                  href={item.path}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#f8fafc",
                    },
                  }}
                >
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Box sx={{ mb: 2, textAlign: "center" }}>
            <Divider sx={{ mb: 1 }} />
            <Button
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                color: "#ef4444",
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Notification Popover */}
      <Popover
        open={open}
        anchorEl={notificationAnchorEl}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <Box
          sx={{
            width: 350,
            maxHeight: 400,
            overflowY: "auto",
            p: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#1e293b" }}>
            Meeting Invitations
          </Typography>

          {notificationCount === 0 ? (
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              No pending meeting invitations
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {Object.entries(meetingNotifications).map(([meetingId, notif]) => (
                <Card
                  key={meetingId}
                  elevation={0}
                  sx={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ pb: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1.5,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                        📹 {notif.connectionName}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleDismissNotification(meetingId)}
                        sx={{
                          color: "#64748b",
                          padding: 0,
                          "&:hover": { backgroundColor: "#f8fafc" },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: "18px" }} />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1.5, color: "#64748b" }}>
                      started a meeting with you
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      onClick={() => handleJoinMeet(meetingId, notif.connectionId)}
                      sx={{
                        backgroundColor: "#1976d2",
                        color: "#ffffff",
                        fontWeight: 600,
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: "#1565c0",
                        },
                      }}
                    >
                      Join Meet
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default Navbar;
