export const normalizeStyle = (style: any): "self" | "managed" => {
  if (!style) return "managed";
  const s = String(style).toLowerCase();
  if (s === "self") return "self";
  return "managed"; 
};

export const deriveStatus = (
  rawStatus: string | null,
  style: string | null,
  returnDate: string | null
): string => {
  if (!rawStatus) return "Pending";

  const s = rawStatus.trim().toLowerCase();
  const isSelf = normalizeStyle(style) === "self";
  const today = new Date();
  const rd = returnDate ? new Date(returnDate) : null;

  const overdue =
    rd && !isNaN(rd.getTime()) && today.getTime() > rd.getTime();

  if (!isSelf) {
    if (overdue) return "Overdue";

    switch (s) {
      case "pending":
      case "new":
        return "Pending";
      case "wait pick up":
      case "waitpickup":
      case "wait_pickup":
      case "wait_pick_up":
        return "WaitPickUp";
      case "verify":
        return "Verify";
      case "checkout":
        return "Checkout";
      case "pick up":
      case "pickup":
      case "pick_up":
        return "PickUp";
      case "processing":
        return "Processing";
      case "stored":
      case "in_warehouse":
        return "Stored";
    }

    return "Pending";
  }

  if (isSelf) {
    if (overdue) return "Overdue";

    switch (s) {
      case "pending":
      case "new":
        return "Pending";
      case "verify":
        return "Verify";
      case "checkout":
        return "Checkout";
      case "renting":
      case "stored":
      case "in_warehouse":
        return "Renting";
    }

    return "Pending";
  }

  return s;
};
