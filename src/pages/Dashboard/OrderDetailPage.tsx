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

const safeDate = (iso?: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

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
        if (!id) throw new Error(t("orderDetail.errors.missingOrderId"));
        const result = await fetchOrderWithDetails(id);
        if (mounted) setOrder(result);
      } catch (err: any) {
        if (mounted) setError(err?.message ?? t("orderDetail.errors.loadFailed"));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, t]);

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

  if (!order) return <Typography>{t("orderDetail.notFound")}</Typography>;

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {order.id}
            </Typography>
            <Typography color="text.secondary">
              {order.kind === "managed" ? t("orderDetail.serviceWarehouse") : t("orderDetail.selfStorage")}
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
          <TrackingTimeline tracking={order.tracking} order={order} />

          {/* Items */}
          <Box mt={3}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              {t("orderDetail.items")}
            </Typography>
            <List>
              {order.items.map((it) => (
                <ListItem key={it.id} divider>
                  <ListItemText
                    primary={`${it.name} x${it.qty}`}
                    secondary={
                      <>
                        <div>
                          {t("orderDetail.priceLabel")}: {it.price != null ? it.price : "-"}
                        </div>
                        {it.productTypeNames?.length ? (
                          <div>
                            {t("orderDetail.productTypes")}: {it.productTypeNames.join(", ")}
                          </div>
                        ) : null}
                        {it.serviceNames?.length ? (
                          <div>
                            {t("orderDetail.services")}: {it.serviceNames.join(", ")}
                          </div>
                        ) : null}
                        <div>
                          {t("orderDetail.placed")}: {it.isPlaced ? t("orderDetail.yes") : t("orderDetail.no")}
                        </div>
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
              <ListItemText primary={t("orderDetail.startDate")} secondary={safeDate(order.startDate)} />
            </ListItem>
            <ListItem>
              <ListItemText primary={t("orderDetail.endDate")} secondary={safeDate(order.endDate)} />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t("orderDetail.status")}
                secondary={order.displayStatus ?? order.status}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary={t("orderDetail.totalPrice")} secondary={order.rawSummary?.totalPrice ?? "-"} />
            </ListItem>
            <ListItem>
              <ListItemText primary={t("orderDetail.unpaidAmount")} secondary={order.rawSummary?.unpaidAmount ?? "-"} />
            </ListItem>
          </List>
        </Paper>
      </Stack>

      {/* Dialog Renew */}
      <Dialog open={renewOpen} onClose={() => setRenewOpen(false)}>
        <DialogTitle>{t("orderDetail.renewOrder")}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label={t("orderDetail.extendByDays")} type="number" sx={{ mt: 1 }} />
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
