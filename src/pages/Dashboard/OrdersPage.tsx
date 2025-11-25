import React, { useEffect, useState } from "react";
import { Stack, Typography, Box, Chip, Paper, Button, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { Order, Item } from "./types";
import OrderCard from "./components/OrderCard";
import OrderDetailModal from "./components/OrderDetailModal";
import { fetchOrdersByCustomer, fetchOrderDetails } from "../../api/order.list.ts"; 


const OrdersPage: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [open, setOpen] = React.useState(false);

  const handleOpen = (o: Order) => {
    setSelectedOrder(o);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedOrder(null);
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const page = await fetchOrdersByCustomer(1, 10);
        const summaries = page.data ?? [];

        const mappedPromises = summaries.map(async (s) => {
          const details = await fetchOrderDetails(s.orderCode);
          const items: Item[] = (details ?? []).map((d: any) => {
            const qty =
              d.containerQuantity ??
              (typeof d.quantity === "string" ? Number(d.quantity) : d.quantity) ??
              1;
            return {
              id: String(d.orderDetailId ?? `${s.orderCode}`),
              name: d.containerCode ?? `Item ${d.orderDetailId ?? ""}`,
              price: typeof d.price === "number" ? d.price : Number(d.price ?? 0),
              qty: typeof qty === "number" ? qty : Number(qty || 1),
              img: d.image ,
              size: undefined,
            } as Item;
          });

          const mapped: Order = {
            id: s.orderCode,
            startDate: s.depositDate ?? s.orderDate ?? new Date().toISOString(),
            endDate: s.returnDate ?? null,
            status: s.status ?? "unknown",
            kind: s.style === "self" ? "self" : "managed",
            staff: undefined,
            tracking: [],
            items,
          };

          return mapped;
        });

        const mappedOrders = await Promise.all(mappedPromises);
        if (!mounted) return;
        setOrders(mappedOrders);
      } catch (err: any) {
        console.error(err);
        if (!mounted) return;
        setError(err?.message ?? "Failed to load orders");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={700}>
        {t("ordersPage.title")}
      </Typography>

      <Box display="flex" gap={2} flexWrap="wrap">
        <Chip label="All" color="primary" />
        <Chip label={t("ordersPage.status.created")} />
        <Chip label={t("ordersPage.status.in_warehouse")} />
        <Chip label={t("ordersPage.status.out_for_delivery")} />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box py={4}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} onOpenDetail={handleOpen} />
          ))}
        </Stack>
      )}

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Showing {orders.length} orders
          </Typography>
          <Button variant="outlined">{t("ordersPage.export")}</Button>
        </Box>
      </Paper>

      <OrderDetailModal open={open} order={selectedOrder ?? undefined} onClose={handleClose} />
    </Stack>
  );
};

export default OrdersPage;
