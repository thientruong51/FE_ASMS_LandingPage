// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from "react";
import {
  Box, Paper, Typography, Stack, Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import type { Order } from "./types";
import OrderCard from "./components/OrderCard";
import OrderDetailModal from "./components/OrderDetailModal";
import { fetchOrdersWithDetails } from "./components/api.helpers";

export default function DashboardPage() {
  const theme = useTheme();
  const { t } = useTranslation("dashboard");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // modal state
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchOrdersWithDetails(1, 50); // page, pageSize
        if (!mounted) return;
        setOrders(data);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message ?? "Failed to load orders");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const activeOrders = orders.filter((o) => !["delivered", "expired", "cancelled"].includes(o.status ?? ""));
  const ordersInProgress = orders.filter((o) => ["pickup_scheduled", "picked", "in_warehouse", "out_for_delivery"].includes(o.status ?? ""));
  const nextExpiry = [...orders].filter(o => o.endDate).sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime())[0];

  const handleOpen = (o: Order) => { setSelectedOrder(o); setOpen(true); };
  const handleClose = () => { setOpen(false); setSelectedOrder(null); };

  return (
    <Stack spacing={3}>
      {loading ? (
        <Box textAlign="center" py={6}><Typography>Loading...</Typography></Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : null}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", md: "repeat(3,1fr)" }, gap: 2 }}>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">{t("dashboardPage.activeOrders")}</Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>{activeOrders.length}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Tổng đơn đang hoạt động</Typography>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">{t("dashboardPage.ordersInProgress") ?? "Orders in progress"}</Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>{ordersInProgress.length}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Đang xử lý: {ordersInProgress.map((o) => o.id).slice(0, 3).join(", ")}
            {ordersInProgress.length > 3 ? ` +${ordersInProgress.length - 3}` : ""}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">{t("dashboardPage.nextExpiry")}</Typography>
          <Typography variant="body1" fontWeight={700} sx={{ mt: 1 }}>{nextExpiry ? `${nextExpiry.id}` : "—"}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {nextExpiry ? `Expires ${new Date(nextExpiry.endDate ?? "").toLocaleDateString()}` : ""}
          </Typography>

          <Button startIcon={<AddIcon />} variant="text" sx={{ mt: 1, color: theme.palette.primary.main }}>{t("dashboardPage.renew")}</Button>
        </Paper>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, gap: 2 }}>
        <Paper sx={{ p: 2.5, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexDirection={{ xs: "column", sm: "row" }} gap={1}>
            <Typography variant="h6" fontWeight={700}>Recent Orders</Typography>
            <Button size="small" variant="outlined" onClick={() => {}}>View all</Button>
          </Box>

          <Stack spacing={2}>
            {orders.slice(0, 6).map((o) => (
              <Box key={o.id} sx={{ width: "100%" }}>
                <OrderCard order={o} onOpenDetail={handleOpen} />
              </Box>
            ))}
          </Stack>
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={1}>Quick Summary</Typography>
          {/* ... giữ nguyên nội dung summary của bạn ... */}
        </Paper>
      </Box>

      <OrderDetailModal open={open} order={selectedOrder ?? undefined} onClose={handleClose} />
    </Stack>
  );
}
