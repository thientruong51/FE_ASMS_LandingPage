import { useEffect, useState } from "react";
import { fetchServices, type ServiceApi } from "../../../../api/service";
import type { ServiceSelection } from "./types";

export default function useServiceDetails(services?: number[] | ServiceSelection[] | null) {
  const [serviceDetails, setServiceDetails] = useState<ServiceSelection[] | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!services || (Array.isArray(services) && services.length === 0)) {
        setServiceDetails([]);
        return;
      }

      if (Array.isArray(services) && typeof services[0] === "object") {
        setServiceDetails(services as ServiceSelection[]);
        return;
      }

      try {
        const all: ServiceApi[] = await fetchServices();
        if (!mounted) return;

        const ids = services as number[];
        const mapped = all
          .filter((s) => ids.includes(s.serviceId))
          .map((s) => ({ serviceId: s.serviceId, name: s.name, price: s.price ?? 0 }));
        setServiceDetails(mapped);
      } catch (err) {
        console.error("Failed to fetch services for summary:", err);
        if (mounted) setServiceDetails([]);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [services]);

  return serviceDetails;
}
