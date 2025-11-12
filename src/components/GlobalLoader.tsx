import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";

export default function GlobalLoader({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleLoad = () => setLoading(false);

    // Nếu DOM và tài nguyên đã sẵn sàng
    if (document.readyState === "complete") {
      setLoading(false);
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          color: "text.primary",
          zIndex: 2000,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
