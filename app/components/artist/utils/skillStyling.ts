export const getRankingClass = (g: string): string => {
  switch (g) {
    case "S": return "ranking-a";
    case "A": return "ranking-b";
    case "B": return "ranking-c";
    case "C": return "ranking-d";
    case "F": return "ranking-f";
    default: return "text-white";
  }
};

export const getSkillClass = (skill: string): string => {
  if (!skill) return "bg-blue-500 text-white";
  const trimmed = skill.trim();
  const t = trimmed.toLowerCase();
  if (t.includes("damage to player"))
    return "damage-to-player bg-gradient-to-r from-slate-600 to-slate-700 border shadow-lg";
  if (
    trimmed === "60% Basic Attack Damage" ||
    trimmed === "60% Normal Attack Damage" ||
    trimmed === "70% Basic Attack Damage" ||
    trimmed === "80% Basic Attack Damage"
  )
    return "basic-attack-60 bg-gradient-to-r from-slate-600 to-slate-700 border shadow-lg";
  if (
    trimmed === "24% Skill Damage" ||
    trimmed === "28% Skill Damage" ||
    trimmed === "30% Skill Damage"
  )
    return "basic-attack-60 bg-gradient-to-r from-slate-600 to-slate-700 border shadow-lg";
  if (
    trimmed === "50% Basic Attack Damage" ||
    trimmed === "50% Normal Attack Damage" ||
    trimmed === "20% Normal Attack Damage"
  )
    return "basic-attack-50 bg-gradient-to-r from-slate-700 to-slate-800 border shadow-sm";
  if (t.includes("gold brick"))
    return "bg-gradient-to-r from-slate-600 to-slate-700 text-orange-500 border border-slate-500/40 gold-text";
  if (t.includes("reduction") && (t.includes("basic attack damage") || t.includes("normal attack damage")))
    return "bg-gradient-to-r from-slate-600 to-slate-700 text-blue-500 border border-slate-500/40 blue-text";
  if (trimmed === "12% Skill Damage Reduction")
    return "bg-gradient-to-r from-slate-600 to-slate-700 text-blue-500 border border-slate-500/40 blue-text";
  if (t.includes("reduce") && (t.includes("normal damage taken") || t.includes("skill damage taken")))
    return "bg-gradient-to-r from-slate-600 to-slate-700 text-blue-500 border border-slate-500/40 blue-text";
  if (
    trimmed === "200/DPS Defending HQ, GH, Club, LM" ||
    trimmed === "240/DPS Defending HQ, GH, Club, LM" ||
    trimmed === "240/DPS Attacking Enemy Company" ||
    trimmed === "10% Gain Fans" ||
    trimmed === "10% Gain Fans Selling CDs" ||
    trimmed === "240/DPS Attacking Group Center, Club, Landmark" ||
    trimmed === "10% Basic Attack Damage" ||
    trimmed === "5% Skill Damage" ||
    (t.includes("dps") && t.includes("defending") && t.includes("hq"))
  )
    return "bg-gradient-to-r from-slate-600 to-slate-700 text-violet-400 border border-violet-500/40 violet-text";
  if (
    [
      "180/DPS Attacking Group Center, Club, Landmark",
      "30% Damage World Building Guard",
      "36% Damage to World Building Guard",
      "36% Damage World Building Guard",
      "180/DPS Attacking Enemy Company",
      "20% Damage WG / 50% Drive Speed",
      "75% Drive Speed",
      "10% Drive Speed",
      "10% Drive Speed Increase",
      "40% Drive Speed Increase",
      "15% Damage Increase World Building Guard",
    ].includes(trimmed) ||
    t.includes("drive speed increase") ||
    t.includes("damage increase world building guard")
  )
    return "skill-specific-worst bg-gradient-to-r from-slate-600 to-slate-700 shadow-sm border border-red-500/40";
  if (trimmed === "20% Skill Damage" || trimmed === "10% Skill Damage")
    return "skill-good bg-gradient-to-r from-slate-700 to-slate-800 border shadow-sm";
  if (t.includes("fan capacity"))
    return "skill-white bg-gradient-to-r from-slate-600 to-slate-700 border";
  return "bg-gradient-to-r from-slate-600 to-slate-700 text-slate-100 border border-slate-500/40";
};
