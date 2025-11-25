import  { useEffect, useRef, useState } from "react";
import { Box, Step, StepLabel, Stepper } from "@mui/material";

export default function StepperHeader({
  activeStep,
  labels,
}: {
  activeStep: number;
  labels: string[];
}) {
  if (!labels || labels.length === 0) return null;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const check = () => {
      const el = containerRef.current;
      if (!el) return;
      const stepItems = el.querySelectorAll(".MuiStep-root");

      const totalWidth = Array.from(stepItems).reduce(
        (sum, item) => sum + item.clientWidth,
        0
      );

      setOverflow(totalWidth > el.clientWidth - 8);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [labels]);

  useEffect(() => {
    if (!overflow) return;
    const container = containerRef.current;
    if (!container) return;

    const steps = container.querySelectorAll<HTMLElement>(".MuiStep-root");
    const activeEl = steps[activeStep];
    if (!activeEl) return;

    const left =
      activeEl.offsetLeft -
      container.clientWidth / 2 +
      activeEl.clientWidth / 2;

    container.scrollTo({ left, behavior: "smooth" });
  }, [activeStep, overflow]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        overflowX: overflow ? "auto" : "hidden",
        mb: { xs: 2, md: 3 },
        px: 1,
        WebkitOverflowScrolling: "touch",
      }}
    >
      <Stepper
        activeStep={activeStep}
        sx={{

          display: overflow ? "inline-flex" : "flex",
          justifyContent: overflow ? "flex-start" : "center",
          flexWrap: "nowrap",
          gap: { xs: 0.5, sm: 0.5, md: 0.5 },

          "& .MuiStepLabel-label": {
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
          },
        }}
      >
        {labels.map((label, i) => (
          <Step key={i}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
