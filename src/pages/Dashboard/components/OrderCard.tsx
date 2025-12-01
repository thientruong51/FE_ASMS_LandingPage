// src/components/OrderCard.tsx
import React, { useState } from "react";
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
} from "@mui/material";
import type { Order as UIOrder, Item as UIItem } from "../types";
import { createPayLink, getPaymentResult } from "../../../api/payOs.api";

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
  // optional callback when paymentCode is created so parent store it if needed
  onPaymentCodeCreated?: (orderId: string | number, paymentCode: string | number) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onOpenDetail, onPaymentCodeCreated }) => {
  const [loadingPay, setLoadingPay] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; severity?: "success" | "error" | "info"; message: string }>({
    open: false,
    severity: "info",
    message: "",
  });

  // Normalize items (still map backend keys to UI-friendly shape)
  const rawItems: any[] = Array.isArray((order as any).items) ? (order as any).items : [];
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
  const backendTotal = (order as any).rawSummary?.totalPrice ?? (order as any).totalPrice ?? null;
  const total =
    backendTotal != null
      ? backendTotal
      : items.reduce((s: number, it: any) => s + (Number(it.price ?? 0) || 0) * (Number(it.qty ?? 1) || 1), 0);

  const ds = (order as any).displayStatus ?? order.status;
  const chip = statusMeta(ds);

  // derive orderCode and paymentCode from order object (common keys)
  const orderCode = (order as any).code ?? (order as any).orderCode ?? order.id;
  // paymentCode may be on order already; we will also update local state if we create one
  const initialPaymentCode = (order as any).paymentCode ?? (order as any).payment?.paymentCode ?? null;
  const [paymentCode, setPaymentCode] = useState<string | number | null>(initialPaymentCode);

  // --- Payment handler ---
  const handlePay = async () => {
    if (!orderCode) {
      setSnack({ open: true, severity: "error", message: "Không có orderCode để tạo link thanh toán." });
      return;
    }

    setLoadingPay(true);
    try {
      const { checkoutUrl, paymentCode: createdPaymentCode } = await createPayLink(orderCode);

      // open payment page in new tab
      window.open(checkoutUrl, "_blank", "noopener");

      // set paymentCode into local state so Check Payment becomes available
      setPaymentCode(createdPaymentCode);

      // notify parent (optional) to persist paymentCode to order model / server-side, if provided
      try {
        onPaymentCodeCreated?.((order as any).id ?? orderCode, createdPaymentCode);
      } catch (e) {
        // ignore errors from callback
        console.debug("onPaymentCodeCreated callback error", e);
      }

      setSnack({
        open: true,
        severity: "success",
        message: `Link thanh toán đã mở. paymentCode=${createdPaymentCode}`,
      });
    } catch (err: any) {
      console.error("createPayLink error:", err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Lỗi khi tạo link thanh toán.";
      setSnack({ open: true, severity: "error", message: msg });
    } finally {
      setLoadingPay(false);
    }
  };

  const handleCheckPayment = async () => {
    if (!paymentCode) {
      setSnack({ open: true, severity: "info", message: "Không có paymentCode trong đơn để kiểm tra." });
      return;
    }

    setCheckingPayment(true);
    try {
      const result = await getPaymentResult(paymentCode);
      const status = result?.status ?? (result as any).paymentStatus ?? "unknown";
      const amount = result?.amount ?? null;
      const msg = `PaymentCode: ${paymentCode} — status: ${status}` + (amount ? ` — amount: ${amount}` : "");
      setSnack({ open: true, severity: "success", message: msg });
      console.debug("PayOs result:", result);
    } catch (err: any) {
      console.error("getPaymentResult error:", err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Lỗi khi lấy kết quả thanh toán.";
      setSnack({ open: true, severity: "error", message: msg });
    } finally {
      setCheckingPayment(false);
    }
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
              #{order.id}
            </Typography>

            <Box display="flex" gap={2} mt={1} flexWrap="wrap">
              <Box>
                <Typography variant="caption" color="text.secondary">Order Date</Typography>
                <Typography variant="body2" sx={{ mt: 0.2 }}>
                  {order.startDate ? new Date(order.startDate).toLocaleDateString() : "-"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Return Date</Typography>
                <Typography variant="body2" sx={{ mt: 0.2 }}>
                  {order.endDate ? new Date(order.endDate).toLocaleDateString() : "-"}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" gap={2} mt={1}>
              <Box>
                <Typography variant="caption" color="text.secondary">Storage</Typography>
                <Typography variant="body2" sx={{ mt: 0.2 }}>
                  {order.kind === "managed" ? "Full service" : "Self service"}
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

          <Button size="small" variant="contained" onClick={handlePay} disabled={loadingPay}>
            {loadingPay ? <CircularProgress size={18} /> : "Pay"}
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={handleCheckPayment}
            disabled={checkingPayment || !paymentCode}
            title={!paymentCode ? "No paymentCode attached to order" : undefined}
          >
            {checkingPayment ? <CircularProgress size={18} /> : "Check Payment"}
          </Button>
        </Box>
      </Paper>

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
