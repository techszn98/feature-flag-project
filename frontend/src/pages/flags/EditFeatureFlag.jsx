import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout.jsx";
import ErrorMessage from "../../components/common/ErrorMessage.jsx";
import Loading from "../../components/common/Loading.jsx";
import FeatureFlagForm from "../../components/forms/FeatureFlagForm.jsx";
import { getFlag, updateFlag } from "../../api/flags.api.js";
import { useProject } from "../../hooks/useProject.js";
import { useFlagEnvironment } from "./useFlagEnvironment.js";

export default function EditFeatureFlag() {
  const { flagId } = useParams();
  const navigate = useNavigate();
  const { selectedEnvironmentId } = useProject();
  const {
    environment,
    loading: environmentLoading,
    error: environmentError,
  } = useFlagEnvironment(selectedEnvironmentId);
  const [flag, setFlag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getFlag(flagId)
      .then((item) => active && setFlag(item))
      .catch((requestError) => active && setError(requestError.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [flagId]);

  async function handleUpdate(payload) {
    setSubmitting(true);
    try {
      await updateFlag(flagId, payload);
      navigate("/feature-flags", { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || environmentLoading)
    return <Loading label="Loading feature flag" />;
  return (
    <AppLayout>
      <main className="workspace-content flags-page">
        <div className="page-heading">
          <div>
            <div className="section-eyebrow">FEATURE FLAGS / EDIT</div>
            <h1>Edit Feature Flag</h1>
            <p>Changes apply only to the selected flag in its environment.</p>
          </div>
        </div>
        <ErrorMessage>{error || environmentError}</ErrorMessage>
        {flag &&
        environment &&
        String(flag.environmentId) ===
          String(environment.id ?? environment._id) ? (
          <FeatureFlagForm
            initialValue={flag}
            environment={environment}
            onSubmit={handleUpdate}
            submitting={submitting}
            submitLabel="Save changes"
          />
        ) : (
          <section className="empty-state panel">
            <h2>Flag context unavailable</h2>
            <p>
              Select the flag’s environment from Feature Flags, then reopen this
              editor.
            </p>
            <button
              className="button primary-button"
              type="button"
              onClick={() => navigate("/feature-flags")}
            >
              Back to feature flags
            </button>
          </section>
        )}
      </main>
    </AppLayout>
  );
}
