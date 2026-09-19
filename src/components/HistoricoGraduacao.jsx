import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { listarHistoricoGraduacaoPorAluno } from "../services/historicoGraduacaoService";

import HistoricoGraduacaoForm from "./HistoricoGraduacaoForm";

function HistoricoGraduacao({ alunoId }) {
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  async function carregarHistorico() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await listarHistoricoGraduacaoPorAluno(alunoId);

      setHistorico(dados);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (!alunoId) {
      return;
    }

    carregarHistorico();
  }, [alunoId]);

  function formatarData(data) {
    if (!data) {
      return "";
    }

    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;
  }

  function abrirFormulario() {
    setErro("");
    setMostrarFormulario(true);
  }

  function cancelarFormulario() {
    setErro("");
    setMostrarFormulario(false);
  }

  async function finalizarCadastro() {
    setMostrarFormulario(false);
    await carregarHistorico();
  }

  if (carregando) {
    return (
      <section className="form-container">
        <div className="form-section-title">
          <h3>Histórico de Graduação</h3>
        </div>

        <p>Carregando histórico...</p>
      </section>
    );
  }

  if (mostrarFormulario) {
    return (
      <section className="form-container">
        <div className="form-section-title">
          <h3>Registrar graduação</h3>

          <p>Registre uma nova graduação para o aluno.</p>
        </div>

        <HistoricoGraduacaoForm
          alunoId={alunoId}
          onCancelar={cancelarFormulario}
          onSucesso={finalizarCadastro}
        />
      </section>
    );
  }

  return (
    <section className="form-container">
      <div className="page-header">
        <div>
          <h3>Histórico de Graduação</h3>

          <p>Histórico de graduações do aluno.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={abrirFormulario}
        >
          <Plus size={18} />
          Registrar graduação
        </button>
      </div>

      {erro && <div className="form-message error-message">{erro}</div>}

      {historico.length === 0 && !erro && (
        <p>Nenhum histórico de graduação registrado.</p>
      )}

      {historico.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Modalidade</th>
                <th>Graduação</th>
                <th>Grau</th>
                <th>Observação</th>
              </tr>
            </thead>

            <tbody>
              {historico.map((registro) => (
                <tr key={registro.id}>
                  <td>{formatarData(registro.data)}</td>

                  <td>{registro.modalidadeNome}</td>

                  <td className="name-cell">{registro.graduacaoNome}</td>

                  <td>{registro.grau}</td>

                  <td>{registro.observacao || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default HistoricoGraduacao;
