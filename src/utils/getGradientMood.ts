import type { ProjectInfo } from "./types";

export const getGradientMood = (project: ProjectInfo) => {
  const { averageComplexity, totalLOC, dependencies } = project.metrics;
  const languages = project.language || [];
  const theme = project.config?.visualDefaults?.theme || "dark";

  // Weighted mood score — combines complexity + dependency + LOC density
  const moodScore = (
    averageComplexity * 0.6 +
    Math.log10(Math.max(totalLOC, 1)) * 0.2 +
    Math.min(dependencies / 10, 2) * 0.2
  );

  // Determine dominant language vibe
  const hasJS = languages.includes("javascript") || languages.includes("typescript");
  const hasPython = languages.includes("python");
  const hasRust = languages.includes("rust");
  const hasCpp = languages.includes("cpp") || languages.includes("c++");

  // Language-specific bias hue
  let langTint = "";
  if (hasPython) langTint = theme === "dark" ? "via-indigo-500" : "via-indigo-400";
  else if (hasJS) langTint = theme === "dark" ? "via-amber-400" : "via-amber-300";
  else if (hasRust) langTint = theme === "dark" ? "via-orange-500" : "via-orange-400";
  else if (hasCpp) langTint = theme === "dark" ? "via-blue-500" : "via-blue-400";
  else langTint = theme === "dark" ? "via-sky-400" : "via-sky-300";

  let gradient = "";
  if (moodScore < 2.5) {
    // calm, lean codebase
    gradient = `from-emerald-300 ${langTint} to-sky-500`;
  } else if (moodScore < 5) {
    // medium complexity / moderate dependencies
    gradient = `from-teal-400 ${langTint} to-cyan-500`;
  } else if (moodScore < 7) {
    // busy but under control
    gradient = `from-violet-400 ${langTint} to-fuchsia-500`;
  } else {
    // overloaded or tangled
    gradient = `from-rose-600 ${langTint} to-slate-800`;
  }

  // Adjust for theme brightness (avoid blinding in light mode)
  if (theme === "light") {
    gradient = gradient
      .replace(/(\d{3})/g, (m) => String(Number(m) - 100)) // slightly lighter tones
      .replace(/from-/g, "from-")
      .replace(/to-/g, "to-");
  }

  return gradient;
};
