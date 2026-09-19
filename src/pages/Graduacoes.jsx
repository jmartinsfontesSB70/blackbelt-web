import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

import {
  listarGraduacoesPorModalidade,
  excluirGraduacao,
} from "../services/graduacaoService";

import { buscarModalidadePorId } from "../services/modalidadeService";

import ConfirmModal from "../components/ConfirmModal";

function Graduacoes() {
  const navigate = useNavigate();
  const { modalidadeId } = useParams();

  const [graduacoes, setGraduacoes] = useState([]);
  const [modalidade, setModalidade] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [graduacaoSelecionada, setGraduacaoSelecionada] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [dadosGraduacoes, dadosModalidade] = await Promise.all([
        listarGraduacoesPorModalidade(modalidadeId),
        buscarModalidadePorId(modalidadeId),
      ]);

      setGraduacoes(dadosGraduacoes);
      setModalidade(dadosModalidade);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [modalidadeId]);

  function handleExcluir(graduacao) {
    setGraduacaoSelecionada(graduacao);
    setModalExcluirAberto(true);
  }

  async function confirmarExclusao() {
    if (!graduacaoSelecionada) {
      return;
    }

    try {
      setExcluindo(true);
      setErro("");

      await excluirGraduacao(graduacaoSelecionada.id);

      setModalExcluirAberto(false);
      setGraduacaoSelecionada(null);

      await carregarDados();
    } catch (error) {
      setModalExcluirAberto(false);
      setGraduacaoSelecionada(null);
      setErro(error.message);
    } finally {
      setExcluindo(false);
    }
  }

  function cancelarExclusao() {
    if (excluindo) {
      return;
    }

    setModalExcluirAberto(false);
    setGraduacaoSelecionada(null);
  }

  function voltar() {
    navigate("/modalidades");
  }

  if (carregando) {
    return (
      <main className="main">
        <h2>Graduações</h2>
        <p>Carregando graduações...</p>
      </main>
    );
  }

  if (erro && !modalidade) {
    return (
      <main className="main">
        <h2>Graduações</h2>
        <p>{erro}</p>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>Graduações</h2>

          <p>
            {modalidade
              ? `Gerencie as graduações da modalidade ${modalidade.nome}.`
              : "Gerencie as graduações da modalidade."}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" className="secondary-button" onClick={voltar}>
            ← Voltar
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() =>
              navigate("/modalidades/" + modalidadeId + "/graduacoes/nova")
            }
          >
            + Nova graduação
          </button>
        </div>
      </div>

      {erro && <div className="form-message error-message">{erro}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ordem</th>
              <th>Graduação</th>
              <th>Quantidade de graus</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {graduacoes.map((graduacao) => (
              <tr key={graduacao.id}>
                <td>{graduacao.ordem}</td>

                <td className="name-cell">{graduacao.nome}</td>

                <td>{graduacao.quantidadeGraus}</td>

                <td>
                  <div className="action-buttons">
                    <button
                      type="button"
                      className="icon-button edit-button"
                      onClick={() =>
                        navigate(
                          "/modalidades/" +
                            modalidadeId +
                            "/graduacoes/" +
                            graduacao.id,
                        )
                      }
                      title="Editar graduação"
                      aria-label="Editar graduação"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      type="button"
                      className="icon-button delete-button"
                      onClick={() => handleExcluir(graduacao)}
                      title="Excluir graduação"
                      aria-label="Excluir graduação"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {graduacoes.length === 0 && (
        <p>Nenhuma graduação cadastrada para esta modalidade.</p>
      )}

      <ConfirmModal
        aberto={modalExcluirAberto}
        titulo="Excluir graduação?"
        mensagem={
          graduacaoSelecionada
            ? "Deseja realmente excluir a graduação " +
              graduacaoSelecionada.nome +
              "?"
            : ""
        }
        onConfirmar={confirmarExclusao}
        onCancelar={cancelarExclusao}
        carregando={excluindo}
      />
    </main>
  );
}

export default Graduacoes;
