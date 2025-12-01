import React, { useEffect, useState } from "react";
import {
  Stack,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
  Chip,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { Order } from "./types";
import OrderCard from "./components/OrderCard";
import OrderDetailModal from "./components/OrderDetailModal";
import { fetchOrdersWithDetails } from "./components/api.helpers";

const FILTERS = [
  "All",
  "Pending",
  "WaitPickUp",
  "Verify",
  "Checkout",
  "PickUp",
  "Processing",
  "Stored",
  "Renting",
  "Overdue",
];

const colorForStatus = (s?: string) => {
  switch (s) {
    case "Pending":
      return "default";
    case "WaitPickUp":
      return "warning";
    case "Verify":
      return "info";
    case "Checkout":
      return "primary";
    case "PickUp":
      return "secondary";
    case "Processing":
      return "warning";
    case "Stored":
      return "success";
    case "Renting":
      return "primary";
    case "Overdue":
      return "error";
    default:
      return "default";
  }
};

const OrdersPage: React.FC = () => {
  const { t } = useTranslation("dashboard");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Order | null>(null);
  const [open, setOpen] = useState(false);

  const [filter, setFilter] = useState("All");

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const data = await fetchOrdersWithDetails(1, 20);
        if (mounted) setOrders(data);
      } catch (err: any) {
        if (mounted) setError(err?.message ?? "Failed to load orders");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = orders.filter((o) => {
    if (filter === "All") return true;
    return (o.displayStatus ?? o.status) === filter;
  });

  const handleFilterChange = (e: SelectChangeEvent<string>) => {
    setFilter(e.target.value as string);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={700}>
        {t("ordersPage.title")}
      </Typography>

      {/* Dropdown filter */}
      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="orders-filter-label">{t("ordersPage.filter") ?? "Filter"}</InputLabel>
          <Select
            labelId="orders-filter-label"
            value={filter}
            label={t("ordersPage.filter") ?? "Filter"}
            onChange={handleFilterChange}
          >
            {FILTERS.map((f) => (
              <MenuItem key={f} value={f}>
                {f}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

       
      </Box>

      {loading ? (
        <Box textAlign="center" py={6}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Stack spacing={3}>
          {filtered.map((o) => {
            const ds = o.displayStatus ?? o.status;
            return (
              <Box key={o.id}>
                <OrderCard order={o} onOpenDetail={(o) => { setSelected(o); setOpen(true); }} />
              </Box>
            );
          })}

          {filtered.length === 0 && (
            <Typography textAlign="center" color="text.secondary">
              No orders
            </Typography>
          )}
        </Stack>
      )}

      <OrderDetailModal open={open} order={selected ?? undefined} onClose={() => setOpen(false)} />
    </Stack>
  );
};

export default OrdersPage;
