import React, { useMemo } from "react";
import { Box, Avatar, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { TrackingHistoryItem } from "../../../api/trackingHistoryApi";
import {
  translateStatus,
  translateActionType,
} from "../../../utils/translationHelpers"; 

type Props = {
  tracking?: TrackingHistoryItem[];
  currentStatus?: string | null;
};

type TimelineStep = {
  statusRaw: string;
  ts: string;
  actionRaw?: string;
};

const GREEN = "#3CBD96";

const normalizeStatus = (s?: string | null) =>
  String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const fmtDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
};

function buildTimeline(tracking: TrackingHistoryItem[]): TimelineStep[] {
  if (!Array.isArray(tracking) || !tracking.length) return [];

  const ordered = [...tracking].reverse();

  const result: TimelineStep[] = [];
  const seen = new Set<string>();

  for (const item of ordered) {
    const normalized = normalizeStatus(item.newStatus);
    if (!normalized || seen.has(normalized)) continue;

    result.push({
      statusRaw: item.newStatus!,
      ts: item.createAt!,
      actionRaw: item.actionType ?? undefined,
    });

    seen.add(normalized);
  }

  return result;
}


export default function TrackingTimeline({
  tracking = [],
  currentStatus,
}: Props) {
  const theme = useTheme();
  const { t } = useTranslation("dashboard");

  const steps = useMemo(() => buildTimeline(tracking), [tracking]);

  const current = useMemo(() => {
    if (!steps.length) return 0;

    const normalizedCurrent = normalizeStatus(currentStatus);
    const idx = steps.findIndex(
      (s) => normalizeStatus(s.statusRaw) === normalizedCurrent
    );

    return idx >= 0 ? idx : steps.length - 1;
  }, [steps, currentStatus]);

  if (!steps.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t("tracking.noTracking")}
      </Typography>
    );
  }

  const STEP_WIDTH_MOBILE = 92;
  const STEP_WIDTH_DESKTOP = 120;
  const minWidthXs = Math.max(600, steps.length * STEP_WIDTH_MOBILE);
  const minWidthMd = Math.max(900, steps.length * STEP_WIDTH_DESKTOP);

  return (
    <Box sx={{ px: 2, overflowX: "auto" }}>
      {/* ================= TOP ROW ================= */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          minWidth: { xs: minWidthXs, md: minWidthMd },
          gap: 1.5,
          py: 2,
        }}
      >
        {steps.map((_, i) => {
          const completed = i < current;
          const active = i === current;

          return (
            <React.Fragment key={i}>
              <Box
                sx={{
                  width: { xs: STEP_WIDTH_MOBILE, md: STEP_WIDTH_DESKTOP },
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    fontSize: 14,
                    fontWeight: 700,
                    bgcolor: completed || active ? GREEN : "transparent",
                    color:
                      completed || active
                        ? "#fff"
                        : theme.palette.text.secondary,
                    border: `2px solid ${
                      completed || active
                        ? GREEN
                        : theme.palette.divider
                    }`,
                    boxShadow: active
                      ? "0 0 0 6px rgba(60,189,150,0.08)"
                      : "none",
                  }}
                >
                  {i + 1}
                </Avatar>
              </Box>

              {i < steps.length - 1 && (
                <Box sx={{ flex: 1, height: 8, px: 0.5 }}>
                  <Box
                    sx={{
                      width: "100%",
                      height: 2,
                      backgroundImage: `radial-gradient(circle, ${
                        i < current ? GREEN : theme.palette.divider
                      } 50%, transparent 51%)`,
                      backgroundRepeat: "repeat-x",
                      backgroundSize: "8px 8px",
                      backgroundPosition: "center",
                    }}
                  />
                </Box>
              )}
            </React.Fragment>
          );
        })}
      </Box>

      {/* ================= BOTTOM ROW ================= */}
      <Box
        sx={{
          display: "flex",
          minWidth: { xs: minWidthXs, md: minWidthMd },
          gap: 1.5,
          py: 0.5,
        }}
      >
        {steps.map((step, i) => {
          const active = i === current;

          const statusLabel = translateStatus(t, step.statusRaw);
          const actionLabel = step.actionRaw
            ? translateActionType(t, step.actionRaw)
            : null;

          return (
            <React.Fragment key={i}>
              <Box
                sx={{
                  width: { xs: STEP_WIDTH_MOBILE, md: STEP_WIDTH_DESKTOP },
                  textAlign: "center",
                  px: 1,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: active ? 700 : 600,
                    color: active ? "primary.main" : "text.primary",
                    fontSize: 13,
                  }}
                >
                  {statusLabel}
                </Typography>

                {actionLabel && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.25 }}
                  >
                    {actionLabel}
                  </Typography>
                )}

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  {fmtDate(step.ts)}
                </Typography>
              </Box>

              {i < steps.length - 1 && <Box sx={{ flex: 1 }} />}
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
}
