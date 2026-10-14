import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ativarLicenca } from "../services/licencaService";
import "./LicencaAtivacao.css";

function LicencaAtivacao() {
  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState(() => {
    const aviso = sessionStorage.getItem("licencaMensagem");

    sessionStorage.removeItem("licencaMensagem");

    return aviso || "";
  });

  const [dataExpiracao, setDataExpiracao] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [licencaAtivada, setLicencaAtivada] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setMensagem("");
    setCarregando(true);

    try {
      const resposta = await ativarLicenca(token.trim());

      setMensagem(resposta.mensagem || "Licença ativada com sucesso!");

      setDataExpiracao(resposta.dataExpiracao || "");
      setLicencaAtivada(true);
      setToken("");
    } catch (error) {
      setErro(error.message || "Não foi possível ativar a licença.");
    } finally {
      setCarregando(false);
    }
  }

  function acessarSistema() {
    navigate("/login", { replace: true });
  }

  const dataFormatada = dataExpiracao
    ? new Date(`${dataExpiracao}T00:00:00`).toLocaleDateString("pt-BR")
    : "";

  return (
    <main className="licenca-ativacao-page">
      <section className="licenca-ativacao-card">
        <h1>Ativação do BlackBelt</h1>

        {licencaAtivada ? (
          <>
            <p className="licenca-sucesso">{mensagem}</p>

            {dataFormatada && (
              <p>
                Sua licença é válida até <strong>{dataFormatada}</strong>.
              </p>
            )}

            <button
              type="button"
              className="licenca-botao"
              onClick={acessarSistema}
            >
              Acessar o BlackBelt
            </button>
          </>
        ) : (
          <>
            <p>
              O período de avaliação terminou ou não há uma licença comercial
              válida. Informe seu token de ativação para continuar utilizando o
              sistema.
            </p>

            {mensagem && <p className="licenca-aviso">{mensagem}</p>}

            {erro && (
              <p className="licenca-erro" role="alert">
                {erro}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <label htmlFor="token">Token de ativação</label>

              <input
                id="token"
                type="text"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Cole seu token aqui"
                autoComplete="off"
                required
                disabled={carregando}
              />

              <button
                type="submit"
                className="licenca-botao"
                disabled={carregando}
              >
                {carregando ? "Ativando..." : "Ativar licença"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

export default LicencaAtivacao;
