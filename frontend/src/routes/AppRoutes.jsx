import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import PublicRoute from "./PublicRoute.jsx";
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import WorkspaceOverview from "../pages/dashboard/WorkspaceOverview.jsx";
import EnvironmentAccess from "../pages/environments/EnvironmentAccess.jsx";
import Evaluation from "../pages/evaluation/Evaluation.jsx";
import IdentityTraits from "../pages/identities/IdentityTraits.jsx";
import FeatureFlags from "../pages/flags/FeatureFlags.jsx";
import CreateFeatureFlag from "../pages/flags/CreateFeatureFlag.jsx";
import EditFeatureFlag from "../pages/flags/EditFeatureFlag.jsx";
import ApiReference from "../pages/api-reference/ApiReference.jsx";
import Homepage from "../pages/home/Homepage.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route path="/api-reference" element={<ApiReference />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<WorkspaceOverview />} />
        <Route path="/feature-flags" element={<FeatureFlags />} />
        <Route path="/feature-flags/new" element={<CreateFeatureFlag />} />
        <Route
          path="/feature-flags/:flagId/edit"
          element={<EditFeatureFlag />}
        />
        <Route path="/environment-access" element={<EnvironmentAccess />} />
        <Route path="/evaluation" element={<Evaluation />} />
        <Route path="/identity-traits" element={<IdentityTraits />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
