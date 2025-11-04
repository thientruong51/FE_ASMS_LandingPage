import { Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function RoomHeader() {
  const { t } = useTranslation("storageSize");

  return (
    <Stack spacing={2} textAlign="center" maxWidth={700}>
      <Typography variant="h3" fontWeight={700} color="primary.main">
        {t("title")}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {t("desc")}
      </Typography>
    </Stack>
  );
}
