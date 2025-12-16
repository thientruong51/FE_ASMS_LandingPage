// Step4Summary.tsx
import { useState, useCallback, useMemo } from "react";
import { Box, Stack, Typography, styled, Divider, Snackbar, Alert } from "@mui/material";
import { useTranslation } from "react-i18next";
import SummaryLeft from "./components/SummaryLeft";
import SummaryRight from "./components/SummaryRight";
import PaymentSection from "./components/PaymentSection";
import type { BookingPayload } from "./components/types";

import { buildOrderPayloadFromBooking, createOrderWithDetails } from "../../../api/order";

import useServiceDetails from "./components/useServiceDetails";
import { usePricing } from "./components/pricingUtils";

const TwoColWrap = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  width: "100%",
  maxWidth: 980,
  alignItems: "flex-start",
  flexDirection: "row",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
  },
}));

export default function Step4Summary({
  data,
  onBack,
  onConfirm,
}: {
  data: BookingPayload;
  onBack: () => void;
  onConfirm: (payload?: BookingPayload) => void;
}) {
  const { t } = useTranslation("booking");

  const [agree, setAgree] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>(() => data.paymentMethod ?? "card");

  const [currentBooking, setCurrentBooking] = useState<BookingPayload>(data);
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // stable callback for children -> avoids changing function identity every render
  const handlePayloadChange = useCallback((payload: BookingPayload) => {
    setCurrentBooking((prev) => {
      // cheap identity guard: if same reference, avoid update
      if (prev === payload) return prev;
      return payload;
    });
  }, []);

  const serviceStyle: "self" | "full" | "unknown" = useMemo(
    () =>
      currentBooking.style === "self"
        ? "self"
        : currentBooking.style === "full"
        ? "full"
        : currentBooking.boxes && currentBooking.boxes.length > 0
        ? "full"
        : currentBooking.room
        ? "self"
        : "unknown",
    [currentBooking]
  );

  // --- NEW: compute pricing for currentBooking (so we can attach to payload/order) ---
  const serviceDetails = useServiceDetails(currentBooking.services);
  const computedPricing = usePricing(currentBooking, serviceDetails);

  async function handleConfirm() {
    if (!agree) {
      setSnackbar({
        open: true,
        message: t("step4_summary.mustAgree", "Bạn cần đồng ý điều khoản để tiếp tục."),
        severity: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const mode: "self" | "full" | undefined =
        serviceStyle === "self" ? "self" : serviceStyle === "full" ? "full" : undefined;

      const chosenContainerType =
        mode === "full" ? currentBooking.boxes?.[0]?.label ?? null : null;

      const options = {
        mode,
        buildingHasAC: Boolean(currentBooking.room?.hasAC),
        chosenContainerType,
        chosenStorageTypeId: currentBooking.storageTypeId ?? null,
      };

      const extras = {
        paymentMethod,
        status: currentBooking.status,
        paymentStatus: currentBooking.paymentStatus,
      };

      // --- build boxesForOrder: ensure oversize items include length/width/height (meters) ---
      const boxesForOrder = (currentBooking.boxes ?? []).map((b: any) => {
        const isOversize = Boolean(b.isOversize === true || String(b.id ?? "").startsWith("oversize-"));

        // If oversize, prefer flat meter fields; fallback convert dims (cm -> m) if present.
        let lengthM: number | undefined = undefined;
        let widthM: number | undefined = undefined;
        let heightM: number | undefined = undefined;

        if (isOversize) {
          if (typeof b.length === "number") lengthM = b.length;
          if (typeof b.width === "number") widthM = b.width;
          if (typeof b.height === "number") heightM = b.height;

          // fallback using dims (assumed cm): convert to meters
          if ((lengthM === undefined || widthM === undefined || heightM === undefined) && b.dims) {
            const dims = b.dims;
            if (typeof dims.length === "number" && lengthM === undefined) lengthM = dims.length / 100;
            if (typeof dims.width === "number" && widthM === undefined) widthM = dims.width / 100;
            if (typeof dims.height === "number" && heightM === undefined) heightM = dims.height / 100;
          }

          // OPTIONAL: enforce presence of all three fields and throw if missing
          // if ([lengthM, widthM, heightM].some((v) => typeof v !== "number")) {
          //   throw new Error("Oversize item missing length/width/height (meters).");
          // }
        }

        const copy: any = { ...b };

        if (isOversize) {
          if (typeof lengthM === "number") copy.length = Number(lengthM);
          if (typeof widthM === "number") copy.width = Number(widthM);
          if (typeof heightM === "number") copy.height = Number(heightM);
          copy.isOversize = true;
        } else {
          // remove flat fields from normal boxes if present
          delete copy.length;
          delete copy.width;
          delete copy.height;
          delete copy.isOversize;
        }

        return copy;
      });

      // Attach computed pricing into bookingForOrder and ensure boxes replaced
      const bookingForOrder: BookingPayload = {
        ...currentBooking,
        boxes: boxesForOrder,
        depositDate: (currentBooking as any).depositDate ?? (currentBooking as any).selectedDate ?? null,
        returnDate: (currentBooking as any).returnDate ?? (currentBooking as any).endDate ?? null,
        paymentMethod,
        style: mode ?? currentBooking.style,
        // IMPORTANT: do not pass containerCode — set it explicitly to null
        containerCode: null as any,
        // Attach price breakdown so order builder/ backend receives exact numbers user saw
        pricing: {
          basePrice: Number(computedPricing.basePrice ?? 0),
          subtotal: Number(computedPricing.subtotal ?? 0),
          total: Number(computedPricing.total ?? computedPricing.subtotal ?? 0),
        },
      };

      const orderPayload = await buildOrderPayloadFromBooking(bookingForOrder, options, extras);

      console.log("DEBUG: orderPayload ->", JSON.stringify(orderPayload, null, 2));

      const res = await createOrderWithDetails(orderPayload);
      console.log("DEBUG: createOrderWithDetails response ->", res);

      setSnackbar({
        open: true,
        message: t("step4_summary.order_created", "Tạo đơn hàng thành công"),
        severity: "success",
      });

      // pass bookingForOrder (contains pricing and normalized boxes) back to parent so it can save
      onConfirm?.(bookingForOrder);
    } catch (err: any) {
      console.error("Order error:", err);
      const msg = err?.response?.data?.message ?? err?.message ?? String(err);

      setSnackbar({
        open: true,
        message:
          t("step4_summary.order_create_failed", {
            msg,
            defaultValue: "Tạo đơn hàng thất bại",
          }) + ": " + msg,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Stack spacing={3} alignItems="center" sx={{ width: "100%" }}>
        <Typography variant="h5" fontWeight={700} color="primary.main" textAlign="center">
          {t("step4_summary.title")}
        </Typography>

        {t("step4_summary.desc") && (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {t("step4_summary.desc")}
          </Typography>
        )}

        {serviceStyle === "unknown" && (
          <Box sx={{ width: "100%", maxWidth: 980 }}>
            <Typography variant="body2" color="text.secondary">
              {t("step4_summary.noRoom", "Không có thông tin phòng")}
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Box>
        )}

        <TwoColWrap>
          <SummaryLeft
            data={currentBooking}
            onPayloadChange={handlePayloadChange}
          />
          <SummaryRight data={currentBooking} />
        </TwoColWrap>

        <PaymentSection
          data={currentBooking}
          agree={agree}
          setAgree={setAgree}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          onBack={onBack}
          onConfirm={handleConfirm}
          loading={loading}
        />
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
