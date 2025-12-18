import { Divider, Paper, Stack, Typography, styled, Box, Chip } from "@mui/material";
import type { BookingPayload } from "./types";
import useServiceDetails from "./useServiceDetails";
import { usePricing } from "./pricingUtils";
import { useTranslation } from "react-i18next";
import { translateStorageTypeName } from "../../../../utils/storageTypeNames";
import { useMemo, type JSXElementConstructor, type Key, type ReactElement, type ReactNode, type ReactPortal } from "react";

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

function inferSurchargePercentFromName(name?: string) {
  if (!name) return undefined;
  const s = name.toLowerCase();
  if (s.includes("dễ vỡ") || s.includes("fragile")) return 20;
  if (s.includes("điện tử") || s.includes("electro") || s.includes("electronics")) return 10;
  if (s.includes("lạnh") || s.includes("cold") || s.includes("refriger")) return 15;
  if (s.includes(">20kg") || s.includes("nặng") || s.includes("heavy")) return 25;
  return undefined;
}

export default function SummaryRight({ data }: { data: BookingPayload }) {
  const { t } = useTranslation("booking");
 
  const serviceDetails = useServiceDetails(data.services);
  const pricing = usePricing(data, serviceDetails);

  const fmt = (n?: number) => {
    if (n === undefined || n === null) return "-";
    return n.toLocaleString("vi-VN") + " đ";
  };
const boxPricesMap =
  pricing.effectivePricingInfo?.boxPricesMap ?? {};
  // --- ưu tiên lấy giá gói numeric & counts từ data.package nếu có ---
  const packageRawPrice: number | undefined = (data as any)?.package?.rawPrice ?? undefined;
  const packageDisplayPrice: string | undefined = (data as any)?.package?.price ?? undefined;
  const packageName: string | undefined = (data as any)?.package?.name ?? undefined;
  const packageShelves: number | undefined = (data as any)?.package?.shelves ?? undefined;
  const packageBoxes: number | undefined = (data as any)?.package?.boxes ?? undefined;
  // --- end ---
 const storageDisplayName = useMemo(() => {
  if (packageName) return packageName;

  return translateStorageTypeName(
    t,
    data.room?.name,
    (data.room as any)?.type
  );
}, [t, packageName, data.room]);
  // per-box details (if boxes available)
  const boxDetails = useMemo(() => {
    const boxes =
  (pricing as any).breakdown?.boxesList ?? [];
    const productTypeSurcharges: Record<string, number> =
      (pricing as any).effectivePricingInfo?.productTypeSurcharges ?? {};

    return boxes.map((b: any, idx: number) => {
      const qty = Number(b.quantity ?? b.qty ?? 1) || 1;
      const labelKey = String(b.label ?? b.type ?? b.name ?? "").toUpperCase();

const unit =
  Number(boxPricesMap[labelKey]) ??
  Number(b.unitPrice) ??
  0;
      const base = unit * qty;

      let pct = 0;
      const ptIds: number[] =
        Array.isArray(b.productTypeIds) && b.productTypeIds.length > 0
          ? b.productTypeIds.map((x: any) => Number(x)).filter((n: unknown) => !Number.isNaN(n))
          : [];

      if (ptIds.length > 0) {
        for (const id of ptIds) {
          const v = productTypeSurcharges[String(id)];
          if (typeof v === "number") pct = Math.max(pct, v);
        }
      }

      if (pct === 0 && Array.isArray(b.productTypes)) {
        for (const pt of b.productTypes) {
          if (pt?.surchargePercent) {
            const sp = Number(pt.surchargePercent);
            if (!Number.isNaN(sp)) pct = Math.max(pct, sp);
          }
          if (pt?.isFragile) pct = Math.max(pct, 20);
          if (pt?.isCold) pct = Math.max(pct, 15);
          if (pt?.isHeavy) pct = Math.max(pct, 25);
          const inferred = inferSurchargePercentFromName(pt?.name ?? pt?.title ?? "");
          if (inferred) pct = Math.max(pct, inferred);
        }
      }

      if (pct === 0) {
        const inferred = inferSurchargePercentFromName(b.label ?? b.name ?? b.type ?? "");
        if (inferred) pct = Math.max(pct, inferred);
        if (b.isFragile) pct = Math.max(pct, 20);
        if (b.isCold) pct = Math.max(pct, 15);
        if (b.isHeavy) pct = Math.max(pct, 25);
      }

      const surchargeAmount = Math.round((base * pct) / 100);
      const lineTotal = base + surchargeAmount;

      return {
        key: b.id ?? `box-${idx}`,
        label: b.label ?? b.name ?? `Box ${idx + 1}`,
        qty,
        unit,
        base,
        pct,
        surchargeAmount,
        lineTotal,
        productTypes: b.productTypes ?? [],
      };
    });
  }, [data, pricing]);

 
  const subtotalForDisplay = packageRawPrice !== undefined ? Number(packageRawPrice) : Number(pricing.basePrice ?? 0);
  const extrasTotal = Number((pricing as any).breakdown?.serviceExtras ?? 0);
  const shippingFee = Number((pricing as any).breakdown?.shippingFee ?? 0);
  const otherSurcharges = Number((pricing as any).breakdown?.totalSurchargesAmount ?? 0);


  const totalToDisplay = packageRawPrice !== undefined ? Number(packageRawPrice) : Number(pricing.total ?? (pricing.subtotal ?? 0));

  return (
    <RightCard>
      <Typography variant="h6" fontWeight={700} color="primary.main" mb={1}>
        {t("step4_summary.breakdownTitle")}
      </Typography>

      <Stack spacing={1} divider={<Divider sx={{ borderStyle: "dashed" }} />}>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography variant="body2">{t("step4_summary.packageLabel", "Gói")}</Typography>
            <Typography variant="subtitle1" fontWeight={700}>
  {storageDisplayName ?? t("summary.service")}
</Typography>
            {packageShelves !== undefined || packageBoxes !== undefined ? (
              <Typography variant="caption" color="text.secondary" display="block">
                {packageShelves !== undefined ? `${packageShelves} kệ` : ""}{" "}
                {packageBoxes !== undefined ? `• ${packageBoxes} thùng` : ""}
              </Typography>
            ) : null}
          </Box>

          <Typography variant="body2">
            {packageDisplayPrice ?? fmt(subtotalForDisplay)}
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary">
              • {t("step4_summary.items_total_label")}
            </Typography>

            <Typography variant="caption" color="text.secondary" display="block">
              {t("step4_summary.boxes_base", "Giá cơ bản thùng/kệ")}: {fmt((pricing as any).breakdown?.boxesPriceRaw ?? 0)}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {t("step4_summary.surcharges_total", "Tổng phụ thu loại hàng")}: {fmt(otherSurcharges)}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="body2" color="text.secondary">
              {fmt((pricing as any).breakdown?.itemsTotal ?? subtotalForDisplay)}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            • {t("step4_summary.servicesLabel")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {fmt(extrasTotal)}
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            • {t("step4_summary.shipping_fee", "Phí vận chuyển")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {fmt(shippingFee)}
          </Typography>
        </Stack>

        <Divider />

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="subtitle1" fontWeight={700}>
            {t("step4_summary.totalLabel")}
          </Typography>
          <Typography variant="subtitle1" fontWeight={700}>
            {fmt(totalToDisplay)}
          </Typography>
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Boxes detail */}
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        {t("step4_summary.boxes_detail", "Chi tiết thùng / loại hàng")}
      </Typography>

      {boxDetails.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t("step4_summary.no_boxes_detail", "Không có thùng cụ thể")}
        </Typography>
      ) : (
        <Stack spacing={1} mb={1}>
          {boxDetails.map((b: { key: Key; label: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; qty: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; unit: number | undefined; base: number | undefined; productTypes: any[]; lineTotal: number | undefined; pct: number; surchargeAmount: number | undefined; }) => (
            <Stack key={b.key as Key} direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" fontWeight={700}>
                  {b.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {fmt(b.base)}
                </Typography>
                <Box mt={0.5}>
                  {b.productTypes && b.productTypes.length > 0 &&
                    b.productTypes.map((pt: any) => (
                      <Chip
                        key={String(pt.id ?? pt.productTypeId ?? pt.name)}
                        label={pt.name ?? pt.title ?? String(pt.id ?? pt.productTypeId)}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                </Box>
              </Box>

              <Box textAlign="right">
                <Typography variant="body2">{fmt(b.lineTotal)}</Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {b.pct > 0 ? `${b.pct}%` : t("step4_summary.no_surcharge", "Không có phụ thu")}
                </Typography>
                {b.pct > 0 && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {t("step4_summary.surcharge_amount", "Phụ thu")}: {fmt(b.surchargeAmount)}
                  </Typography>
                )}
              </Box>
            </Stack>
          ))}
        </Stack>
      )}

      <Divider sx={{ my: 1 }} />

      {/* Shipping detail */}
      <Typography variant="subtitle2" fontWeight={700}>
        {t("step4_summary.shipping_detail", "Chi tiết vận chuyển")}
      </Typography>

      <Stack spacing={1} mt={1} mb={2}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2">{t("step4_summary.box_count", "Số thùng")}</Typography>
          <Typography variant="body2">{packageBoxes ?? (pricing as any).breakdown?.boxCount ?? (pricing as any).boxCount ?? 0}</Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2">{t("step4_summary.distance", "Khoảng cách (km)")}</Typography>
          <Typography variant="body2">{((pricing as any).shipping?.distanceInKm ?? (data as any).distanceInKm) ?? "-"}</Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2">{t("step4_summary.shipping_fee", "Phí vận chuyển")}</Typography>
          <Typography variant="body2">{fmt(shippingFee)}</Typography>
        </Stack>
      </Stack>

      <Divider sx={{ my: 1 }} />
    </RightCard>
  );
}
