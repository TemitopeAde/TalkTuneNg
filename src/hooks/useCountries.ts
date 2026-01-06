import { useEffect, useState } from "react";

interface Country {
  name: string;
  code: string;
  dial_code: string;
}

export const useCountries = () => {
  const [data, setData] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,idd",
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`Failed to load countries (${res.status})`);
        const json: Array<{
          name?: { common?: string };
          cca2?: string;
          idd?: { root?: string; suffixes?: string[] };
        }> = await res.json();

        const countries: Country[] = json
          .map((c) => {
            const name = c.name?.common?.trim();
            const code = c.cca2?.trim();
            const root = (c.idd?.root || "+").trim();
            const suffix = (c.idd?.suffixes && c.idd!.suffixes[0]) || "";
            // Ensure single leading '+' and build dial code
            const normalizedRoot = root.startsWith("+") ? root : `+${root}`;
            const dial_code = `${normalizedRoot}${suffix}`.replace(/\+\+/g, "+");
            if (!name || !code || dial_code === "+") return null;
            return { name, code, dial_code } as Country;
          })
          .filter(Boolean) as Country[];

        countries.sort((a, b) => a.name.localeCompare(b.name));
        setData(countries);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          // Fallback to minimal list if API fails
          setData([
            { name: "United States", code: "US", dial_code: "+1" },
            { name: "United Kingdom", code: "GB", dial_code: "+44" },
          ]);
          setError(e?.message || "Failed to load countries");
        }
      } finally {
        setIsLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  return { data, isLoading, error } as const;
};
