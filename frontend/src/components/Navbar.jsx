import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  InputBase,
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // ✅ Added import
import { useNotifications } from "../context/NotificationContext";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const navigate = useNavigate();
  const navItems = ["Dashboard", "Profile", "Connections", "Chat"];
  const { meetingNotifications, removeMeetingNotification } =
    useNotifications();

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

  // ✅ Centralized Logout Function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const notificationCount = Object.keys(meetingNotifications).length;
  const open = Boolean(notificationAnchorEl);

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#30187dff",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.25)",
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
          {/* Logo + Drawer Toggle */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              sx={{ color: "white", display: { xs: "flex", md: "none" } }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>

            <motion.div whileHover={{ scale: 1.05 }}>
              <Typography
                variant="h6"
                component="a"
                href="/"
                sx={{
                  textDecoration: "none",
                  fontWeight: "bold",
                  color: "#fff",
                  fontSize: "1.6rem",
                  letterSpacing: "0.5px",
                }}
              >
                <Box component="span" sx={{ color: "#7e78d6ff" }}>
                  Skill
                </Box>
                Xchange
              </Typography>
            </motion.div>
          </Box>

          {/* Search Bar */}
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              backgroundColor: alpha("#ffffff", 0.15),
              borderRadius: "30px",
              px: 2,
              py: 0.5,
              width: { sm: "55%", md: "40%" },
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: alpha("#ffffff", 0.25),
              },
            }}
          >
            <SearchIcon sx={{ color: "white", mr: 1 }} />
            <InputBase
              placeholder="Search..."
              sx={{
                color: "white",
                width: "100%",
                "&::placeholder": { color: "#d9f5e5" },
              }}
            />
          </Box>

          {/* Right Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Nav Buttons */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
              {navItems.map((item) => (
                <motion.div key={item} whileHover={{ y: -2 }}>
                  <Button
                    href={`/${item.toLowerCase()}`}
                    sx={{
                      color: "#ffffff",
                      fontWeight: 500,
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: alpha("#ffffff", 0.15),
                      },
                    }}
                  >
                    {item}
                  </Button>
                </motion.div>
              ))}
            </Box>

            <IconButton
              sx={{ color: "white" }}
              onClick={handleNotificationClick}
            >
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsActiveIcon />
              </Badge>
            </IconButton>

            <IconButton
              sx={{ color: "white" }}
              onClick={() => navigate("/profile")}
            >
              <AccountCircleIcon />
            </IconButton>

            {/* Logout Button */}
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                  sx={{
                    color: "#114b2d",
                    backgroundColor: "white",
                    fontWeight: "600",
                    borderRadius: "20px",
                    textTransform: "none",
                    px: 2.5,
                    py: 0.7,
                    "&:hover": {
                      backgroundColor: "#c8ffdf",
                    },
                  }}
                >
                  Logout
                </Button>
              </motion.div>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer Menu for Mobile */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{
            width: 250,
            backgroundColor: "#114b2d",
            height: "100%",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                fontWeight: "bold",
                mt: 2,
                mb: 1,
                color: "#c8ffdf",
              }}
            >
              Menu
            </Typography>
            <List>
              {navItems.map((item) => (
                <ListItem key={item} disablePadding>
                  <ListItemButton
                    component="a"
                    href={`/${item.toLowerCase()}`}
                    sx={{
                      "&:hover": {
                        backgroundColor: alpha("#ffffff", 0.15),
                      },
                    }}
                  >
                    <ListItemText primary={item} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Drawer Logout */}
          <Box sx={{ mb: 2, textAlign: "center" }}>
            <Divider sx={{ backgroundColor: alpha("#fff", 0.2), mb: 1 }} />
            <Button
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                color: "#114b2d",
                backgroundColor: "white",
                fontWeight: "600",
                borderRadius: "20px",
                textTransform: "none",
                px: 3,
                py: 0.8,
                "&:hover": {
                  backgroundColor: "#c8ffdf",
                },
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
      >
        <Box
          sx={{
            width: 350,
            maxHeight: 400,
            overflowY: "auto",
            p: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Meeting Invitations
          </Typography>

          {notificationCount === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No pending meeting invitations
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {Object.entries(meetingNotifications).map(([meetingId, notif]) => (
                <Card
                  key={meetingId}
                  elevation={2}
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
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
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                        📹 {notif.connectionName}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleDismissNotification(meetingId)}
                        sx={{
                          color: "white",
                          padding: 0,
                          "&:hover": { opacity: 0.8 },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: "18px" }} />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1.5, opacity: 0.95 }}>
                      started a meeting with you
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      onClick={() => handleJoinMeet(meetingId, notif.connectionId)}
                      sx={{
                        backgroundColor: "white",
                        color: "#667eea",
                        fontWeight: "bold",
                        "&:hover": {
                          backgroundColor: "#f0f0f0",
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
