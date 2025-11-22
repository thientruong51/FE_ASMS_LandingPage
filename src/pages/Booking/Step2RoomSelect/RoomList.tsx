import { Stack, CircularProgress, Box, Typography } from "@mui/material";
import RoomCard from "./RoomCard";
import { useEffect, useState } from "react";
import { fetchStorageTypes } from "../../../api/storageType";
import { fetchStorages, type StorageApi } from "../../../api/storage";
import { useGLTF } from "@react-three/drei";
import { useTranslation } from "react-i18next";


const LOCAL_TEST_IMAGE = "/mnt/data/97afeeea-4814-4a56-80b1-9d5b4ee6a4b6.png";

function mapApiNameToI18nKey(name: string): "small" | "medium" | "large" | null {
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
  const [rooms, setRooms] = useState<
    {
      id: string;
      type: "small" | "medium" | "large";
      area: string;
      dimension: string;
      price: string;
      model: string;
      available: number;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchStorageTypes(),
      fetchStorages("BLD002", 1, 1000),
      fetchStorages("BLD003", 1, 1000),
    ])
      .then(([typesData, storagesBld2, storagesBld3]) => {
        if (!mounted) return;

        const combined: StorageApi[] = [...storagesBld2, ...storagesBld3].filter(
          (s) => s && s.status === "Ready" && s.isActive === true
        );

        const countsByTypeName = combined.reduce<Record<string, number>>((acc, cur) => {
          const name = (cur.storageTypeName ?? "").toString().toLowerCase();
          if (!name) return acc;
          acc[name] = (acc[name] ?? 0) + 1;
          return acc;
        }, {});

        const sizeFiltered = typesData.filter((d) => {
          const lower = d.name.toLowerCase();
          if (/warehouse|ware ?house|oversize|nha_kho|nha ?kho/i.test(lower)) return false;
          if (!/small|medium|large/i.test(lower)) return false;
          if (!d.imageUrl) return false;
          return true;
        });

        let finalList = sizeFiltered.filter((d) => {
          const ac = isAC(d.name);
          return hasAC ? ac : !ac;
        });

        if (finalList.length === 0) finalList = sizeFiltered;

        const locale = i18n.language === "vi" ? "vi-VN" : "en-US";

        const mapped = finalList
          .map((d) => {
            const i18nKey = mapApiNameToI18nKey(d.name);
            if (!i18nKey) return null;

            const exactKey = d.name.toLowerCase(); 
            const baseKey = i18nKey;
            const variantKey = `${baseKey}ac`;

            const available =
              (countsByTypeName[exactKey] ?? 0) +
              (countsByTypeName[baseKey] ?? 0) +
              (countsByTypeName[variantKey] ?? 0);

            if (available <= 0) return null;

            const price = d.price == null ? "—" : `${d.price.toLocaleString(locale)} đ`;

            try {
              useGLTF.preload(d.imageUrl as string);
            } catch {}

            return {
              id: d.storageTypeId.toString(),
              type: i18nKey,
              area: `${(d.area ?? d.length * d.width).toFixed(2)} m²`,
              dimension: `${d.length} x ${d.width} x ${d.height} m`,
              price,
              model: (d.imageUrl as string) ?? LOCAL_TEST_IMAGE,
              available,
            };
          })
          .filter(Boolean) as {
            id: string;
            type: "small" | "medium" | "large";
            area: string;
            dimension: string;
            price: string;
            model: string;
            available: number;
          }[];

        setRooms(mapped);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message ?? "Unknown error");
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [hasAC, i18n.language]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" textAlign="center">
        Lỗi tải dữ liệu: {error}
      </Typography>
    );

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
