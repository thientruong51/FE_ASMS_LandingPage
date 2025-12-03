import React from "react";
import { Stack, Typography, Paper, TextField, Button, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import MailIcon from "@mui/icons-material/Mail";
import { useTranslation } from "react-i18next";

const ContactPage: React.FC = () => {
  const { t } = useTranslation("dashboard");

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={700}>
        {t("contact.title")}
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
        <Paper sx={{ flex: 1, p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t("contact.formTitle")}
          </Typography>
          <Stack spacing={2} mt={2}>
            <TextField label={t("contact.subject")} fullWidth />
            <TextField label={t("contact.message")} fullWidth multiline minRows={4} />
            <Button variant="contained">{t("contact.send")}</Button>
          </Stack>
        </Paper>

        <Paper sx={{ flex: 1, p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t("contact.onDuty")}
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <PhoneIcon />
              </ListItemIcon>
              <ListItemText primary={t("contact.personName", { name: "Nguyễn Văn A" })} secondary="+84 912 345 678" />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <MailIcon />
              </ListItemIcon>
              <ListItemText primary="support@warehouse.vn" secondary={t("contact.available")} />
            </ListItem>
          </List>
        </Paper>
      </Stack>
    </Stack>
  );
};

export default ContactPage;
