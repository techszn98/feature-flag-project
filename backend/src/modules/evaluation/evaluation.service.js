const { isDeepStrictEqual } = require("node:util");
const Flag = require("../flags/flag.model");
const identityService = require("../identities/identity.service");

const getTrait = (traits, path) => {
  let value = traits;
  for (const key of path.split(".")) {
    if (
      value === null ||
      typeof value !== "object" ||
      !Object.hasOwn(value, key)
    ) {
      return { exists: false, value: undefined };
    }
    value = value[key];
  }
  return { exists: true, value };
};

const matchesRule = (rule, traits) => {
  const actual = getTrait(traits, rule.trait);
  if (rule.operator === "exists") return actual.exists === rule.value;
  if (!actual.exists) return false;

  switch (rule.operator) {
    case "equals":
      return isDeepStrictEqual(actual.value, rule.value);
    case "notEquals":
      return !isDeepStrictEqual(actual.value, rule.value);
    case "in":
      return rule.value.some((candidate) =>
        isDeepStrictEqual(actual.value, candidate),
      );
    case "notIn":
      return rule.value.every(
        (candidate) => !isDeepStrictEqual(actual.value, candidate),
      );
    case "greaterThan":
      return typeof actual.value === "number" && actual.value > rule.value;
    case "greaterThanOrEqual":
      return typeof actual.value === "number" && actual.value >= rule.value;
    case "lessThan":
      return typeof actual.value === "number" && actual.value < rule.value;
    case "lessThanOrEqual":
      return typeof actual.value === "number" && actual.value <= rule.value;
    case "contains":
      return typeof actual.value === "string"
        ? actual.value.includes(rule.value)
        : Array.isArray(actual.value) &&
            actual.value.some((item) => isDeepStrictEqual(item, rule.value));
    default:
      return false;
  }
};

const evaluateFlag = (flag, traits) => {
  const matchedRule = (flag.targetingRules || []).find((rule) =>
    matchesRule(rule, traits),
  );
  return matchedRule ? matchedRule.enabled : flag.enabled;
};

const evaluateEnvironment = async (environmentId, identifier) => {
  const [flags, traits] = await Promise.all([
    Flag.find({ environmentId }).sort({ name: 1 }).lean(),
    identityService.getTraitsForEvaluation(environmentId, identifier),
  ]);

  return Object.fromEntries(
    flags.map((flag) => [flag.name, evaluateFlag(flag, traits)]),
  );
};

module.exports = {
  evaluateEnvironment,
  evaluateFlag,
  matchesRule,
};
