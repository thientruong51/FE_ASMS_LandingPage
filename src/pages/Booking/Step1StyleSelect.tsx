import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";

function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter(Boolean) as string[];
  if (v && typeof v === "object") return Object.values(v as Record<string, unknown>).map(String);
  if (typeof v === "string") {
    return v.split("|").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

type StyleKey = "self" | "full";

type Props = {
  onNext: (style: StyleKey) => void;
};

export default function Step1StyleSelect({ onNext }: Props) {
  const { t } = useTranslation("booking");
  const [selected, setSelected] = useState<StyleKey | null>(null);

  const options = useMemo(
    () => {
      const selfPoints = toArray(t("step1.self.points", { returnObjects: true }));
      const fullPoints = toArray(t("step1.full.points", { returnObjects: true }));

      return [
        {
          key: "self" as const,
          title: t("step1.self.title"),
          desc: t("step1.self.desc"),
          points: selfPoints,
          img: t("step1.self.img"),
        },
        {
          key: "full" as const,
          title: t("step1.full.title"),
          desc: t("step1.full.desc"),
          points: fullPoints,
          img: t("step1.full.img"),
        },
      ];
    },
    [t]
  );

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={700} color="primary.main">
        {t("step1.title")}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t("step1.desc")}
      </Typography>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems="stretch"
      >
        {options.map((opt) => (
          <Card
            key={opt.key}
            variant="outlined"
            sx={{
              flex: 1,
              borderRadius: 3,
              borderColor: selected === opt.key ? "primary.main" : "divider",
              boxShadow:
                selected === opt.key
                  ? "0 0 0 2px rgba(60,189,150,0.25)"
                  : "none",
              transition: "all .2s ease",
            }}
          >
            <CardActionArea onClick={() => setSelected(opt.key)}>
              <CardContent>
                <Stack spacing={1.25}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700}>
                      {opt.title}
                    </Typography>
                    {selected === opt.key && <CheckCircleIcon color="primary" />}
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    {opt.desc}
                  </Typography>

                  <Stack spacing={0.75} sx={{ mt: 1 }}>
                    {toArray(opt.points).map((p, i) => (
                      <Stack key={i} direction="row" spacing={1} alignItems="center">
                        <CheckCircleIcon sx={{ fontSize: 18, color: "primary.main" }} />
                        <Typography variant="body2" color="text.secondary">
                          {p}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  {typeof opt.img === "string" && opt.img && (
                    <Box
                      component="img"
                      src={opt.img}
                      alt=""
                      sx={{
                        mt: 1.5,
                        width: "100%",
                        height: 300,
                        objectFit: "cover",
                        borderRadius: 2,
                      }}
                    />
                  )}
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>

      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          disabled={!selected}
          onClick={() => selected && onNext(selected)}
        >
          {t("step1.next")}
        </Button>
      </Stack>
    </Stack>
  );
}
