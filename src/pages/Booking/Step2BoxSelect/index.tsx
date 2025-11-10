import  { useState } from "react";
import {
  Container,
  Stack,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Box,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import BoxList from "./components/BoxList";

export default function Step2BoxSelect({
  selected,
  onNext,
  onBack,
}: {
  selected?: any[]; // previous selection if any
  onNext: (payload: any) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation("booking");
  const [selectedBoxes, setSelectedBoxes] = useState<any[]>(selected ?? []);
  const [goodsTypes, setGoodsTypes] = useState<string[]>([]);

  const goodsKeys = ["fragile", "electronics", "cold", "heavy"];

  const toggleGoods = (key: string) =>
    setGoodsTypes((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));

  const handleNext = () => {
    if (selectedBoxes.length === 0) return;
    const payload = {
      boxes: selectedBoxes,
      goodsTypes,
      totalMonthly: selectedBoxes.reduce(
        (s: number, b: any) => s + (b.priceMonthValue ?? 0) * (b.quantity ?? 1),
        0
      ),
    };
    onNext(payload);
  };

  return (
    <Container maxWidth="lg" sx={{ height: "100vh", display: "flex", flexDirection: "column", py: 3 }}>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h4" fontWeight={700} color="primary.main" textAlign="center">
          {t("step2_box.title", "Chọn hộp")}
        </Typography>

        <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={760}>
          {t("step2_box.desc", "Chọn một hoặc nhiều loại hộp, điều chỉnh số lượng cho mỗi loại giống như 1 giỏ hàng, rồi chọn loại hàng hóa.")}
        </Typography>
      </Stack>

      {/* main content: BoxList + goods selection */}
      <Box sx={{ flex: 1, overflow: "auto", width: "100%", mt: 2 }}>
        <Paper sx={{ p: 3 }}>
          {/* BoxList provides onChange selected array */}
          <BoxList initialSelected={selectedBoxes} onChange={(arr) => setSelectedBoxes(arr)} />

          {/* goods selection block */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" fontWeight={700} textAlign="center" gutterBottom>
              {t("chooseGoods", "Chọn loại hàng hóa / Goods types")}
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
              {goodsKeys.map((k) => (
                <FormControlLabel
                  key={k}
                  control={<Checkbox checked={goodsTypes.includes(k)} onChange={() => toggleGoods(k)} />}
                  label={<Typography variant="body2">{t(`goods.${k}`, k)}</Typography>}
                />
              ))}
            </Stack>
          </Box>
        </Paper>
      </Box>

     <Box sx={{ display: "flex", justifyContent: "center" }}>
  <Stack direction="row" spacing={2}>
    <Button variant="outlined" onClick={onBack}>
      {t("step2_box.back", "Quay lại")}
    </Button>
    <Button
      variant="contained"
      disabled={selectedBoxes.length === 0}
      onClick={handleNext}
    >
      {t("step2_box.next", "Tiếp theo")}
    </Button>
  </Stack>
</Box>

    </Container>
  );
}
