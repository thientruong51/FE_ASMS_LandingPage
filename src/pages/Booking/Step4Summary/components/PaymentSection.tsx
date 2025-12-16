import {
  Box,
  Paper,
  Stack,
  Typography,

  FormControlLabel,
  Checkbox,
  styled,
  Button,
  CircularProgress,
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


export default function PaymentSection({
  agree,
  setAgree,
  onBack,
  onConfirm,
  loading = false,
}: {
  data: BookingPayload;
  agree: boolean;
  setAgree: (v: boolean) => void;
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  onBack: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  const { t } = useTranslation("booking");

  return (
    <PaymentWrapper sx={{ maxWidth: 980, width: "100%" }}>
     

      <Stack spacing={1}>
       

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
          <Button variant="outlined" onClick={onBack} disabled={loading}>
            {t("actions.back")}
          </Button>
          <Button
            variant="contained"
            disabled={!agree || loading}
            onClick={onConfirm}
            startIcon={loading ? <CircularProgress size={18} /> : null}
          >
            {t("step4_summary.confirm")}
          </Button>
        </Box>
      </Stack>
    </PaymentWrapper>
  );
}
