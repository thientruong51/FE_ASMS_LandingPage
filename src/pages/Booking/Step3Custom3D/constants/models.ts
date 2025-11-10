import { useGLTF } from "@react-three/drei";

export const MODELS = {
  rooms: {
    small: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847449/PHONG_SMALL_bjalft.glb",
    smallAC: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847448/PHONG_SMALL_may_lanh_cyv1yy.glb",
    medium: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847447/PHONG_MEDIUM_zos1eu.glb",
    mediumAC: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847446/PHONG_MEDIUM_may_lanh_oskv0t.glb",
    large: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847446/PHONG_LARGE_hu7i9i.glb",
    largeAC: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847444/PHONG_LARGE_may_lanh_ab7z38.glb",
  },
  shelf: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847444/KE_1550X1057X2045_jvuubl.glb",
  boxes: {
    A: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847449/THUNG_A_uu6f3w.glb",
    B: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847443/THUNG_B_qp8ysr.glb",
    C: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847443/THUNG_C_wtagvu.glb",
    D: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847446/THUNG_D_cs1w1m.glb",
  },
};

export const ROOM_LAYOUTS = {
  small: {
    rows: 1,
    perRow: 2,
    shelfWidth: 1.05,
    shelfDepth: 0.8,
    shelfSpacing: 0.25,
    wallGap: 0.25,
    rowGap: 0.76,
    offset: { x: 0.8, y: -1.26, z: 0.2 },
  },
  medium: {
    rows: 2,
    perRow: 2,
    shelfWidth: 1.05,
    shelfDepth: 0.8,
    shelfSpacing: 1,
    wallGap: 0.25,
    rowGap: 0.76,
    offset: { x: 0.53, y: -1.26, z: 1 },
  },
  large: {
    rows: 2,
    perRow: 3,
    shelfWidth: 1.05,
    shelfDepth: 0.8,
    shelfSpacing: 1,
    wallGap: 0.25,
    rowGap: 0.76,
    offset: { x: 1.55, y: -1.26, z: 0.2 },
  },
};


Object.values(MODELS.rooms).forEach((url) => useGLTF.preload(url));
Object.values(MODELS.boxes).forEach((url) => useGLTF.preload(url));
useGLTF.preload(MODELS.shelf);
