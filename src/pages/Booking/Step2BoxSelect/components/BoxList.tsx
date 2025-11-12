// BoxList.tsx
import { useEffect, useState } from "react";
import { Box, Stack, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import BoxCard from "./BoxCard";
import { MODELS } from "../../Step3Custom3D/constants/models";
import { MODEL_SPECS } from "../../Step3Custom3D/constants/modelSpecs";
import { useTranslation } from "react-i18next";

type SelectedItem = {
  id: string;
  quantity?: number;
  [k: string]: any;
};

export default function BoxList({
  initialSelected,
  onChange,
}: {
  // cho phép mảng hoặc object (Record) hoặc undefined
  initialSelected?: SelectedItem[] | Record<string, SelectedItem>;
  onChange: (selected: SelectedItem[]) => void;
}) {
  const { t } = useTranslation("booking");

  // --- fix: declare order as const so id is typed as 'A'|'B'|'C'|'D'
  const order = ["A", "B", "C", "D"] as const;
  type BoxId = typeof order[number]; // 'A' | 'B' | 'C' | 'D'

  const boxes = order.map((id) => {
    const spec = MODEL_SPECS[id as keyof typeof MODEL_SPECS] as {
      depth: number;
      width: number;
      height: number;
    };

    return {
      id,
      label: t(`boxes.${id}.label`, `Hộp ${id}`),
      size: t(`boxes.${id}.infoSize`, {
        depth: spec.depth,
        width: spec.width,
        height: spec.height,
      }),
      priceMonth: t(`boxes.${id}.priceMonth`, ""),
      priceMonthValue:
        id === "A" ? 35000 : id === "B" ? 50000 : id === "C" ? 60000 : 55000,
      modelUrl: (MODELS.boxes as Record<BoxId, string>)[id],
    };
  });

  // ========== Safe normalization of initialSelected ==========
  const [selected, setSelected] = useState<Record<string, SelectedItem>>(() => {
    const init: Record<string, SelectedItem> = {};

    // Normalize initialSelected into an array of items
    const arr: SelectedItem[] = Array.isArray(initialSelected)
      ? initialSelected
      : initialSelected && typeof initialSelected === "object"
      ? // If it's an object/map like { A: {...}, B: {...} } -> take values
        Object.values(initialSelected as Record<string, SelectedItem>)
      : [];

    arr.forEach((s) => {
      if (s && s.id) {
        // ensure quantity exists
        init[s.id] = { quantity: s.quantity ?? 1, ...s };
      }
    });

    return init;
  });

  useEffect(() => {
    onChange(Object.values(selected));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const toggleSelect = (box: any) =>
    setSelected((prev) => {
      const copy = { ...prev };
      if (copy[box.id]) delete copy[box.id];
      else copy[box.id] = { ...box, quantity: 1 };
      return copy;
    });

  const changeQty = (id: string, delta: number) =>
    setSelected((prev) => {
      const copy = { ...prev };
      if (!copy[id]) return prev;
      copy[id] = { ...copy[id], quantity: Math.max(1, (copy[id].quantity ?? 1) + delta) };
      return copy;
    });

  const totalMonthly = Object.values(selected).reduce(
    (s: number, it: any) => s + (it.priceMonthValue ?? 0) * (it.quantity ?? 1),
    0
  );

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1600,
        mx: "auto",
        boxSizing: "border-box",
        px: 2,
      }}
    >
      {/* Vùng hiển thị các thùng */}
      <Box
        sx={(theme) => ({
          display: "flex",
          flexDirection: "row",
          gap: 2,
          // default desktop: keep on one row (4 items)
          flexWrap: "nowrap",
          justifyContent: "center",
          overflowX: "hidden",
          pb: 2,

          "& > div.cardWrapper": {
            flex: "1 1 calc(25% - 8px)",
            maxWidth: "calc(25% - 8px)",
            boxSizing: "border-box",
            minWidth: 0,
          },

          [theme.breakpoints.down("lg")]: {
            flexWrap: "wrap",
            justifyContent: "center",
            "& > div.cardWrapper": {
              flex: "1 1 calc(50% - 8px)",
              maxWidth: "calc(50% - 8px)",
            },
          },

          [theme.breakpoints.down("sm")]: {
            "& > div.cardWrapper": {
              flex: "1 1 100%",
              maxWidth: "100%",
            },
          },
        })}
      >
        {boxes.map((box) => {
          const isSelected = Boolean(selected[box.id]);
          const qty = selected[box.id]?.quantity ?? 1;

          return (
            <Box key={box.id} className="cardWrapper">
              <BoxCard
                priceWeek=""
                {...box}
                selected={isSelected}
                onSelect={() => toggleSelect(box)}
              />

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="center"
                sx={{ mt: 1 }}
              >
                <IconButton
                  size="small"
                  onClick={() => isSelected && changeQty(box.id, -1)}
                  disabled={!isSelected}
                  sx={{ border: "1px solid", borderColor: "divider" }}
                  aria-label={t("decrease", "Giảm")}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>

                <Typography variant="body2" sx={{ minWidth: 64, textAlign: "center" }}>
                  {t("quantityLabel", "Số lượng")}: {qty}
                </Typography>

                <IconButton
                  size="small"
                  onClick={() => isSelected && changeQty(box.id, 1)}
                  disabled={!isSelected}
                  sx={{ border: "1px solid", borderColor: "divider" }}
                  aria-label={t("increase", "Tăng")}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          );
        })}
      </Box>

      {/* summary */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", px: 1 }}>
        <Typography variant="body2">
          {t("selectedCount", "Số loại đã chọn")}: {Object.values(selected).length}
        </Typography>
        <Typography variant="body2" fontWeight={700}>
          {t("grandTotal", "Tổng (tháng)")}: {totalMonthly.toLocaleString()} đ
        </Typography>
      </Box>
    </Box>
  );
}
