import React, { useMemo } from "react";
import { Box, Avatar, Typography, useTheme } from "@mui/material";
import type { TrackingRecord, Order } from "../types";
import { useTranslation } from "react-i18next";

type Props = {
  tracking?: TrackingRecord[];
  order?: Order | null;
};

const BASE_FULL = ["Pending", "Verify", "Checkout", "Processing", "Stored"];
const BASE_SELF = ["Pending", "Verify", "Checkout", "Renting"];

const fmtDate = (iso?: string) => {
  if (!iso || !String(iso).length) return "-";
  const d = new Date(String(iso));
  if (isNaN(d.getTime())) return "-";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const hasDeliveryService = (order?: Order | null) => {
  if (!order?.items) return false;
  return order.items.some((it: any) =>
    Array.isArray((it as any).serviceNames) &&
    (it as any).serviceNames.some((s: string) => String(s).toLowerCase() === "delivery")
  );
};

const isOverdue = (order?: Order | null) => {
  const s = (order?.rawSummary ?? {}) as any;
  const rd = s?.returnDate ?? order?.endDate ?? null;
  if (!rd) return false;
  const d = new Date(String(rd));
  if (isNaN(d.getTime())) return false;
  return Date.now() > d.getTime();
};

const buildSteps = (tracking?: TrackingRecord[], order?: Order | null): string[] => {
  if (Array.isArray(tracking) && tracking.length > 0) {
    const seen = new Set<string>();
    return tracking
      .map((t) => String(t.status))
      .filter((s) => (seen.has(s) ? false : (seen.add(s), true)));
  }

  const overdue = isOverdue(order);
  const isSelf = order?.kind === "self";
  const base = isSelf ? BASE_SELF.slice() : BASE_FULL.slice();

  if (hasDeliveryService(order)) {
    const checkoutIdx = base.indexOf("Checkout");
    if (checkoutIdx >= 0) {
      base.splice(checkoutIdx + 1, 0, "PickUp");
    }

    const pickUpIdx = base.indexOf("PickUp");
    if (pickUpIdx >= 0) {
      base.splice(pickUpIdx + 1, 0, "Delivered");
    }

    const pendingIdx = base.indexOf("Pending");
    const insertAt = pendingIdx >= 0 ? pendingIdx + 1 : 1;
    base.splice(insertAt, 0, "WaitPickUp");
  }

  if (overdue) {
    base.push("Overdue", "ExpiredStorage");
  }

  base.push("Retrieved");
  base.push("Completed");

  return base;
};

const determineIndex = (steps: string[], tracking?: TrackingRecord[], order?: Order | null) => {
  const display = (order as any)?.displayStatus ?? order?.status;
  if (display) {
    const idx = steps.indexOf(String(display));
    if (idx >= 0) return idx;
  }

  if (Array.isArray(tracking) && tracking.length > 0) {
    for (let i = tracking.length - 1; i >= 0; i--) {
      const t = tracking[i];
      if (t.ts && String(t.ts).length) {
        const idx = steps.indexOf(String(t.status));
        if (idx >= 0) return idx;
      }
    }
    const lastIdx = steps.indexOf(String(tracking[tracking.length - 1].status));
    if (lastIdx >= 0) return lastIdx;
  }

  if (isOverdue(order)) {
    const oi = steps.indexOf("Overdue");
    if (oi >= 0) return oi;
  }

  return 0;
};

export default function TrackingTimeline({ tracking = [], order = null }: Props) {
  const theme = useTheme();
  const GREEN = "#3CBD96";
  const { t } = useTranslation("dashboard");

  const steps = useMemo(() => buildSteps(tracking, order), [tracking, order]);
  const current = useMemo(() => determineIndex(steps, tracking, order), [steps, tracking, order]);

  const derived: TrackingRecord[] = useMemo(() => {
    if (Array.isArray(tracking) && tracking.length > 0) {
      const map = new Map<string, TrackingRecord>();
      for (const tr of tracking) {
        map.set(String(tr.status), { ...tr, ts: String(tr.ts ?? "") });
      }
      return steps.map((s) => map.get(s) ?? ({ ts: "", status: s }));
    }

    const s = (order?.rawSummary ?? {}) as any;
    const orderDate = s.orderDate ?? s.depositDate ?? "";
    const returnDate = s.returnDate ?? order?.endDate ?? "";

    return steps.map((step) => {
      let ts = "";
      let note: string | undefined;
      if (step === "Pending") ts = String(orderDate || "");
      if (step === "Overdue") ts = String(returnDate || "");
      if (step === "Pending" && s.paymentStatus) note = `${t("tracking.payment")}: ${s.paymentStatus}`;
      if (step === "Delivered" && s.deliveredAt) ts = String(s.deliveredAt);
      if (step === "Completed" && s.completedAt) ts = String(s.completedAt);
      return { ts, status: step, note } as TrackingRecord;
    });
  }, [steps, tracking, order, t]);

  if (!derived.length)
    return (
      <Typography variant="body2" color="text.secondary">
        {t("tracking.noTracking")}
      </Typography>
    );

  const STEP_WIDTH_MOBILE = 92;
  const STEP_WIDTH_DESKTOP = 120;
  const stepCount = derived.length;
  const minWidthXs = Math.max(600, stepCount * STEP_WIDTH_MOBILE);
  const minWidthMd = Math.max(900, stepCount * STEP_WIDTH_DESKTOP);

  return (
    <Box sx={{ px: 2, overflowX: "auto" }}>
      {/* Top row: avatars with connecting dotted line */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          minWidth: { xs: minWidthXs, md: minWidthMd },
          gap: 1.5,
          py: 2,
        }}
      >
        {derived.map((_, i) => {
          const completed = i < current;
          const active = i === current;
          return (
            <React.Fragment key={i}>
              {/* Each step column for avatar */}
              <Box
                sx={{
                  width: { xs: STEP_WIDTH_MOBILE, md: STEP_WIDTH_DESKTOP },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    fontSize: 14,
                    fontWeight: 700,
                    bgcolor: completed || active ? GREEN : "transparent",
                    color: completed || active ? "#fff" : theme.palette.text.secondary,
                    border: `2px solid ${completed || active ? GREEN : theme.palette.divider}`,
                    boxShadow: active ? `0 0 0 6px rgba(60,189,150,0.08)` : "none",
                    zIndex: 2,
                  }}
                >
                  {i + 1}
                </Avatar>
              </Box>

              {/* Connector between steps */}
              {i < derived.length - 1 && (
                <Box
                  aria-hidden
                  sx={{
                    flex: 1,
                    height: 8,
                    display: "flex",
                    alignItems: "center",
                    px: 0.5,
                  }}
                >
                  <Box
                    className="dots"
                    sx={{
                      width: "100%",
                      height: 2,
                      backgroundImage: `radial-gradient(circle, ${i < current ? GREEN : theme.palette.divider} 50%, transparent 51%)`,
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

      {/* Bottom row: labels + dates aligned with avatar columns */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          minWidth: { xs: minWidthXs, md: minWidthMd },
          gap: 1.5,
          py: 0.5,
        }}
      >
        {derived.map((step, i) => {
          const active = i === current;
          const label = t(`status.${step.status}`, step.status);
          return (
            <React.Fragment key={i}>
              <Box
                sx={{
                  width: { xs: STEP_WIDTH_MOBILE, md: STEP_WIDTH_DESKTOP },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  px: 1,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    mt: 0,
                    fontWeight: active ? 700 : 600,
                    color: active ? "primary.main" : "text.primary",
                    whiteSpace: "normal",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    fontSize: 13,
                  }}
                  title={String(step.status)}
                >
                  {label}
                </Typography>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {fmtDate(step.ts)}
                </Typography>

             
              </Box>

              {/* Spacer between columns (connector drawn in top row) */}
              {i < derived.length - 1 && <Box sx={{ flex: 1 }} />}
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
}
