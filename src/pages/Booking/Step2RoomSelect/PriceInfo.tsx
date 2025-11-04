import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Stack,
  Chip,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export default function PriceInfo({ hasAC }: { hasAC: boolean }) {
  const { t} = useTranslation("storageSize");

  const rooms = hasAC
    ? [
        {
          key: "small",
          type: t("price.rooms.smallName"),
          area: "5.94 m²",
          base: "399.000 đ/m²",
          discount: "0%",
          priceMonth: "2.400.000 đ",
          priceWeek: "720.000 đ",
        },
        {
          key: "medium",
          type: t("price.rooms.mediumName"),
          area: "10.56 m²",
          base: "399.000 đ/m²",
          discount: "2%",
          priceMonth: "4.100.000 đ",
          priceWeek: "1.230.000 đ",
        },
        {
          key: "large",
          type: t("price.rooms.largeName"),
          area: "15.36 m²",
          base: "399.000 đ/m²",
          discount: "7%",
          priceMonth: "5.700.000 đ",
          priceWeek: "1.710.000 đ",
        },
      ]
    : [
        {
          key: "small",
          type: t("price.rooms.smallName"),
          area: "5.94 m²",
          base: "324.000 đ/m²",
          discount: "0%",
          priceMonth: "1.900.000 đ",
          priceWeek: "570.000 đ",
        },
        {
          key: "medium",
          type: t("price.rooms.mediumName"),
          area: "10.56 m²",
          base: "312.000 đ/m²",
          discount: "2%",
          priceMonth: "3.200.000 đ",
          priceWeek: "960.000 đ",
        },
        {
          key: "large",
          type: t("price.rooms.largeName"),
          area: "15.36 m²",
          base: "300.000 đ/m²",
          discount: "7%",
          priceMonth: "4.300.000 đ",
          priceWeek: "1.290.000 đ",
        },
      ];

  return (
    <Box sx={{ width: "100%", mt: 6 }}>
      {/* ===== HEADER ===== */}
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Typography variant="h5" fontWeight={700} color="primary.main">
          {hasAC
            ? t("price.acTitle")
            : t("price.noAcTitle")}
        </Typography>
        <Chip
          label={hasAC ? t("price.withAc") : t("price.noAc")}
          color={hasAC ? "primary" : "default"}
          sx={{
            bgcolor: hasAC ? "#3CBD96" : "#E0E0E0",
            color: hasAC ? "#fff" : "#555",
            fontWeight: 600,
          }}
        />
      </Stack>

      {/* ===== TABLE ===== */}
      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#E9F4F3" }}>
              <TableCell sx={{ fontWeight: 700 }}>{t("price.colRoom")}</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                {t("price.colArea")}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                {t("price.colBase")}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                {t("price.colDiscount")}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                {t("price.colMonth")}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                {t("price.colWeek")}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rooms.map((r) => (
              <TableRow
                key={r.key}
                sx={{
                  "&:nth-of-type(odd)": { bgcolor: "#fff" },
                  "&:nth-of-type(even)": { bgcolor: "#F8FCFA" },
                  transition: "background 0.2s ease",
                  "&:hover": { bgcolor: "#f1f9f7" },
                }}
              >
                <TableCell>{r.type}</TableCell>
                <TableCell align="center">{r.area}</TableCell>
                <TableCell align="center">{r.base}</TableCell>
                <TableCell align="center">{r.discount}</TableCell>
                <TableCell
                  align="center"
                  sx={{ color: "primary.main", fontWeight: 600 }}
                >
                  {r.priceMonth}
                </TableCell>
                <TableCell align="center" sx={{ color: "text.secondary" }}>
                  {r.priceWeek}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
