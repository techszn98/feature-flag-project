export const NUMERIC_OPERATORS = new Set([
  "greaterThan",
  "greaterThanOrEqual",
  "lessThan",
  "lessThanOrEqual",
]);
export const LIST_OPERATORS = new Set(["in", "notIn"]);
export const TARGETING_RULE_OPERATORS = [
  ["equals", "Equals"],
  ["notEquals", "Does not equal"],
  ["in", "Is in list"],
  ["notIn", "Is not in list"],
  ["greaterThan", "Greater than"],
  ["greaterThanOrEqual", "Greater than or equal"],
  ["lessThan", "Less than"],
  ["lessThanOrEqual", "Less than or equal"],
  ["contains", "Contains"],
  ["exists", "Exists"],
];

const VALID_OPERATORS = new Set(
  TARGETING_RULE_OPERATORS.map(([value]) => value),
);
const TRAIT_PATH_PATTERN = /^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*$/;
let nextRuleId = 0;

export function createRuleDraft(rule = {}) {
  const operator = rule.operator ?? "equals";
  const value = Object.hasOwn(rule, "value")
    ? rule.value
    : operator === "exists"
      ? true
      : "";
  let valueType = "text";
  if (Array.isArray(value)) {
    valueType = value.every((item) => typeof item === "number")
      ? "number-list"
      : value.every((item) => typeof item === "boolean")
        ? "boolean-list"
        : "text-list";
  } else if (typeof value === "boolean") {
    valueType = "boolean";
  } else if (typeof value === "number") {
    valueType = "number";
  }

  if (operator === "exists") valueType = "boolean";
  else if (NUMERIC_OPERATORS.has(operator)) valueType = "number";
  else if (LIST_OPERATORS.has(operator) && !valueType.endsWith("list")) {
    valueType = "text-list";
  }

  return {
    id: `targeting-rule-${++nextRuleId}`,
    trait: rule.trait ?? "",
    operator,
    value: Array.isArray(value) ? value.join(", ") : String(value ?? ""),
    valueType,
    enabled: rule.enabled ?? true,
  };
}

export function getRuleValueType(rule) {
  if (NUMERIC_OPERATORS.has(rule.operator)) return "number";
  if (rule.operator === "exists") return "boolean";
  if (LIST_OPERATORS.has(rule.operator)) {
    return rule.valueType.endsWith("list") ? rule.valueType : "text-list";
  }
  if (rule.operator === "contains") return "text";
  return rule.valueType;
}

function parseRuleValue(rule, index) {
  const type = getRuleValueType(rule);
  const label = `Rule ${index + 1}`;

  if (type === "boolean") {
    if (!["true", "false"].includes(rule.value)) {
      return { error: `${label}: choose true or false.` };
    }
    return { value: rule.value === "true" };
  }
  if (type === "number") {
    if (!rule.value.trim()) {
      return { error: `${label}: enter a valid number.` };
    }
    const value = Number(rule.value);
    return Number.isFinite(value)
      ? { value }
      : { error: `${label}: enter a valid number.` };
  }
  if (type.endsWith("list")) {
    const entries = rule.value.split(",").map((entry) => entry.trim());
    if (!entries.length || entries.some((entry) => !entry)) {
      return { error: `${label}: enter a comma-separated list of values.` };
    }
    if (type === "number-list") {
      const numbers = entries.map(Number);
      return numbers.every(Number.isFinite)
        ? { value: numbers }
        : { error: `${label}: list values must all be numbers.` };
    }
    if (type === "boolean-list") {
      if (entries.some((entry) => !["true", "false"].includes(entry))) {
        return { error: `${label}: list values must be true or false.` };
      }
      return { value: entries.map((entry) => entry === "true") };
    }
    return { value: entries };
  }
  return { value: rule.value };
}

export function serializeTargetingRules(rules) {
  if (rules.length > 100) {
    return { error: "Targeting rules can contain at most 100 rules." };
  }

  const targetingRules = [];
  for (const [index, rule] of rules.entries()) {
    const trait = rule.trait.trim();
    if (!TRAIT_PATH_PATTERN.test(trait) || trait.length > 128) {
      return {
        error: `Rule ${index + 1}: enter a valid trait path, such as plan or account.tier.`,
      };
    }
    if (!VALID_OPERATORS.has(rule.operator)) {
      return { error: `Rule ${index + 1}: choose a supported operator.` };
    }
    if (typeof rule.enabled !== "boolean") {
      return {
        error: `Rule ${index + 1}: choose whether the flag is enabled.`,
      };
    }

    const parsedValue = parseRuleValue(rule, index);
    if (parsedValue.error) return parsedValue;
    targetingRules.push({
      trait,
      operator: rule.operator,
      value: parsedValue.value,
      enabled: rule.enabled,
    });
  }

  return { targetingRules };
}
