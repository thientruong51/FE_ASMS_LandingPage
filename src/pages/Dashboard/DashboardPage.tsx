import  { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
 
} from "@mui/material";

import { useTranslation } from "react-i18next";

import type { Order } from "./types";
import OrderCard from "./components/OrderCard";
import OrderDetailModal from "./components/OrderDetailModal";
import { fetchOrdersWithDetails } from "./components/api.helpers";



const PROCESSING_STATUSES = [
  "pending",
  "processing",
  "wait pick up",
  "verify",
  "checkout",
  "pick up",
  "delivered",
  "waiting refund",
  "reserved",
];

const ACTIVE_STATUSES = ["renting", "stored"];

export default function DashboardPage() {

  const { t } = useTranslation("dashboard");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [open, setOpen] = useState(false);

 
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const data = await fetchOrdersWithDetails(1, 50);
        if (!mounted) return;
        setOrders(data);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message ?? t("dashboardPage.loadError"));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [t]);


  const processingOrders = useMemo(
    () =>
      orders.filter(o =>
        PROCESSING_STATUSES.includes(
          (o.status ?? "").toLowerCase()
        )
      ),
    [orders]
  );

  const activeOrders = useMemo(
    () =>
      orders.filter(o =>
        ACTIVE_STATUSES.includes(
          (o.status ?? "").toLowerCase()
        )
      ),
    [orders]
  );

  const recentOrders = useMemo(
    () =>
      [...orders]
        .filter(o => o.startDate)
        .sort(
          (a, b) =>
            new Date(b.startDate!).getTime() -
            new Date(a.startDate!).getTime()
        )
        .slice(0, 3),
    [orders]
  );

 const expiringOrders = useMemo(
  () =>
    [...orders]
      .filter(o => o.endDate && !isNaN(new Date(o.endDate).getTime()))
      .sort(
        (a, b) =>
          new Date(a.endDate!).getTime() -
          new Date(b.endDate!).getTime()
      )
      .slice(0, 3),
  [orders]
);


 
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
      {/* Loading / Error */}
      {loading && (
        <Box textAlign="center" py={6}>
          <Typography>{t("dashboardPage.loading")}</Typography>
        </Box>
      )}

      {error && (
        <Typography color="error">
          {error}
        </Typography>
      )}

      {/* KPI CARDS */}
      {!loading && !error && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2,1fr)",
              md: "repeat(3,1fr)",
            },
            gap: 2,
          }}
        >
          {/* Active Orders */}
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {t("dashboardPage.activeOrders")}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
              {activeOrders.length}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t("dashboardPage.activeOrdersDesc")}
            </Typography>
          </Paper>

          {/* Processing Orders */}
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {t("dashboardPage.ordersInProgress")}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
              {processingOrders.length}
            </Typography>
           
          </Paper>

          {/* Expiring Orders */}
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {t("dashboardPage.nextExpiry")}
            </Typography>

            {expiringOrders.length === 0 ? (
              <Typography sx={{ mt: 1 }}>—</Typography>
            ) : (
              <Stack spacing={0.75} sx={{ mt: 1 }}>
                {expiringOrders.map(o => (
                  <Box key={o.id}>
                    <Typography fontWeight={600}>
                      {o.id}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {t("dashboardPage.expiresOn")}{" "}
                      {new Date(o.endDate!).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}

           
          </Paper>
        </Box>
      )}

      {/* CONTENT */}
      {!loading && !error && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "2fr 1fr",
            },
            gap: 2,
          }}
        >
          {/* Recent Orders */}
          <Paper sx={{ p: 2.5, borderRadius: 2 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
              flexDirection={{ xs: "column", sm: "row" }}
              gap={1}
            >
              <Typography variant="h6" fontWeight={700}>
                {t("dashboardPage.recentOrders")}
              </Typography>
             
            </Box>

            <Stack spacing={2}>
              {recentOrders.map(o => (
                <Box key={o.id}>
                  <OrderCard
                    order={o}
                    onOpenDetail={handleOpen}
                  />
                </Box>
              ))}

              {recentOrders.length === 0 && (
                <Typography color="text.secondary">
                  {t("dashboardPage.noOrders")}
                </Typography>
              )}
            </Stack>
          </Paper>

       
        </Box>
      )}

      {/* MODAL */}
      <OrderDetailModal
        open={open}
        order={selectedOrder ?? undefined}
        onClose={handleClose}
      />
    </Stack>
  );
}
