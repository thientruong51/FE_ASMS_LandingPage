import React from "react";
import {
  Paper,
  Box,
  Typography,
  Stack,
  Avatar,
  Link,
  Button,
  Divider,
} from "@mui/material";
import type { Order, Item } from "../types";

const statusColor = (s: string) => {
  switch (s) {
    case "delivered":
      return { bg: "#E6F8EF", color: "#0E8A5F", label: "Delivered" };
    case "in_warehouse":
    case "picked":
    case "pickup_scheduled":
      return { bg: "#E8F8F0", color: "#0E8A5F", label: "In Warehouse" };
    case "out_for_delivery":
      return { bg: "#FFF8E6", color: "#C28700", label: "Out for Delivery" };
    default:
      return { bg: "#F3F4F6", color: "#6B7280", label: s };
  }
};

const formatMoney = (n?: number) => {
  if (n == null) return "-";
  return `$${n.toFixed(2)}`;
};

interface OrderCardProps {
  order: Order;
  onOpenDetail?: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onOpenDetail }) => {
  const { items } = order;

  // ✅ Tính tổng tiền từ items
  const total = items.reduce(
    (sum: number, it: Item) => sum + (it.price ?? 0) * (it.qty ?? 1),
    0
  );

  const chip = statusColor(order.status);

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        boxShadow: 1,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "flex-start",
          gap: 2.5,
        }}
      >
        {/* LEFT COLUMN */}
        <Box
          sx={{
            flex: { xs: "0 0 auto", md: "0 0 42%" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minWidth: 0,
            pr: { md: 2 },
          }}
        >
          {/* Header info */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: chip.color,
                }}
              />
              <Typography variant="caption" sx={{ color: chip.color, fontWeight: 600 }}>
                {chip.label}
              </Typography>
            </Box>

            <Typography variant="subtitle2" fontWeight={700}>
              Order Number
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.3 }}>
              #{order.id}
            </Typography>

            <Box display="flex" gap={3} mt={1.2} flexWrap="wrap">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Order Date
                </Typography>
                <Typography variant="body2">
                  {new Date(order.startDate).toLocaleDateString()}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Delivery Date
                </Typography>
                <Typography variant="body2">
                  {new Date(order.endDate).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" gap={3} mt={1.2} flexWrap="wrap">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Ship To
                </Typography>
                <Typography variant="body2">
                  {order.staff?.name ?? "Customer"} — USA
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Payment Method
                </Typography>
                <Typography variant="body2">COD</Typography>
              </Box>
            </Box>
          </Box>

          {/* Footer (Total + View Details) */}
          <Box mt={2}>
            <Divider sx={{ my: 1.2 }} />
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Amount :
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {formatMoney(total)}
                </Typography>
              </Box>

              <Button
                variant="outlined"
                size="small"
                onClick={() => onOpenDetail?.(order)}
              >
                View Details
              </Button>
            </Box>
          </Box>
        </Box>

        {/* RIGHT COLUMN (items list) */}
        <Box
          sx={{
            flex: { xs: "0 0 auto", md: "0 0 58%" },
            borderLeft: { xs: "none", md: "1px solid" },
            borderColor: { md: "divider" },
            pl: { md: 2.5 },
            width: "100%",
          }}
        >
          <Stack spacing={1.5}>
            {items.map((it, idx) => (
              <Box
                key={it.id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  pb: idx < items.length - 1 ? 1.5 : 0,
                  borderBottom:
                    idx < items.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    variant="rounded"
                    src={it.img}
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: 2,
                      bgcolor: "#F5F5F5",
                    }}
                  >
                    {!it.img && String(idx + 1)}
                  </Avatar>

                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {it.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Qty : {it.qty}
                    </Typography>
                    {it.size && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Size : {it.size}
                      </Typography>
                    )}
                    <Link
                      component="button"
                      underline="hover"
                      sx={{
                        mt: 0.4,
                        display: "inline-block",
                        fontSize: 13,
                        color: "primary.main",
                      }}
                    >
                      Buy it again
                    </Link>
                  </Box>
                </Box>

                <Typography variant="subtitle2" fontWeight={700}>
                  {formatMoney(it.price)}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
};

export default OrderCard;
