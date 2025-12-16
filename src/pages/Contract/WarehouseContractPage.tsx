import { useEffect, useRef, useState } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import { useParams, useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

import Header from "../../components/Header";
import Footer from "../Home/Footer";

import {
    ContractHeader,
    ContractParties,
    ContractContent,
    ContractSignature,
} from "./";

import { fetchOrderByCode } from "../../api/order.list";

export default function WarehouseContractPage() {
    /* ========================
     * ROUTE & STATE
     * ======================== */
    const { orderCode } = useParams<{ orderCode: string }>();
    const location = useLocation();

    // preload để load nhanh (optional)
    const preloadOrder = (location.state as any)?.order ?? null;

    const [order, setOrder] = useState<any>(preloadOrder);
    const [loading, setLoading] = useState<boolean>(!preloadOrder);

    /* ========================
     * PRINT / PDF
     * ======================== */
    const printRef = useRef<HTMLDivElement>(null);

    const handleExportPdf = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Warehouse_Contract_${order?.orderCode ?? ""}`,
    });

    /* ========================
     * FETCH ORDER (SAFE)
     * ======================== */
    useEffect(() => {
        if (!orderCode) return;

        fetchOrderByCode(orderCode)
            .then(res => setOrder(res))
            .finally(() => setLoading(false));
    }, [orderCode]);

    /* ========================
     * LOADING STATE
     * ======================== */
    if (loading) {
        return (
            <Box py={10} display="flex" justifyContent="center">
                <CircularProgress />
            </Box>
        );
    }

    if (!order) {
        return (
            <Box py={10} textAlign="center">
                Không tìm thấy hợp đồng
            </Box>
        );
    }

    /* ========================
     * RENDER
     * ======================== */
    return (
        <>
            <Box className="no-print">
                <Header />
            </Box>

            {/* ===== ACTION BAR (KHÔNG IN) ===== */}
            <Box
                className="no-print"
                display="flex"
                justifyContent="flex-end"
                px={3}
                mt={2}
            >
                <Button
                    variant="contained"
                    onClick={handleExportPdf}
                >
                    Xuất PDF hợp đồng
                </Button>
            </Box>

            {/* ===== CONTRACT CONTENT (IN / PDF) ===== */}
            <Box sx={{ bgcolor: "#F5F5F5", py: 6 }}>
                <Box
                    ref={printRef}
                    className="print-container"
                    maxWidth={900}
                    mx="auto"
                >
                    <ContractHeader order={order} />

                    <Box className="contract-section">
                        <ContractParties order={order} />
                    </Box>

                    <Box className="contract-section">
                        <ContractContent order={order} />
                    </Box>

                    <Box className="contract-section">
                        <ContractSignature order={order} />
                    </Box>
                </Box>
            </Box>

            <Box className="no-print">
                <Footer />
            </Box>
        </>
    );
}
