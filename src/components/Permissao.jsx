import { cloneElement } from "react";
import { temPermissao } from "../utils/auth";

function Permissao({ nome, children, esconder = false }) {
  const autorizado = temPermissao(nome);

  if (!autorizado && esconder) {
    return null;
  }

  if (!autorizado) {
    return cloneElement(children, {
      disabled: true,
      title: "Você não possui permissão para esta ação.",
    });
  }

  return children;
}

export default Permissao;
