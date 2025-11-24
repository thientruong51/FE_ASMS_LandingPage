import { useState } from "react";
import { Box, Stack, Typography, styled, Divider, Snackbar, Alert } from "@mui/material";
import { useTranslation } from "react-i18next";
import SummaryLeft from "./components/SummaryLeft";
import SummaryRight from "./components/SummaryRight";
import PaymentSection from "./components/PaymentSection";
import type { BookingPayload } from "./components/types";

import { buildOrderPayloadFromBooking, createOrderWithDetails } from "../../../api/order";

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
  const [paymentMethod, setPaymentMethod] = useState<string>(data.paymentMethod ?? "card");

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

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const serviceStyle: "self" | "full" | "unknown" =
    currentBooking.style === "self"
      ? "self"
      : currentBooking.style === "full"
      ? "full"
      : currentBooking.boxes && currentBooking.boxes.length > 0
      ? "full"
      : currentBooking.room
      ? "self"
      : "unknown";

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

      const bookingForOrder: BookingPayload = {
        ...currentBooking,
        depositDate: (currentBooking as any).depositDate ?? (currentBooking as any).selectedDate ?? null,
        returnDate: (currentBooking as any).returnDate ?? (currentBooking as any).endDate ?? null,
        paymentMethod,
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

      onConfirm?.(currentBooking);
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
            onPayloadChange={(payload) => {
              setCurrentBooking(payload);
            }}
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
