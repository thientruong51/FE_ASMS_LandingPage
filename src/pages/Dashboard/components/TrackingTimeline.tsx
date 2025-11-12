import React from "react";
import { Box, Avatar, Typography, useTheme } from "@mui/material";
import type { TrackingRecord } from "../types";

type Props = { tracking?: TrackingRecord[] };

export default function TrackingTimeline({ tracking = [] }: Props) {
  const theme = useTheme();
  const GREEN = "#3CBD96";

  if (!tracking.length) {
    return <Typography variant="body2" color="text.secondary">No tracking</Typography>;
  }

  const lastIndex = tracking.length - 1;
  const fmt = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "-";

  return (
    <Box sx={{ px: 2, overflowX: "auto" }}>
      {/* top row: avatars + connectors */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          minWidth: { xs: 600, md: 900 },
          gap: 1.5,
          py: 2,
        }}
      >
        {tracking.map((_, i) => {
          const completed = i < lastIndex;
          const isActive = i === lastIndex;

          return (
            <React.Fragment key={i}>
              {/* Step (avatar) */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: 100,
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    fontSize: 14,
                    fontWeight: 700,
                    bgcolor: completed || isActive ? GREEN : "transparent",
                    color: completed || isActive ? "#fff" : theme.palette.text.secondary,
                    border: `2px solid ${completed || isActive ? GREEN : theme.palette.divider}`,
                    boxShadow: isActive ? `0 0 0 6px rgba(60,189,150,0.08)` : "none",
                    zIndex: 2,
                  }}
                >
                  {i + 1}
                </Avatar>
              </Box>

              {/* Connector between this step and next (not rendered after last) */}
              {i < lastIndex && (
                <Box
                  aria-hidden
                  sx={{
                    flex: 1,
                    height: 8,
                    display: "flex",
                    alignItems: "center",
                    px: 0.5,
                    "& .dots": {
                      width: "100%",
                      height: 2,
                      backgroundImage: `radial-gradient(circle, ${completed ? GREEN : theme.palette.divider} 50%, transparent 51%)`,
                      backgroundRepeat: "repeat-x",
                      backgroundSize: "8px 8px", 
                      backgroundPosition: "0 center",
                    },
                  }}
                >
                  <Box className="dots" />
                </Box>
              )}
            </React.Fragment>
          );
        })}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          minWidth: { xs: 600, md: 900 },
          gap: 1.5,
          py: 0.5,
        }}
      >
        {tracking.map((step, i) => {
          const isActive = i === lastIndex;
          return (
            <React.Fragment key={i}>
              <Box
                sx={{
                  minWidth: 92,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    mt: 0,
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? "primary.main" : "text.primary",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 92,
                  }}
                  title={step.status}
                >
                  {step.status}
                </Typography>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {fmt(step.ts)}
                </Typography>
              </Box>

              {i < lastIndex && <Box sx={{ flex: 1 }} />}
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
}
