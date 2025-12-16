import { Stack, CircularProgress, Box, Typography } from "@mui/material";
import RoomCard from "./RoomCard";
import { useEffect, useState } from "react";
import { fetchStorageTypes } from "../../../api/storageType";
import { fetchStorages, type StorageApi } from "../../../api/storage";
import { useTranslation } from "react-i18next";

const LOCAL_TEST_IMAGE = "/placeholder-room.glb";

function mapApiNameToI18nKey(
  name: string
): "small" | "medium" | "large" | null {
  const n = name.toLowerCase();
  if (n.includes("small")) return "small";
  if (n.includes("medium")) return "medium";
  if (n.includes("large")) return "large";
  return null;
}

function isAC(name: string) {
  const n = name.toLowerCase();
  return n.includes("ac") || n.includes("may_lanh");
}

const BUILDING_CODE_BY_MODE = {
  normal: "BLD002",
  ac: "BLD003",
};

type RoomUI = {
  id: string;
  type: "small" | "medium" | "large";
  area: string;
  dimension: string;
  price: string;
  model: string;
  available: number;
};

export default function RoomList({
  hasAC,
  selectedId,
  onSelect,
}: {
  hasAC: boolean;
  selectedId: string;
  onSelect: (id: string, type: string) => void;
}) {
  const { i18n } = useTranslation();
  const [rooms, setRooms] = useState<RoomUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const buildingCode = hasAC
      ? BUILDING_CODE_BY_MODE.ac
      : BUILDING_CODE_BY_MODE.normal;

    Promise.all([
      fetchStorageTypes(),
      fetchStorages(buildingCode, 1, 1000),
    ])
      .then(([typesData, storages]) => {
        if (!mounted) return;


        const readyStorages = storages.filter(
          (s: StorageApi) =>
            s.status === "Ready" && s.isActive === true
        );


        const countsByTypeName = readyStorages.reduce<Record<string, number>>(
          (acc, cur) => {
            const key = cur.storageTypeName.toLowerCase();
            acc[key] = (acc[key] ?? 0) + 1;
            return acc;
          },
          {}
        );

        const validTypes = typesData.filter((d) => {
          const lower = d.name.toLowerCase();

          if (/warehouse|nha_kho|kho_lon/i.test(lower)) return false;
          if (!/small|medium|large/i.test(lower)) return false;
          if (!d.imageUrl) return false;

          return hasAC ? isAC(d.name) : !isAC(d.name);
        });

        const locale = i18n.language === "vi" ? "vi-VN" : "en-US";


        const mapped: RoomUI[] = validTypes
          .map((d) => {
            const typeKey = mapApiNameToI18nKey(d.name);
            if (!typeKey) return null;

            const available =
              countsByTypeName[d.name.toLowerCase()] ?? 0;

            if (available <= 0) return null;

            return {
              id: d.storageTypeId.toString(),
              type: typeKey,
              area: `${(d.area ?? d.length * d.width).toFixed(2)} m²`,
              dimension: `${d.length} x ${d.width} x ${d.height} m`,
              price:
                d.price == null
                  ? "—"
                  : `${d.price.toLocaleString(locale)} đ`,
              model: d.imageUrl ?? LOCAL_TEST_IMAGE,
              available,
            };
          })
          .filter(Boolean) as RoomUI[];

        setRooms(mapped);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message ?? "Unknown error");
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [hasAC, i18n.language]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" textAlign="center">
        Lỗi tải dữ liệu: {error}
      </Typography>
    );
  }

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={4}
      justifyContent="center"
      alignItems="stretch"
      width="100%"
    >
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          {...room}
          selected={selectedId === room.id}
          onSelect={() => onSelect(room.id, room.type)}
        />
      ))}
    </Stack>
  );
}
