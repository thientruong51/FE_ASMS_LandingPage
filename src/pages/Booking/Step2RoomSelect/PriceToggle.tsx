import { Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import { useTranslation } from "react-i18next";

export default function PriceToggle({
  hasAC,
  setHasAC,
}: {
  hasAC: boolean;
  setHasAC: (v: boolean) => void;
}) {
  const { t } = useTranslation("storageSize");

  return (
    <Stack direction="row" justifyContent="center">
      <ToggleButtonGroup
        color="primary"
        value={hasAC ? "ac" : "noac"}
        exclusive
        onChange={(_, v) => v && setHasAC(v === "ac")}
        sx={{
          borderRadius: 10,
          bgcolor: "#fff",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <ToggleButton value="noac" sx={{ px: 3 }}>
          <WarehouseIcon sx={{ mr: 1 }} />
          {t("toggle.noAC")}
        </ToggleButton>
        <ToggleButton value="ac" sx={{ px: 3 }}>
          <AcUnitIcon sx={{ mr: 1 }} />
          {t("toggle.ac")}
        </ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}
