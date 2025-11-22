import { useState } from "react";
import { Box, Stack, Typography, styled, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";
import SummaryLeft from "./components/SummaryLeft";
import SummaryRight from "./components/SummaryRight";
import PaymentSection from "./components/PaymentSection";
import type { BookingPayload } from "./components/types";

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


  const serviceStyle: "self" | "full" | "unknown" =
    (data.style as any) === "self" ? "self" : (data.style as any) === "full" ? "full" : (data.boxes && (data.boxes as any).length > 0) ? "full" : data.room ? "self" : "unknown";






  return (
    <Stack spacing={3} alignItems="center" sx={{ width: "100%" }}>
      <Typography variant="h5" fontWeight={700} color="primary.main" textAlign="center">
        {t("step4_summary.title")}
      </Typography>

      {t("step4_summary.desc") && (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {t("step4_summary.desc")}
        </Typography>
      )}

     

      

      {/* Unknown service: show generic info */}
      {serviceStyle === "unknown" && (
        <Box sx={{ width: "100%", maxWidth: 980 }}>
          <Typography variant="body2" color="text.secondary">
            {t("step4_summary.noRoom", "Không có thông tin phòng")}
          </Typography>
          <Divider sx={{ my: 2 }} />
        </Box>
      )}

      {/* left + right summary columns (shared) */}
      <TwoColWrap>
        <SummaryLeft data={data} />
        <SummaryRight data={data} />
      </TwoColWrap>


      <PaymentSection
        data={data}
        agree={agree}
        setAgree={setAgree}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onBack={onBack}
        onConfirm={() => onConfirm({ ...data, paymentMethod })}
      />
    </Stack>
  );
}
