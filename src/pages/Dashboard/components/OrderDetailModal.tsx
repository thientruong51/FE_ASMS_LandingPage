import { useEffect, useMemo, useState } from "react";
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
  Chip,
  IconButton,
} from "@mui/material";
import TrackingTimeline from "./TrackingTimeline";
import type { Order as UIOrder } from "../types";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";
import { fetchOrderDetails } from "../../../api/order.list";
import { loadTypeLookup, resolveStorageName, resolveShelfName, resolveContainerName } from "../../../api/typeLookup";

type Props = {
  open: boolean;
  order?: UIOrder | any | null;
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
      } catch {
        return null;
      }
    }
  } catch {
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

const toArrayStrings = (v: any) => {
  if (!v) return [] as string[];
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
};

export default function OrderDetailModal({ open, order, onClose }: Props) {
  const { t } = useTranslation("dashboard");
  const tokenPayload = useMemo(() => decodeJwtPayload(localStorage.getItem("accessToken")), []);
  const customerName = tokenPayload?.Name ?? tokenPayload?.name ?? null;
  const customerEmail = tokenPayload?.Email ?? tokenPayload?.email ?? null;
  const customerPhone = tokenPayload?.Phone ?? tokenPayload?.phone ?? null;
  const pickupAddress = tokenPayload?.Address ?? tokenPayload?.address ?? null;

  const [detailsLoading, setDetailsLoading] = useState(false);
  const [fetchedDetails, setFetchedDetails] = useState<any[] | null>(null);
  const [typesLoaded, setTypesLoaded] = useState(false);

  // load type lookup once
  useEffect(() => {
    let mounted = true;
    void loadTypeLookup()
      .then(() => {
        if (mounted) setTypesLoaded(true);
      })
      .catch(() => {
        if (mounted) setTypesLoaded(false);
      });
    return () => { mounted = false; };
  }, []);

  // derive a best-effort orderCode (could be orderId, orderCode, id)
  const orderCode = useMemo(() => {
    if (!order) return null;
    return order.orderCode ?? order.orderId ?? order.id ?? null;
  }, [order]);

  // If items look like summary, fetch details and override items
  useEffect(() => {
    if (!orderCode) {
      setFetchedDetails(null);
      return;
    }

    const rawItemsCandidates: any[] = (() => {
      if (Array.isArray(order.items) && order.items.length > 0) return order.items;
      if (Array.isArray(order.data) && order.data.length > 0) return order.data;
      if (order.data && Array.isArray(order.data.items) && order.data.items.length > 0) return order.data.items;
      if (Array.isArray(order) && order.length > 0) return order;
      if (Array.isArray(order.data)) return order.data;
      return [];
    })();

    const hasFullDetail = rawItemsCandidates.some((it: any) =>
      (it?.storageCode != null) || (it?.orderDetailId != null) || (it?.shelfTypeId != null) || (it?.subTotal != null) || (it?.storageTypeId != null)
    );

    if (hasFullDetail) {
      setFetchedDetails(null);
      setDetailsLoading(false);
      return;
    }

    let mounted = true;
    setDetailsLoading(true);
    void fetchOrderDetails(String(orderCode))
      .then((details: any[]) => {
        if (!mounted) return;
        if (Array.isArray(details) && details.length > 0) setFetchedDetails(details);
        else setFetchedDetails(null);
      })
      .catch(() => { if (mounted) setFetchedDetails(null); })
      .finally(() => { if (mounted) setDetailsLoading(false); });

    return () => { mounted = false; };
  }, [orderCode, order]);

  if (!order) return null;

  // Build canonical items array: prefer fetchedDetails, else use normalized raw candidates
  const rawItemsCandidates: any[] = (() => {
    if (Array.isArray(order.items) && order.items.length > 0) return order.items;
    if (Array.isArray(order.data) && order.data.length > 0) return order.data;
    if (order.data && Array.isArray(order.data.items) && order.data.items.length > 0) return order.data.items;
    if (Array.isArray(order) && order.length > 0) return order;
    if (Array.isArray(order.data)) return order.data;
    return [];
  })();

  const sourceItems: any[] = fetchedDetails ?? rawItemsCandidates;

  const items = sourceItems.map((it: any, idx: number) => {
    const qty = Number(it.quantity ?? it.qty ?? it.containerQuantity ?? 1) || 1;
    const price = Number(it.price ?? it.basePrice ?? 0) || 0;
    const subTotal = Number(it.subTotal ?? it.subtotal ?? it.sub_total ?? price * qty) || price * qty;
    const productTypeNames = toArrayStrings(it.productTypeNames ?? it.raw?.productTypeNames ?? it.productTypes ?? []);
    const serviceNames = toArrayStrings(it.serviceNames ?? it.raw?.serviceNames ?? it.services ?? []);
    const storageTypeId = it.storageTypeId ?? it.raw?.storageTypeId ?? null;
    const shelfTypeId = it.shelfTypeId ?? it.raw?.shelfTypeId ?? null;
    const containerTypeId = it.containerType ?? it.raw?.containerType ?? null;
    const storageCode = it.storageCode ?? it.raw?.storageCode ?? null;
    const containerCode = it.containerCode ?? it.raw?.containerCode ?? null;
    const floorNumber = it.floorNumber ?? it.raw?.floorNumber ?? it.raw?.floor ?? null;
    const shelfQuantity = it.shelfQuantity ?? it.raw?.shelfQuantity ?? null;

    return {
      id: it.orderDetailId ?? it.id ?? `item-${idx}`,
      img: it.image ?? it.img ?? undefined,
      name: it.containerCode ?? it.name ?? it.title ?? `Item ${idx + 1}`,
      qty,
      price,
      subTotal,
      productTypeNames,
      serviceNames,
      storageTypeId,
      shelfTypeId,
      containerTypeId,
      storageCode,
      containerCode,
      floorNumber,
      shelfQuantity,
      raw: it,
    };
  });

  const subtotal = (() => {
    const wrapperTotal = order.rawSummary?.totalPrice ?? order.totalPrice ?? order.total ?? null;
    if (typeof wrapperTotal === "number") return wrapperTotal;
    return items.reduce((s: number, it: any) => s + (Number(it.subTotal ?? it.raw?.subTotal ?? it.price * it.qty) || 0), 0);
  })();

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
    return `${days} ${t("orderDetail.days")}`;
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ px: 3, py: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {order.id ?? order.orderId ?? order.orderCode ?? "-"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("orderDetail.summary")} • {order.kind === "managed" ? t("orderDetail.serviceWarehouse") : t("orderDetail.selfStorage")}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Button variant="outlined" size="small" onClick={() => {}}>
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
        <Box mb={3}>
          <Typography variant="subtitle1" fontWeight={700} mb={1}>
            {t("orderDetail.tracking")}
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <TrackingTimeline tracking={order.tracking ?? []} order={{ ...order, items }} />
          </Paper>
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" }, mb: 3, alignItems: "stretch" }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>{t("orderDetail.orderInformation")}</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t("orderDetail.pickupDate")}</Typography>
                  <Typography variant="body2" fontWeight={600}>{fmtDate(order.startDate)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t("orderDetail.estimateDrop")}</Typography>
                  <Typography variant="body2" fontWeight={600}>{calcDays()}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t("orderDetail.returnAvailableTime")}</Typography>
                  <Typography variant="body2" fontWeight={600}>{order.endDate ? fmtDate(order.endDate) : "-"}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>{t("orderDetail.locations")}</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t("orderDetail.pickupLocation")}</Typography>
                  <Typography variant="body2" fontWeight={600}>{pickupAddress ?? "-"}</Typography>
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">{t("orderDetail.dropoffLocation")}</Typography>
                  <Typography variant="body2" fontWeight={600}>—</Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>{t("orderDetail.customerDetails")}</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t("orderDetail.fullName")}</Typography>
                  <Typography variant="body2" fontWeight={600}>{customerName ?? "-"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t("orderDetail.email")}</Typography>
                  <Typography variant="body2" fontWeight={600}>{customerEmail ?? "-"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t("orderDetail.phoneNumber")}</Typography>
                  <Typography variant="body2" fontWeight={600}>{customerPhone ?? "-"}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle1" fontWeight={700} mb={1}>{t("orderDetail.itemList")}</Typography>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("table.no")}</TableCell>
                  <TableCell>{t("table.itemName")}</TableCell>
                  <TableCell align="right">{t("table.basePrice")}</TableCell>
                  <TableCell align="center">{t("table.quantity")}</TableCell>
                  <TableCell align="right">{t("table.total")}</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {(detailsLoading ? [] : items).map((it: any, idx: number) => {
                  const price = Number(it.price ?? it.raw?.price ?? 0) || 0;
                  const qty = Number(it.qty ?? it.raw?.quantity ?? 1) || 1;
                  const lineTotal = Number(it.subTotal ?? it.raw?.subTotal ?? it.raw?.subtotal ?? price * qty) || price * qty;

                  // resolve type names (only if types loaded)
                  const storageName = typesLoaded ? resolveStorageName(it.storageTypeId) : null;
                  const shelfName = typesLoaded ? resolveShelfName(it.shelfTypeId) : null;
                  const containerName = typesLoaded ? resolveContainerName(it.containerTypeId) : null;

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
                            <Typography variant="body2" noWrap>{it.name}</Typography>

                            <Stack direction="row" spacing={0.5} flexWrap="wrap" mt={0.5}>
                              {it.storageCode && <Chip label={it.storageCode} size="small" variant="outlined" sx={{ height: 22 }} />}
                              {it.containerCode && <Chip label={it.containerCode} size="small" variant="outlined" sx={{ height: 22 }} />}
                              {containerName && <Chip label={containerName} size="small" variant="outlined" sx={{ height: 22 }} />}
                              {storageName && <Chip label={storageName} size="small" variant="outlined" sx={{ height: 22 }} />}
                              {shelfName && <Chip label={shelfName + (it.shelfQuantity ? ` ×${it.shelfQuantity}` : "")} size="small" variant="outlined" sx={{ height: 22 }} />}
                              {it.floorNumber != null && <Chip label={t("floorLabel", { number: it.floorNumber })} size="small" variant="outlined" sx={{ height: 22 }} />}
                              {it.productTypeNames && it.productTypeNames.map((p: string, i: number) => <Chip key={`pt-${i}`} label={p} size="small" variant="outlined" sx={{ height: 22 }} />)}
                              {it.serviceNames && it.serviceNames.map((s: string, i: number) => <Chip key={`svc-${i}`} label={s} size="small" color="primary" variant="outlined" sx={{ height: 22 }} />)}
                            </Stack>
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
                  <TableCell colSpan={4} align="right" sx={{ fontWeight: 700 }}>{t("orderDetail.allTotal")}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMoney(subtotal)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {detailsLoading && (
            <Box display="flex" justifyContent="center" alignItems="center" py={2}>
              <Typography variant="body2" color="text.secondary">{t("loadingDetails")}</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{t("orderDetail.cancel")}</Button>
        <Button variant="contained" onClick={onClose}>{t("orderDetail.send")}</Button>
      </DialogActions>
    </Dialog>
  );
}
