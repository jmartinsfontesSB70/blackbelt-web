import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { redefinirSenha } from "../services/authService";

function RedefinirSenha() {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setMensagem("");

    if (!token) {
      setErro("Link de recuperação inválido ou incompleto.");
      return;
    }

    if (!novaSenha.trim()) {
      setErro("Informe sua nova senha.");
      return;
    }

    if (novaSenha.length < 6) {
      setErro("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      setEnviando(true);

      await redefinirSenha(token, novaSenha);

      setMensagem(
        "Senha redefinida com sucesso! Você já pode entrar no sistema.",
      );
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
            <h2>Nova senha</h2>

            <p>Digite sua nova senha para recuperar o acesso ao sistema.</p>
          </div>

          <div className="login-field">
            <label htmlFor="novaSenha">Nova senha</label>

            <input
              id="novaSenha"
              type="password"
              placeholder="Digite sua nova senha"
              value={novaSenha}
              onChange={(event) => setNovaSenha(event.target.value)}
              autoComplete="new-password"
              disabled={enviando || !token}
            />
          </div>

          <div className="login-field">
            <label htmlFor="confirmarSenha">Confirmar nova senha</label>

            <input
              id="confirmarSenha"
              type="password"
              placeholder="Digite novamente sua nova senha"
              value={confirmarSenha}
              onChange={(event) => setConfirmarSenha(event.target.value)}
              autoComplete="new-password"
              disabled={enviando || !token}
            />
          </div>

          {erro && <p className="login-error">{erro}</p>}

          {mensagem && <p className="recovery-success">{mensagem}</p>}

          {!mensagem && (
            <button
              type="submit"
              className="login-button"
              disabled={enviando || !token}
            >
              {enviando ? "Redefinindo..." : "Redefinir senha"}
            </button>
          )}

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

export default RedefinirSenha;
