import  { lazy, Suspense, useRef, useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";

const Warehouse3DViewer = lazy(() => import("./Warehouse3DViewer"));

export default function TruckLoadCard() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const shelfCount = 72;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Card
      ref={ref}
      sx={{
        borderRadius: 3,
        bgcolor: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
        

          <Box sx={{ flex: 1, minWidth: 280 }}>
            {visible ? (
              <Suspense
                fallback={
                  <Box
                    height={350}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <CircularProgress size={32} />
                  </Box>
                }
              >
                <Warehouse3DViewer shelfCount={shelfCount} />
              </Suspense>
            ) : (
              <Box
                height={350}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography color="text.secondary" fontSize={13}>
                  Loading 3D preview…
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
