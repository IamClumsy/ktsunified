export const getSkillClass = (skill: string): string => {
  if (!skill) return "bg-blue-500 text-white";
  const trimmed = skill.trim();
  if (trimmed.toLowerCase().includes("damage to player"))
    return "damage-to-player bg-gradient-to-r from-slate-600 to-slate-700 border shadow-lg";
  if (trimmed === "60% Basic Attack Damage")
    return "basic-attack-60 bg-gradient-to-r from-slate-600 to-slate-700 border shadow-lg";
  if (trimmed === "70% Basic Attack Damage")
    return "basic-attack-60 bg-gradient-to-r from-slate-600 to-slate-700 border shadow-lg";
  if (trimmed === "24% Skill Damage")
    return "basic-attack-60 bg-gradient-to-r from-slate-600 to-slate-700 border shadow-lg";
  if (trimmed === "28% Skill Damage")
    return "basic-attack-60 bg-gradient-to-r from-slate-600 to-slate-700 border shadow-lg";
  if (trimmed === "30% Skill Damage")
    return "basic-attack-60 bg-gradient-to-r from-slate-600 to-slate-700 border shadow-lg";
  if (trimmed === "50% Basic Attack Damage")
    return "basic-attack-50 bg-gradient-to-r from-slate-700 to-slate-800 border shadow-sm";
  if (trimmed.includes("Gold Brick"))
    return "bg-gradient-to-r from-slate-600 to-slate-700 text-orange-500 border border-slate-500/40 gold-text";
  if (trimmed.includes("Reduction Basic Attack Damage"))
    return "bg-gradient-to-r from-slate-600 to-slate-700 text-blue-500 border border-slate-500/40 blue-text";
  if (
    trimmed === "200/DPS Defending HQ, GH, Club, LM" ||
    trimmed === "240/DPS Defending HQ, GH, Club, LM" ||
    trimmed === "240/DPS Attacking Enemy Company" ||
    (trimmed.toLowerCase().includes("dps") &&
      trimmed.toLowerCase().includes("defending") &&
      trimmed.toLowerCase().includes("hq"))
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
    ].includes(trimmed) ||
    trimmed.toLowerCase().includes("drive speed increase") ||
    (trimmed.toLowerCase().includes("drive speed") &&
      !trimmed.toLowerCase().includes("reduction"))
  )
    return "skill-specific-worst bg-gradient-to-r from-slate-600 to-slate-700 shadow-sm border border-red-500/40";
  if (trimmed === "20% Skill Damage")
    return "skill-good bg-gradient-to-r from-slate-700 to-slate-800 border shadow-sm";
  if (trimmed === "12% Skill Damage Reduction")
    return "bg-gradient-to-r from-slate-600 to-slate-700 text-blue-500 border border-slate-500/40 blue-text";
  return "bg-gradient-to-r from-slate-600 to-slate-700 text-slate-100 border border-slate-500/40";
};
