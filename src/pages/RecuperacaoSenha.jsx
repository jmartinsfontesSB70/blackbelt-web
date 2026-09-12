import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { solicitarRecuperacaoSenha } from "../services/authService";

function RecuperacaoSenha() {
  const [identificador, setIdentificador] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    setMensagem("");
    setErro("");

    if (!identificador.trim()) {
      setErro("Informe seu usuário ou e-mail.");
      return;
    }

    try {
      setEnviando(true);

      await solicitarRecuperacaoSenha(identificador.trim());

      setMensagem(
        "Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.",
      );

      setIdentificador("");
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  }

  function voltarParaLogin() {
    navigate("/login");
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">BB</div>

          <h1>BlackBelt</h1>

          <p>Gestão inteligente para sua academia</p>
        </div>

        <div className="login-divider" />

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-heading">
            <h2>Recuperar senha</h2>

            <p>
              Informe seu e-mail para receber as instruções de redefinição da
              senha.
            </p>
          </div>

          <div className="login-field">
            <label htmlFor="identificador">Usuário ou e-mail</label>

            <input
              id="identificador"
              type="text"
              placeholder="Digite seu usuário ou e-mail"
              value={identificador}
              onChange={(event) => setIdentificador(event.target.value)}
              autoComplete="username"
              disabled={enviando}
            />
          </div>

          {erro && <p className="login-error">{erro}</p>}

          {mensagem && <p className="recovery-success">{mensagem}</p>}

          <button type="submit" className="login-button" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar instruções"}
          </button>

          <button
            type="button"
            className="forgot-password-button"
            onClick={voltarParaLogin}
            disabled={enviando}
          >
            Voltar para o login
          </button>
        </form>

        <div className="login-footer">
          <span>BlackBelt</span>
          <span>•</span>
          <span>Gestão para academias</span>
        </div>
      </div>
    </div>
  );
}

export default RecuperacaoSenha;
