import { Step, StepLabel, Stepper } from "@mui/material";

export default function StepperHeader({
  activeStep,
  labels,
}: {
  activeStep: number;
  labels: string[];
}) {
  if (!labels || labels.length === 0) return null;

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
