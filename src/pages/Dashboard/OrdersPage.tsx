import React, { useEffect, useState } from "react";
import {
  Stack,
  Typography,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
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
  "ExpiredStorage",
  "Retrieved",
  "Delivered",
  "Completed",
] as const;

const OrdersPage: React.FC = () => {
  const { t } = useTranslation("dashboard");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Order | null>(null);
  const [open, setOpen] = useState(false);

  const [filter, setFilter] = useState<string>("All");

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      try {
        const data = await fetchOrdersWithDetails(1, 20);
        if (mounted) {
          setOrders(data);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message ?? t("ordersPage.loadError"));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    loadOrders();

    const intervalId = setInterval(() => {
      if (!open) {
        loadOrders();
      }
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [t, open]);


  const filtered = orders.filter((o) => {
    if (filter === "All") return true;
    return (o.displayStatus ?? o.status) === filter;
  });

  const handleFilterChange = (e: SelectChangeEvent<string>) => {
    setFilter(e.target.value as string);
  };

  const keyOf = (o: any) => (o?.orderCode ?? o?.orderId ?? o?.id ?? null);
  const getOrderKey = (o: any) => keyOf(o) ?? JSON.stringify(o);

  const handleOpenDetailFromCard = (freshOrder?: any, fallbackOrder?: Order) => {
    const orderToUse = freshOrder ?? fallbackOrder;
    if (!orderToUse) {
      setOpen(true);
      return;
    }

    setOrders((prev) => {
      try {
        const replaced = prev.map((p) =>
          keyOf(p) === keyOf(orderToUse) ? { ...p, ...orderToUse } : p
        );
        const found = replaced.some((p) => keyOf(p) === keyOf(orderToUse));
        return found ? replaced : [orderToUse, ...prev];
      } catch {
        return prev;
      }
    });

    setSelected(orderToUse);
    setOpen(true);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={700}>
        {t("ordersPage.title")}
      </Typography>

      {/* Dropdown filter */}
      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="orders-filter-label">{t("ordersPage.filter")}</InputLabel>
          <Select
            labelId="orders-filter-label"
            value={filter}
            label={t("ordersPage.filter")}
            onChange={handleFilterChange}
          >
            {FILTERS.map((f) => (
              <MenuItem key={f} value={f}>
                {f === "All" ? t("ordersPage.all") : t(`status.${f}`, f)}
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
          {filtered.map((o) => (
            <Box key={getOrderKey(o)}>
              <OrderCard
                order={o}
                onOpenDetail={(freshOrder) => handleOpenDetailFromCard(freshOrder ?? undefined, o)}
              />
            </Box>
          ))}

          {filtered.length === 0 && (
            <Typography textAlign="center" color="text.secondary">
              {t("ordersPage.noOrders")}
            </Typography>
          )}
        </Stack>
      )}

      <OrderDetailModal
        key={getOrderKey(selected ?? {})}
        open={open}
        order={selected ?? undefined}
        onClose={() => setOpen(false)}
      />
    </Stack>
  );
};

export default OrdersPage;
