

export type StorageStepConfig = {
    step: number;
    yawDeg?: number; 
};

const STORAGE_STEP_MAP: Record<string, StorageStepConfig> = {
    STR001: { step: 5, yawDeg: 0 },
    STR002: { step: 5, yawDeg: -10 },
    STR003: { step: 6.5, yawDeg: -12 },
    STR004: { step: 6.5, yawDeg: 30 },
    STR005: { step: 8, yawDeg: 0 },
    STR006: { step: 8, yawDeg: 0 },
    STR007: { step: 9, yawDeg: 15 },
    STR008: { step: 9, yawDeg: -15 },
    STR009: { step: 10.5, yawDeg: 0 },
    STR010: { step: 10.5, yawDeg: -10 },
    STR011: { step: 12, yawDeg: -12 },
    STR012: { step: 12, yawDeg: 30 },
    STR013: { step: 14, yawDeg: 0 },
    STR014: { step: 14, yawDeg: 0 },
    STR015: { step: 16.5, yawDeg: 15 },
    STR016: { step: 16.5, yawDeg: -15 },
    STR017: { step: 18.5, yawDeg: 30 },
    STR018: { step: 18.5, yawDeg: 0 },
    STR019: { step: 21, yawDeg: 0 },
    STR020: { step: 21, yawDeg: 15 },
};

export function storageCodeToStepConfig(
    storageCode: string | null | undefined
): StorageStepConfig | null {
    if (!storageCode) return null;

    const match = storageCode.match(/STR(\d+)/i);
    if (!match) return null;

    const key = `STR${match[1].padStart(3, "0")}`;
    return STORAGE_STEP_MAP[key] ?? null;
}
