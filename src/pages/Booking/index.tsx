import { useState, useMemo } from "react";
import { Box, Container, Paper } from "@mui/material";
import StepperHeader from "./StepperHeader";
import Step1StyleSelect from "./Step1StyleSelect";
import Step2RoomSelect from "./Step2RoomSelect";
import Step2BoxSelect from "./Step2BoxSelect";
import Step3InfoForm from "./Step3InfoForm";
import Step4Summary from "./Step4Summary";
import Step5Success from "./Step5Success";
import Header from "../../components/Header";
import Footer from "../Home/Footer";

export type BookingData = {
  style?: "self" | "full";
  room?: { id: string; name: string; hasAC: boolean };
  box?: { id: string; label: string; price: number };
  info?: { name: string; phone: string; email?: string; note?: string };
};

const steps = ["style", "room", "box", "info", "summary", "done"] as const;

export default function BookingPage() {
  const [active, setActive] = useState(0);
  const [data, setData] = useState<BookingData>({});

  const goNext = () => setActive((s) => Math.min(s + 1, steps.length - 1));
  const goBack = () => setActive((s) => Math.max(s - 1, 0));

  const handlers = useMemo(
    () => ({
      save: (patch: Partial<BookingData>) =>
        setData((prev) => ({ ...prev, ...patch })),
      next: goNext,
      back: goBack,
    }),
    []
  );

  return (
    <>
    <Header/>
    <Box sx={{ bgcolor: "#F8FCFA", py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
          <StepperHeader activeStep={active} />
          {active === 0 && (
            <Step1StyleSelect
              onNext={(style) => {
                handlers.save({ style });
                handlers.next();
              }}
            />
          )}

          {active === 1 &&
            (data.style === "self" ? (
              <Step2RoomSelect
                selected={data.room || null}
                onBack={handlers.back}
                onNext={(room) => {
                  handlers.save({ room });
                  handlers.next();
                }}
              />
            ) : (
              <Step2BoxSelect
                selected={data.box || null}
                onBack={handlers.back}
                onNext={(box) => {
                  handlers.save({ box });
                  handlers.next();
                }}
              />
            ))}

          {active === 2 && (
            <Step3InfoForm
              initial={data.info}
              onBack={handlers.back}
              onNext={(info) => {
                handlers.save({ info });
                handlers.next();
              }}
            />
          )}

          {active === 3 && (
            <Step4Summary
              data={data}
              onBack={handlers.back}
              onConfirm={() => {
                console.log("BOOKING_PAYLOAD", data);
                alert("Đặt chỗ mock thành công! Kiểm tra console để xem payload.");
                handlers.next();
              }}
            />
          )}

          {active === 4 && <Step5Success />}
        </Paper>
      </Container>
    </Box>
    <Footer/>
    </>
    
  );
}
