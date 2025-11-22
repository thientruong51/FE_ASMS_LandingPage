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
import Step4Summary from "./Step4Summary/Step4Summary";
import Step5Success from "./Step5Success";

import Header from "../../components/Header";
import Footer from "../Home/Footer";
import React from "react";


export type ServiceSelection = { serviceId: number; name: string; price: number };

export type RoomInfo = {
  id: string;
  name: string;
  hasAC: boolean;
  type?: string;
  width?: number;
  depth?: number;
  price?: number;
};

export type ProductTypeSelection = {
  id: number;
  name: string;
  isFragile?: boolean;
  canStack?: boolean;
  description?: string | null;
};

export type BoxInfo = {
  id: string;
  label: string;
  price: number;
  quantity?: number;
  imageUrl?: string | null;
};

export type BoxInfoExtended = BoxInfo & {
  productTypes?: ProductTypeSelection[]; 
  productTypeIds?: number[]; 
};

export type PriceBreakdown = {
  basePrice?: number;
  subtotal?: number;
  vatPercentage?: number;
  vatAmount?: number;
  total?: number;
};

export type BookingData = {
  style?: "self" | "full";

  room?: RoomInfo | null;

  box?: BoxInfo | null;

  boxes?: BoxInfoExtended[] | null;

  boxPayload?: any;

  productTypes?: ProductTypeSelection[] | null;

  package?: { id: string; name: string; price: number | string } | null;

  customItems?: any[] | { items: any[]; counts?: Record<string, number> } | null;
  counts?: Record<string, number> | null;

  info?: {
    name: string;
    phone: string;
    email: string;
    address: string;
    note?: string;
    services?: number[];
  } | null;

  selectedDate?: string | null;
  services?: number[] | ServiceSelection[] | null;
  pricing?: PriceBreakdown | null;

  rentalType?: "week" | "month" | "custom";
  rentalWeeks?: number; 
  rentalMonths?: number; 

  prevStep?: number;
};



export default function BookingPage() {
  const { t } = useTranslation("booking");

  const [active, setActive] = useState(0);
  const [data, setData] = useState<BookingData>({});

  const labelsSelf = t("stepsSelf", { returnObjects: true }) as string[];
  const labelsBox = t("stepsBox", { returnObjects: true }) as string[];
  const currentLabels = data.style === "full" ? labelsBox : labelsSelf || labelsSelf;

  const handlers = useMemo(() => {
    const next = (currentStep?: number) => {
      if (typeof currentStep === "number") {
        setData((prev) => ({ ...prev, prevStep: currentStep }));
      }
      setActive((s) => s + 1);
    };

    const back = () => setActive((s) => Math.max(s - 1, 0));
    const goTo = (index: number) => setActive(index);
    const save = (patch: Partial<BookingData>) => setData((prev) => ({ ...prev, ...patch }));

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
            <StepperHeader activeStep={active} labels={currentLabels} />

            {/* STEP 1 */}
            {active === 0 && (
              <Step1StyleSelect
                onNext={(style) => {
                  handlers.save({ style });
                  handlers.next();
                }}
              />
            )}

            {/* SELF STORAGE FLOW */}
            {data.style === "self" && (
              <>
                {/* STEP 2: ROOM */}
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

                {/* STEP 3: Package vs Custom */}
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

                {/* STEP 4: Package select */}
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

                {/* STEP 5: Custom 3D */}
                {active === 4 && data.room && (
                  <Step3Custom3D
                    room={data.room}
                    onBack={() => handlers.goTo(2)}
                    onNext={(payload) => {
                      if (Array.isArray(payload)) {
                        handlers.save({ customItems: payload, counts: undefined });
                      } else if (payload && typeof payload === "object" && Array.isArray((payload as any).items)) {
                        handlers.save({ customItems: (payload as any).items, counts: (payload as any).counts ?? undefined });
                      } else {
                        handlers.save({ customItems: payload as any });
                      }
                      handlers.next(4);
                      setActive(5);
                    }}
                  />
                )}

                {/* STEP 6: Info Form */}
                {active === 5 && (
                  <Step3InfoForm
                    initial={{
                      name: data.info?.name,
                      phone: data.info?.phone,
                      email: data.info?.email,
                      address: data.info?.address,
                      note: data.info?.note,
                      services: Array.isArray(data.services) && typeof data.services[0] === "number" ? (data.services as number[]) : [],
                      selectedDate: data.selectedDate ?? null,
                      rentalType: data.rentalType ?? undefined,
                      rentalWeeks: data.rentalWeeks ?? undefined,
                      rentalMonths: data.rentalMonths ?? undefined,
                    }}
                    onBack={() => {
                      if (data.prevStep !== undefined) handlers.goTo(data.prevStep);
                      else handlers.back();
                    }}
                    onNext={(form) => {
                      handlers.save({
                        info: { name: form.name, phone: form.phone, email: form.email, address: form.address, note: form.note },
                        services: form.services ?? [],
                        selectedDate: form.selectedDate ?? null,
                        rentalType: (form as any).rentalType ?? undefined,
                        rentalWeeks: (form as any).rentalWeeks ?? undefined,
                        rentalMonths: (form as any).rentalMonths ?? undefined,
                      });
                      handlers.next();
                    }}
                  />
                )}

                {/* STEP 7: Summary */}
                {active === 6 && (
                  <Step4Summary
                    data={data}
                    onBack={handlers.back}
                    onConfirm={() => {
                      console.log("BOOKING_PAYLOAD", data);
                      handlers.next();
                    }}
                  />
                )}

                {/* STEP 8: Success */}
                {active === 7 && <Step5Success />}
              </>
            )}

            {/* FULL SERVICE (BOX) FLOW */}
            {data.style === "full" && (
              <React.Fragment>
                {/* STEP 2: Box select */}
                {active === 1 && (
                  <Step2BoxSelect
                    selected={data.boxes ?? []}
                    onBack={handlers.back}
                    onNext={(payload) => {

                      const rawBoxes = Array.isArray(payload?.boxes) ? payload.boxes : [];
                      const normalizedBoxes: BoxInfoExtended[] = rawBoxes.map((b: any) => {
                        const productTypeIdsFromTypes =
                          Array.isArray(b.productTypes) && b.productTypes.length > 0
                            ? b.productTypes.map((pt: any) => pt.id ?? pt.productTypeId).filter((x: any) => x != null)
                            : [];

                        const ids =
                          Array.isArray(b.productTypeIds) && b.productTypeIds.length > 0
                            ? b.productTypeIds.map((x: any) => Number(x))
                            : productTypeIdsFromTypes.map((x: any) => Number(x));

                        return {
                          id: String(b.id ?? b.containerTypeId ?? b.boxId ?? ""),
                          label: b.label ?? b.name ?? "",
                          price: Number(b.price ?? b.priceMonthValue ?? 0),
                          quantity: Number(b.quantity ?? 1),
                          imageUrl: b.imageUrl ?? b.modelUrl ?? null,
                          productTypes: Array.isArray(b.productTypes) ? b.productTypes.map((pt: any) => ({
                            id: Number(pt.id ?? pt.productTypeId),
                            name: pt.name ?? pt.title ?? String(pt.id ?? pt.productTypeId),
                            isFragile: pt.isFragile ?? pt.isFragile,
                            canStack: pt.canStack ?? pt.canStack,
                            description: pt.description ?? null,
                          })) : undefined,
                          productTypeIds: ids ?? [],
                        } as BoxInfoExtended;
                      });

                      const masterProductTypes =
                        Array.isArray(payload?.productTypes) ? payload.productTypes.map((pt: any) => ({
                          id: Number(pt.productTypeId ?? pt.id),
                          name: pt.name,
                          isFragile: pt.isFragile,
                          canStack: pt.canStack,
                          description: pt.description ?? null,
                        })) : (Array.isArray(payload?.productTypesList) ? payload.productTypesList : undefined);

                      const firstBox =
                        normalizedBoxes.length > 0
                          ? {
                              id: normalizedBoxes[0].id,
                              label: normalizedBoxes[0].label,
                              price: normalizedBoxes[0].price,
                              quantity: normalizedBoxes[0].quantity,
                            }
                          : null;

                      handlers.save({
                        boxes: normalizedBoxes,
                        box: firstBox,
                        boxPayload: payload, 
                        productTypes: masterProductTypes ?? (data.productTypes ?? null),
                      });

                      handlers.next();
                    }}
                  />
                )}

                {/* STEP 3: Info Form (box flow) */}
                {active === 2 && (
                  <Step3InfoForm
                    initial={{
                      name: data.info?.name,
                      phone: data.info?.phone,
                      email: data.info?.email,
                      address: data.info?.address,
                      note: data.info?.note,
                      services:
                        Array.isArray(data.services) && typeof data.services[0] === "number"
                          ? (data.services as number[])
                          : [],
                      selectedDate: data.selectedDate ?? null,
                      rentalType: data.rentalType ?? undefined,
                      rentalWeeks: data.rentalWeeks ?? undefined,
                      rentalMonths: data.rentalMonths ?? undefined,
                    }}
                    onBack={handlers.back}
                    onNext={(form) => {
                      handlers.save({
                        info: {
                          name: form.name,
                          phone: form.phone,
                          email: form.email,
                          address: form.address,
                          note: form.note,
                        },
                        services: form.services ?? [],
                        selectedDate: form.selectedDate ?? null,
                        rentalType: (form as any).rentalType ?? undefined,
                        rentalWeeks: (form as any).rentalWeeks ?? undefined,
                        rentalMonths: (form as any).rentalMonths ?? undefined,
                      });
                      handlers.next();
                    }}
                  />
                )}

                {/* STEP 4: Summary */}
                {active === 3 && (
                  <Step4Summary
                    data={data}
                    onBack={handlers.back}
                    onConfirm={() => {
                      console.log("BOOKING_PAYLOAD", data);
                      handlers.next();
                    }}
                  />
                )}

                {/* STEP 5: Success */}
                {active === 4 && <Step5Success />}
              </React.Fragment>
            )}
          </Paper>
        </Container>
      </Box>

      <Footer />
    </>
  );
}
