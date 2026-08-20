import { Navigate, Outlet } from "react-router-dom";

import { temPermissao } from "../utils/auth";

function RotaPermissao({ nome }) {
  if (!temPermissao(nome)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default RotaPermissao;
