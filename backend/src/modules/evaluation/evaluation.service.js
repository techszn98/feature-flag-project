const FeatureFlag = require('../flags/flag.model');
const Identity = require('../identities/identity.model');

exports.evaluateFlags = async (environmentId, identifier, traits) => {
  // 1. Auto-create or update the Identity
  await Identity.findOneAndUpdate(
    { environmentId, identifier },
    { $set: { traits: traits || {} } },
    { new: true, upsert: true }
  );

  // 2. Fetch all flags for this environment
  const flags = await FeatureFlag.find({ environmentId });

  // 3. Evaluate each flag with targeting logic
  const evaluatedResults = {};
  
  for (const flag of flags) {
    evaluatedResults[flag.name] = evaluateFlag(flag, traits);
  }

  return evaluatedResults;
};

// The actual targeting brain
function evaluateFlag(flag, traits) {
  // If flag is globally disabled, return false immediately
  if (!flag.enabled) {
    return false;
  }

  // If there are no targeting rules, return the global state
  if (!flag.targetingRules || Object.keys(flag.targetingRules).length === 0) {
    return true;
  }

  // Apply targeting rules based on traits
  // Example: flag.targetingRules = { plan: 'premium', country: 'Nigeria' }
  for (const [key, requiredValue] of Object.entries(flag.targetingRules)) {
    const userValue = traits?.[key];
    
    // If the user doesn't have this trait, or it doesn't match, deny access
    if (userValue !== requiredValue) {
      return false;
    }
  }

  // All targeting rules passed
  return true;
}