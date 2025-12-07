// Step2BoxSelect.tsx
import { useEffect, useState } from "react";
import {
  Container,
  Stack,
  Typography,
  Button,
  Paper,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import BoxList from "./components/BoxList";
import type { ContainerTypeApi } from "../../../api/containerType";
import { fetchContainerTypes } from "../../../api/containerType";
import { fetchProductTypes } from "../../../api/productType";
import type { ProductTypeApi } from "../../../api/productType";

export default function Step2BoxSelect({
  selected,
  onNext,
  onBack,
}: {
  selected?: any[] | any | null;
  onNext: (payload: any) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation("booking");

  const initialSelected = Array.isArray(selected)
    ? selected
    : selected && typeof selected === "object"
    ? [selected]
    : [];

  const [selectedBoxes, setSelectedBoxes] = useState<any[]>(initialSelected);

  const [containers, setContainers] = useState<ContainerTypeApi[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [productTypes, setProductTypes] = useState<ProductTypeApi[] | null>(null);
  const [_productLoading, setProductLoading] = useState<boolean>(false);
  const [_productError, setProductError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetchContainerTypes()
      .then((res) => {
        if (!mounted) return;
        const filtered = (res ?? []).filter((x) => !String(x.type ?? "").includes("_Storage"));
        setContainers(filtered);
      })
      .catch((err) => {
        console.error(err);
        setError(t("fetchError", "Không tải được dữ liệu hộp. Vui lòng thử lại sau."));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [t]);

  useEffect(() => {
    let mounted = true;
    setProductLoading(true);
    setProductError(null);

    fetchProductTypes()
      .then((res) => {
        if (!mounted) return;
        const active = (res ?? []).filter((p) => p.isActive !== false);
        setProductTypes(active);
      })
      .catch((err) => {
        console.error(err);
        setProductError(t("fetchErrorProduct", "Không tải được loại hàng. Vui lòng thử lại sau."));
      })
      .finally(() => {
        if (mounted) setProductLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [t]);

  const totalMonthly = selectedBoxes.reduce(
    (s: number, b: any) => s + (b.price ?? b.priceMonthValue ?? 0) * (b.quantity ?? 1),
    0
  );
  const totalTypes = selectedBoxes.length;
  const totalItems = selectedBoxes.reduce((s: number, b: any) => s + (b.quantity ?? 1), 0);

  const handleNext = () => {
    if (selectedBoxes.length === 0) return;

    // map selectedBoxes -> boxesPayload
    const boxesPayload = selectedBoxes.map((b) => {
      // normalize product type ids
      let ids: number[] = [];
      if (Array.isArray(b.productTypeIds) && b.productTypeIds.length > 0) {
        ids = b.productTypeIds.map((x: any) => Number(x)).filter((x: unknown) => !Number.isNaN(x));
      } else if (Array.isArray(b.productTypes) && b.productTypes.length > 0) {
        ids = b.productTypes
          .map((p: any) => Number(p.id ?? p.productTypeId))
          .filter((x: any) => !Number.isNaN(x));
      } else {
        ids = [];
      }

      // normalize productTypes array
      const normalizedProductTypes =
        Array.isArray(b.productTypes) && b.productTypes.length > 0
          ? b.productTypes.map((p: any) => ({
              id: Number(p.id ?? p.productTypeId),
              name: p.name ?? p.title ?? String(p.id ?? p.productTypeId),
              isFragile: p.isFragile ?? false,
              canStack: p.canStack ?? false,
            }))
          : ids.map((id: number) => {
              const found = (productTypes ?? []).find(
                (pt) => Number(pt.productTypeId) === Number(id) || Number(pt.id) === Number(id)
              );
              return {
                id: Number(id),
                name: found?.name ?? `#${id}`,
                isFragile: found?.isFragile ?? false,
                canStack: found?.canStack ?? false,
              };
            });

      // detect oversize (either explicit flag or id prefix)
      const isOversize = Boolean(b.isOversize === true || String(b.id ?? "").startsWith("oversize-"));

      // base payload
      const base = {
        id: String(b.id ?? b.containerTypeId ?? ""),
        label: b.label ?? b.name ?? "",
        quantity: Number(b.quantity ?? 1),
        price: Number(b.price ?? b.priceMonthValue ?? 0),
        imageUrl: b.imageUrl ?? b.modelUrl ?? null,
        productTypeIds: ids,
        productTypes: normalizedProductTypes,
      };

      // attach oversize flat fields (in meters) only when oversize
      if (isOversize) {
        return {
          ...base,
          isOversize: true,
          length: typeof b.length === "number" ? b.length : b.length ? Number(b.length) : undefined,
          width: typeof b.width === "number" ? b.width : b.width ? Number(b.width) : undefined,
          height: typeof b.height === "number" ? b.height : b.height ? Number(b.height) : undefined,
        };
      }

      return base;
    });

    const masterProductTypes = Array.isArray(productTypes)
      ? productTypes.map((pt) => ({
          id: Number(pt.productTypeId ?? pt.id),
          name: pt.name,
          isFragile: pt.isFragile,
          canStack: pt.canStack,
          description: pt.description ?? null,
        }))
      : [];

    const payload = {
      boxes: boxesPayload,
      productTypes: masterProductTypes,
      selectedProductTypeIds: Array.from(new Set(boxesPayload.flatMap((b) => b.productTypeIds ?? []))),
      totalMonthly,
      totalTypes,
      totalItems,
    };

    onNext(payload);
  };

  return (
    <Container maxWidth="lg" sx={{ height: "auto", display: "flex", flexDirection: "column", py: 3 }}>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h4" fontWeight={700} color="primary.main" textAlign="center">
          {t("step2_box.title", "Chọn hộp")}
        </Typography>

        <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={760}>
          {t(
            "step2_box.desc",
            "Chọn một hoặc nhiều loại hộp, điều chỉnh số lượng cho mỗi loại giống như 1 giỏ hàng, rồi chọn loại hàng hóa."
          )}
        </Typography>
      </Stack>

      {/* main content */}
      <Box sx={{ flex: 1, overflow: "auto", width: "102%", mt: 2 }}>
        <Paper sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : containers && containers.length > 0 ? (
            <BoxList
              initialSelected={selectedBoxes}
              boxes={containers}
              productTypes={productTypes ?? []}
              onChange={(arr) => setSelectedBoxes(arr)}
            />
          ) : (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
              {t("noBoxes", "Không có dữ liệu loại hộp để hiển thị.")}
            </Typography>
          )}
        </Paper>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={onBack}>
            {t("step2_box.back", "Quay lại")}
          </Button>
          <Button variant="contained" disabled={selectedBoxes.length === 0} onClick={handleNext}>
            {t("step2_box.next", "Tiếp theo")}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
