import { Box, Stack, Typography } from "@mui/material";

export default function ContractSignature({ }: { order: any }) {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        p: 5,
        border: "1px solid #E0E0E0",
        mt: 4,
        fontFamily: "Times New Roman, Roboto, serif",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", textAlign: "center" }}>
        {/* PARTY A */}
        <Stack spacing={2} sx={{ width: "45%" }}>
          <Typography fontWeight={700}>ĐẠI DIỆN BÊN A</Typography>
          <Typography variant="body2" sx={{ fontStyle: "italic" }}>
            Authorized Representative – Party A
          </Typography>

          <Typography fontWeight={600}>Chức danh: Giám đốc</Typography>
          <Typography variant="body2" sx={{ fontStyle: "italic" }}>
            Title: Director
          </Typography>

          <Box sx={{ height: 80 }} />

          <Typography>(Ký, ghi rõ họ tên)</Typography>
          <Typography variant="body2" sx={{ fontStyle: "italic" }}>
            (Signature, full name)
          </Typography>

          <Typography mt={2}>Ngày …… tháng …… năm ……</Typography>
          <Typography variant="body2" sx={{ fontStyle: "italic" }}>
            Date …… / …… / ……
          </Typography>
        </Stack>

        {/* PARTY B */}
        <Stack spacing={2} sx={{ width: "45%" }}>
          <Typography fontWeight={700}>ĐẠI DIỆN BÊN B</Typography>
          <Typography variant="body2" sx={{ fontStyle: "italic" }}>
            Authorized Representative – Party B
          </Typography>

          <Typography fontWeight={600}>Chức danh: Khách hàng</Typography>
          <Typography variant="body2" sx={{ fontStyle: "italic" }}>
            Title: Customer
          </Typography>

          <Box sx={{ height: 80 }} />

          <Typography>(Ký, ghi rõ họ tên)</Typography>
          <Typography variant="body2" sx={{ fontStyle: "italic" }}>
            (Signature, full name)
          </Typography>

          <Typography mt={2}>Ngày …… tháng …… năm ……</Typography>
          <Typography variant="body2" sx={{ fontStyle: "italic" }}>
            Date …… / …… / ……
          </Typography>
        </Stack>
      </Box>

      <Box mt={4}>
        <Typography>
          Trong trường hợp có sự khác biệt giữa bản tiếng Việt và tiếng Anh,
          bản tiếng Việt sẽ được ưu tiên áp dụng.
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>
          In the event of any discrepancy between the Vietnamese and English versions,
          the Vietnamese version shall prevail.
        </Typography>
      </Box>
    </Box>
  );
}
