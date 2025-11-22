import { useEffect, useState } from "react";
import {
  Box,
  Stack,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Checkbox,
  ListItemText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import BoxCard from "./BoxCard";
import { useTranslation } from "react-i18next";
import type { ProductTypeApi } from "../../../../api/productType";
import type { ContainerTypeApi } from "../../../../api/containerType";

type SelectedItem = {
  id: string;
  quantity?: number;
  label?: string;
  price?: number;
  imageUrl?: string | null;
  productTypeIds?: number[]; 
  productTypeNames?: string[]; 
  [k: string]: any;
};

export default function BoxList({
  boxes,
  initialSelected,
  onChange,
  productTypes = [],
}: {
  boxes?: ContainerTypeApi[];
  initialSelected?: SelectedItem[] | Record<string, SelectedItem>;
  onChange: (selected: SelectedItem[]) => void;
  productTypes?: ProductTypeApi[];
}) {
  const { t } = useTranslation("booking");

  const choices = (boxes ?? []).map((b) => ({
    id: String(b.containerTypeId),
    label: b.type || `Box ${b.containerTypeId}`,
    size: t("boxSizeTemplate", {
      length: b.length,
      width: b.width,
      height: b.height,
      defaultValue: `${b.length} x ${b.width} x ${b.height} cm`,
    }),
    priceMonth:
      b.price != null
        ? `${b.price.toLocaleString()} ${t("currencyVND")} ${t("perMonth")}`
        : t("priceNA", "Liên hệ"),
    priceMonthValue: b.price ?? 0,
    modelUrl: b.imageUrl ?? undefined,
  }));

  const makeInit = (initProp?: SelectedItem[] | Record<string, SelectedItem>) => {
    const init: Record<string, SelectedItem> = {};
    const arr: SelectedItem[] = Array.isArray(initProp)
      ? initProp
      : initProp && typeof initProp === "object"
      ? Object.values(initProp as Record<string, SelectedItem>)
      : [];

    arr.forEach((s) => {
      if (s && s.id) {
        init[String(s.id)] = {
          quantity: s.quantity ?? 1,
          productTypeIds: s.productTypeIds ?? s.productTypes?.map((p: any) => p.id) ?? [],
          productTypeNames: s.productTypeNames ?? (s.productTypes ? s.productTypes.map((p: any) => p.name) : []),
          ...s,
        };
      }
    });

    return init;
  };

  const [selected, setSelected] = useState<Record<string, SelectedItem>>(() => makeInit(initialSelected));

  useEffect(() => {
    setSelected(makeInit(initialSelected));
  }, [JSON.stringify(initialSelected)]); 

  useEffect(() => {
    const arr = Object.values(selected).map((it) => ({
      ...it,
      productTypeIds: it.productTypeIds ?? [],
      productTypeNames: it.productTypeNames ?? [],
    }));
    onChange(arr);
  }, [selected]);

  const toggleSelect = (choice: any) =>
    setSelected((prev) => {
      const copy = { ...prev };
      if (copy[choice.id]) delete copy[choice.id];
      else
        copy[choice.id] = {
          id: choice.id,
          label: choice.label,
          quantity: 1,
          price: choice.priceMonthValue ?? 0,
          imageUrl: choice.modelUrl ?? null,
          productTypeIds: [],
          productTypeNames: [],
        };
      return copy;
    });

  const changeQty = (id: string, delta: number) =>
    setSelected((prev) => {
      const copy = { ...prev };
      if (!copy[id]) return prev;
      copy[id] = { ...copy[id], quantity: Math.max(1, (copy[id].quantity ?? 1) + delta) };
      return copy;
    });

  const setProductTypesForBox = (boxId: string, ids: number[]) =>
    setSelected((prev) => {
      const copy = { ...prev };
      const cur = copy[boxId];
      if (!cur) return prev;
      const names = ids
        .map((id) => productTypes.find((p) => p.productTypeId === id)?.name ?? String(id))
        .filter(Boolean) as string[];
      copy[boxId] = {
        ...cur,
        productTypeIds: ids,
        productTypeNames: names,
      };
      return copy;
    });

  const totalMonthly = Object.values(selected).reduce(
    (s: number, it: any) => s + (it.price ?? 0) * (it.quantity ?? 1),
    0
  );

  const getSelectValue = (isSelected: boolean, selectedIds?: number[]) => (isSelected ? selectedIds ?? [] : []);

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
      <Box
        sx={(theme) => ({
          display: "flex",
          flexDirection: "row",
          gap: 2,
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
        {choices.map((box) => {
          const isSelected = Boolean(selected[box.id]);
          const qty = selected[box.id]?.quantity ?? 1;
          const selectedIds = selected[box.id]?.productTypeIds ?? [];

          return (
            <Box key={box.id} className="cardWrapper">
              <BoxCard priceWeek="" {...box} selected={isSelected} onSelect={() => toggleSelect(box)} />

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

              {/* Multi-select dropdown */}
              <Box sx={{ mt: 1, px: 1 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id={`pt-label-${box.id}`}>{t("chooseGoodsPerBox", "Chọn loại hàng")}</InputLabel>
                  <Select
                    labelId={`pt-label-${box.id}`}
                    multiple
                    value={getSelectValue(isSelected, selectedIds)}
                    onChange={(e) => {
                      const v = e.target.value;
                      const arr = Array.isArray(v) ? v.map((x) => Number(x)) : [];
                      setProductTypesForBox(box.id, arr);
                    }}
                    renderValue={(selectedVals) => {
                      const arr = (selectedVals as number[]).map((id) => productTypes.find((p) => p.productTypeId === id)?.name || "").filter(Boolean);
                      if (arr.length === 0) return t("none", "Không chọn");
                      return (
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          {arr.map((n) => (
                            <Chip key={n} label={n} size="small" sx={{ ml: 0.3 }} />
                          ))}
                        </Stack>
                      );
                    }}
                    label={t("chooseGoodsPerBox", "Chọn loại hàng")}
                    disabled={!isSelected}
                  >
                    {productTypes.length === 0 ? (
                      <MenuItem disabled>{t("noProductTypes", "Không có loại hàng để chọn.")}</MenuItem>
                    ) : (
                      productTypes.map((pt) => (
                        <MenuItem key={pt.productTypeId} value={pt.productTypeId}>
                          <Checkbox checked={selectedIds.includes(pt.productTypeId)} />
                          <ListItemText
                            primary={pt.name}
                            secondary={pt.description}
                          />
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* summary */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", px: 1, flexWrap: "wrap", gap: 1 }}>
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
