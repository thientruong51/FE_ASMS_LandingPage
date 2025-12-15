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
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import type { Order as UIOrder, Item as UIItem } from "../types";
import { createPayLink } from "../../../api/payOs.api";
import {
  fetchOrderByCode,
  fetchOrdersByCustomer,
  fetchOrderDetails,
  cancelOrder,
} from "../../../api/order.list";
import {
  loadTypeLookup,
  resolveStorageName,
  resolveShelfName,
  resolveContainerName,
} from "../../../api/typeLookup";
import { useTranslation } from "react-i18next";

import ContactDialog from "./ContactDialog";
import UpdatePasskeyDialog from "./UpdatePasskeyDialog";

import { translateStatus } from "../../../utils/statusHelper";

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
  const { t } = useTranslation("dashboard");

  const [order, setOrder] = useState<any>(initialOrder);
  useEffect(() => setOrder(initialOrder), [initialOrder]);

  const [loadingPay, setLoadingPay] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [typesLoaded, setTypesLoaded] = useState(false);

  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);

  const [contactOpen, setContactOpen] = useState(false);
  const [updatePasskeyOpen, setUpdatePasskeyOpen] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: "success" | "error" | "info";
    message: string;
  }>({ open: false, severity: "info", message: "" });

  const pollingRef = useRef<number | null>(null);
  const pollStartRef = useRef<number | null>(null);
  const closedByUserRef = useRef(false);

  const orderCode = order?.orderCode ?? order?.code ?? order?.id;

  const chip = {
    color: "#6B7280",
    label: translateStatus(t, order?.status),
  };

  /* ✅ PAYMENT – không fallback sang status */
  const paymentStatusRaw =
    order?.paymentStatus ?? order?.payment?.paymentStatus ?? null;
  const isPaid =
    paymentStatusRaw?.toString().toUpperCase() === "PAID";

  /* ✅ Pending check raw status */
  const isPending =
    order?.status?.toString().toLowerCase() === "pending";

  useEffect(() => {
    let mounted = true;
    loadTypeLookup()
      .then(() => mounted && setTypesLoaded(true))
      .finally(() => (mounted = false));
  }, []);

  const rawItems: any[] = Array.isArray(order?.items) ? order.items : [];

  const items: UIItem[] = rawItems.map((itOrig: any, idx: number) => {
    const r: any = itOrig ?? {};
    const qty = Number(r.quantity ?? r.qty ?? 1) || 1;
    const price = Number(r.price ?? r.basePrice ?? 0) || 0;
    const subTotal =
      Number(r.subTotal ?? r.subtotal ?? price * qty) || price * qty;

    return {
      id: r.orderDetailId ?? r.id ?? `item-${idx}`,
      img: r.image ?? r.img ?? undefined,
      name:
        (r.containerCode ??
          r.name ??
          r.title ??
          `Item ${idx + 1}`) as string,
      qty,
      price,
      subTotal,
      productTypeNames: Array.isArray(r.productTypeNames)
        ? r.productTypeNames
        : [],
      serviceNames: Array.isArray(r.serviceNames)
        ? r.serviceNames
        : [],
      raw: r,
    };
  });

  const backendTotal =
    order?.rawSummary?.totalPrice ?? order?.totalPrice ?? null;
  const total =
    backendTotal != null
      ? backendTotal
      : items.reduce(
          (s, it) =>
            s +
            (Number(it.price ?? 0) || 0) *
              (Number(it.qty ?? 1) || 1),
          0
        );

  useEffect(() => {
    if (!orderCode) return;

    const hasFullDetail =
      Array.isArray(order?.items) &&
      order.items.some(
        (it: any) =>
          it?.storageCode != null ||
          it?.orderDetailId != null ||
          it?.shelfTypeId != null ||
          it?.subTotal != null ||
          it?.storageTypeId != null
      );
    if (hasFullDetail) return;

    let mounted = true;
    setDetailsLoading(true);

    fetchOrderDetails(String(orderCode))
      .then((details: any[]) => {
        if (!mounted) return;
        if (!Array.isArray(details) || details.length === 0) return;

        const existingItems = Array.isArray(order?.items)
          ? order.items
          : [];

        const merged = existingItems.map((it: any, idx: number) => {
          const match = details.find(
            (d: any) =>
              d.orderDetailId != null &&
              it.orderDetailId != null &&
              d.orderDetailId === it.orderDetailId
          );
          if (match) return { ...it, ...match };
          return details[idx] ? { ...it, ...details[idx] } : it;
        });

        setOrder((prev: any) => ({
          ...prev,
          items: merged.length > 0 ? merged : details,
        }));
      })
      .finally(() => mounted && setDetailsLoading(false));

    return () => {
      mounted = false;
    };
  }, [orderCode]);

  const reloadOrder = async (): Promise<any> => {
    if (!orderCode) return null;

    try {
      const fresh = await fetchOrderByCode(String(orderCode));
      if (fresh) {
        setOrder((prev: any) => ({ ...prev, ...fresh }));
        return fresh;
      }
    } catch {}

    try {
      const res = await fetchOrdersByCustomer(1, 100);
      const fresh = (res?.data ?? []).find(
        (o: any) => o.orderCode === orderCode
      );
      if (fresh) {
        setOrder((prev: any) => ({ ...prev, ...fresh }));
        return fresh;
      }
    } catch {}

    return null;
  };

  const stopPolling = () => {
    if (pollingRef.current != null) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    pollStartRef.current = null;
  };

  const startPollingForPaid = () => {
    if (!orderCode) return;
    stopPolling();
    pollStartRef.current = Date.now();
    closedByUserRef.current = false;

    const doPoll = async () => {
      try {
        const fresh = await reloadOrder();
        const paid =
          fresh?.paymentStatus
            ?.toString()
            .toUpperCase() === "PAID";

        if (paid) {
          stopPolling();
          setTimeout(() => {
            if (!closedByUserRef.current) {
              setCheckoutUrl(null);
              setSnack({
                open: true,
                severity: "success",
                message: t("snack.paymentCompleted"),
              });
            }
          }, 3000);
        } else if (
          pollStartRef.current &&
          Date.now() - pollStartRef.current > pollTimeoutMs
        ) {
          stopPolling();
          setSnack({
            open: true,
            severity: "info",
            message: t("snack.pollingTimeout"),
          });
        }
      } catch {}
    };

    doPoll();
    pollingRef.current = window.setInterval(doPoll, pollIntervalMs);
  };

  useEffect(() => () => stopPolling(), []);

  useEffect(() => {
    if (checkoutUrl) startPollingForPaid();
    else {
      closedByUserRef.current = true;
      stopPolling();
      setIframeLoading(true);
      void reloadOrder();
    }
  }, [checkoutUrl]);

  const handlePay = async () => {
    if (!orderCode) {
      setSnack({
        open: true,
        severity: "error",
        message: t("snack.noOrderCodePayError"),
      });
      return;
    }

    setLoadingPay(true);
    try {
      const { checkoutUrl } = await createPayLink(orderCode);
      setCheckoutUrl(checkoutUrl ?? null);
      setIframeLoading(true);
      setSnack({
        open: true,
        severity: "success",
        message: t("snack.openCheckout"),
      });
    } catch (err: any) {
      setSnack({
        open: true,
        severity: "error",
        message:
          err?.response?.data?.message ??
          err?.message ??
          t("snack.createPayLinkError"),
      });
    } finally {
      setLoadingPay(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderCode) return;

    setCancelLoading(true);
    try {
      await cancelOrder({
        orderCode: String(orderCode),
        cancelReason: "Customer cancel",
      });

      setSnack({
        open: true,
        severity: "success",
        message: t("snack.cancelSuccess"),
      });

      await reloadOrder();
    } catch (err: any) {
      setSnack({
        open: true,
        severity: "error",
        message:
          err?.response?.data?.message ??
          err?.message ??
          t("snack.cancelError"),
      });
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <>
      <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 0, border: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, alignItems: "flex-start" }}>
          <Box sx={{ flex: { md: "0 0 45%" }, minWidth: 0 }}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: chip.color }} />
              <Typography variant="caption" sx={{ color: chip.color, fontWeight: 600 }}>{chip.label}</Typography>
            </Box>

            <Typography variant="subtitle2" fontWeight={700}>
              {t("orderLabel", { code: order?.orderCode ?? order?.id ?? "-" })}
            </Typography>

            <Box display="flex" gap={2} mt={1} flexWrap="wrap">
              <Box>
                <Typography variant="caption" color="text.secondary">{t("orderDate")}</Typography>
                <Typography variant="body2" sx={{ mt: 0.2 }}>
                  {order?.orderDate ? new Date(order.orderDate).toLocaleDateString() : "-"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">{t("returnDate")}</Typography>
                <Typography variant="body2" sx={{ mt: 0.2 }}>
                  {order?.returnDate ? new Date(order.returnDate).toLocaleDateString() : "-"}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" gap={2} mt={1}>
              <Box>
                <Typography variant="caption" color="text.secondary">{t("storage")}</Typography>
                <Typography variant="body2" sx={{ mt: 0.2 }}>
                  {order?.style === "managed" || order?.kind === "managed" ? t("fullService") : t("selfService")}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">{t("items")}</Typography>
                <Typography variant="body2" sx={{ mt: 0.2 }}>{items.length}</Typography>
              </Box>
            </Box>

            {order?.passkey != null && (
              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                <Typography variant="body2">
                  {t("passkey")}: <strong>{showPasskey ? order.passkey : "••••••"}</strong>
                </Typography>
                <IconButton size="small" onClick={() => setShowPasskey(v => !v)} sx={{ p: 0.5 }}>
                  {showPasskey ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </Box>
            )}

            <Box mt={1.5}>
              <Divider />
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                <Typography variant="body2" color="text.secondary">{t("total")}</Typography>
                <Typography variant="subtitle1" fontWeight={700}>{formatMoney(total)}</Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ flex: 1, borderLeft: { md: "1px solid" }, borderColor: "divider", pl: { md: 2 } }}>
            <Stack spacing={1}>
              {detailsLoading ? (
                <Box display="flex" alignItems="center" justifyContent="center" height={80}><CircularProgress size={20} /></Box>
              ) : (
                items.slice(0, 3).map((it, idx) => {
                  const r: any = it.raw ?? {};
                  const storageName = typesLoaded ? resolveStorageName(r.storageTypeId ?? null) : null;
                  const shelfName = typesLoaded ? resolveShelfName(r.shelfTypeId ?? null) : null;
                  const containerName = typesLoaded ? resolveContainerName(r.containerType ?? null) : null;

                  return (
                    <Box key={it.id ?? idx} display="flex" gap={2} alignItems="flex-start">
                      <Avatar
                        src={it.img ?? undefined}
                        variant="rounded"
                        sx={{ width: 56, height: 56, bgcolor: "#F5F5F5", flexShrink: 0 }}
                      >
                        {!it.img && String(idx + 1)}
                      </Avatar>

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="body2" fontWeight={700} noWrap>{it.name}</Typography>
                        <Box mt={0.5} display="flex" gap={1} flexWrap="wrap">
                          {containerName && <Typography variant="caption" sx={{ bgcolor: "#E5FFE9", px: 0.6, py: 0.3, borderRadius: 1 }}>{containerName}</Typography>}
                          {storageName && <Typography variant="caption" sx={{ bgcolor: "#E5F3FF", px: 0.6, py: 0.3, borderRadius: 1 }}>{storageName}</Typography>}
                          {shelfName && <Typography variant="caption" sx={{ bgcolor: "#FFF4E5", px: 0.6, py: 0.3, borderRadius: 1 }}>{shelfName}</Typography>}
                        </Box>
                      </Box>

                    </Box>
                  );
                })
              )}
            </Stack>
          </Box>
        </Box>

        <Box display="flex" justifyContent="flex-end" mt={2} gap={1}>
          <Button size="small" variant="outlined" onClick={() => onOpenDetail?.(order)}>{t("viewDetails")}</Button>

          <Button size="small" variant="outlined" onClick={() => setContactOpen(true)}>
            {t("orderDetail.contactStaff") ?? "Liên hệ"}
          </Button>

          {order?.passkey != null && (
            <Button size="small" variant="outlined" onClick={() => setUpdatePasskeyOpen(true)}>
              {t("updatePasskey") ?? "Cập nhật passkey"}
            </Button>
          )}

          {isPending && (
            <Button size="small" variant="outlined" color="error" onClick={handleCancelOrder} disabled={cancelLoading}>
              {cancelLoading ? <CircularProgress size={18} /> : t("cancelOrder") ?? "Hủy đơn"}
            </Button>
          )}

          {!isPaid && (
            <Button size="small" variant="contained" onClick={handlePay} disabled={loadingPay}>
              {loadingPay ? <CircularProgress size={18} /> : t("pay")}
            </Button>
          )}
        </Box>
      </Paper>

      <Dialog open={Boolean(checkoutUrl)} onClose={() => setCheckoutUrl(null)} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", pr: 1 }}>
          {t("checkoutTitle")}
          <IconButton size="small" onClick={() => setCheckoutUrl(null)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: "80vh" }}>
          {checkoutUrl && (
            <iframe
              title="checkout"
              src={checkoutUrl}
              style={{ width: "100%", height: "100%", border: 0 }}
              onLoad={() => setIframeLoading(false)}
            />
          )}
          {iframeLoading && <CircularProgress />}
        </DialogContent>
        <DialogActions><Button onClick={() => setCheckoutUrl(null)}>{t("close")}</Button></DialogActions>
      </Dialog>

      <ContactDialog
        open={contactOpen}
        onClose={() => { setContactOpen(false); void reloadOrder(); }}
        orderCode={orderCode}
        onSent={() => { void reloadOrder(); setContactOpen(false); }}
      />

      <UpdatePasskeyDialog
        open={updatePasskeyOpen}
        orderCode={String(orderCode)}
        onClose={() => setUpdatePasskeyOpen(false)}
        onSuccess={() => {
          setSnack({ open: true, severity: "success", message: t("snack.updatePasskeySuccess") ?? "Cập nhật passkey thành công" });
          void reloadOrder();
        }}
        onError={(msg) => setSnack({ open: true, severity: "error", message: msg })}
      />

      <Snackbar open={snack.open} autoHideDuration={6000} onClose={() => setSnack(prev => ({ ...prev, open: false }))}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </>
  );
};

export default OrderCard;
