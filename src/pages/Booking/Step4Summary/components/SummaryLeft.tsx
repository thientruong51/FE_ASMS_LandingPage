import { useMemo, useEffect } from "react";
import { Box, Avatar, Divider, Paper, Stack, Typography, styled, Chip } from "@mui/material";
import type { BookingPayload } from "./types";
import useServiceDetails from "./useServiceDetails";
import { usePricing } from "./pricingUtils"; 
import { useTranslation } from "react-i18next";

const TwoColWrap = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  width: "100%",
  maxWidth: 980,
  flexDirection: "row",
  alignItems: "flex-start",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
  },
}));

const LeftCard = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
  borderRadius: 10,
  boxShadow: "none",
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.action.hover}`,
}));

export default function SummaryLeft({
  data,
  onPayloadChange,
}: {
  data: BookingPayload;
  onPayloadChange?: (payload: BookingPayload) => void;
}) {
  const { t } = useTranslation("booking");
  const serviceDetails = useServiceDetails(data.services);

  const pricing = usePricing(data, serviceDetails);

  const serviceStyle: "self" | "full" =
    (data.style as any) === "full"
      ? "full"
      : (data.style as any) === "self"
      ? "self"
      : Array.isArray((data as any).boxes) && (data as any).boxes.length > 0
      ? "full"
      : data.room
      ? "self"
      : "self";

  const boxes: any[] = Array.isArray((data as any).boxes)
    ? (data as any).boxes
    : (data as any).box
    ? [(data as any).box]
    : [];

  const itemsArray = useMemo<any[]>(() => {
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.customItems)) return data.customItems as any[];
    if (Array.isArray((data.customItems as any)?.items)) return (data.customItems as any).items as any[];
    return [];
  }, [data.items, data.customItems]);

  const inferredCounts = useMemo(() => {
    if (data.counts && (data.counts.shelves !== undefined || data.counts.boxes !== undefined || data.counts.byType)) {
      return data.counts;
    }

    const arr = itemsArray;
    if (!arr || arr.length === 0) return null;

    const byType: Record<string, number> = {};
    let shelves = 0;
    let boxes = 0;

    for (const it of arr) {
      const ttype = (it?.type ?? it?.label ?? it?.name ?? "").toString();
      const key = ttype || "unknown";
      byType[key] = (byType[key] ?? 0) + 1;
      if (/shelf/i.test(ttype)) shelves += 1;
      if (/^[ABCD]$/i.test(ttype) || /box|container|crate/i.test(ttype)) boxes += 1;
    }

    return {
      shelves,
      boxes,
      byType,
      totalShelves: (data.counts && (data.counts.totalShelves ?? undefined)) || undefined,
      pricingInfo: (data.counts as any)?.pricingInfo ?? undefined,
    } as BookingPayload["counts"];
  }, [data.counts, itemsArray]);

  const boxesByType = useMemo(() => {
    const byType = inferredCounts?.byType ?? {};
    const entries = Object.entries(byType);
    const boxEntries = entries.filter(([k]) => {
      if (!k) return false;
      if (/^[ABCD]$/i.test(k)) return true;
      if (/box|container|crate/i.test(k)) return true;
      return false;
    });
    boxEntries.sort((a, b) => {
      const ka = a[0].toUpperCase();
      const kb = b[0].toUpperCase();
      if (/^[ABCD]$/.test(ka) && /^[ABCD]$/.test(kb)) return ka.localeCompare(kb);
      if (/^[ABCD]$/.test(ka)) return -1;
      if (/^[ABCD]$/.test(kb)) return 1;
      return ka.localeCompare(kb);
    });
    return boxEntries;
  }, [inferredCounts]);

  const fmtCurrency = (n?: number) => {
    if (n == null) return "-";
    return Number(n).toLocaleString("vi-VN") + " đ";
  };

  const productTypeMap = useMemo(() => {
    const map = new Map<number, { id: number; name: string }>();
    const payload = (data as any).boxPayload ?? (data as any).productPayload ?? null;
    if (payload) {
      if (Array.isArray(payload.productTypes)) {
        for (const pt of payload.productTypes) {
          const id = pt?.productTypeId ?? pt?.id ?? null;
          if (id != null) map.set(Number(id), { id: Number(id), name: pt.name ?? String(id) });
        }
      }
      if (typeof payload.productTypesMap === "object" && payload.productTypesMap !== null) {
        for (const [k, v] of Object.entries(payload.productTypesMap)) {
          const id = Number(k);
          if (!Number.isNaN(id)) map.set(id, { id, name: (v as any)?.name ?? String(k) });
        }
      }
    }
    if (Array.isArray((data as any).productTypes)) {
      for (const pt of (data as any).productTypes) {
        const id = pt?.productTypeId ?? pt?.id ?? null;
        if (id != null) map.set(Number(id), { id: Number(id), name: pt.name ?? String(id) });
      }
    }
    return map;
  }, [data.boxPayload, data.productTypes]);

  function computeStartEnd() {
    const rt = (data as any).rentalType as "week" | "month" | "custom" | undefined;
    const weeks = Number((data as any).rentalWeeks ?? 0);
    const months = Number((data as any).rentalMonths ?? 0);
    const daysCustom = Number((data as any).rentalDays ?? 0);

    const startRaw = (data as any).selectedDate;
    if (!startRaw) return { valid: false, startVN: "-", endVN: "-", startRaw: null, endRaw: null };

    const start = new Date(startRaw);
    if (isNaN(start.getTime())) return { valid: false, startVN: "-", endVN: "-", startRaw: null, endRaw: null };

    let end = new Date(start);

    try {
      if (rt === "week") {
        const w = weeks > 0 ? weeks : 1;
        end.setDate(end.getDate() + w * 7);
        end.setDate(end.getDate() - 1);
      } else if (rt === "month") {
        const m = months > 0 ? months : 1;
        end.setMonth(end.getMonth() + m);
        end.setDate(end.getDate() - 1);
      } else if (rt === "custom") {
        if (daysCustom > 0) {
          end.setDate(end.getDate() + daysCustom);
          end.setDate(end.getDate() - 1);
        } else {
          const m = months > 0 ? months : 1;
          end.setMonth(end.getMonth() + m);
          end.setDate(end.getDate() - 1);
        }
      } else {
        end = new Date(start);
      }
    } catch (err) {
      return { valid: false, startVN: "-", endVN: "-", startRaw: null, endRaw: null };
    }

    const viFmt = new Intl.DateTimeFormat("vi-VN");
    const enFmt = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" });

    const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
    const endRaw = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;

    return {
      valid: true,
      startRaw,
      startVN: viFmt.format(start),
      startEN: enFmt.format(start),
      endRaw,
      endVN: viFmt.format(end),
      endEN: enFmt.format(end),
    };
  }

  const se = computeStartEnd();

  function normalizeBoxProductTypes(b: any) {
    const raw = Array.isArray(b?.productTypes) ? b.productTypes : [];
    const normalized: { id: number; name: string }[] = raw
      .map((r: any) => {
        if (r == null) return null;
        if (typeof r === "number" || typeof r === "string") {
          const id = Number(r);
          if (!Number.isNaN(id)) {
            const found = productTypeMap.get(id);
            return found ?? { id, name: `#${id}` };
          }
          return null;
        }
        const id = r.productTypeId ?? r.id ?? r.typeId ?? null;
        const name = r.name ?? r.title ?? r.description ?? (id != null ? String(id) : null);
        if (id == null) return name ? { id: Math.random(), name } : null;
        return { id: Number(id), name };
      })
      .filter(Boolean) as { id: number; name: string }[];
    return normalized;
  }

  // ---- guarded effect: only call parent when we actually would change data.depositDate/returnDate ----
  useEffect(() => {
    if (typeof onPayloadChange !== "function") return;

    const depositDateExisting = (data as any).depositDate ?? (data as any).selectedDate ?? null;
    const returnDateExisting = (data as any).returnDate ?? (data as any).endDate ?? null;

    const depositDateToSet = depositDateExisting ?? se.startRaw ?? null;
    const returnDateToSet = returnDateExisting ?? se.endRaw ?? null;

    // Current values (explicitly read primitives)
    const currentDeposit = (data as any).depositDate ?? null;
    const currentReturn = (data as any).returnDate ?? null;

    const depositChanged = (depositDateToSet ?? null) !== (currentDeposit ?? null);
    const returnChanged = (returnDateToSet ?? null) !== (currentReturn ?? null);

    if (!depositChanged && !returnChanged) return;

    const patched: any = { ...data };
    if (depositDateToSet != null) patched.depositDate = depositDateToSet;
    if (returnDateToSet != null) patched.returnDate = returnDateToSet;

    onPayloadChange(patched);
    // dependency array uses primitive fields to avoid running due to object identity changes
  }, [
    onPayloadChange,
    (data as any).depositDate,
    (data as any).returnDate,
    (data as any).selectedDate,
    se.startRaw,
    se.endRaw,
  ]);

  return (
    <TwoColWrap>
      <LeftCard>
        <Typography variant="h6" fontWeight={700} color="primary.main" mb={1}>
          {t("step4_summary.packageTitle")}
        </Typography>

        <Stack spacing={2}>
          {serviceStyle === "self" && (
            <Stack direction="row" spacing={2} alignItems="center">
              {data.room?.image ? (
                <Avatar variant="rounded" src={data.room.image} sx={{ width: 72, height: 72 }} />
              ) : null}
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {data.room?.name ?? t("summary.service")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {data.room?.width && data.room?.depth ? `${data.room.width} x ${data.room.depth} m` : ""}
                </Typography>
              </Box>
            </Stack>
          )}

          <Divider />

          {serviceStyle === "self" && (
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>{t("summary.room")}:</strong> {data.room?.name ?? t("step4_summary.noRoom", "")}
              </Typography>

              <Typography variant="body2">
                <strong>{t("step4_summary.extraServicesLabel")}:</strong>{" "}
                {(serviceDetails ?? []).map((s) => `${s.name} (${fmtCurrency(s.price)})`).join(", ")}
              </Typography>

              <Typography variant="body2">
                <strong>{t("step4_summary.acLabel")}:</strong>{" "}
                {data.room?.hasAC ? t("step2_room.toggle.ac") : t("step2_room.toggle.noAC")}
              </Typography>

              <Typography variant="body2">
                <strong>{t("startDate.title")}:</strong> {se.startVN}
              </Typography>
              <Typography variant="body2">
                <strong>{t("endDate.title")}:</strong> {se.endVN}
              </Typography>

              {inferredCounts && (
                <>
                  <Divider />
                  <Typography variant="subtitle2" fontWeight={700}>
                    {t("step4_summary.countsTitle", "Số lượng thuê")}
                  </Typography>

                  <Typography variant="body2">
                    <strong>{t("step4_summary.shelvesLabel", "Kệ")}:</strong> {inferredCounts.shelves ?? 0}
                  </Typography>

                  {boxesByType && boxesByType.length > 0 ? (
                    <Box>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        <strong>{t("step4_summary.boxesLabel", "Thùng")}:</strong>
                      </Typography>
                      <Box mt={1}>
                        {boxesByType.map(([typeKey, count]) => (
                          <Typography key={typeKey} variant="body2">
                            • {typeKey}: {count}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="body2">
                      <strong>{t("step4_summary.boxesLabel", "Thùng")}:</strong> {inferredCounts.boxes ?? 0}
                    </Typography>
                  )}

                  <Divider sx={{ mt: 1 }} />
                  <Typography variant="subtitle2" fontWeight={700} mt={1}>
                    {t("step4_summary.breakdownByType", "Chi tiết theo loại")}
                  </Typography>
                  <Box mt={1}>
                    <Typography variant="body2">
                      • {t("step4_summary.pay_shelf_label", "Giá kệ")}: {fmtCurrency(pricing.effectivePricingInfo?.perShelfPrice ?? 0)}
                    </Typography>

                    {pricing.effectivePricingInfo && pricing.effectivePricingInfo.boxPricesMap && Object.keys(pricing.effectivePricingInfo.boxPricesMap).length > 0 && (
                      <Box mt={0.5}>
                        {Object.entries(pricing.effectivePricingInfo.boxPricesMap).map(([k, v]) => (
                          <Typography key={k} variant="body2">
                            • {t(`boxes.${k}.label`) ?? k}: {fmtCurrency(Number(v))}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </Stack>
          )}

          {serviceStyle === "full" && (
            <Stack spacing={2}>
              {boxes.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t("step4_summary.noBoxes", "Không có hộp đã chọn")}
                </Typography>
              ) : (
                boxes.map((b, i) => {
                  const normalized = normalizeBoxProductTypes(b);
                  const quantity = b.quantity ?? b.qty ?? 1;
                  const label = b.label ?? b.name ?? t("summary.box", "Loại thùng");
                  const image = b.imageUrl ?? b.image ?? undefined;
                  const unitPrice = b.price ?? b.unitPrice ?? 0;
                  const totalPrice = (unitPrice ?? 0) * (quantity ?? 1);

                  return (
                    <Box
                      key={b.id ?? `box-${i}`}
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                        p: 1,
                        borderRadius: 1,
                        bgcolor: "background.paper",
                      }}
                    >
                      {image ? <Avatar variant="rounded" src={image} sx={{ width: 64, height: 64 }} /> : null}

                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {label}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {t("quantityLabel", "Số lượng")}: {quantity}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {fmtCurrency(unitPrice)} {t("perMonth", " / tháng")}
                        </Typography>

                        {normalized.length > 0 ? (
                          <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
                            {normalized.map((pt) => (
                              <Chip key={`${b.id ?? i}-${pt.id}`} label={`${pt.name}${quantity ? ` ×${quantity}` : ""}`} size="small" />
                            ))}
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                            {t("step4_summary.items_inferred_other", "Chưa chọn loại hàng")}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ textAlign: "right", minWidth: 120 }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {fmtCurrency(totalPrice)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {t("perMonth", "tháng")}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })
              )}

              {(serviceDetails ?? []).length > 0 && (
                <Typography variant="body2">
                  <strong>{t("step4_summary.extraServicesLabel")}:</strong>{" "}
                  {(serviceDetails ?? []).map((s) => `${s.name} (${fmtCurrency(s.price)})`).join(", ")}
                </Typography>
              )}
              <Typography variant="body2">
                <strong>{t("startDate.title")}:</strong> {se.startVN}
              </Typography>
              <Typography variant="body2">
                <strong>{t("endDate.title")}:</strong> {se.endVN}
              </Typography>
            </Stack>
          )}

          {/* ===== Contact block moved here (from SummaryRight) ===== */}
          <Divider sx={{ mt: 2 }} />
          <Stack spacing={0.4} mt={1}>
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
</Stack>
          {/* ====================================================== */}
        </Stack>
      </LeftCard>
    </TwoColWrap>
  );
}
