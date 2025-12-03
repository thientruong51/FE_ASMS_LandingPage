// src/components/OrderCard.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Paper,
  Box,
  Typography,
  Stack,
  Avatar,
  Button,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { Order as UIOrder, Item as UIItem } from "../types";
import { createPayLink } from "../../../api/payOs.api";
import { fetchOrderByCode, fetchOrdersByCustomer } from "../../../api/order.list";

/** minimal status meta for badge color/label */
const statusMeta = (s?: string) => {
  const token = (s ?? "").toString();
  switch (token) {
    case "WaitPickUp":
      return { color: "#C28700", label: "Wait pick up" };
    case "Overdue":
      return { color: "#B91C1C", label: "Overdue" };
    case "Pending":
      return { color: "#6B7280", label: "Pending" };
    case "Verify":
      return { color: "#0C4A6E", label: "Verify" };
    case "Stored":
    case "Processing":
    case "PickUp":
    case "Checkout":
      return { color: "#0E8A5F", label: token };
    default:
      return { color: "#6B7280", label: token || "Unknown" };
  }
};

const formatMoney = (n?: number) => {
  if (n == null) return "-";
  return n.toLocaleString("vi-VN") + " đ";
};

interface OrderCardProps {
  order: UIOrder;
  onOpenDetail?: (order: UIOrder) => void;
 
  pollIntervalMs?: number; 
  pollTimeoutMs?: number; 
}

const OrderCard: React.FC<OrderCardProps> = ({
  order: initialOrder,
  onOpenDetail,
  pollIntervalMs = 2000,
  pollTimeoutMs = 60000,
}) => {
  // local order state so we can reload it when payment completes
  const [order, setOrder] = useState<any>(initialOrder);
  useEffect(() => setOrder(initialOrder), [initialOrder]);

  const [loadingPay, setLoadingPay] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; severity?: "success" | "error" | "info"; message: string }>(
    { open: false, severity: "info", message: "" }
  );

  // iframe/dialog state
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);

  // polling refs
  const pollingRef = useRef<number | null>(null);
  const pollStartRef = useRef<number | null>(null);
  const closedByUserRef = useRef(false);

  // Normalize items (still map backend keys to UI-friendly shape)
  const rawItems: any[] = Array.isArray(order?.items) ? order.items : [];
  const items: UIItem[] = rawItems.map((it: any, idx: number) => {
    const qty = Number(it.quantity ?? it.qty ?? 1) || 1;
    const price = Number(it.price ?? it.basePrice ?? 0) || 0;
    const subTotal = Number(it.subTotal ?? it.subtotal ?? price * qty) || price * qty;

    return {
      id: it.orderDetailId ?? it.id ?? `item-${idx}`,
      img: it.image ?? it.img ?? undefined,
      name: it.containerCode ?? it.name ?? it.title ?? `Item ${idx + 1}`,
      qty,
      price,
      subTotal,
      productTypeNames: Array.isArray(it.productTypeNames) ? it.productTypeNames : [],
      serviceNames: Array.isArray(it.serviceNames) ? it.serviceNames : [],
      raw: it,
    } as unknown as UIItem;
  });

  // compact total (prefer backend if available)
  const backendTotal = order?.rawSummary?.totalPrice ?? order?.totalPrice ?? null;
  const total =
    backendTotal != null
      ? backendTotal
      : items.reduce((s: number, it: any) => s + (Number(it.price ?? 0) || 0) * (Number(it.qty ?? 1) || 1), 0);

  const ds = order?.displayStatus ?? order?.status;
  const chip = statusMeta(ds);

  // derive orderCode
  const orderCode = order?.orderCode ?? order?.code ?? order?.id;

  // --- NEW: normalize paymentStatus and isPaid ---
  const paymentStatusRaw = order?.paymentStatus ?? order?.payment?.paymentStatus ?? order?.status ?? null;
  const paymentStatus = paymentStatusRaw != null ? String(paymentStatusRaw) : null;
  const isPaid = paymentStatus?.toUpperCase() === "PAID";

  // reloadOrder: prefer GET /api/Order/{orderCode}, fallback to list search
  const reloadOrder = async (): Promise<any> => {
    try {
      if (!orderCode) {
        console.debug("[OrderCard] reloadOrder: no orderCode");
        return null;
      }

      console.debug("[OrderCard] reloadOrder: try fetchOrderByCode", orderCode);

      // 1) try endpoint GET /api/Order/{orderCode}
      try {
        const fresh = await fetchOrderByCode(String(orderCode));
        if (fresh) {
          console.debug("[OrderCard] reloadOrder: fetched by code", fresh);
          setOrder((prev: any) => ({ ...prev, ...fresh }));
          try { window.dispatchEvent(new CustomEvent("order:updated", { detail: fresh })); } catch {}
          return fresh;
        }
      } catch (err) {
        console.warn("[OrderCard] fetchOrderByCode failed, fallback to list", err);
      }

      // 2) fallback: fetchOrdersByCustomer and find the order in list
      try {
        console.debug("[OrderCard] reloadOrder: fallback fetchOrdersByCustomer");
        const page = 1;
        const pageSize = 100;
        const res = await fetchOrdersByCustomer(page, pageSize);
        const fresh = (res?.data ?? []).find(
          (o: any) =>
            o.orderCode === orderCode ||
            o.orderCode === order?.orderCode ||
            o.orderCode === String(order?.id)
        );
        if (!fresh) {
          console.warn("[OrderCard] reloadOrder: not found in list fallback");
          return null;
        }
        console.debug("[OrderCard] reloadOrder: found in list fallback", fresh);
        setOrder((prev: any) => ({ ...prev, ...fresh }));
        try { window.dispatchEvent(new CustomEvent("order:updated", { detail: fresh })); } catch {}
        return fresh;
      } catch (err) {
        console.error("[OrderCard] reloadOrder fallback error", err);
        return null;
      }
    } catch (e) {
      console.error("[OrderCard] reloadOrder error", e);
      return null;
    }
  };

  // Polling - checks server for PAID
  const startPollingForPaid = () => {
    if (!orderCode) {
      console.debug("[OrderCard] startPollingForPaid: no orderCode");
      return;
    }
    stopPolling();
    pollStartRef.current = Date.now();
    closedByUserRef.current = false;

    console.debug("[OrderCard] PAY POLL START", { orderCode, pollIntervalMs, pollTimeoutMs });

    const doPoll = async () => {
      try {
        const fresh = await reloadOrder();
        const freshPaymentStatus =
          fresh?.paymentStatus ?? fresh?.payment?.paymentStatus ?? fresh?.status ?? null;
        const normalized = freshPaymentStatus != null ? String(freshPaymentStatus).toUpperCase() : null;

        console.debug("[OrderCard] poll check", { normalized });

        if (normalized === "PAID") {
          console.debug("[OrderCard] detected PAID -> will auto-close in 3s");
          stopPolling();
          if (fresh) setOrder((prev: any) => ({ ...prev, ...fresh }));
          setTimeout(() => {
            if (!closedByUserRef.current) {
              setCheckoutUrl(null);
              setSnack({ open: true, severity: "success", message: "Thanh toán hoàn tất — cập nhật xong." });
            }
          }, 3000);
        } else {
          const started = pollStartRef.current ?? 0;
          if (Date.now() - started > pollTimeoutMs) {
            stopPolling();
            console.debug("[OrderCard] PAY POLL TIMEOUT");
            setSnack({ open: true, severity: "info", message: "Polling thanh toán đã hết thời gian." });
          }
        }
      } catch (e) {
        console.error("[OrderCard] poll error", e);
      }
    };

    // immediate + interval
    void doPoll();
    const id = window.setInterval(doPoll, pollIntervalMs);
    pollingRef.current = id;
  };

  const stopPolling = () => {
    if (pollingRef.current != null) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
      console.debug("[OrderCard] PAY POLL STOP");
    }
    pollStartRef.current = null;
  };

  useEffect(() => {
    return () => {
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (checkoutUrl) {
      startPollingForPaid();
    } else {
      closedByUserRef.current = true;
      stopPolling();
      setIframeLoading(true);
      // final refresh when dialog closed
      void reloadOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutUrl]);

  // --- Payment handler ---
  const handlePay = async () => {
    if (!orderCode) {
      setSnack({ open: true, severity: "error", message: "Không có orderCode để tạo link thanh toán." });
      return;
    }

    setLoadingPay(true);
    try {
      const { checkoutUrl: url } = await createPayLink(orderCode);

      // open checkout inside in-app dialog via iframe
      setCheckoutUrl(url ?? null);
      setIframeLoading(true);

      setSnack({
        open: true,
        severity: "success",
        message: `Mở trang thanh toán trong app.`,
      });
    } catch (err: any) {
      console.error("createPayLink error:", err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Lỗi khi tạo link thanh toán.";
      setSnack({ open: true, severity: "error", message: msg });
    } finally {
      setLoadingPay(false);
    }
  };

  const closeCheckoutDialog = () => {
    closedByUserRef.current = true;
    setCheckoutUrl(null);
    setIframeLoading(true);
  };

  return (
    <>
      <Paper
        sx={{
          p: 2,
          borderRadius: 3,
          boxShadow: 0,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            alignItems: "flex-start",
          }}
        >
          {/* LEFT: brief order info */}
          <Box sx={{ flex: { md: "0 0 45%" }, minWidth: 0 }}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: chip.color }} />
              <Typography variant="caption" sx={{ color: chip.color, fontWeight: 600 }}>
                {chip.label}
              </Typography>
            </Box>

            <Typography variant="subtitle2" fontWeight={700}>
              #{order?.orderCode ?? order?.id}
            </Typography>

            <Box display="flex" gap={2} mt={1} flexWrap="wrap">
              <Box>
                <Typography variant="caption" color="text.secondary">Order Date</Typography>
                <Typography variant="body2" sx={{ mt: 0.2 }}>
                  {order?.orderDate ? new Date(order.orderDate).toLocaleDateString() : "-"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Return Date</Typography>
                <Typography variant="body2" sx={{ mt: 0.2 }}>
                  {order?.returnDate ? new Date(order.returnDate).toLocaleDateString() : "-"}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" gap={2} mt={1}>
              <Box>
                <Typography variant="caption" color="text.secondary">Storage</Typography>
                <Typography variant="body2" sx={{ mt: 0.2 }}>
                  {order?.style === "managed" || order?.kind === "managed" ? "Full service" : "Self service"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Items</Typography>
                <Typography variant="body2" sx={{ mt: 0.2 }}>{items.length}</Typography>
              </Box>
            </Box>

            <Box mt={1.5}>
              <Divider />
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                <Typography variant="body2" color="text.secondary">Total</Typography>
                <Typography variant="subtitle1" fontWeight={700}>{formatMoney(total)}</Typography>
              </Box>
            </Box>
          </Box>

          {/* RIGHT: compact items list (only avatar, name, qty) */}
          <Box sx={{ flex: 1, borderLeft: { md: "1px solid" }, borderColor: "divider", pl: { md: 2 } }}>
            <Stack spacing={1}>
              {items.slice(0, 3).map((it, idx) => (
                <Box key={it.id ?? idx} display="flex" alignItems="center" justifyContent="flex-start" gap={2}>
                  <Avatar
                    src={it.img ?? undefined}
                    variant="rounded"
                    sx={{ width: 56, height: 56, bgcolor: "#F5F5F5" }}
                  >
                    {!it.img && String(idx + 1)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{it.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Qty: {it.qty}</Typography>
                  </Box>
                </Box>
              ))}

              {/* if there are more than 3 items, show a hint */}
              {items.length > 3 && (
                <Typography variant="caption" color="text.secondary">
                  +{items.length - 3} more
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>

        {/* footer action */}
        <Box display="flex" justifyContent="flex-end" mt={2} gap={1}>
          <Button size="small" variant="outlined" onClick={() => onOpenDetail?.(order)}>
            View Details
          </Button>

          {/* Pay button only when not paid */}
          {!isPaid && (
            <Button size="small" variant="contained" onClick={handlePay} disabled={loadingPay}>
              {loadingPay ? <CircularProgress size={18} /> : "Pay"}
            </Button>
          )}
        </Box>
      </Paper>

      {/* Checkout dialog with iframe */}
      <Dialog
        open={Boolean(checkoutUrl)}
        onClose={closeCheckoutDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { height: { xs: "80vh", md: "80vh" } } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1 }}>
          Thanh toán
          <IconButton size="small" onClick={closeCheckoutDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, height: "100%", position: "relative" }}>
          {checkoutUrl ? (
            <iframe
              title="checkout"
              src={checkoutUrl}
              style={{ width: "100%", height: "100%", border: 0 }}
              onLoad={() => setIframeLoading(false)}
            />
          ) : (
            <Box p={2}>
              <Typography>Không có link thanh toán.</Typography>
            </Box>
          )}
          {iframeLoading && checkoutUrl && (
            <Box sx={{ position: "absolute", left: 0, right: 0, top: 56, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={closeCheckoutDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={6000}
        onClose={() => setSnack(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack(prev => ({ ...prev, open: false }))}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default OrderCard;
