import React from "react";
import { Stack, Typography, Box, Chip, Paper, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { MOCK_ORDERS } from "./mockOrders"; // chỉnh path nếu khác
import type { Order } from "./types";
import OrderCard from "./components/OrderCard";
import OrderDetailModal from "./components/OrderDetailModal";

const OrdersPage: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const orders = MOCK_ORDERS as Order[];

  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [open, setOpen] = React.useState(false);

  const handleOpen = (o: Order) => {
    setSelectedOrder(o);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    // nếu muốn giữ selected để debug, có thể không clear
    setSelectedOrder(null);
  };

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

      <Stack spacing={3}>
        {orders.map((o) => (
          // CHÚ Ý: truyền onOpenDetail = handleOpen
          <OrderCard key={o.id} order={o} onOpenDetail={handleOpen} />
        ))}
      </Stack>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Showing {orders.length} orders
          </Typography>
          <Button variant="outlined">{t("ordersPage.export")}</Button>
        </Box>
      </Paper>

      {/* Modal phải mount ở đây, nhận open + order + onClose */}
      <OrderDetailModal open={open} order={selectedOrder ?? undefined} onClose={handleClose} />
    </Stack>
  );
};

export default OrdersPage;
