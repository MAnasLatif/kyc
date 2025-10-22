/**
 * Convert ISO2 country code to ISO3
 * Add more mappings as needed
 */
export function toISO3(country?: string): string {
  if (!country) return "";

  const map: Record<string, string> = {
    PK: "PAK",
    IN: "IND",
    US: "USA",
    GB: "GBR",
    UK: "GBR",
    CA: "CAN",
    AU: "AUS",
    AE: "ARE",
    SA: "SAU",
    FR: "FRA",
    DE: "DEU",
    IT: "ITA",
    ES: "ESP",
    NL: "NLD",
    SE: "SWE",
    NO: "NOR",
    DK: "DNK",
    FI: "FIN",
  };

  const key = country.toUpperCase();
  return map[key] ?? "";
}
