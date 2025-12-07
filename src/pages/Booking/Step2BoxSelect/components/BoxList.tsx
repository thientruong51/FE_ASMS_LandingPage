// BoxList.tsx
import { useEffect, useRef, useState } from "react";
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
  TextField,
  Paper,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
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
  dims?: { length: number; width: number; height: number }; // in cm for UI
  volume?: number; // in m^3
  // flat oversize fields (only present for oversize items) in meters
  length?: number;
  width?: number;
  height?: number;
  isOversize?: boolean;
  [k: string]: any;
};

type OversizeEntry = {
  id: string;
  dims: { length: number; width: number; height: number }; // cm
  volume: number; // m^3
  price: number;
  quantity: number;
  productTypeIds: number[];
  productTypeNames: string[];
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

  // ---------------- constants for layout ----------------
  const CARD_W = 190; // fixed card width in px
  const GAP_PX = 18;

  // the temporary image you provided for oversize
  const OVERSIZE_IMG =
    "https://res.cloudinary.com/dkfykdjlm/image/upload/v1762190192/LOGO-remove_1_1_wj05gw.png";

  // ---------------- price / volume helpers ----------------
  const priceMonthFromVolume = (vol: number) => {
    if (vol >= 0.5 && vol <= 1.5) return 180000;
    if (vol >= 1.6 && vol <= 3.5) return 350000;
    if (vol >= 3.6 && vol <= 5.0) return 480000;
    if (vol >= 5.1 && vol <= 7.0) return 650000;
    if (vol >= 7.1 && vol <= 10.0) return 900000;
    if (vol > 10.0) return Math.round(320000 * vol);
    return 180000;
  };
  // dims are in cm -> convert to m^3 by dividing by 1_000_000
  const volumeFromDims = (d: { length: number; width: number; height: number }) =>
    Math.max(0, (d.length * d.width * d.height) / 1_000_000);

  // ---------------- base choices (normal boxes) ----------------
  const baseChoices = (boxes ?? []).map((b) => ({
    id: String(b.containerTypeId),
    label: b.type || `Box ${b.containerTypeId}`,
    size: t("boxSizeTemplate", {
      length: b.length,
      width: b.width,
      height: b.height,
      defaultValue: `${b.length} x ${b.width} x ${b.height} cm`,
    }),
    priceMonth: b.price ?? 0,
    priceWeek: "",
    modelUrl: b.imageUrl ?? undefined,
    dims: { length: b.length, width: b.width, height: b.height }, // kept for reference (cm)
  }));

  // ---------------- oversize state (multiple entries) ----------------
  const [oversizes, setOversizes] = useState<OversizeEntry[]>([]);
  const idCounterRef = useRef(1);
  const makeOversizeId = () => `oversize-${idCounterRef.current++}`;

  // create a default oversize on first mount if none exist
  useEffect(() => {
    // corrected condition: when none exist, create a default oversize
    if (oversizes.length === -1) {
      // default dims 100x100x100 cm => 1.000 m3
      addOversize({ length: 100, width: 100, height: 100 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // ---------------- selection state (boxes + oversizes selected) ----------------
  const makeInit = (initProp?: SelectedItem[] | Record<string, SelectedItem>) => {
    const init: Record<string, SelectedItem> = {};
    const arr: SelectedItem[] = Array.isArray(initProp)
      ? initProp
      : initProp && typeof initProp === "object"
      ? Object.values(initProp as Record<string, SelectedItem>)
      : [];

    arr.forEach((s) => {
      if (s && s.id) {
        // detect oversize by id prefix or explicit flag
        const isOversize = String(s.id).startsWith("oversize-") || s.isOversize === true;

        // Create dims (cm) for UI:
        // - prefer s.dims if provided (assume in cm)
        // - otherwise if it's oversize and flat fields length/width/height exist assume they are in meters -> convert to cm
        const dims =
          s.dims ??
          (isOversize && (typeof s.length === "number" || typeof s.width === "number" || typeof s.height === "number")
            ? {
                length: Math.round((s.length ?? 0) * 100),
                width: Math.round((s.width ?? 0) * 100),
                height: Math.round((s.height ?? 0) * 100),
              }
            : undefined);

        // compute volume (m^3): prefer provided volume, otherwise compute from dims (cm)
        const computedVolume =
          typeof s.volume === "number" ? s.volume : dims ? volumeFromDims(dims) : undefined;

        init[String(s.id)] = {
          quantity: s.quantity ?? 1,
          productTypeIds: s.productTypeIds ?? s.productTypes?.map((p: any) => p.id) ?? [],
          productTypeNames:
            s.productTypeNames ?? (s.productTypes ? s.productTypes.map((p: any) => p.name) : []),
          dims: dims ? { ...dims } : undefined, // cm for UI
          volume: typeof computedVolume === "number" ? Number(computedVolume.toFixed(6)) : undefined,
          price: s.price ?? (typeof computedVolume === "number" ? priceMonthFromVolume(computedVolume) : 0),
          imageUrl: s.imageUrl ?? null,
          label: s.label,
          ...s,
          // only include flat length/width/height (in meters) for oversize items
          ...(isOversize && dims
            ? { length: (dims.length / 100), width: (dims.width / 100), height: (dims.height / 100), isOversize: true }
            : {}),
        };
      }
    });

    return init;
  };

  const [selected, setSelected] = useState<Record<string, SelectedItem>>(() =>
    makeInit(initialSelected)
  );

  // sync guards to avoid infinite loops
  const lastEmittedRef = useRef<string>("");
  const lastInitialJsonRef = useRef<string | null>(null);

  useEffect(() => {
    const incomingJson = JSON.stringify(initialSelected ?? {});
    if (lastInitialJsonRef.current !== incomingJson) {
      setSelected(makeInit(initialSelected));
      lastInitialJsonRef.current = incomingJson;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialSelected)]);

  useEffect(() => {
    const arr = Object.values(selected).map((it) => ({
      ...it,
      productTypeIds: it.productTypeIds ?? [],
      productTypeNames: it.productTypeNames ?? [],
    }));
    const payloadJson = JSON.stringify(arr);
    if (lastEmittedRef.current !== payloadJson) {
      lastEmittedRef.current = payloadJson;
      onChange(arr);
    }
  }, [selected, onChange]);

  // ---------------- actions for normal boxes ----------------
  const toggleSelect = (choice: any) =>
    setSelected((prev) => {
      const copy = { ...prev };
      if (copy[choice.id]) delete copy[choice.id];
      else
        copy[choice.id] = {
          id: choice.id,
          label: choice.label,
          quantity: 1,
          price: Number(choice.priceMonth ?? 0),
          imageUrl: choice.modelUrl ?? null,
          productTypeIds: [],
          productTypeNames: [],
          // keep dims reference but DO NOT add flat length/width/height for base boxes
          dims: choice.dims ?? undefined,
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

  const addOversize = (initialDims?: { length: number; width: number; height: number }) => {
    const dims = initialDims ?? { length: 100, width: 100, height: 100 }; // cm
    const vol = volumeFromDims(dims); // m^3
    const price = priceMonthFromVolume(vol);
    const id = makeOversizeId();
    const entry: OversizeEntry = {
      id,
      dims,
      volume: Number(vol.toFixed(6)),
      price,
      quantity: 1,
      productTypeIds: [],
      productTypeNames: [],
    };
    setOversizes((prev) => [...prev, entry]);

    // only oversize items get flat length/width/height (in meters)
    setSelected((prev) => ({
      ...prev,
      [id]: {
        id,
        label: t("oversizeLabel", { volume: entry.volume }),
        quantity: 1,
        price: entry.price,
        imageUrl: OVERSIZE_IMG,
        productTypeIds: [],
        productTypeNames: [],
        dims: entry.dims, // cm for UI
        volume: entry.volume,
        // convert cm -> m for flat fields to send in payload
        length: entry.dims.length / 100,
        width: entry.dims.width / 100,
        height: entry.dims.height / 100,
        isOversize: true,
      },
    }));
  };

  const removeOversize = (id: string) => {
    setOversizes((prev) => prev.filter((o) => o.id !== id));
    setSelected((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const updateOversizeDims = (id: string, dims: { length: number; width: number; height: number }) => {
    setOversizes((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const vol = volumeFromDims(dims);
        const price = priceMonthFromVolume(vol);
        return {
          ...o,
          dims,
          volume: Number(vol.toFixed(6)),
          price,
        };
      })
    );
    setSelected((prev) => {
      const cur = prev[id];
      if (!cur) return prev;
      const vol = volumeFromDims(dims);
      const price = priceMonthFromVolume(vol);
      const updated = {
        ...cur,
        dims, // cm for UI
        volume: Number(vol.toFixed(6)),
        price,
        label: t("oversizeLabel", { volume: Number(vol.toFixed(6)) }),
        // update flat fields (convert cm -> m)
        length: dims.length / 100,
        width: dims.width / 100,
        height: dims.height / 100,
        isOversize: true,
      };
      if (JSON.stringify(cur) === JSON.stringify(updated)) return prev;
      return { ...prev, [id]: updated };
    });
  };

  const setProductTypesForOversize = (id: string, ids: number[]) => {
    setOversizes((prev) => prev.map((o) => (o.id === id ? { ...o, productTypeIds: ids } : o)));
    setSelected((prev) => {
      const copy = { ...prev };
      const cur = copy[id];
      if (!cur) return prev;
      const names = ids
        .map((idv) => productTypes.find((p) => p.productTypeId === idv)?.name ?? String(idv))
        .filter(Boolean) as string[];
      copy[id] = { ...cur, productTypeIds: ids, productTypeNames: names };
      return copy;
    });
  };

  // ---------------- build choices: base + oversize (for display) ----------------

  const totalMonthly = Object.values(selected).reduce(
    (s: number, it: any) => s + Number(it.price ?? 0) * Number(it.quantity ?? 1),
    0
  );

  const getSelectValue = (isSelected: boolean, selectedIds?: number[]) =>
    isSelected ? selectedIds ?? [] : [];

  // ref to oversize strip for auto scroll
  const oversizeStripRef = useRef<HTMLDivElement | null>(null);

  // auto-scroll oversize strip to end when new oversize added
  useEffect(() => {
    if (!oversizeStripRef.current) return;
    oversizeStripRef.current.scrollTo({ left: oversizeStripRef.current.scrollWidth, behavior: "smooth" });
  }, [oversizes.length]);

  // ---------------- Render ----------------
  return (
    <Box sx={{ width: "100%", boxSizing: "border-box", px: 2 }}>
      {/* Title */}

      {/* Grid of base boxes (fixed card width columns) */}
      <Box sx={{ maxWidth: Math.max(5 * CARD_W + 4 * GAP_PX, 1200), mx: "auto", pb: 2 }}>
        <Box
          sx={{
            display: "grid",
            gap: `${GAP_PX}px`,
            justifyContent: "center",
            gridTemplateColumns: `repeat(auto-fit, minmax(${CARD_W}px, ${CARD_W}px))`,
          }}
        >
          {baseChoices.map((box) => {
            const isSelected = Boolean(selected[box.id]);
            const qty = selected[box.id]?.quantity ?? 1;
            const selectedIds = selected[box.id]?.productTypeIds ?? [];

            return (
              <Box key={box.id} className="cardWrapper" sx={{ width: `${CARD_W}px` }}>
                <BoxCard {...box} selected={isSelected} onSelect={() => toggleSelect(box)} />

                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mt: 1 }}>
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
                    {t("quantityLabel")}: {qty}
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

                <Box sx={{ mt: 1, px: 1 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id={`pt-label-${box.id}`}>{t("chooseGoodsPerBox")}</InputLabel>
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
                        const arr = (selectedVals as number[])
                          .map((id) => productTypes.find((p) => p.productTypeId === id)?.name || "")
                          .filter(Boolean);
                        if (arr.length === 0) return t("none");
                        return (
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            {arr.map((n) => (
                              <Chip key={n} label={n} size="small" sx={{ ml: 0.3 }} />
                            ))}
                          </Stack>
                        );
                      }}
                      label={t("chooseGoodsPerBox")}
                      disabled={!isSelected}
                    >
                      {productTypes.length === 0 ? (
                        <MenuItem disabled>{t("noProductTypes")}</MenuItem>
                      ) : (
                        productTypes.map((pt) => (
                          <MenuItem key={pt.productTypeId} value={pt.productTypeId}>
                            <Checkbox checked={selectedIds.includes(pt.productTypeId)} />
                            <ListItemText primary={pt.name} secondary={pt.description} />
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
      </Box>

      {/* Oversize operations: add button and anchored horizontal strip */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 12, mb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          {t("oversizeTitle")}
        </Typography>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={() => addOversize()}>
          {t("oversizeAdd")}
        </Button>
      </Stack>

      {/* Oversize strip: anchored, centered, horizontal scroll when many entries */}
      <Box
        ref={oversizeStripRef}
        sx={{
          display: "flex",
          gap: `${GAP_PX}px`,
          pb: 2,
          overflowX: oversizes.length > 1 ? "auto" : "visible",
          justifyContent: "center", // keep centered
          alignItems: "flex-start",
          whiteSpace: "nowrap",
        }}
      >
        {oversizes.map((o) => {
          const isSelected = Boolean(selected[o.id]);
          const qty = selected[o.id]?.quantity ?? o.quantity ?? 1;
          const selectedIds = selected[o.id]?.productTypeIds ?? o.productTypeIds ?? [];

          const choice = {
            id: o.id,
            label: t("oversizeLabel", { volume: o.volume.toFixed(6) }),
            size: `${o.dims.length} x ${o.dims.width} x ${o.dims.height} cm`,
            // pass the provided temp image as modelUrl so BoxCard will render it
            modelUrl: OVERSIZE_IMG,
            priceMonth: o.price,
            priceWeek: "",
          };

          return (
            <Box key={o.id} sx={{ width: `${CARD_W}px`, flex: "0 0 auto" }}>
              <BoxCard {...choice} selected={isSelected} onSelect={() => toggleSelect(choice)} />

              <Paper sx={{ p: 1, mt: 1 }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">{t("oversizeSizeLabel")}</Typography>
                    <IconButton size="small" onClick={() => removeOversize(o.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      label={t("oversizeDimensionD")}
                      size="small"
                      type="number"
                      value={o.dims.length}
                      onChange={(e) => updateOversizeDims(o.id, { ...o.dims, length: Number(e.target.value || 0) })}
                      sx={{ width: 88 }}
                    />
                    <TextField
                      label={t("oversizeDimensionR")}
                      size="small"
                      type="number"
                      value={o.dims.width}
                      onChange={(e) => updateOversizeDims(o.id, { ...o.dims, width: Number(e.target.value || 0) })}
                      sx={{ width: 88 }}
                    />
                    <TextField
                      label={t("oversizeDimensionC")}
                      size="small"
                      type="number"
                      value={o.dims.height}
                      onChange={(e) => updateOversizeDims(o.id, { ...o.dims, height: Number(e.target.value || 0) })}
                      sx={{ width: 88 }}
                    />
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      {t("oversizeVolume")}: {o.volume.toFixed(6)} m³
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {o.price.toLocaleString()} đ
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>

              <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mt: 1 }}>
                <IconButton size="small" onClick={() => isSelected && changeQty(o.id, -1)} disabled={!isSelected} sx={{ border: "1px solid", borderColor: "divider" }}>
                  <RemoveIcon fontSize="small" />
                </IconButton>

                <Typography variant="body2" sx={{ minWidth: 64, textAlign: "center" }}>
                  {t("quantityLabel")}: {qty}
                </Typography>

                <IconButton size="small" onClick={() => isSelected && changeQty(o.id, 1)} disabled={!isSelected} sx={{ border: "1px solid", borderColor: "divider" }}>
                  <AddIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Box sx={{ mt: 1 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id={`pt-label-${o.id}`}>{t("chooseGoodsPerBox")}</InputLabel>
                  <Select
                    labelId={`pt-label-${o.id}`}
                    multiple
                    value={getSelectValue(isSelected, selectedIds)}
                    onChange={(e) => {
                      const v = e.target.value;
                      const arr = Array.isArray(v) ? v.map((x) => Number(x)) : [];
                      setProductTypesForOversize(o.id, arr);
                    }}
                    renderValue={(selectedVals) => {
                      const arr = (selectedVals as number[]).map((id) => productTypes.find((p) => p.productTypeId === id)?.name || "").filter(Boolean);
                      if (arr.length === 0) return t("none");
                      return (
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          {arr.map((n) => (
                            <Chip key={n} label={n} size="small" sx={{ ml: 0.3 }} />
                          ))}
                        </Stack>
                      );
                    }}
                    label={t("chooseGoodsPerBox")}
                    disabled={!isSelected}
                  >
                    {productTypes.length === 0 ? (
                      <MenuItem disabled>{t("noProductTypes")}</MenuItem>
                    ) : (
                      productTypes.map((pt) => (
                        <MenuItem key={pt.productTypeId} value={pt.productTypeId}>
                          <Checkbox checked={(selectedIds as number[]).includes(pt.productTypeId)} />
                          <ListItemText primary={pt.name} secondary={pt.description} />
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
        <Typography variant="body2">{t("selectedCount")}: {Object.values(selected).length}</Typography>
        <Typography variant="body2" fontWeight={700}>
          {t("grandTotal")}: {totalMonthly.toLocaleString()} đ
        </Typography>
      </Box>
    </Box>
  );
}
