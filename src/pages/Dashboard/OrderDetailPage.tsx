// src/pages/Dashboard/OrderDetailPage.tsx
import React from "react";
import { useParams } from "react-router-dom";
import { Stack, Paper, Typography, Button, Box, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { MOCK_ORDERS } from "./mockOrders";
import TrackingTimeline from "./components/TrackingTimeline";

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation("dashboard");
  const order = MOCK_ORDERS.find((o) => o.id === id);
  const [openRenew, setOpenRenew] = React.useState(false);
  const [openContact, setOpenContact] = React.useState(false);

  if (!order) return <Typography>Order not found</Typography>;

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
                <ListItemText primary={t("orderDetail.warehouseStaff")} secondary={`${order.staff.name} • ${order.staff.phone ?? "-"}`} />
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
