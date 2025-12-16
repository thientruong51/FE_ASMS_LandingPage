import { Box, Stack, Typography } from "@mui/material";

export default function ContractHeader({ order }: { order: any }) {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        border: "1px solid #E0E0E0",
        p: 5,
        textAlign: "center",
        fontFamily: "Times New Roman, Roboto, serif",
      }}
    >
      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={700}>
          HỢP ĐỒNG THUÊ KHO
        </Typography>
        <Typography variant="subtitle2" sx={{ fontStyle: "italic" }}>
          WAREHOUSE LEASE AGREEMENT
        </Typography>

        <Typography mt={2}>
          Số hợp đồng: {order?.orderCode}
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
          Contract No.: {order?.orderCode}
        </Typography>

        <Typography mt={1}>
          Ngày ký: {new Date().toLocaleDateString("vi-VN")}
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
          Signing Date: {new Date().toLocaleDateString("en-GB")}
        </Typography>
      </Stack>
    </Box>
  );
}
