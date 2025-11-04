import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  initial?: { name?: string; phone?: string; email?: string; note?: string };
  onNext: (info: any) => void;
  onBack: () => void;
};

export default function Step3InfoForm({ initial, onNext, onBack }: Props) {
  const { t } = useTranslation("booking");
  const [info, setInfo] = useState(initial || { name: "", phone: "", email: "", note: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInfo({ ...info, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(info);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3} alignItems="center" maxWidth={500} mx="auto">
        <Typography variant="h5" fontWeight={700} color="primary.main">
          {t("step3_info.title")}
        </Typography>

        <TextField
          label={t("step3_info.fields.name")}
          name="name"
          value={info.name}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          label={t("step3_info.fields.phone")}
          name="phone"
          value={info.phone}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          label={t("step3_info.fields.email")}
          name="email"
          value={info.email}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label={t("step3_info.fields.note")}
          name="note"
          value={info.note}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
        />

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="outlined" color="inherit" onClick={onBack}>
            {t("common.back")}
          </Button>
          <Button variant="contained" color="primary" type="submit">
            {t("common.next")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
