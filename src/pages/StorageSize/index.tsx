import { Box, Container, Stack } from "@mui/material";
import { useState } from "react";
import Hero from "./Header";
import PriceToggle from "./PriceToggle";
import RoomList from "./RoomList";
import PriceInfo from "./PriceInfo";
import Header from "../../components/Header";
import Footer from "../Home/Footer";

export default function StorageSize() {
  const [hasAC, setHasAC] = useState(false); 

  return (
  <>
  <Header/>
  <Box sx={{ bgcolor: "#F9FAFB", py: { xs: 6, md: 10 } }}>
        
      <Container>
        <Stack spacing={6} alignItems="center">
          <Hero />
          <PriceToggle hasAC={hasAC} setHasAC={setHasAC} />
          <RoomList hasAC={hasAC} />
          <PriceInfo hasAC={hasAC} />
        </Stack>
      </Container>
    </Box>
    <Footer/>
  </>
    
  );
}
