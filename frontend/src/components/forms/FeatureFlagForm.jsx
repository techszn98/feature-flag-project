import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../common/Button.jsx";
import ErrorMessage from "../common/ErrorMessage.jsx";
import Input from "../common/Input.jsx";
import {
  createRuleDraft,
  getRuleValueType,
  LIST_OPERATORS,
  NUMERIC_OPERATORS,
  serializeTargetingRules,
  TARGETING_RULE_OPERATORS,
} from "../../utils/targetingRules.js";

const FLAG_NAME_PATTERN = /^[a-z][a-z0-9_-]{0,99}$/;

export default function FeatureFlagForm({
  initialValue,
  environment,
  onSubmit,
  submitting = false,
  submitLabel = "Save feature flag",
}) {
  const [name, setName] = useState(initialValue?.name ?? "");
  const [enabled, setEnabled] = useState(initialValue?.enabled ?? false);
  const [rules, setRules] = useState(() =>
    (initialValue?.targetingRules ?? []).map(createRuleDraft),
  );
  const [rulesError, setRulesError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(initialValue?.name ?? "");
    setEnabled(initialValue?.enabled ?? false);
    setRules((initialValue?.targetingRules ?? []).map(createRuleDraft));
    setRulesError("");
    setError("");
  }, [initialValue]);

  function updateRule(index, updates) {
    setRules((current) =>
      current.map((rule, ruleIndex) =>
        ruleIndex === index ? { ...rule, ...updates } : rule,
      ),
    );
    setRulesError("");
  }

  function changeRuleOperator(index, operator) {
    const current = rules[index];
    let valueType = current.valueType;
    if (NUMERIC_OPERATORS.has(operator)) valueType = "number";
    else if (operator === "exists") valueType = "boolean";
    else if (LIST_OPERATORS.has(operator)) valueType = "text-list";
    else if (
      LIST_OPERATORS.has(current.operator) ||
      current.operator === "exists" ||
      NUMERIC_OPERATORS.has(current.operator)
    )
      valueType = "text";
    updateRule(index, { operator, valueType, value: "" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setRulesError("");

    const normalizedName = name.trim();
    if (!FLAG_NAME_PATTERN.test(normalizedName)) {
      setError(
        "Use a lowercase key beginning with a letter; letters, numbers, underscores and hyphens are allowed.",
      );
      return;
    }

    const serializedRules = serializeTargetingRules(rules);
    if (serializedRules.error) {
      setRulesError(serializedRules.error);
      return;
    }

    try {
      await onSubmit({
        name: normalizedName,
        enabled,
        targetingRules: serializedRules.targetingRules,
        ...(initialValue
          ? {}
          : { environmentId: environment.id ?? environment._id }),
      });
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <form className="panel flag-form" onSubmit={handleSubmit} noValidate>
      <div className="panel-header">
        <h2>
          {initialValue ? "Flag configuration" : "New flag configuration"}
        </h2>
        <p>Environment · {environment?.name ?? "Not selected"}</p>
      </div>
      <div className="panel-body">
        <Input
          id="flag-name"
          label="Feature flag name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. checkout_redesign"
          maxLength={100}
          autoComplete="off"
          spellCheck={false}
          required
        />

        <label className="flag-toggle" htmlFor="flag-enabled">
          <span>
            <strong>Enabled</strong>
            <small>Make this flag active for its environment.</small>
          </span>
          <input
            id="flag-enabled"
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
          />
        </label>

        <section
          className="targeting-rules"
          aria-labelledby="targeting-rules-title"
        >
          <div className="targeting-rules-heading">
            <div>
              <h3 id="targeting-rules-title">Targeting rules</h3>
              <p>
                Rules are checked in order. The first match determines the flag
                state.
              </p>
            </div>
            <Button
              className="button-secondary add-rule-button"
              type="button"
              disabled={rules.length >= 100}
              onClick={() =>
                setRules((current) => [...current, createRuleDraft()])
              }
            >
              Add rule
            </Button>
          </div>

          {rules.length === 0 ? (
            <p className="rules-empty">
              No targeting rules. The flag’s enabled state is used for every
              identity.
            </p>
          ) : (
            <div className="targeting-rule-list">
              {rules.map((rule, index) => {
                const valueType = getRuleValueType(rule);
                const typeChoices = LIST_OPERATORS.has(rule.operator)
                  ? [
                      ["text-list", "Text list"],
                      ["number-list", "Number list"],
                      ["boolean-list", "Boolean list"],
                    ]
                  : [
                      ["text", "Text"],
                      ["number", "Number"],
                      ["boolean", "Boolean"],
                    ];
                const showTypeSelect =
                  !NUMERIC_OPERATORS.has(rule.operator) &&
                  rule.operator !== "exists" &&
                  rule.operator !== "contains";

                return (
                  <fieldset className="targeting-rule-card" key={rule.id}>
                    <legend>Rule {index + 1}</legend>
                    <div className="targeting-rule-fields">
                      <Input
                        id={`rule-trait-${rule.id}`}
                        label="Trait path"
                        value={rule.trait}
                        onChange={(event) =>
                          updateRule(index, { trait: event.target.value })
                        }
                        placeholder="plan or account.tier"
                        maxLength={128}
                        autoComplete="off"
                        spellCheck={false}
                        required
                      />
                      <div className="field">
                        <label htmlFor={`rule-operator-${rule.id}`}>
                          Operator
                        </label>
                        <select
                          id={`rule-operator-${rule.id}`}
                          value={rule.operator}
                          onChange={(event) =>
                            changeRuleOperator(index, event.target.value)
                          }
                        >
                          {TARGETING_RULE_OPERATORS.map(([value, label]) => (
                            <option value={value} key={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {showTypeSelect && (
                        <div className="field">
                          <label htmlFor={`rule-type-${rule.id}`}>
                            Value type
                          </label>
                          <select
                            id={`rule-type-${rule.id}`}
                            value={valueType}
                            onChange={(event) =>
                              updateRule(index, {
                                valueType: event.target.value,
                              })
                            }
                          >
                            {typeChoices.map(([value, label]) => (
                              <option value={value} key={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {valueType === "boolean" ? (
                        <div className="field">
                          <label htmlFor={`rule-value-${rule.id}`}>Value</label>
                          <select
                            id={`rule-value-${rule.id}`}
                            value={rule.value}
                            onChange={(event) =>
                              updateRule(index, { value: event.target.value })
                            }
                          >
                            <option value="true">True</option>
                            <option value="false">False</option>
                          </select>
                        </div>
                      ) : (
                        <Input
                          id={`rule-value-${rule.id}`}
                          label={
                            LIST_OPERATORS.has(rule.operator)
                              ? "Values"
                              : "Value"
                          }
                          type={valueType === "number" ? "number" : "text"}
                          step={valueType === "number" ? "any" : undefined}
                          value={rule.value}
                          onChange={(event) =>
                            updateRule(index, { value: event.target.value })
                          }
                          placeholder={
                            LIST_OPERATORS.has(rule.operator)
                              ? "pro, enterprise"
                              : "Enter a value"
                          }
                          autoComplete="off"
                          required
                        />
                      )}
                      <label
                        className="rule-enabled-toggle"
                        htmlFor={`rule-enabled-${rule.id}`}
                      >
                        <span>When matched</span>
                        <select
                          id={`rule-enabled-${rule.id}`}
                          value={String(rule.enabled)}
                          onChange={(event) =>
                            updateRule(index, {
                              enabled: event.target.value === "true",
                            })
                          }
                          aria-label={`Rule ${index + 1} flag state when matched`}
                        >
                          <option value="true">Enable flag</option>
                          <option value="false">Disable flag</option>
                        </select>
                      </label>
                      <Button
                        className="icon-button danger-icon remove-rule-button"
                        type="button"
                        aria-label={`Remove rule ${index + 1}`}
                        title="Remove rule"
                        onClick={() =>
                          setRules((current) =>
                            current.filter(
                              (_, ruleIndex) => ruleIndex !== index,
                            ),
                          )
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </fieldset>
                );
              })}
            </div>
          )}
          {rulesError && (
            <span className="field-error" id="flag-rules-error">
              {rulesError}
            </span>
          )}
        </section>

        <ErrorMessage>{error}</ErrorMessage>
        <div className="button-row">
          <Button className="primary-button" type="submit" loading={submitting}>
            <Save size={16} /> {submitLabel}
          </Button>
          <Link className="button button-secondary" to="/feature-flags">
            <ArrowLeft size={16} /> Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
