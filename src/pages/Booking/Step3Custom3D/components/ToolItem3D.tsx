import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ButtonBase,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Fade,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ModelViewer from "./ModelViewer";

export type ModelSpec =
  | { width: number; depth: number; height: number }
  | undefined;

type ToolItem3DProps = {
  id: string;
  labelVi: string;
  labelEn?: string;
  showBilingual?: boolean;
  modelUrl: string;
  count: number;
  specs?: ModelSpec;
  size?: number;
  disabled?: boolean;
  missingTranslation?: boolean;
  onAdd: (id: string) => void;
  onRemoveOne?: (id: string) => void;
  onRemoveAll?: (id: string) => void;
  removeOneLabel?: string;
  removeAllLabel?: string;
  removeDisabled?: boolean;
};

export default function ToolItem3D({
  id,
  labelVi,
  labelEn = "",
  showBilingual = false,
  modelUrl,
  count,
  specs,
  size = 120,
  disabled = false,
  onAdd,
  onRemoveOne,
  onRemoveAll,
  removeOneLabel = "Remove one",
  removeAllLabel = "Remove all",
  removeDisabled = false,
}: ToolItem3DProps) {
  const [hovered, setHovered] = React.useState(false);
  const showEn = showBilingual && labelEn && labelEn !== labelVi;

  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        margin: 1,
        zIndex: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ButtonBase
        onClick={() => onAdd(id)}
        disabled={disabled}
        sx={{
          width: size,
          height: size + 68,
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          border: (theme) => `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
          position: "relative",
          backgroundColor: (theme) =>
            disabled ? theme.palette.action.disabledBackground : "#fff",
          transition: "transform 0.18s ease, box-shadow 0.18s ease",
          boxShadow: hovered ? "0 3px 12px rgba(0,0,0,0.12)" : "0 1px 5px rgba(0,0,0,0.04)",
          "&:hover": { transform: "translateY(-2px)" },
        }}
        focusRipple
        aria-label={labelVi + (showEn ? ` / ${labelEn}` : "")}
      >
        <div style={{ width: size, height: size, pointerEvents: "none" }}>
          <Canvas camera={{ position: [2.5, 1.5, 2.5], fov: 45 }}>
            <ambientLight intensity={0.9} />
            <directionalLight position={[3, 3, 3]} intensity={1.1} />
            <Suspense fallback={null}>
              <ModelViewer url={modelUrl} />
            </Suspense>
          </Canvas>
        </div>

        <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 700, color: "text.primary", lineHeight: 1 }}>
          {labelVi}
        </Typography>
        {showEn && <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>{labelEn}</Typography>}
        {specs && (
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1, mt: 0.25 }}>
            {`${specs.width}×${specs.depth}×${specs.height} m`}
          </Typography>
        )}
      </ButtonBase>

      {count > 0 && (
        <Box
          sx={{
            position: "absolute",
            top: 6,
            right: 8,
            bgcolor: "rgba(0,0,0,0.75)",
            color: "#fff",
            borderRadius: "8px",
            px: 0.7,
            fontSize: 12,
            fontWeight: 600,
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          x{count}
        </Box>
      )}

      <Fade in={hovered && count > 0}>
        <Box
          sx={{
            position: "absolute",
            bottom: 6,
            width: size,
            left: 0,
            right: 0,
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
            gap: 1.2,
            zIndex: 10,
            pointerEvents: "auto",
          }}
        >
          <Tooltip title={removeOneLabel}>
            <span style={{ pointerEvents: "auto" }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!removeDisabled) onRemoveOne?.(id);
                }}
                disabled={removeDisabled}
                aria-label="remove-one"
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: "rgba(255,255,255,0.95)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                  "&:hover": !removeDisabled ? { bgcolor: "rgba(255,230,230,1)" } : {},
                }}
              >
                <RemoveCircleOutlineIcon fontSize="small" sx={{ color: removeDisabled ? "rgba(0,0,0,0.26)" : "#e53935" }} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={removeAllLabel}>
            <span style={{ pointerEvents: "auto" }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!removeDisabled) onRemoveAll?.(id);
                }}
                disabled={removeDisabled}
                aria-label="remove-all"
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: "rgba(255,255,255,0.95)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                  "&:hover": !removeDisabled ? { bgcolor: "rgba(255,230,230,1)" } : {},
                }}
              >
                <DeleteOutlineIcon fontSize="small" sx={{ color: removeDisabled ? "rgba(0,0,0,0.26)" : "#e53935" }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Fade>
    </Box>
  );
}
