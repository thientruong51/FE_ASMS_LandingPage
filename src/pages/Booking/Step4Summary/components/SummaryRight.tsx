import { Divider, Paper, Stack, Typography, styled } from "@mui/material";
import type { BookingPayload } from "./types";
import useServiceDetails from "./useServiceDetails";
import { usePricing } from "./pricingUtils";
import { useTranslation } from "react-i18next";

const RightCard = styled(Paper)(({ theme }) => ({
  width: 780,
  padding: theme.spacing(3),
  borderRadius: 10,
  boxShadow: "none",
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.action.hover}`,
  [theme.breakpoints.down("md")]: {
    width: "100%",
  },
}));

export default function SummaryRight({ data }: { data: BookingPayload }) {
  const { t } = useTranslation("booking");
  const serviceDetails = useServiceDetails(data.services);
  const pricing = usePricing(data, serviceDetails);

  const fmt = (n?: number) => {
    const langIsVi = true;
    if (n === undefined || n === null) return "-";
    if (langIsVi) return n.toLocaleString("vi-VN") + " đ";
    return n.toLocaleString("en-US") + " đ";
  };

  return (
    <RightCard>
      <Typography variant="h6" fontWeight={700} color="primary.main" mb={1}>
        {t("step4_summary.breakdownTitle")}
      </Typography>

      <Stack spacing={1} divider={<Divider sx={{ borderStyle: "dashed" }} />}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2">{t("step4_summary.baseLabel")}</Typography>
          <Typography variant="body2">{fmt(pricing.basePrice)}</Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            • {t("step4_summary.items_total_label")}:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {fmt(pricing.breakdown.itemsTotal)}
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            • {t("step4_summary.servicesLabel")}:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {fmt(pricing.breakdown.serviceExtras)}
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2">{t("step4_summary.subtotalLabel")}</Typography>
          <Typography variant="body2">{fmt(pricing.subtotal)}</Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2">
            {`${t("step4_summary.vatLabel", "VAT")} (${pricing.vatPercentage ?? 0}%)`}
          </Typography>
          <Typography variant="body2">{fmt(pricing.vatAmount)}</Typography>
        </Stack>

        <Divider />

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="subtitle1" fontWeight={700}>
            {t("step4_summary.totalLabel")}
          </Typography>
          <Typography variant="subtitle1" fontWeight={700}>
            {fmt(pricing.total)}
          </Typography>
        </Stack>

        
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" fontWeight={700}>
        {t("step4_summary.contactTitle")}
      </Typography>
      <Typography variant="body2">
        <strong>{t("summary.name")}:</strong> {data.info?.name ?? "-"}
      </Typography>
      <Typography variant="body2">
        <strong>{t("step3_info.fields.email")}:</strong> {data.info?.email ?? "-"}
      </Typography>
      <Typography variant="body2">
        <strong>{t("summary.phone")}:</strong> {data.info?.phone ?? "-"}
      </Typography>
      <Typography variant="body2">
        <strong>{t("step3_info.fields.address")}:</strong> {data.info?.address ?? "-"}
      </Typography>
      <Typography variant="body2">
        <strong>{t("step3_info.fields.note")}:</strong> {data.info?.note ?? "-"}
      </Typography>
    </RightCard>
  );
}
