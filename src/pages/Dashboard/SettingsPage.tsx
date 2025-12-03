import React from "react";
import { Stack, Paper, Typography, TextField, Button } from "@mui/material";
import { useTranslation } from "react-i18next";

const SettingsPage: React.FC = () => {
  const { t } = useTranslation("dashboard");

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={700}>
        {t("settings.title")}
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 2, maxWidth: 640 }}>
        <Stack spacing={2}>
          <TextField
            label={t("settings.language")}
            defaultValue={t("settings.defaultLanguage")}
          />
          <TextField
            label={t("settings.notification")}
            defaultValue="taosk@example.com"
          />
          <Button variant="contained">
            {t("settings.save")}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default SettingsPage;
