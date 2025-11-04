import { Stack, Typography, Button } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function Step5Success() {
  const { t } = useTranslation("booking");
  const navigate = useNavigate();

  return (
    <Stack spacing={3} alignItems="center" textAlign="center" py={6}>
      <CheckCircleOutlineIcon sx={{ fontSize: 80, color: "primary.main" }} />
      <Typography variant="h4" fontWeight={700} color="primary.main">
        {t("step5_success.title")}
      </Typography>
      <Typography variant="body1" color="text.secondary" maxWidth={500}>
        {t("step5_success.desc")}
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate("/")}>
        {t("step5_success.backHome")}
      </Button>
    </Stack>
  );
}
