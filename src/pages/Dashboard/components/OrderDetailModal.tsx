import React, { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Stack,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import TrackingTimeline from "./TrackingTimeline";
import type { Order as UIOrder } from "../types";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";

type Props = {
  open: boolean;
  order?: UIOrder | any | null; // accept various shapes
  onClose: () => void;
};

const decodeJwtPayload = (token?: string | null): any | null => {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = (4 - (base64.length % 4)) % 4;
    const padded = base64 + "=".repeat(padLength);
    const jsonStr = atob(padded);
    try {
      return JSON.parse(jsonStr);
    } catch {
      try {
        const decoded = decodeURIComponent(
          jsonStr
            .split("")
            .map((c) => {
              const hex = c.charCodeAt(0).toString(16).padStart(2, "0");
              return "%" + hex;
            })
            .join("")
        );
        return JSON.parse(decoded);
      } catch (err) {
        console.error("Failed to parse JWT payload after fallback", err);
        return null;
      }
    }
  } catch (err) {
    console.error("Failed to decode token payload", err);
    return null;
  }
};

const safeDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

const formatMoney = (n?: number) => {
  if (n == null) return "-";
  return n.toLocaleString("vi-VN") + " đ";
};

const isImageUrl = (url?: string) => {
  if (!url) return false;
  return /\.(png|jpe?g|webp|svg|gif)$/i.test(url);
};

// coerce various shapes into an array of strings
const toArrayStrings = (v: any) => {
  if (!v) return [] as string[];
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
};

export default function OrderDetailModal({ open, order, onClose }: Props) {
  const { t } = useTranslation("dashboard");

  // token payload (for pickup/customer info)
  const tokenPayload = useMemo(() => decodeJwtPayload(localStorage.getItem("accessToken")), []);

  const customerName = tokenPayload?.Name ?? tokenPayload?.name ?? null;
  const customerEmail = tokenPayload?.Email ?? tokenPayload?.email ?? null;
  const customerPhone = tokenPayload?.Phone ?? tokenPayload?.phone ?? null;
  const pickupAddress = tokenPayload?.Address ?? tokenPayload?.address ?? null;

  if (!order) return null;

  // ---------------- Normalization: accept several response shapes ----------------
  const rawItemsCandidates: any[] = (() => {
    if (Array.isArray(order.items) && order.items.length > 0) return order.items;
    if (Array.isArray(order.data) && order.data.length > 0) return order.data;
    if (order.data && Array.isArray(order.data.items) && order.data.items.length > 0) return order.data.items;
    if (Array.isArray(order) && order.length > 0) return order;
    if (Array.isArray(order.data)) return order.data;
    return [];
  })();

  // normalize each item to fields used by the UI and ensure name arrays
  const items = rawItemsCandidates.map((it: any, idx: number) => {
    const qty = Number(it.quantity ?? it.qty ?? it.containerQuantity ?? 1) || 1;
    const price = Number(it.price ?? it.basePrice ?? 0) || 0;
    const subTotal = Number(it.subTotal ?? it.subtotal ?? it.sub_total ?? price * qty) || price * qty;

    // ensure we have arrays of strings (fallback to raw.* in case)
    const productTypeNames = toArrayStrings(it.productTypeNames ?? it.raw?.productTypeNames ?? it.productTypes ?? []);
    const serviceNames = toArrayStrings(it.serviceNames ?? it.raw?.serviceNames ?? it.services ?? []);

    return {
      id: it.orderDetailId ?? it.id ?? `item-${idx}`,
      img: it.image ?? it.img ?? undefined,
      name: it.containerCode ?? it.name ?? it.title ?? `Item ${idx + 1}`,
      qty,
      price,
      subTotal,
      productTypeNames,
      serviceNames,
      isPlaced: it.isPlaced ?? it.raw?.isPlaced ?? it.is_placed ?? false,
      raw: it,
    };
  });

  // subtotal: prefer backend total if provided elsewhere, else compute from normalized items
  const subtotal = (() => {
    const wrapperTotal = order.rawSummary?.totalPrice ?? order.totalPrice ?? order.total ?? null;
    if (typeof wrapperTotal === "number") return wrapperTotal;
    return items.reduce((s: number, it: any) => s + (Number(it.subTotal ?? it.subtotal ?? it.price * it.qty) || 0), 0);
  })();

  // helper formatters
  const fmtDate = (iso?: string | null) => {
    const d = safeDate(iso);
    if (!d) return "-";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const calcDays = () => {
    const s = safeDate(order.startDate);
    const e = safeDate(order.endDate);
    if (!s || !e) return "-";
    const days = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} Days`;
  };

  // Small helpful debug: uncomment if you need to inspect shape quickly
  // console.log("OrderDetailModal - normalized order:", { order, items, subtotal });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ px: 3, py: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {order.id ?? order.orderId ?? order.orderCode ?? "-"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.kind === "managed"
                ? t("orderDetail.summary") + " • Kho dịch vụ"
                : t("orderDetail.summary") + " • Kho tự quản"}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Button variant="outlined" size="small" onClick={() => { /* renew handler */ }}>
              {t("orderDetail.renewOrder")}
            </Button>
            <Button variant="contained" size="small">
              {t("orderDetail.contactStaff")}
            </Button>
            <IconButton aria-label="close" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 3 }}>
        {/* TIMELINE */}
        <Box mb={3}>
          <Typography variant="subtitle1" fontWeight={700} mb={1}>
            {t("orderDetail.tracking")}
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <TrackingTimeline tracking={order.tracking ?? []} order={{ ...order, items }} />

          </Paper>
        </Box>

        {/* 3 columns using flex */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", md: "row" },
            mb: 3,
            alignItems: "stretch",
          }}
        >
          {/* Column 1 - Order Information */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Order Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Pickup date</Typography>
                  <Typography variant="body2" fontWeight={600}>{fmtDate(order.startDate)}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Estimate drop</Typography>
                  <Typography variant="body2" fontWeight={600}>{calcDays()}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Return available time</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {order.endDate ? fmtDate(order.endDate) : "-"}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>

          {/* Column 2 - Locations (pickup address from token) */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Locations
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Pickup location</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {pickupAddress ?? "-"}
                  </Typography>
                </Box>

                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">Dropoff location</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    —{/* No dropoff info available in this payload */}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>

          {/* Column 3 - Customer Details (from token) */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Customer Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Full name</Typography>
                  <Typography variant="body2" fontWeight={600}>{customerName ?? "-"}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">E-mail</Typography>
                  <Typography variant="body2" fontWeight={600}>{customerEmail ?? "-"}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Phone number</Typography>
                  <Typography variant="body2" fontWeight={600}>{customerPhone ?? "-"}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </Box>

        {/* Item list table */}
        <Box>
          <Typography variant="subtitle1" fontWeight={700} mb={1}>
            Item List
          </Typography>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No</TableCell>
                  <TableCell>Item Name</TableCell>
                  <TableCell align="right">Base Price</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {items.map((it: any, idx: number) => {
                  const price = Number(it.price ?? it.raw?.price ?? 0) || 0;
                  const qty = Number(it.qty ?? it.raw?.quantity ?? 1) || 1;
                  const lineTotal = Number(it.subTotal ?? it.raw?.subTotal ?? it.raw?.subtotal ?? price * qty) || price * qty;

                  return (
                    <TableRow key={it.id ?? idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          {it.img && isImageUrl(it.img) ? (
                            <Avatar src={it.img} variant="rounded" sx={{ width: 36, height: 36 }} />
                          ) : (
                            <Avatar sx={{ width: 36, height: 36 }}>{String(idx + 1)}</Avatar>
                          )}
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" noWrap>
                              {it.name}
                            </Typography>

                            {/* product type chips */}
                            {it.productTypeNames && it.productTypeNames.length > 0 ? (
                              <Stack direction="row" spacing={0.5} flexWrap="wrap" mt={0.5}>
                                {it.productTypeNames.map((p: string, i: number) => (
                                  
                                    <Chip
                                      label={p}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: "0.65rem", height: 22 }}
                                    />
                                 
                                ))}
                              </Stack>
                            ) : null}

                            {/* service chips */}
                            {it.serviceNames && it.serviceNames.length > 0 ? (
                              <Stack direction="row" spacing={0.5} flexWrap="wrap" mt={0.5}>
                                {it.serviceNames.map((s: string, i: number) => (
                                 
                                    <Chip
                                      label={s}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                      sx={{ fontSize: "0.65rem", height: 22 }}
                                    />
                                
                                ))}
                              </Stack>
                            ) : null}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">{formatMoney(price)}</TableCell>
                      <TableCell align="center">{qty}</TableCell>
                      <TableCell align="right">{formatMoney(lineTotal)}</TableCell>
                    </TableRow>
                  );
                })}

                <TableRow>
                  <TableCell colSpan={4} align="right" sx={{ fontWeight: 700 }}>
                    ALL TOTAL
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {formatMoney(subtotal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{t("orderDetail.cancel")}</Button>
        <Button variant="contained" onClick={onClose}>
          {t("orderDetail.send")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
