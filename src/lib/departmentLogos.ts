const LOGO_VERSION = "20260619b";

const DEPARTMENT_LOGOS: Record<string, string> = {
  BCH: versionLogo("/assets/departments/biochemistry.png"),
  BTN: versionLogo("/assets/departments/botany.png"),
  CBG: versionLogo("/assets/departments/cell-biology-and-genetics.png"),
  FSH: versionLogo("/assets/departments/fisheries.png"),
  FISHERIES: versionLogo("/assets/departments/fisheries.png"),
  MIC: versionLogo("/assets/departments/microbiology.png"),
  MSM: versionLogo("/assets/departments/marine-sciences.png"),
  "PRE-MED": versionLogo("/assets/departments/pre-med.png"),
  ZLY: versionLogo("/assets/departments/zoology.png"),
};

const DISPLAY_ABBR: Record<string, string> = {
  FISHERIES: "FSH",
};

export function getDepartmentLogoUrl(abbr?: string | null, logoUrl?: string | null) {
  const mappedLogo = abbr ? DEPARTMENT_LOGOS[normalizeDepartmentAbbr(abbr)] : null;
  if (mappedLogo) return mappedLogo;
  if (logoUrl) return versionLogo(logoUrl);
  return null;
}

export function displayDepartmentAbbr(abbr?: string | null) {
  if (!abbr) return "TBD";
  const normalized = normalizeDepartmentAbbr(abbr);
  return DISPLAY_ABBR[normalized] ?? normalized;
}

export function normalizeDepartmentAbbr(abbr: string) {
  return abbr.trim().toUpperCase().replaceAll(" ", "-");
}

function versionLogo(url: string) {
  if (!url.startsWith("/assets/departments/")) return url;
  return `${url}?v=${LOGO_VERSION}`;
}
