import {
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  Paper,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export default function Step4Summary({
  data,
  onBack,
  onConfirm,
}: {
  data: any;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation("booking");

  const randomPrice = Math.floor(Math.random() * 3_000_000) + 2_000_000;

  return (
    <Stack spacing={3} alignItems="center">
      <Typography variant="h5" fontWeight={700} color="primary.main">
        {t("step4_summary.title")}
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 500, width: "100%" }} elevation={3}>
        <Stack spacing={2}>
          <Typography>
            <strong>{t("summary.service")}:</strong>{" "}
            {data.style === "self" ? "Kho tự quản" : "Dịch vụ trọn gói"}
          </Typography>
          {data.room && (
            <Typography>
              <strong>{t("summary.room")}:</strong> {data.room.name}{" "}
              {data.room.hasAC ? "(Có điều hòa)" : "(Không điều hòa)"}
            </Typography>
          )}
          {data.box && (
            <Typography>
              <strong>{t("summary.box")}:</strong> {data.box.label}
            </Typography>
          )}
          {data.info && (
            <>
              <Typography>
                <strong>{t("summary.name")}:</strong> {data.info.name}
              </Typography>
              <Typography>
                <strong>{t("summary.phone")}:</strong> {data.info.phone}
              </Typography>
            </>
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography textAlign="center" fontSize={20} fontWeight={700}>
          💰 {t("summary.total")}:{" "}
          <Box component="span" color="primary.main">
            {randomPrice.toLocaleString()} đ
          </Box>
        </Typography>
      </Paper>

      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={onBack}>
          {t("common.back")}
        </Button>
        <Button variant="contained" onClick={onConfirm}>
          {t("step4_summary.confirm")}
        </Button>
      </Stack>
    </Stack>
  );
}
