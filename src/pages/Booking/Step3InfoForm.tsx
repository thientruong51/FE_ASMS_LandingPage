import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  InputAdornment,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchServices, type ServiceApi } from "../../api/service";
import { calculateDistance, type DistanceResponse } from "../../api/distance";
import { translateServiceName } from "../../utils/serviceNameHelper";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { vi, enUS } from "date-fns/locale";

type FormState = {
  name: string;
  phone: string;
  email: string;
  address: string;
  note?: string;
  services: number[];
  selectedDate?: string | null;
  rentalType?: "week" | "month" | "custom";
  rentalWeeks?: number | null;
  rentalMonths?: number | null;
  distanceInKm?: number | null;
};

type Props = {
  initial?: Partial<FormState>;
  onBack: () => void;
  onNext: (form: FormState) => void;
  daysRange?: number;
  bilingualDates?: boolean;
};

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default function Step3InfoForm({
  initial,
  onBack,
  onNext,
  daysRange = 31,
}: Props) {
  const { t, i18n } = useTranslation("booking");
  const currentLang = i18n.language ?? "vi";
  const DELIVERY_ID = 4;
  const [form, setForm] = useState<FormState>({
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    address: initial?.address ?? "",
    note: initial?.note,
    services:
      initial?.services && initial.services.length > 0
        ? initial.services
        : [DELIVERY_ID],
    selectedDate: initial?.selectedDate ?? null,
    rentalType: initial?.rentalType ?? "month",
    rentalWeeks: initial?.rentalWeeks ?? 1,
    rentalMonths: initial?.rentalMonths ?? 1,
    distanceInKm: initial?.distanceInKm ?? null,
  });

  const [allServices, setAllServices] = useState<ServiceApi[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingDistance, setLoadingDistance] = useState(false);

  const ALLOWED_SERVICE_IDS = [4];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const list = await fetchServices();
        if (!mounted) return;
        setAllServices(list.filter((s) => ALLOWED_SERVICE_IDS.includes(s.serviceId)));
      } catch (err) {
        console.error("Load services failed:", err);
      } finally {
        if (mounted) setLoadingServices(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleService = (id: number) => {
    setForm((prev) => {
      const arr = prev.services ?? [];
      return { ...prev, services: arr.includes(id) ? arr.filter((s) => s !== id) : [...arr, id] };
    });
  };

  const today = new Date();
  const minDate = today;
  const maxDate = addDays(today, Math.max(0, daysRange - 1));
  const localeToUse = currentLang.startsWith("vi") ? vi : enUS;
  const inputFormat = currentLang.startsWith("vi") ? "dd/MM/yyyy" : "MM/dd/yyyy";

  const handleDateSelectIso = (d: Date | null) => {
    if (!d) {
      setForm((prev) => ({ ...prev, selectedDate: null }));
      return;
    }

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    const localIso = `${yyyy}-${mm}-${dd}`;
    setForm((prev) => ({ ...prev, selectedDate: localIso }));
  };

  const handleRentalTypeChange = (value: "week" | "month" | "custom") => {
    setForm((prev) => ({
      ...prev,
      rentalType: value,
      rentalWeeks: value === "week" ? prev.rentalWeeks ?? 1 : prev.rentalWeeks,
      rentalMonths: value === "custom" ? prev.rentalMonths ?? 1 : prev.rentalMonths,
    }));
  };

  const handleRentalWeeksChange = (v: string) => {
    const n = Math.floor(Number(v) || 0);
    const clamped = Math.min(4, Math.max(1, n || 1));
    setForm((prev) => ({ ...prev, rentalWeeks: clamped }));
  };

  const handleRentalMonthsChange = (v: string) => {
    const n = Math.floor(Number(v) || 0);
    setForm((prev) => ({ ...prev, rentalMonths: n > 0 ? n : 0 }));
  };

  const ORIGIN_PLACE = "Ngã tư Thủ Đức";



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.email?.trim() || !form.address?.trim()) {
      setError(t("infoForm.error.required"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError(t("infoForm.error.email"));
      return;
    }
    if (form.rentalType === "week") {
      const w = Number(form.rentalWeeks ?? 0);
      if (!w || w < 1 || w > 4) {
        setError(t("rental.error.weeksRange", "Số tuần phải từ 1 đến 4."));
        return;
      }
    }
    if (form.rentalType === "custom") {
      if (!form.rentalMonths || form.rentalMonths <= 0) {
        setError(t("rental.error.monthsPositive", "Vui lòng nhập số tháng hợp lệ (> 0)."));
        return;
      }
    }

    setError(null);
    setLoadingDistance(true);

    try {
      let distanceInKm: number | null = null;

      const isDeliverySelected = (form.services ?? []).includes(DELIVERY_ID);

      if (isDeliverySelected) {
        const payload = { origin: ORIGIN_PLACE, destination: form.address };
        const data: DistanceResponse = await calculateDistance(payload);
        distanceInKm = typeof data?.distanceInKm === "number" ? data.distanceInKm : null;
      }

      const nextPayload: FormState = {
        ...form,
        services: form.services ?? [],
        selectedDate: form.selectedDate ?? null,
        rentalWeeks: form.rentalType === "week" ? Number(form.rentalWeeks ?? 1) : undefined,
        rentalMonths:
          form.rentalType === "custom" ? Number(form.rentalMonths ?? 1) : form.rentalType === "month" ? 1 : undefined,
        distanceInKm,
      };

      setLoadingDistance(false);
      onNext(nextPayload);
    } catch (err: any) {
      console.error("Distance calculation failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t("distance.error.fetchFailed", "Tính khoảng cách thất bại. Vui lòng thử lại.");
      setError(String(msg));
      setLoadingDistance(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        bgcolor: "#F9FAFB",
        py: { xs: 2, md: 3 },
        px: { xs: 1, sm: 2 },
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            width: "100%",
            borderRadius: 3,
            p: { xs: 2, md: 3 },
            height: "auto",
            overflow: "visible",
          }}
        >
          <Stack spacing={1.2}>
            <Typography variant="h5" fontWeight={700} textAlign="center">
              {t("infoForm.title")}
            </Typography>

            <Typography variant="body2" textAlign="center" color="text.secondary">
              {t("infoForm.desc")}
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            {/* FORM */}
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={1.2}>

                {/* Name + Phone */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                >
                  <TextField
                    name="name"
                    label={t("infoForm.name")}
                    value={form.name}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                  <TextField
                    name="phone"
                    label={t("infoForm.phone")}
                    value={form.phone}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Stack>

                {/* Email + Address */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                >
                  <TextField
                    name="email"
                    label={t("infoForm.email")}
                    value={form.email ?? ""}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                  <TextField
                    name="address"
                    label={t("infoForm.address")}
                    value={form.address ?? ""}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Stack>

                <TextField
                  name="note"
                  label={t("infoForm.note")}
                  value={form.note ?? ""}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={2}
                />

                {/* DATE PICKER */}
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    mb={0.5}
                  >
                    {t("startDate.title")}
                  </Typography>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={localeToUse}>
                    <DatePicker
                      label={t("startDate.chooseDate")}
                      value={form.selectedDate ? new Date(form.selectedDate) : null}
                      onChange={handleDateSelectIso}
                      disablePast
                      minDate={minDate}
                      maxDate={maxDate}
                      format={inputFormat}
                      slotProps={{
                        textField: { fullWidth: true },
                      }}
                    />
                  </LocalizationProvider>
                </Box>

                {/* RENTAL PERIOD */}
                <Box>
                  <FormControl fullWidth>
                    <FormLabel>{t("rental.period.title")}</FormLabel>
                    <RadioGroup
                      value={form.rentalType ?? "month"}
                      onChange={(e) =>
                        handleRentalTypeChange(e.target.value as "week" | "month" | "custom")
                      }
                    >
                      <FormControlLabel value="week" control={<Radio />} label={t("rental.period.week")} />
                      <FormControlLabel value="month" control={<Radio />} label={t("rental.period.month")} />
                      <FormControlLabel
                        value="custom"
                        control={<Radio />}
                        label={t("rental.period.custom")}
                      />
                    </RadioGroup>

                    {form.rentalType === "week" && (
                      <TextField
                        label={t("rental.period.weeksLabel")}
                        type="number"
                        inputProps={{ min: 1, max: 4 }}
                        fullWidth
                        sx={{ mt: 1 }}
                        value={form.rentalWeeks ?? 1}
                        onChange={(e) => handleRentalWeeksChange(e.target.value)}
                      />
                    )}

                    {form.rentalType === "custom" && (
                      <TextField
                        label={t("rental.period.monthsLabel")}
                        type="number"
                        fullWidth
                        sx={{ mt: 1 }}
                        value={form.rentalMonths ?? 1}
                        onChange={(e) => handleRentalMonthsChange(e.target.value)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {t("rental.period.monthSuffix")}
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </FormControl>
                </Box>

                {/* SERVICES */}
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} mb={1}>
                    {t("infoForm.chooseServices")}
                  </Typography>

                  {loadingServices ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                      <CircularProgress size={22} />
                    </Box>
                  ) : (
                    <Stack spacing={0.5}>
                      {allServices.map((s) => (
                        <FormControlLabel
                          key={s.serviceId}
                          control={
                            <Checkbox
                              checked={form.services.includes(s.serviceId)}
                              onChange={() => toggleService(s.serviceId)}
                            />
                          }
                          label={
                            s.serviceId === DELIVERY_ID
                              ? translateServiceName(t, s.name) 
                              : `${translateServiceName(t, s.name)} — ${s.price?.toLocaleString?.() ?? s.price}đ`
                          }
                        />
                      ))}
                    </Stack>
                  )}
                </Box>

                {/* BUTTONS */}
                <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
                  <Button variant="outlined" onClick={onBack}>
                    {t("actions.back")}
                  </Button>
                  <Button variant="contained" type="submit">
                    {loadingDistance ? <CircularProgress size={20} /> : t("actions.next")}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );


}
