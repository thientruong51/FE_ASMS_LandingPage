import { Stack } from "@mui/material";
import ToolItem3D from "./ToolItem3D";
import { MODELS } from "../constants/models";
import { MODEL_SPECS } from "../constants/modelSpecs";
import { useTranslation } from "react-i18next";

type ToolToolbarProps = {
  totalShelves: number;
  countByType: (type: string) => number;
  onAdd: (type: string) => void;
  onRemoveOne: (type: string) => void;
  onRemoveAll: (type: string) => void;
};

export default function ToolToolbar({
  totalShelves,
  countByType,
  onAdd,
  onRemoveOne,
  onRemoveAll,
}: ToolToolbarProps) {
  const {  i18n } = useTranslation("storageSize");
  const tEn = i18n.getFixedT("en", "storageSize");

  const currentLang = (i18n.language || "vi").toLowerCase();

  // resolve an action label with fallback
  const resolveActionLabel = (actionKey: string) => {
    const existsVi = i18n.exists(actionKey, { lng: "vi", ns: "storageSize" });
    const existsEn = i18n.exists(actionKey, { lng: "en", ns: "storageSize" });

    const viLabel = existsVi ? i18n.t(actionKey, { lng: "vi", ns: "storageSize" }) : "";
    const enLabel = existsEn ? tEn(actionKey) : "";

    if (currentLang.startsWith("en")) {
      return enLabel || viLabel || actionKey;
    }
    return viLabel || enLabel || actionKey;
  };

  const removeOneLabel = resolveActionLabel("actions.removeOne");
  const removeAllLabel = resolveActionLabel("actions.removeAll");

  const shelfCount = countByType("shelf");

  const boxKeys: Record<string, string> = {
    A: "custom3d.addBoxA",
    B: "custom3d.addBoxB",
    C: "custom3d.addBoxC",
    D: "custom3d.addBoxD",
  };

  const resolveLabel = (key: string) => {
    const existsVi = i18n.exists(key, { lng: "vi", ns: "storageSize" });
    const existsEn = i18n.exists(key, { lng: "en", ns: "storageSize" });

    const viLabel = existsVi ? i18n.t(key, { lng: "vi", ns: "storageSize" }) : "";
    const enLabel = existsEn ? tEn(key) : "";

    if (currentLang.startsWith("en")) {
      if (enLabel) return { labelVi: enLabel, missing: false };
      if (viLabel) return { labelVi: viLabel, missing: false };
      return { labelVi: key, missing: true };
    }

    if (viLabel) return { labelVi: viLabel, missing: false };
    if (enLabel) return { labelVi: enLabel, missing: false };
    return { labelVi: key, missing: true };
  };

  return (
    <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center" sx={{ mt: 1 }}>
      {/* ====== KỆ ====== */}
      {(() => {
        const { labelVi, missing } = resolveLabel("custom3d.addShelf");
        return (
          <ToolItem3D
            key="shelf"
            id="shelf"
            labelVi={labelVi}
            labelEn=""
            showBilingual={false}
            modelUrl={MODELS.shelf}
            specs={MODEL_SPECS.shelf}
            count={shelfCount}
            missingTranslation={missing}
            onAdd={onAdd}
            onRemoveOne={onRemoveOne}
            onRemoveAll={onRemoveAll}
            // ❗ Chỉ disable hành động "thêm" khi đạt giới hạn
            disabled={shelfCount >= totalShelves}
            // ❗ Nhưng vẫn cho phép xóa kệ
            removeDisabled={false}
            removeOneLabel={removeOneLabel}
            removeAllLabel={removeAllLabel}
          />
        );
      })()}

      {/* ====== CÁC THÙNG ====== */}
      {(["A", "B", "C", "D"] as const).map((type) => {
        const key = boxKeys[type];
        const { labelVi, missing } = resolveLabel(key);
        return (
          <ToolItem3D
            key={type}
            id={type}
            labelVi={labelVi}
            labelEn=""
            showBilingual={false}
            modelUrl={MODELS.boxes[type]}
            specs={MODEL_SPECS[type]}
            count={countByType(type)}
            missingTranslation={missing}
            onAdd={onAdd}
            onRemoveOne={onRemoveOne}
            onRemoveAll={onRemoveAll}
            removeOneLabel={removeOneLabel}
            removeAllLabel={removeAllLabel}
          />
        );
      })}
    </Stack>
  );
}
