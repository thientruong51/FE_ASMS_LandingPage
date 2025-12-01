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
import type { Order } from "./types";
import { fetchOrderWithDetails } from "./components/api.helpers";

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation("dashboard");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [renewOpen, setRenewOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        if (!id) throw new Error("OrderId missing");
        const result = await fetchOrderWithDetails(id);
        if (mounted) setOrder(result);
      } catch (err: any) {
        if (mounted) setError(err?.message ?? "Failed to load order");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading)
    return (
      <Box textAlign="center" py={6}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" py={3}>
        {error}
      </Typography>
    );

  if (!order) return <Typography>Order not found</Typography>;

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {order.id}
            </Typography>
            <Typography color="text.secondary">
              {order.kind === "managed" ? "Kho dịch vụ" : "Kho tự quản"}
            </Typography>
          </Box>

          <Box>
            <Button variant="outlined" onClick={() => setRenewOpen(true)} sx={{ mr: 1 }}>
              {t("orderDetail.renewOrder")}
            </Button>
            <Button variant="contained" onClick={() => setContactOpen(true)}>
              {t("orderDetail.contactStaff")}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tracking + Items */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        {/* Tracking */}
        <Paper sx={{ flex: 2, p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            {t("orderDetail.tracking")}
          </Typography>
          <TrackingTimeline tracking={order.tracking} />

          {/* Items */}
          <Box mt={3}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              Items
            </Typography>
            <List>
              {order.items.map((it) => (
                <ListItem key={it.id} divider>
                  <ListItemText
                    primary={`${it.name} x${it.qty}`}
                    secondary={
                      <>
                        <div>Price: {it.price}</div>
                        {it.productTypeNames?.length ? (
                          <div>Product Types: {it.productTypeNames.join(", ")}</div>
                        ) : null}
                        {it.serviceNames?.length ? (
                          <div>Services: {it.serviceNames.join(", ")}</div>
                        ) : null}
                        <div>Placed: {it.isPlaced ? "Yes" : "No"}</div>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>

        {/* Summary */}
        <Paper sx={{ flex: 1, p: 3 }}>
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
              <ListItemText
                primary={t("orderDetail.status")}
                secondary={order.displayStatus ?? order.status}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Total Price" secondary={order.rawSummary?.totalPrice ?? "-"} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Unpaid Amount" secondary={order.rawSummary?.unpaidAmount ?? "-"} />
            </ListItem>
          </List>
        </Paper>
      </Stack>

      {/* Dialog Renew */}
      <Dialog open={renewOpen} onClose={() => setRenewOpen(false)}>
        <DialogTitle>{t("orderDetail.renewOrder")}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Extend by (days)" type="number" sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenewOpen(false)}>{t("orderDetail.cancel")}</Button>
          <Button variant="contained">{t("orderDetail.send")}</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Contact */}
      <Dialog open={contactOpen} onClose={() => setContactOpen(false)}>
        <DialogTitle>{t("orderDetail.contactStaff")}</DialogTitle>
        <DialogContent>
          <TextField multiline minRows={4} fullWidth sx={{ mt: 1 }} label={t("orderDetail.messageLabel")} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactOpen(false)}>{t("orderDetail.cancel")}</Button>
          <Button variant="contained">{t("orderDetail.send")}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default OrderDetailPage;
