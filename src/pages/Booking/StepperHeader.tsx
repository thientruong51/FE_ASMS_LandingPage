import { Step, StepLabel, Stepper } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function StepperHeader({ activeStep }: { activeStep: number }) {
  const { t } = useTranslation("booking");
  const labels = t("steps", { returnObjects: true }) as string[];

  return (
    <Stepper activeStep={activeStep} sx={{ mb: { xs: 2, md: 3 } }}>
      {labels.map((label, i) => (
        <Step key={i}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
