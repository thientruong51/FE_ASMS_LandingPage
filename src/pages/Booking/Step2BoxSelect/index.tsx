import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import BoxList from "./BoxList";

type Props = {
  selected: any;
  onNext: (box: any) => void;
  onBack: () => void;
};

export default function Step2BoxSelect({ selected, onNext, onBack }: Props) {
  const { t } = useTranslation("booking");
  const [chosen, setChosen] = useState<any>(selected);

  return (
    <Container>
      <Stack spacing={4} alignItems="center">
        <Typography variant="h4" fontWeight={700} color="primary.main" textAlign="center">
          {t("step2_box.title")}
        </Typography>

        <Typography variant="body1" color="text.secondary" textAlign="center" maxWidth={600}>
          {t("step2_box.desc")}
        </Typography>

        <BoxList chosen={chosen} onSelect={(b) => setChosen(b)} />

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
          <Button variant="outlined" color="inherit" onClick={onBack}>
            {t("common.back")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!chosen}
            onClick={() => onNext(chosen)}
          >
            {t("common.next")}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
