import { Box, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { fetchBusinessRules, type BusinessRule } from "../../api/businessRule.api";

export default function ContractContent({ }: { order: any }) {
  const [rules, setRules] = useState<BusinessRule[]>([]);

  useEffect(() => {
    fetchBusinessRules({ page: 1, pageSize: 100 })
      .then(res => {
        setRules(
          res.data.filter(r =>
            ["Kho tự quản", "Kho tập trung", "Giao hàng", "Quy tắc phí theo kỳ"].includes(
              r.category
            )
          )
        );
      });
  }, []);

  return (
    <Box sx={{ bgcolor: "#fff", p: 5, border: "1px solid #E0E0E0", mt: 4 }}>
      <Typography fontWeight={700}>
        II. ĐIỀU KHOẢN HỢP ĐỒNG
      </Typography>
      <Typography variant="body2" sx={{ fontStyle: "italic", mb: 3 }}>
        II. TERMS AND CONDITIONS
      </Typography>

      <Stack spacing={4}>
        {rules.map((r, i) => (
          <Box key={r.ruleCode}>
            <Typography fontWeight={600}>
              Điều {i + 1}. {r.ruleName}
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              Article {i + 1}. {r.ruleName}
            </Typography>

            <Typography sx={{ lineHeight: 2, mt: 1 }}>
              {r.ruleDescription}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                lineHeight: 2,
                fontStyle: "italic",
                color: "text.secondary",
                mt: 1,
              }}
            >
              {r.ruleDescription}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
