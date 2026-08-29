import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { alterarMinhaSenha } from "../services/usuarioService";

function AlterarSenha() {
  const navigate = useNavigate();

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (!senhaAtual.trim()) {
      setErro("Informe a senha atual.");
      return;
    }

    if (!novaSenha.trim()) {
      setErro("Informe a nova senha.");
      return;
    }

    if (novaSenha.length < 6) {
      setErro("A nova senha deve possuir pelo menos 6 caracteres.");
      return;
    }

    if (!confirmacaoSenha.trim()) {
      setErro("Confirme a nova senha.");
      return;
    }

    if (novaSenha !== confirmacaoSenha) {
      setErro("A confirmação da nova senha não confere.");
      return;
    }

    try {
      setSalvando(true);

      await alterarMinhaSenha(senhaAtual, novaSenha);

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmacaoSenha("");

      setSucesso("Senha alterada com sucesso.");
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>Alterar senha</h2>

          <p>Altere a senha do seu usuário.</p>
        </div>
      </div>

      {erro && <div className="form-message error-message">{erro}</div>}

      {sucesso && <div className="form-message success-message">{sucesso}</div>}

      <form className="form-container" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="senhaAtual">Senha atual</label>

          <input
            id="senhaAtual"
            type="password"
            value={senhaAtual}
            onChange={(event) => setSenhaAtual(event.target.value)}
            disabled={salvando}
            autoComplete="current-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="novaSenha">Nova senha</label>

          <input
            id="novaSenha"
            type="password"
            value={novaSenha}
            onChange={(event) => setNovaSenha(event.target.value)}
            disabled={salvando}
            minLength={6}
            autoComplete="new-password"
          />

          <small>A nova senha deve possuir pelo menos 6 caracteres.</small>
        </div>

        <div className="form-group">
          <label htmlFor="confirmacaoSenha">Confirmar nova senha</label>

          <input
            id="confirmacaoSenha"
            type="password"
            value={confirmacaoSenha}
            onChange={(event) => setConfirmacaoSenha(event.target.value)}
            disabled={salvando}
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate(-1)}
            disabled={salvando}
          >
            Cancelar
          </button>

          <button type="submit" className="primary-button" disabled={salvando}>
            {salvando ? "Alterando..." : "Alterar senha"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default AlterarSenha;
