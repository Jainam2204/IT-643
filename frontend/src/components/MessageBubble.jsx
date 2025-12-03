import React from "react";
import { Box, Typography, Link } from "@mui/material";

function MessageBubble({ message, isOwnMessage }) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isFile = message.type === "file" && message.fileUrl;
  const isPDF = message.fileName?.toLowerCase().endsWith(".pdf");
  const fileExtension = message.fileName?.split(".").pop()?.toLowerCase() || "";

  const handleFileDownload = (e) => {
    e.preventDefault();

    if (message._id) {
      const downloadUrl = `/api/messages/download/${message._id}`;

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = message.fileName || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFileIcon = () => {
    if (isPDF) return "📄";
    if (["doc", "docx"].includes(fileExtension)) return "📝";
    if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) return "🖼️";
    return "📎";
  };

  return (
    <Box
      display="flex"
      justifyContent={isOwnMessage ? "flex-end" : "flex-start"}
      my={1}
    >
      <Box
        sx={{
          maxWidth: "70%",
          px: 1.5,
          py: 1,
          borderRadius: 2,
          boxShadow: 1,
          wordBreak: "break-word",
          bgcolor: isOwnMessage ? "primary.main" : "#ffffff",
          color: isOwnMessage ? "#ffffff" : "#1f2937",
        }}
      >
        {isFile ? (
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Link
              href={message.fileUrl}
              onClick={handleFileDownload}
              target="_blank"
              rel="noopener noreferrer"
              underline="always"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: isOwnMessage ? "#ffffff" : "primary.main",
                fontWeight: 500,
                "&:hover": {
                  color: isOwnMessage ? "primary.light" : "primary.dark",
                },
              }}
            >
              <span>{getFileIcon()}</span>
              <span>{message.fileName || "Open file"}</span>
            </Link>

            {message.content && message.content !== message.fileName && (
              <Typography
                variant="caption"
                sx={{
                  color: isOwnMessage ? "primary.light" : "text.secondary",
                }}
              >
                {message.content}
              </Typography>
            )}
          </Box>
        ) : (
          <Typography variant="body2">{message.content}</Typography>
        )}

        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.5,
            textAlign: "right",
            color: isOwnMessage ? "primary.light" : "text.secondary",
            fontSize: "10px",
          }}
        >
          {time}
        </Typography>
      </Box>
    </Box>
  );
}

export default MessageBubble;
