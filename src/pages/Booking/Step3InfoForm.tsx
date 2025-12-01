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

  const [form, setForm] = useState<FormState>({
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    address: initial?.address ?? "",
    note: initial?.note,
    services: initial?.services ?? [],
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

  const ALLOWED_SERVICE_IDS = [2, 3, 4]; 

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
    const iso = d.toISOString().slice(0, 10);
    setForm((prev) => ({ ...prev, selectedDate: iso }));
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

  const DELIVERY_ID = 4;

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
      maxHeight: "85vh",         
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "#F9FAFB",
      py: { xs: 3, md: 6 },       
      boxSizing: "border-box",
    }}
  >
    <Container
      maxWidth="md"
      sx={{
        height: "100%",            
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, md: 0 },
        boxSizing: "border-box",
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          width: "100%",
          maxHeight: "calc(100vh - 48px)", 
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          boxSizing: "border-box",
          overflow: "visible",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
          <Typography
            variant="h5"
            fontWeight={700}
            color="primary.main"
            textAlign="center"
            sx={{ mb: 0 }}
          >
            {t("infoForm.title")}
          </Typography>

          <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mb: 0 }}>
            {t("infoForm.desc")}
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ flex: "1 1 auto", overflow: "visible" }}>
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ alignItems: "stretch" }}
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
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
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

              {/* Note */}
              <TextField
                name="note"
                label={t("infoForm.note")}
                value={form.note ?? ""}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
              />

              {/* Date Picker */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} mb={1}>
                  {t("startDate.title")}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {t("startDate.desc")}
                </Typography>

                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={localeToUse}>
                  <DatePicker
                    label={t("startDate.chooseDate", "Chọn ngày bắt đầu")}
                    value={form.selectedDate ? new Date(form.selectedDate) : null}
                    onChange={handleDateSelectIso}
                    disablePast
                    minDate={minDate}
                    maxDate={maxDate}
                    format={inputFormat}
                    slotProps={{
                      textField: { fullWidth: true },
                      popper: {
                        sx: {
                          "& .MuiPaper-root": {
                            borderRadius: 3,
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Box>

              {/* Rental period */}
              <Box>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend" sx={{ mb: 1 }}>
                    {t("rental.period.title", "Chọn thời gian thuê")}
                  </FormLabel>

                  <RadioGroup
                    value={form.rentalType ?? "month"}
                    onChange={(e) => handleRentalTypeChange(e.target.value as "week" | "month" | "custom")}
                    row
                  >
                    <FormControlLabel value="week" control={<Radio />} label={t("rental.period.week", "Theo tuần")} />
                    <FormControlLabel value="month" control={<Radio />} label={t("rental.period.month", "Theo tháng")} />
                    <FormControlLabel value="custom" control={<Radio />} label={t("rental.period.custom", "Tùy chỉnh (số tháng)")} />
                  </RadioGroup>

                  {form.rentalType === "week" && (
                    <Box sx={{ mt: 1, maxWidth: 260 }}>
                      <TextField
                        label={t("rental.period.weeksLabel", "Số tuần")}
                        type="number"
                        inputProps={{ min: 1, max: 4 }}
                        value={form.rentalWeeks ?? ""}
                        onChange={(e) => handleRentalWeeksChange(e.target.value)}
                        helperText={t("rental.period.weeksHelp", "Chọn từ 1 đến 4 tuần. Giá = giá tháng × 0.3 × số tuần")}
                        fullWidth
                      />
                    </Box>
                  )}

                  {form.rentalType === "custom" && (
                    <Box sx={{ mt: 1, maxWidth: 220 }}>
                      <TextField
                        label={t("rental.period.monthsLabel", "Số tháng")}
                        type="number"
                        inputProps={{ min: 1 }}
                        value={form.rentalMonths ?? ""}
                        onChange={(e) => handleRentalMonthsChange(e.target.value)}
                        fullWidth
                        InputProps={{
                          endAdornment: <InputAdornment position="end">{t("rental.period.monthSuffix", "tháng")}</InputAdornment>,
                        }}
                      />
                    </Box>
                  )}
                </FormControl>
              </Box>

              {/* Services */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} mb={1}>
                  {t("infoForm.chooseServices")}
                </Typography>

                {loadingServices ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <Stack spacing={0.5}>
                    {allServices.map((s) => (
                      <FormControlLabel
                        key={s.serviceId}
                        control={<Checkbox checked={form.services.includes(s.serviceId)} onChange={() => toggleService(s.serviceId)} />}
                        label={`${s.name} — ${s.price?.toLocaleString?.() ?? s.price}đ`}
                      />
                    ))}
                  </Stack>
                )}
              </Box>

              {/* Buttons */}
              <Stack direction="row" spacing={2} justifyContent="center" mt={1}>
                <Button variant="outlined" onClick={onBack} disabled={loadingDistance}>
                  {t("actions.back")}
                </Button>
                <Button variant="contained" type="submit" disabled={loadingDistance}>
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
