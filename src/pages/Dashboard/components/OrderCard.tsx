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
import {
  fetchOrderByCode,
  fetchOrdersByCustomer,
  fetchOrderDetails,
} from "../../../api/order.list";
import {
  loadTypeLookup,
  resolveStorageName,
  resolveShelfName,
  resolveContainerName,
} from "../../../api/typeLookup";
import { useTranslation } from "react-i18next";

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

  const statusMeta = (s?: string) => {
    const token = (s ?? "").toString();
    switch (token) {
      case "WaitPickUp":
        return { color: "#C28700", label: t("status.WaitPickUp") };
      case "Overdue":
        return { color: "#B91C1C", label: t("status.Overdue") };
      case "Pending":
        return { color: "#6B7280", label: t("status.Pending") };
      case "Verify":
        return { color: "#0C4A6E", label: t("status.Verify") };
      case "Stored":
      case "Processing":
      case "PickUp":
      case "Checkout":
        return { color: "#0E8A5F", label: t(`status.${token}`, token) };
      default:
        return { color: "#6B7280", label: token ? t(`status.${token}`, token) : t("status.Unknown") };
    }
  };

  const [order, setOrder] = useState<any>(initialOrder);
  useEffect(() => setOrder(initialOrder), [initialOrder]);

  const [loadingPay, setLoadingPay] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; severity?: "success" | "error" | "info"; message: string }>(
    { open: false, severity: "info", message: "" }
  );

  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);

  const pollingRef = useRef<number | null>(null);
  const pollStartRef = useRef<number | null>(null);
  const closedByUserRef = useRef(false);

  const [detailsLoading, setDetailsLoading] = useState(false);
  const [typesLoaded, setTypesLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    void loadTypeLookup()
      .then(() => { if (mounted) setTypesLoaded(true); })
      .catch(() => {})
      .finally(() => { mounted = false; });
  }, []);

  const rawItems: any[] = Array.isArray(order?.items) ? order.items : [];

  const items: UIItem[] = rawItems.map((itOrig: any, idx: number) => {
    const r: any = itOrig ?? {};
    const qty = Number(r.quantity ?? r.qty ?? 1) || 1;
    const price = Number(r.price ?? r.basePrice ?? 0) || 0;
    const subTotal = Number(r.subTotal ?? r.subtotal ?? price * qty) || price * qty;
    return {
      id: r.orderDetailId ?? r.id ?? `item-${idx}`,
      img: r.image ?? r.img ?? undefined,
      name: (r.containerCode ?? r.name ?? r.title ?? `Item ${idx + 1}`) as string,
      qty,
      price,
      subTotal,
      productTypeNames: Array.isArray(r.productTypeNames) ? r.productTypeNames : [],
      serviceNames: Array.isArray(r.serviceNames) ? r.serviceNames : [],
      raw: r,
    } as unknown as UIItem;
  });

  const backendTotal = order?.rawSummary?.totalPrice ?? order?.totalPrice ?? null;
  const total =
    backendTotal != null
      ? backendTotal
      : items.reduce((s: number, it: any) => s + (Number(it.price ?? 0) || 0) * (Number(it.qty ?? 1) || 1), 0);

  const ds = order?.displayStatus ?? order?.status;
  const chip = statusMeta(ds);

  const orderCode = order?.orderCode ?? order?.code ?? order?.id;

  const paymentStatusRaw = order?.paymentStatus ?? order?.payment?.paymentStatus ?? order?.status ?? null;
  const paymentStatus = paymentStatusRaw != null ? String(paymentStatusRaw) : null;
  const isPaid = paymentStatus?.toUpperCase() === "PAID";

  useEffect(() => {
    if (!orderCode) return;
    const hasFullDetail = Array.isArray(order?.items) && order.items.some((it: any) =>
      it?.storageCode != null || it?.orderDetailId != null || it?.shelfTypeId != null || it?.subTotal != null || it?.storageTypeId != null
    );
    if (hasFullDetail) return;

    let mounted = true;
    setDetailsLoading(true);

    void fetchOrderDetails(String(orderCode))
      .then((details: any[]) => {
        if (!mounted) return;
        if (!Array.isArray(details) || details.length === 0) return;
        const existingItems = Array.isArray(order?.items) ? order.items : [];
        const merged = existingItems.map((it: any, idx: number) => {
          const matchById = details.find((d: any) => d.orderDetailId != null && it.orderDetailId != null && d.orderDetailId === it.orderDetailId);
          if (matchById) return { ...it, ...matchById };
          const det = details[idx];
          return det ? { ...it, ...det } : it;
        });
        const finalItems = merged.length > 0 ? merged : details;
        setOrder((prev: any) => ({ ...prev, items: finalItems }));
      })
      .catch(() => {})
      .finally(() => { if (mounted) setDetailsLoading(false); });

    return () => { mounted = false; };
  }, [orderCode]);

  const reloadOrder = async (): Promise<any> => {
    if (!orderCode) return null;
    try {
      const fresh = await fetchOrderByCode(String(orderCode));
      if (fresh) {
        setOrder((prev: any) => ({ ...prev, ...fresh }));
        try { window.dispatchEvent(new CustomEvent("order:updated", { detail: fresh })); } catch {}
        return fresh;
      }
    } catch {}

    try {
      const page = 1;
      const pageSize = 100;
      const res = await fetchOrdersByCustomer(page, pageSize);
      const fresh = (res?.data ?? []).find((o: any) =>
        o.orderCode === orderCode || o.orderCode === order?.orderCode || o.orderCode === String(order?.id)
      );
      if (fresh) {
        setOrder((prev: any) => ({ ...prev, ...fresh }));
        try { window.dispatchEvent(new CustomEvent("order:updated", { detail: fresh })); } catch {}
        return fresh;
      }
    } catch {}

    return null;
  };

  const startPollingForPaid = () => {
    if (!orderCode) return;
    stopPolling();
    pollStartRef.current = Date.now();
    closedByUserRef.current = false;

    const doPoll = async () => {
      try {
        const fresh = await reloadOrder();
        const freshPaymentStatus = fresh?.paymentStatus ?? fresh?.payment?.paymentStatus ?? fresh?.status ?? null;
        const normalized = freshPaymentStatus != null ? String(freshPaymentStatus).toUpperCase() : null;
        if (normalized === "PAID") {
          stopPolling();
          if (fresh) setOrder((prev: any) => ({ ...prev, ...fresh }));
          setTimeout(() => {
            if (!closedByUserRef.current) {
              setCheckoutUrl(null);
              setSnack({ open: true, severity: "success", message: t("snack.paymentCompleted") });
            }
          }, 3000);
        } else {
          const started = pollStartRef.current ?? 0;
          if (Date.now() - started > pollTimeoutMs) {
            stopPolling();
            setSnack({ open: true, severity: "info", message: t("snack.pollingTimeout") });
          }
        }
      } catch {}
    };

    void doPoll();
    const id = window.setInterval(doPoll, pollIntervalMs);
    pollingRef.current = id;
  };

  const stopPolling = () => {
    if (pollingRef.current != null) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    pollStartRef.current = null;
  };

  useEffect(() => {
    return () => { stopPolling(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (checkoutUrl) startPollingForPaid();
    else {
      closedByUserRef.current = true;
      stopPolling();
      setIframeLoading(true);
      void reloadOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutUrl]);

  const handlePay = async () => {
    if (!orderCode) {
      setSnack({ open: true, severity: "error", message: t("snack.noOrderCodePayError") });
      return;
    }

    setLoadingPay(true);
    try {
      const { checkoutUrl: url } = await createPayLink(orderCode);
      setCheckoutUrl(url ?? null);
      setIframeLoading(true);
      setSnack({ open: true, severity: "success", message: t("snack.openCheckout") });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? t("snack.createPayLinkError");
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
                <Typography variant="body2" sx={{ mt: 0.2 }}>{order?.orderDate ? new Date(order.orderDate).toLocaleDateString() : "-"}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">{t("returnDate")}</Typography>
                <Typography variant="body2" sx={{ mt: 0.2 }}>{order?.returnDate ? new Date(order.returnDate).toLocaleDateString() : "-"}</Typography>
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
                  const itAny: any = it;
                  const r: any = itAny.raw ?? {};

                  const storageTypeId = r.storageTypeId ?? null;
                  const shelfTypeId = r.shelfTypeId ?? null;
                  const containerTypeId = r.containerType ?? null;

                  const storageName = typesLoaded ? resolveStorageName(storageTypeId) : null;
                  const shelfName = typesLoaded ? resolveShelfName(shelfTypeId) : null;
                  const containerName = typesLoaded ? resolveContainerName(containerTypeId) : null;

                  const storageCode = (r.storageCode ?? itAny.storageCode ?? "").toString().trim();
                  const containerCode = (r.containerCode ?? itAny.containerCode ?? "").toString().trim();
                  const name = (itAny.name ?? r.containerCode ?? r.name ?? `Item ${idx + 1}`).toString();
                  const qty = Number(r.quantity ?? r.qty ?? itAny.qty ?? 1) || 0;
                  const price = Number(r.price ?? r.basePrice ?? itAny.price ?? 0) || 0;
                  const subtotal = Number(r.subTotal ?? r.subtotal ?? itAny.subTotal ?? itAny.subtotal ?? price * qty) || (price * qty);

                  const floorNumber = r.floorNumber ?? r.floor ?? null;
                  const shelfQuantity = r.shelfQuantity ?? null;
                  const productTypes: string[] = Array.isArray(r.productTypeNames) ? r.productTypeNames : Array.isArray(itAny.productTypeNames) ? itAny.productTypeNames : [];
                  const services: string[] = Array.isArray(r.serviceNames) ? r.serviceNames : Array.isArray(itAny.serviceNames) ? itAny.serviceNames : [];

                  return (
                    <Box key={itAny.id ?? idx} display="flex" gap={2} alignItems="flex-start">
                      <Avatar src={itAny.img ?? (r.image as string) ?? undefined} variant="rounded" sx={{ width: 56, height: 56, bgcolor: "#F5F5F5", flexShrink: 0 }}>
                        {!itAny.img && String(idx + 1)}
                      </Avatar>

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box sx={{ minWidth: 0, pr: 1 }}>
                            <Typography variant="body2" fontWeight={700} noWrap>{name}</Typography>

                            <Box mt={0.5} display="flex" gap={1} flexWrap="wrap">
                              {storageCode.length > 0 && <Typography variant="caption" sx={{ bgcolor: "#F3F4F6", px: 0.6, py: 0.3, borderRadius: 1 }}>{storageCode}</Typography>}
                              {containerCode.length > 0 && <Typography variant="caption" sx={{ bgcolor: "#F3F4F6", px: 0.6, py: 0.3, borderRadius: 1 }}>{containerCode}</Typography>}
                              {containerName && <Typography variant="caption" sx={{ bgcolor: "#E5FFE9", px: 0.6, py: 0.3, borderRadius: 1 }}>{containerName}</Typography>}
                              {storageName && <Typography variant="caption" sx={{ bgcolor: "#E5F3FF", px: 0.6, py: 0.3, borderRadius: 1 }}>{storageName}</Typography>}
                              {shelfName && <Typography variant="caption" sx={{ bgcolor: "#FFF4E5", px: 0.6, py: 0.3, borderRadius: 1 }}>{shelfName}{shelfQuantity ? ` ×${shelfQuantity}` : ""}</Typography>}
                              {floorNumber != null && <Typography variant="caption" sx={{ bgcolor: "#F3F4F6", px: 0.6, py: 0.3, borderRadius: 1 }}>{t("floorLabel", { number: floorNumber })}</Typography>}
                              {productTypes.length > 0 && productTypes.map((p: string, i: number) => <Typography key={`pt-${i}`} variant="caption" sx={{ bgcolor: "#E5F3FF", px: 0.6, py: 0.3, borderRadius: 1 }}>{p}</Typography>)}
                              {services.length > 0 && services.map((s: string, i: number) => <Typography key={`svc-${i}`} variant="caption" sx={{ bgcolor: "#FFF4E5", px: 0.6, py: 0.3, borderRadius: 1 }}>{s}</Typography>)}
                            </Box>
                          </Box>

                          <Box textAlign="right" sx={{ ml: 1 }}>
                            <Typography variant="body2" fontWeight={700}>{formatMoney(subtotal)}</Typography>
                            
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  );
                })
              )}
              {items.length > 3 && <Typography variant="caption" color="text.secondary">{t("moreItems", { n: items.length - 3 })}</Typography>}
            </Stack>
          </Box>
        </Box>

        <Box display="flex" justifyContent="flex-end" mt={2} gap={1}>
          <Button size="small" variant="outlined" onClick={() => onOpenDetail?.(order)}>{t("viewDetails")}</Button>
          {!isPaid && (
            <Button size="small" variant="contained" onClick={handlePay} disabled={loadingPay}>
              {loadingPay ? <CircularProgress size={18} /> : t("pay")}
            </Button>
          )}
        </Box>
      </Paper>

      <Dialog open={Boolean(checkoutUrl)} onClose={closeCheckoutDialog} fullWidth maxWidth="md" PaperProps={{ sx: { height: { xs: "80vh", md: "80vh" } } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1 }}>
          {t("checkoutTitle")}
          <IconButton size="small" onClick={closeCheckoutDialog}><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, height: "100%", position: "relative" }}>
          {checkoutUrl ? <iframe title="checkout" src={checkoutUrl} style={{ width: "100%", height: "100%", border: 0 }} onLoad={() => setIframeLoading(false)} /> : <Box p={2}><Typography>{t("noPaymentLink")}</Typography></Box>}
          {iframeLoading && checkoutUrl && <Box sx={{ position: "absolute", left: 0, right: 0, top: 56, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><CircularProgress /></Box>}
        </DialogContent>

        <DialogActions><Button onClick={closeCheckoutDialog}>{t("close")}</Button></DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={6000} onClose={() => setSnack((prev) => ({ ...prev, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnack((prev) => ({ ...prev, open: false }))} severity={snack.severity} sx={{ width: "100%" }}>{snack.message}</Alert>
      </Snackbar>
    </>
  );
};

export default OrderCard;
