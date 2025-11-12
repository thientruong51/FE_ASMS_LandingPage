
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Stack,
  IconButton,
} from "@mui/material";
import TrackingTimeline from "./TrackingTimeline";
import type { Order } from "../types";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";

type Props = {
  open: boolean;
  order?: Order | null;
  onClose: () => void;
};

export default function OrderDetailModal({ open, order, onClose }: Props) {
  const { t } = useTranslation("dashboard");

  if (!order) return null;

  const items = ((order as any).items ?? [
    { id: "i1", name: "Laptop", price: 80, qty: 1, img: undefined },
    { id: "i2", name: "Watch", price: 56, qty: 2, img: undefined },
    { id: "i3", name: "Headphone", price: 94, qty: 1, img: undefined },
    { id: "i4", name: "Perfume", price: 83, qty: 1, img: undefined },
  ]) as Array<{ id?: string; name: string; price: number; qty: number; img?: string }>;

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);

  const fmtDate = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const calcDays = () => {
    try {
      const s = new Date(order.startDate);
      const e = new Date(order.endDate);
      const days = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
      return `${days} Days`;
    } catch {
      return "-";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ px: 3, py: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {order.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.kind === "managed" ? t("orderDetail.summary") + " • Kho dịch vụ" : t("orderDetail.summary") + " • Kho tự quản"}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Button variant="outlined" size="small" onClick={() => { /* renew handler */ }}>
              {t("orderDetail.renewOrder")}
            </Button>
            <Button variant="contained" size="small">
              {t("orderDetail.contactStaff")}
            </Button>
            <IconButton aria-label="close" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 3 }}>
        {/* TIMELINE */}
        <Box mb={3}>
          <Typography variant="subtitle1" fontWeight={700} mb={1}>
            {t("orderDetail.tracking")}
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <TrackingTimeline tracking={order.tracking} />
          </Paper>
        </Box>

        {/* 3 columns using flex (no Grid) */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", md: "row" },
            mb: 3,
            alignItems: "stretch",
          }}
        >
          {/* Column 1 - Order Information */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Order Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Pickup date</Typography>
                  <Typography variant="body2" fontWeight={600}>{fmtDate(order.startDate)}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Estimate drop</Typography>
                  <Typography variant="body2" fontWeight={600}>{calcDays()}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Return available time</Typography>
                  <Typography variant="body2" fontWeight={600}>In 7 Days</Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>

          {/* Column 2 - Locations */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Locations
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Pickup location</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {(order.staff && `${order.staff.name}`) ?? "—"}
                    <br />
                    456 Maple Avenue, Brooklyn, NY 11201
                    <br />
                    United States
                  </Typography>
                </Box>

                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">Dropoff location</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    Michael Johnson
                    <br />
                    789 Oak Street, Los Angeles, CA 90001
                    <br />
                    United States
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>

          {/* Column 3 - Customer Details */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Customer Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Full name</Typography>
                  <Typography variant="body2" fontWeight={600}>{order.staff?.name ?? "-"}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">E-mail</Typography>
                  <Typography variant="body2" fontWeight={600}>{order.staff?.email ?? "-"}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Phone number</Typography>
                  <Typography variant="body2" fontWeight={600}>{order.staff?.phone ?? "-"}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </Box>

        {/* Item list table */}
        <Box>
          <Typography variant="subtitle1" fontWeight={700} mb={1}>
            Item List
          </Typography>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No</TableCell>
                  <TableCell>Item Name</TableCell>
                  <TableCell align="right">Base Price</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {items.map((it, idx) => (
                  <TableRow key={it.id ?? idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        {it.img ? <Avatar src={it.img} variant="rounded" sx={{ width: 36, height: 36 }} /> : <Avatar sx={{ width: 36, height: 36 }}>{String(idx + 1)}</Avatar>}
                        <Typography variant="body2">{it.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">${it.price.toFixed(2)}</TableCell>
                    <TableCell align="center">{it.qty}</TableCell>
                    <TableCell align="right">${(it.price * it.qty).toFixed(2)}</TableCell>
                  </TableRow>
                ))}

                <TableRow>
                  <TableCell colSpan={4} align="right" sx={{ fontWeight: 700 }}>
                    ALL TOTAL
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    ${subtotal.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{t("orderDetail.cancel")}</Button>
        <Button variant="contained" onClick={onClose}>
          {t("orderDetail.send")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
