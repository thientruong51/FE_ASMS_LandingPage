import { MenuItem, Select } from "@mui/material";
import i18n from "i18next";

export default function LanguageSwitcher() {
  const value = i18n.language || "vi";
  return (
    <Select
      size="small"
      value={value}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      sx={{ minWidth: 80 }}
    >
      <MenuItem value="vi">VI</MenuItem>
      <MenuItem value="en">EN</MenuItem>
    </Select>
  );
}
