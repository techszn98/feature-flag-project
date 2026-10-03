import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout.jsx";
import ErrorMessage from "../../components/common/ErrorMessage.jsx";
import Loading from "../../components/common/Loading.jsx";
import FeatureFlagForm from "../../components/forms/FeatureFlagForm.jsx";
import { createFlag } from "../../api/flags.api.js";
import { useProject } from "../../hooks/useProject.js";
import { useFlagEnvironment } from "./useFlagEnvironment.js";

export default function CreateFeatureFlag() {
  const navigate = useNavigate();
  const { selectedEnvironmentId } = useProject();
  const { environment, loading, error } = useFlagEnvironment(
    selectedEnvironmentId,
  );
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(payload) {
    setSubmitting(true);
    try {
      await createFlag(payload);
      navigate("/feature-flags", { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loading label="Loading selected environment" />;
  return (
    <AppLayout>
      <main className="workspace-content flags-page">
        <div className="page-heading">
          <div>
            <div className="section-eyebrow">FEATURE FLAGS / NEW</div>
            <h1>Create Feature Flag</h1>
            <p>Use a stable key and target rules to control a release.</p>
          </div>
        </div>
        <ErrorMessage>{error}</ErrorMessage>
        {environment ? (
          <FeatureFlagForm
            environment={environment}
            onSubmit={handleCreate}
            submitting={submitting}
            submitLabel="Create feature flag"
          />
        ) : (
          <section className="empty-state panel">
            <h2>Select an environment first</h2>
            <p>Flags are scoped to a project environment.</p>
            <button
              className="button primary-button"
              type="button"
              onClick={() => navigate("/feature-flags")}
            >
              Choose environment
            </button>
          </section>
        )}
      </main>
    </AppLayout>
  );
}
