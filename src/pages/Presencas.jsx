import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

import { listarPresencas, excluirPresenca } from "../services/presencaService";

import ConfirmModal from "../components/ConfirmModal";
import Permissao from "../components/Permissao";

function formatarData(data) {
  if (!data) {
    return "";
  }

  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano}`;
}

function Presencas() {
  const navigate = useNavigate();

  const [presencas, setPresencas] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [presencaSelecionada, setPresencaSelecionada] = useState(null);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const carregarPresencas = useCallback(async () => {
    try {
      setCarregando(true);
      setErro("");

      const dados = await listarPresencas(paginaAtual, 10);

      setPresencas(dados.content);
      setTotalPaginas(dados.totalPages);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }, [paginaAtual]);

  useEffect(() => {
    carregarPresencas();
  }, [carregarPresencas]);

  function handleExcluir(presenca) {
    setErro("");
    setPresencaSelecionada(presenca);
    setModalExcluirAberto(true);
  }

  async function confirmarExclusao() {
    if (!presencaSelecionada) {
      return;
    }

    const id = presencaSelecionada.id;

    try {
      setExcluindo(true);
      setErro("");

      await excluirPresenca(id);

      setModalExcluirAberto(false);
      setPresencaSelecionada(null);

      if (presencas.length === 1 && paginaAtual > 0) {
        setPaginaAtual(paginaAtual - 1);
      } else {
        await carregarPresencas();
      }
    } catch (error) {
      setModalExcluirAberto(false);
      setPresencaSelecionada(null);
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
    setPresencaSelecionada(null);
  }

  function irParaPaginaAnterior() {
    if (paginaAtual > 0) {
      setPaginaAtual(paginaAtual - 1);
    }
  }

  function irParaProximaPagina() {
    if (paginaAtual < totalPaginas - 1) {
      setPaginaAtual(paginaAtual + 1);
    }
  }

  if (carregando) {
    return (
      <main className="main">
        <h2>Presenças</h2>
        <p>Carregando presenças...</p>
      </main>
    );
  }

  if (erro && presencas.length === 0) {
    return (
      <main className="main">
        <h2>Presenças</h2>
        <p>{erro}</p>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>Presenças</h2>
          <p>Controle de presença dos alunos nas aulas.</p>
        </div>

        <Permissao nome="PRESENCA_CRIAR">
          <button
            className="primary-button"
            onClick={() => navigate("/presencas/nova")}
          >
            + Nova presença
          </button>
        </Permissao>
      </div>

      {erro && <div className="form-message error-message">{erro}</div>}

      <div className="table-container">
        <table className="data-table presencas-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Aluno</th>
              <th>Turma</th>
              <th>Data</th>
              <th>Presença</th>
              <th>Observação</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {presencas.map((presenca) => (
              <tr key={presenca.id}>
                <td>{presenca.id}</td>

                <td className="name-cell">{presenca.alunoNome}</td>

                <td>{presenca.turmaNome}</td>

                <td>{formatarData(presenca.data)}</td>

                <td>
                  <span
                    className={
                      presenca.presente ? "status active" : "status inactive"
                    }
                  >
                    {presenca.presente ? "Presente" : "Ausente"}
                  </span>
                </td>

                <td>{presenca.observacao || ""}</td>

                <td>
                  <div className="action-buttons">
                    <Permissao nome="PRESENCA_EDITAR">
                      <button
                        type="button"
                        className="icon-button edit-button"
                        onClick={() => navigate(`/presencas/${presenca.id}`)}
                        title="Editar presença"
                      >
                        <Pencil size={18} />
                      </button>
                    </Permissao>

                    <Permissao nome="PRESENCA_EXCLUIR">
                      <button
                        type="button"
                        className="btn-action btn-delete"
                        onClick={() => handleExcluir(presenca)}
                        title="Excluir presença"
                      >
                        <Trash2 size={18} />
                      </button>
                    </Permissao>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          type="button"
          className="pagination-button"
          onClick={irParaPaginaAnterior}
          disabled={paginaAtual === 0 || carregando}
        >
          ← Anterior
        </button>

        <span>
          Página {paginaAtual + 1} de {totalPaginas}
        </span>

        <button
          type="button"
          className="pagination-button"
          onClick={irParaProximaPagina}
          disabled={paginaAtual >= totalPaginas - 1 || carregando}
        >
          Próxima →
        </button>
      </div>

      <ConfirmModal
        aberto={modalExcluirAberto}
        titulo="Excluir presença"
        mensagem={
          presencaSelecionada
            ? `Deseja realmente excluir a presença de ${presencaSelecionada.alunoNome}?`
            : ""
        }
        textoConfirmar={excluindo ? "Excluindo..." : "Excluir"}
        textoCancelar="Cancelar"
        onConfirmar={confirmarExclusao}
        onCancelar={cancelarExclusao}
        carregando={excluindo}
      />
    </main>
  );
}

export default Presencas;
