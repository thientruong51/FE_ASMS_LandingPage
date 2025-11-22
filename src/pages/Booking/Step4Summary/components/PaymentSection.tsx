import {
  Box,
  Paper,
  Stack,
  Typography,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  styled,
  Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { BookingPayload } from "./types";

const PaymentWrapper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  borderRadius: 10,
  border: `1px solid ${theme.palette.action.hover}`,
  background: theme.palette.background.paper,
}));

const PaymentOption = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.25),
  borderRadius: 8,
  border: `1px solid ${theme.palette.action.hover}`,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
}));

export default function PaymentSection({
  agree,
  setAgree,
  paymentMethod,
  setPaymentMethod,
  onBack,
  onConfirm,
}: {
  data: BookingPayload;
  agree: boolean;
  setAgree: (v: boolean) => void;
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation("booking");

  return (
    <PaymentWrapper sx={{ maxWidth: 980, width: "100%" }}>
      <Typography variant="h6" fontWeight={700} color="primary.main" mb={1}>
        {t("step4_summary.payOptions")}
      </Typography>

      <Stack spacing={1}>
        <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} aria-label="payment">
          <PaymentOption elevation={0}>
            <Radio value="bank" checked={paymentMethod === "bank"} onChange={() => setPaymentMethod("bank")} sx={{ color: "primary.main" }} />
            <Box>
              <Typography variant="body1" fontWeight={700}>
                {t("step4_summary.pay_bank")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("step4_summary.pay_bank_desc")}
              </Typography>
            </Box>
          </PaymentOption>

          <PaymentOption elevation={0}>
            <Radio value="cash" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} sx={{ color: "primary.main" }} />
            <Box>
              <Typography variant="body1" fontWeight={700}>
                {t("step4_summary.pay_cash")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("step4_summary.pay_cash_desc")}
              </Typography>
            </Box>
          </PaymentOption>
        </RadioGroup>

        <FormControlLabel
          control={<Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} sx={{ color: "primary.main" }} />}
          label={
            <Typography variant="caption">
              {t("step4_summary.agree1")}{" "}
              <Box component="span" sx={{ color: "primary.main", textDecoration: "underline", cursor: "pointer" }}>
                {t("step4_summary.terms")}
              </Box>{" "}
              {t("step4_summary.and")}{" "}
              <Box component="span" sx={{ color: "primary.main", textDecoration: "underline", cursor: "pointer" }}>
                {t("step4_summary.privacy")}
              </Box>
            </Typography>
          }
          sx={{ mt: 1 }}
        />

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Button variant="outlined" onClick={onBack}>
            {t("actions.back")}
          </Button>
          <Button variant="contained" disabled={!agree} onClick={onConfirm}>
            {t("step4_summary.confirm")}
          </Button>
        </Box>
      </Stack>
    </PaymentWrapper>
  );
}
