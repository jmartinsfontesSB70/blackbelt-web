import { Navigate, Outlet } from "react-router-dom";

function RotaPrivada() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default RotaPrivada;
