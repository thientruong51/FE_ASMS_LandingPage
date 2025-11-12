import React from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,

  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { MOCK_ORDERS } from "./mockOrders";
import type { Order } from "./types";
import OrderCard from "./components/OrderCard";
import OrderDetailModal from "./components/OrderDetailModal";
export default function DashboardPage() {
  const theme = useTheme();

  const { t } = useTranslation("dashboard");
  const orders: Order[] = MOCK_ORDERS;

  // derived metrics
  const activeOrders = orders.filter((o) => !["delivered", "expired", "cancelled"].includes(o.status));
  const ordersInProgress = orders.filter((o) => ["pickup_scheduled", "picked", "in_warehouse", "out_for_delivery"].includes(o.status));
  const nextExpiry = [...orders].sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())[0];

  // modal state
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

  return (
    <Stack spacing={3}>
      {/* Header */}
     

      {/* Stats row - responsive: 1 column on xs/sm, 3 columns on md+ */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", md: "repeat(3,1fr)" },
          gap: 2,
        }}
      >
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {t("dashboardPage.activeOrders")}
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
            {activeOrders.length}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Tổng đơn đang hoạt động
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {t("dashboardPage.ordersInProgress") ?? "Orders in progress"}
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
            {ordersInProgress.length}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Đang xử lý: {ordersInProgress.map((o) => o.id).slice(0, 3).join(", ")}
            {ordersInProgress.length > 3 ? ` +${ordersInProgress.length - 3}` : ""}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {t("dashboardPage.nextExpiry")}
          </Typography>
          <Typography variant="body1" fontWeight={700} sx={{ mt: 1 }}>
            {nextExpiry ? `${nextExpiry.id}` : "—"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {nextExpiry ? `Expires ${new Date(nextExpiry.endDate).toLocaleDateString()}` : ""}
          </Typography>

          <Button
            startIcon={<AddIcon />}
            variant="text"
            sx={{ mt: 1, color: theme.palette.primary.main }}
          >
            {t("dashboardPage.renew")}
          </Button>
        </Paper>
      </Box>

      {/* Main content: Recent orders + quick summary
          Responsive: single column on xs/sm, two columns on md+ */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 2,
        }}
      >
        {/* Recent Orders list */}
        <Paper sx={{ p: 2.5, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexDirection={{ xs: "column", sm: "row" }} gap={1}>
            <Typography variant="h6" fontWeight={700}>
              Recent Orders
            </Typography>
            <Button size="small" variant="outlined" onClick={() => {}} sx={{ mt: { xs: 1, sm: 0 } }}>
              View all
            </Button>
          </Box>

          <Stack spacing={2}>
            {orders.slice(0, 6).map((o) => (
              // ensure OrderCard fills available width on small screens
              <Box key={o.id} sx={{ width: "100%" }}>
                <OrderCard order={o} onOpenDetail={handleOpen} />
              </Box>
            ))}
          </Stack>
        </Paper>

        {/* Right column: compact summary / actions */}
        <Paper sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={1}>
            Quick Summary
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Next expiry
              </Typography>
              <Typography variant="body1" fontWeight={700} sx={{ mt: 0.5 }}>
                {nextExpiry ? `${nextExpiry.id}` : "—"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {nextExpiry ? new Date(nextExpiry.endDate).toLocaleDateString() : ""}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Shortcuts
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="contained" size="small" sx={{ bgcolor: theme.palette.primary.main }}>
                  New Order
                </Button>
                <Button variant="outlined" size="small">
                  Renew
                </Button>
                <Button variant="outlined" size="small">
                  Contact
                </Button>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Notifications
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  {ordersInProgress.length} orders need attention.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Next: {nextExpiry ? `${nextExpiry.id} (${new Date(nextExpiry.endDate).toLocaleDateString()})` : "—"}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Box>

      {/* Modal */}
      <OrderDetailModal open={open} order={selectedOrder ?? undefined} onClose={handleClose} />
    </Stack>
  );
}
