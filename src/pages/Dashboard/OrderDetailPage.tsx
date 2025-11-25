import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Stack,
  Paper,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import TrackingTimeline from "./components/TrackingTimeline";
import { fetchOrderDetails, fetchOrdersByCustomer } from "../../api/order.list"; // adjust path if needed
import type { Order } from "./types";


const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation("dashboard");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [openRenew, setOpenRenew] = React.useState(false);
  const [openContact, setOpenContact] = React.useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!id) throw new Error("Order id is required");

        // Option A: fetch list and find that order's summary (using customer token)
        // then fetch details for the order. This avoids extra API endpoint call.
        const page = await fetchOrdersByCustomer(1, 50); // try bigger pageSize to find the order if not in first 10
        const found = page.data.find((o: any) => o.orderCode === id);
        if (!found) throw new Error("Order not found");

        const details = await fetchOrderDetails(id);
        const items = (details ?? []).map((d: any, idx: number) => {
          const qty =
            d.containerQuantity ??
            (typeof d.quantity === "string" ? Number(d.quantity) : d.quantity) ??
            1;
          return {
            id: String(d.orderDetailId ?? idx),
            name: d.containerCode ?? `Item ${d.orderDetailId ?? idx}`,
            price: typeof d.price === "number" ? d.price : Number(d.price ?? 0),
            qty: typeof qty === "number" ? qty : Number(qty || 1),
            img: d.image ,
          };
        });

        const mapped: Order = {
          id: found.orderCode,
          startDate: found.depositDate ?? found.orderDate ?? new Date().toISOString(),
          endDate: found.returnDate ?? null,
          status: found.status ?? "unknown",
          kind: found.style === "self" ? "self" : "managed",
          staff: undefined,
          tracking: [],
          items,
        };

        if (!mounted) return;
        setOrder(mapped);
      } catch (err: any) {
        console.error(err);
        if (!mounted) return;
        setError(err?.message ?? "Failed to load order");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Box py={6} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box py={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!order) {
    return <Typography>Order not found</Typography>;
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {order.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.kind === "managed" ? "Kho dịch vụ" : "Kho tự quản"}
            </Typography>
          </Box>

          <Box>
            <Button variant="outlined" onClick={() => setOpenRenew(true)} sx={{ mr: 1 }}>
              {t("orderDetail.renewOrder")}
            </Button>
            <Button variant="contained" onClick={() => setOpenContact(true)}>
              {t("orderDetail.contactStaff")}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Paper sx={{ flex: 2, p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            {t("orderDetail.tracking")}
          </Typography>
          <TrackingTimeline tracking={order.tracking} />
        </Paper>

        <Paper sx={{ flex: 1, p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t("orderDetail.summary")}
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary={t("orderDetail.startDate")} secondary={order.startDate} />
            </ListItem>
            <ListItem>
              <ListItemText primary={t("orderDetail.endDate")} secondary={order.endDate} />
            </ListItem>
            <ListItem>
              <ListItemText primary={t("orderDetail.status")} secondary={order.status} />
            </ListItem>
            {order.staff && (
              <ListItem>
                <ListItemText
                  primary={t("orderDetail.warehouseStaff")}
                  secondary={`${order.staff.name} • ${order.staff.phone ?? "-"}`}
                />
              </ListItem>
            )}
          </List>
        </Paper>
      </Stack>

      {/* Dialogs */}
      <Dialog open={openRenew} onClose={() => setOpenRenew(false)}>
        <DialogTitle>{t("orderDetail.renewOrder")}</DialogTitle>
        <DialogContent>
          <TextField label="Extend by (days)" type="number" fullWidth sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRenew(false)}>{t("orderDetail.cancel")}</Button>
          <Button variant="contained">{t("orderDetail.send")}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openContact} onClose={() => setOpenContact(false)}>
        <DialogTitle>{t("orderDetail.contactStaff")}</DialogTitle>
        <DialogContent>
          <TextField label={t("orderDetail.messageLabel")} multiline minRows={4} fullWidth sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenContact(false)}>{t("orderDetail.cancel")}</Button>
          <Button variant="contained">{t("orderDetail.send")}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default OrderDetailPage;
