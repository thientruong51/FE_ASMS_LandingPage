import { Box, Typography } from "@mui/material";
import type { BusinessRule } from "../../api/businessRule.api";

type Props = {
  index: number;
  rule: BusinessRule;
};

export default function TermsRuleItem({ index, rule }: Props) {
  return (
    <Box>
      {/* ĐIỀU */}
      <Typography
        variant="subtitle1"
        fontWeight={700}
        gutterBottom
      >
        Điều {index}. {rule.ruleName}
      </Typography>

      {/* NỘI DUNG */}
      <Typography
        variant="body1"
        sx={{
          lineHeight: 2,
          textAlign: "justify",
          whiteSpace: "pre-line",
        }}
      >
        {rule.ruleDescription}
      </Typography>
    </Box>
  );
}
