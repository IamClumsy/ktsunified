export const isGoodBuff = (skill: string): boolean => {
  const t = (skill || "").toLowerCase();
  if (t.includes("60%") && (t.includes("basic attack damage") || t.includes("normal attack damage"))) return false;
  if (t.includes("30%") && t.includes("skill damage")) return false;
  if (t.includes("28%") && t.includes("skill damage")) return false;
  if (t.includes("70%") && t.includes("basic attack damage")) return false;
  if (t.includes("80%") && t.includes("basic attack damage")) return false;
  if (t.includes("24%") && t.includes("skill damage")) return false;
  if (t.includes("reduc")) return false;
  return (
    t.includes("skill damage") ||
    t.includes("basic attack damage") ||
    t.includes("normal attack damage") ||
    t.includes("basic damage") ||
    t.includes("normal damage")
  );
};

export const isWorstSkill = (skill: string): boolean => {
  const t = (skill || "").toLowerCase();
  const isDamageSkill = t.includes("damage") && (t.includes("sec/") || /\d+\s*damage/.test(t));
  if (isDamageSkill) return false;
  const is200DpsDefending =
    t.includes("200/dps") &&
    (t.includes("defending") || t.includes("hq") || t.includes("gh") || t.includes("club") || t.includes("lm"));
  if (is200DpsDefending) return false;
  return (
    t.includes("180/dps") ||
    t.includes("200/dps") ||
    t.includes("world building guard") ||
    t.includes("damage wg") ||
    t.includes("damage increase world building guard") ||
    (t.includes("10 sec") && !t.includes("sec/")) ||
    t.includes("10/sec") ||
    t.includes("driving speed") ||
    t.includes("drive speed") ||
    t.includes("drive speed increase")
  );
};

export const isBadSkill = (skill: string): boolean => {
  const t = (skill || "").toLowerCase();
  const trimmed = (skill || "").trim();
  const isDefendingDps =
    (t.includes("200/dps") || t.includes("240/dps")) &&
    (t.includes("defending") || t.includes("hq") || t.includes("gh") || t.includes("club") || t.includes("lm"));
  const is240DpsAttacking = t.includes("240/dps") && t.includes("attacking enemy company");
  return (
    !isWorstSkill(skill) &&
    (isDefendingDps ||
      is240DpsAttacking ||
      trimmed === "10% Basic Attack Damage" ||
      trimmed === "5% Skill Damage" ||
      t.includes("gold brick gathering") ||
      t.includes("gold brick gather speed") ||
      (t.includes("fan capacity") && !t.includes("10% rally fan capacity") && !t.includes("rally")))
  );
};

export const isDirectDamage = (skill: string): boolean => {
  const t = (skill || "").toLowerCase();
  if (t.includes("60%") && (t.includes("basic attack damage") || t.includes("normal attack damage"))) return true;
  if (t.includes("70%") && t.includes("basic attack damage")) return true;
  if (t.includes("80%") && t.includes("basic attack damage")) return true;
  if (t.includes("30%") && t.includes("skill damage")) return true;
  if (t.includes("28%") && t.includes("skill damage")) return true;
  if (t.includes("24%") && t.includes("skill damage")) return true;
  if (t.includes("damage to player")) return true;
  const mentionsDamage = t.includes("damage") && !t.includes("reduc") && !t.includes("taken") && !t.includes("increase");
  const timeBased = t.includes(" sec/") || /\bsec\b/.test(t);
  return (
    (mentionsDamage || timeBased) &&
    !isGoodBuff(skill) &&
    !isBadSkill(skill) &&
    !isWorstSkill(skill)
  );
};

export const categorizeSkills = (skills: string[]) => {
  const worstSkills = skills.filter(isWorstSkill);
  const badSkills = skills.filter(isBadSkill);
  const bestSkills = skills.filter(isDirectDamage);
  const goodSkills = skills.filter(isGoodBuff);
  const okaySkills = skills.filter(
    (s) =>
      !bestSkills.includes(s) &&
      !goodSkills.includes(s) &&
      !badSkills.includes(s) &&
      !worstSkills.includes(s)
  );
  return { worstSkills, badSkills, bestSkills, goodSkills, okaySkills };
};
