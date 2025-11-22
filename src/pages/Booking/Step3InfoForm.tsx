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
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchServices, type ServiceApi } from "../../api/service";


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
};

type Props = {
  initial?: Partial<FormState>;
  onBack: () => void;
  onNext: (form: FormState) => void;
  daysRange?: number;
  bilingualDates?: boolean;
};

const WEEKDAY_LABELS_VN = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const WEEKDAY_LABELS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateLabelByLang(d: Date, lang: string, bilingual = false) {
  const vnWeek = WEEKDAY_LABELS_VN[d.getDay()];
  const enWeek = WEEKDAY_LABELS_EN[d.getDay()];
  const monthEnShort = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
  const monthVn = d.getMonth() + 1;
  const day = d.getDate();

  if (bilingual) return `${vnWeek} • ${enWeek} — ${monthEnShort} ${day}`;
  if (lang?.startsWith("vi")) return `${vnWeek}, Th${monthVn} ${day}`;
  return `${enWeek} — ${monthEnShort} ${day}`;
}

export default function Step3InfoForm({
  initial,
  onBack,
  onNext,
  daysRange = 28,
  bilingualDates = false,
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
  });

  const [allServices, setAllServices] = useState<ServiceApi[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const dateList = useMemo(() => {
    const today = new Date();
    const arr: Date[] = [];
    for (let i = 0; i < daysRange; i++) arr.push(addDays(today, i));
    return arr;
  }, [daysRange]);

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

  const handleDateSelect = (d: Date) => {
    const iso = d.toISOString().slice(0, 10);
    setForm((prev) => ({ ...prev, selectedDate: iso }));
  };

  const isSelected = (d: Date) => form.selectedDate === d.toISOString().slice(0, 10);

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

  const handleSubmit = (e: React.FormEvent) => {
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
    onNext({
      ...form,
      services: form.services ?? [],
      selectedDate: form.selectedDate ?? null,
      rentalWeeks: form.rentalType === "week" ? Number(form.rentalWeeks ?? 1) : undefined,
      rentalMonths: form.rentalType === "custom" ? Number(form.rentalMonths ?? 1) : form.rentalType === "month" ? 1 : undefined,
    });
  };

  return (
    <Box sx={{ bgcolor: "#F9FAFB", py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h5" fontWeight={700} color="primary.main" textAlign="center">
              {t("infoForm.title")}
            </Typography>

            <Typography variant="body2" textAlign="center" color="text.secondary">
              {t("infoForm.desc")}
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField name="name" label={t("infoForm.name")} value={form.name} onChange={handleChange} fullWidth required />
                  <TextField name="phone" label={t("infoForm.phone")} value={form.phone} onChange={handleChange} fullWidth required />
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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

                <TextField name="note" label={t("infoForm.note")} value={form.note ?? ""} onChange={handleChange} fullWidth multiline minRows={2} />

                <Box>
                  <Typography variant="subtitle1" fontWeight={600} mb={1}>
                    {t("startDate.title")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {t("startDate.desc")}
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "repeat(3,1fr)", sm: "repeat(4,1fr)", md: "repeat(7,1fr)" },
                      gap: 1,
                    }}
                  >
                    {dateList.map((d) => {
                      const active = isSelected(d);
                      const label = formatDateLabelByLang(d, currentLang, bilingualDates);
                      return (
                        <Button
                          key={d.toISOString()}
                          variant={active ? "contained" : "outlined"}
                          onClick={() => handleDateSelect(d)}
                          sx={{
                            textTransform: "none",
                            borderRadius: 1,
                            py: 1.25,
                            px: 2,
                            justifyContent: "flex-start",
                            backgroundColor: active ? "primary.main" : "transparent",
                            color: active ? "white" : "text.primary",
                          }}
                        >
                          <Typography variant="caption" fontWeight={600}>
                            {label}
                          </Typography>
                        </Button>
                      );
                    })}
                  </Box>
                </Box>

                {/* --- Rental period selector (updated to use i18n keys) --- */}
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
                      <FormControlLabel
                        value="week"
                        control={<Radio />}
                        label={t("rental.period.week", "Theo tuần")}
                      />
                      <FormControlLabel
                        value="month"
                        control={<Radio />}
                        label={t("rental.period.month", "Theo tháng")}
                      />
                      <FormControlLabel
                        value="custom"
                        control={<Radio />}
                        label={t("rental.period.custom", "Tùy chỉnh (số tháng)")}
                      />
                    </RadioGroup>

                    {form.rentalType === "week" && (
                      <Box sx={{ mt: 1, display: "flex", gap: 2, alignItems: "center", maxWidth: 260 }}>
                        <TextField
                          label={t("rental.period.weeksLabel", "Số tuần")}
                          type="number"
                          inputProps={{ min: 1, max: 4 }}
                          value={form.rentalWeeks ?? ""}
                          onChange={(e) => handleRentalWeeksChange(e.target.value)}
                          helperText={t(
                            "rental.period.weeksHelp",
                            "Chọn từ 1 đến 4 tuần. Giá = giá tháng × 0.3 × số tuần"
                          )}
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

                <Box>
                  <Typography variant="subtitle1" fontWeight={600} mb={1}>
                    {t("infoForm.chooseServices")}
                  </Typography>
                  {loadingServices ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <Stack spacing={1}>
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

                <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
                  <Button variant="outlined" onClick={onBack}>
                    {t("actions.back")}
                  </Button>
                  <Button variant="contained" type="submit">
                    {t("actions.next")}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
