import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import PublicRoute from "./PublicRoute.jsx";
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import WorkspaceOverview from "../pages/dashboard/WorkspaceOverview.jsx";
import EnvironmentAccess from "../pages/environments/EnvironmentAccess.jsx";
import Evaluation from "../pages/evaluation/Evaluation.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<WorkspaceOverview />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      <Route path="/environment-access" element={<EnvironmentAccess />} />
      <Route path="/evaluation" element={<Evaluation />} />
    </Routes>
  );
}