import { useState, useMemo } from "react";
import { Box, Container, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";

import StepperHeader from "./StepperHeader";
import Step1StyleSelect from "./Step1StyleSelect";
import Step2RoomSelect from "./Step2RoomSelect";
import Step2BoxSelect from "./Step2BoxSelect";
import Step2CustomizeChoice from "./Step2CustomizeChoice";
import Step2PackageSelect from "./Step2PackageSelect";
import Step3Custom3D from "./Step3Custom3D";
import Step3InfoForm from "./Step3InfoForm";
import Step4Summary from "./Step4Summary";
import Step5Success from "./Step5Success";
import Header from "../../components/Header";
import Footer from "../Home/Footer";


export type BookingData = {
  style?: "self" | "full";
  room?: { id: string; name: string; hasAC: boolean };
  box?: { id: string; label: string; price: number };
  package?: { id: string; name: string; price: string };
  customItems?: any[];
  info?: { name: string; phone: string; email?: string; note?: string };
  prevStep?: number;
};


export default function BookingPage() {
  const { t } = useTranslation("booking");
  const [active, setActive] = useState(0);
  const [data, setData] = useState<BookingData>({});

  const labelsSelf = t("stepsSelf", { returnObjects: true }) as string[];
  const labelsBox = t("stepsBox", { returnObjects: true }) as string[];
  const currentLabels =
    data.style === "full" ? labelsBox : labelsSelf || labelsSelf;


  const handlers = useMemo(() => {
    const next = (currentStep?: number) => {
      if (typeof currentStep === "number") {
        setData((prev) => ({ ...prev, prevStep: currentStep }));
      }
      setActive((s) => s + 1);
    };

    const back = () => setActive((s) => Math.max(s - 1, 0));
    const goTo = (index: number) => setActive(index);
    const save = (patch: Partial<BookingData>) =>
      setData((prev) => ({ ...prev, ...patch }));

    return { next, back, goTo, save };
  }, []);


  return (
    <>
      <Header />
      <Box sx={{ bgcolor: "#F8FCFA", py: { xs: 4, md: 6 } }}>
        <Container maxWidth="xl">
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            {/* ======== STEPPER ======== */}
            <StepperHeader activeStep={active} labels={currentLabels} />

            {/* ======== STEP 1: CHỌN LOẠI DỊCH VỤ ======== */}
            {active === 0 && (
              <Step1StyleSelect
                onNext={(style) => {
                  handlers.save({ style });
                  handlers.next();
                }}
              />
            )}

            {/*  FLOW: SELF STORAGE */}
            {data.style === "self" && (
              <>
                {/* Step 2: Chọn phòng */}
                {active === 1 && (
                  <Step2RoomSelect
                    selected={data.room || null}
                    onBack={handlers.back}
                    onNext={(room) => {
                      handlers.save({ room });
                      handlers.next();
                    }}
                  />
                )}

                {/* Step 3: Chọn giữa gói sẵn / tùy chỉnh */}
                {active === 2 && data.room && (
                  <Step2CustomizeChoice
                    room={data.room}
                    onBack={handlers.back}
                    onSelect={(choice) => {
                      if (choice === "package") setActive(3);
                      else if (choice === "custom") setActive(4);
                    }}
                  />
                )}

                {/* Step 4: Chọn gói sẵn */}
                {active === 3 && data.room && (
                  <Step2PackageSelect
                    room={data.room}
                    onBack={() => handlers.goTo(2)}
                    onNext={(pkg) => {
                      handlers.save({ package: pkg });
                      handlers.next(3);
                      setActive(5);
                    }}
                  />
                )}

                {/* Step 5: Tùy chỉnh phòng 3D */}
                {active === 4 && data.room && (
                  <Step3Custom3D
                    room={data.room}
                    onBack={() => handlers.goTo(2)}
                    onNext={(items) => {
                      handlers.save({ customItems: items });
                      handlers.next(4);
                      setActive(5);
                    }}
                  />
                )}

                {/* Step 6: Thông tin cá nhân */}
                {active === 5 && (
                  <Step3InfoForm
                    initial={data.info}
                    onBack={() => {
                      if (data.prevStep !== undefined)
                        handlers.goTo(data.prevStep);
                      else handlers.back();
                    }}
                    onNext={(info) => {
                      handlers.save({ info });
                      handlers.next();
                    }}
                  />
                )}

                {/* Step 7: Xác nhận */}
                {active === 6 && (
                  <Step4Summary
                    data={data}
                    onBack={handlers.back}
                    onConfirm={() => {
                      console.log("BOOKING_PAYLOAD", data);
                      alert("✅ Đặt chỗ thành công (mock). Kiểm tra console!");
                      handlers.next();
                    }}
                  />
                )}

                {/* Step 8: Hoàn tất */}
                {active === 7 && <Step5Success />}
              </>
            )}

            {/* FLOW: BOX SERVICE */}
            {data.style === "full" && (
              <>
                {/* Step 2: Chọn Box */}
                {active === 1 && (
                  <Step2BoxSelect
                    selected={data.box || null}
                    onBack={handlers.back}
                    onNext={(box) => {
                      handlers.save({ box });
                      handlers.next();
                    }}
                  />
                )}

                {/* Step 3: Thông tin cá nhân */}
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

                {/* Step 4: Xác nhận */}
                {active === 3 && (
                  <Step4Summary
                    data={data}
                    onBack={handlers.back}
                    onConfirm={() => {
                      console.log("BOOKING_PAYLOAD", data);
                      alert("✅ Đặt chỗ thành công (mock). Kiểm tra console!");
                      handlers.next();
                    }}
                  />
                )}

                {/* Step 5: Hoàn tất */}
                {active === 4 && <Step5Success />}
              </>
            )}
          </Paper>
        </Container>
      </Box>
      <Footer />
    </>
  );
}
