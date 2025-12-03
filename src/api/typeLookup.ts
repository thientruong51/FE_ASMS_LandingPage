import { fetchStorageTypes } from "./storageType";
import { fetchShelfTypes } from "./shelfType";
import { fetchContainerTypes } from "./containerType";

let cached = {
  storageTypes: null as any[] | null,
  shelfTypes: null as any[] | null,
  containerTypes: null as any[] | null,
};

export async function loadTypeLookup() {
  if (cached.storageTypes && cached.shelfTypes && cached.containerTypes) {
    return cached;
  }

  const [storage, shelf, container] = await Promise.all([
    fetchStorageTypes(),
    fetchShelfTypes(),
    fetchContainerTypes(),
  ]);

  cached = {
    storageTypes: storage ?? [],
    shelfTypes: shelf ?? [],
    containerTypes: container ?? [],
  };

  return cached;
}

export function resolveStorageName(id: number | null | undefined) {
  if (!cached.storageTypes) return null;
  const f = cached.storageTypes.find((x: any) => x.storageTypeId === id);
  return f?.name ?? null;
}

export function resolveShelfName(id: number | null | undefined) {
  if (!cached.shelfTypes) return null;
  const f = cached.shelfTypes.find((x: any) => x.shelfTypeId === id);
  return f?.name ?? null;
}

export function resolveContainerName(id: number | null | undefined) {
  if (!cached.containerTypes) return null;
  const f = cached.containerTypes.find((x: any) => x.containerTypeId === id);
  return f?.type ?? null;
}
