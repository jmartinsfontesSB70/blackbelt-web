import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Search } from "lucide-react";

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

  const [textoPesquisa, setTextoPesquisa] = useState("");
  const [pesquisa, setPesquisa] = useState("");

  const [sort, setSort] = useState("data");
  const [direction, setDirection] = useState("desc");

  const carregarPresencas = useCallback(async () => {
    try {
      setCarregando(true);
      setErro("");

      const dados = await listarPresencas(
        paginaAtual,
        10,
        pesquisa,
        sort,
        direction,
      );

      setPresencas(dados.content);
      setTotalPaginas(dados.totalPages);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }, [paginaAtual, pesquisa, sort, direction]);

  useEffect(() => {
    carregarPresencas();
  }, [carregarPresencas]);

  function executarPesquisa() {
    setPaginaAtual(0);
    setPesquisa(textoPesquisa);
  }

  function handlePesquisaKeyDown(event) {
    if (event.key === "Enter") {
      executarPesquisa();
    }
  }

  function ordenarPor(campo) {
    if (sort === campo) {
      setDirection((direcaoAtual) => (direcaoAtual === "asc" ? "desc" : "asc"));
    } else {
      setSort(campo);
      setDirection("asc");
    }

    setPaginaAtual(0);
  }

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

          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Pesquisar aluno ou turma..."
              value={textoPesquisa}
              onChange={(event) => setTextoPesquisa(event.target.value)}
              onKeyDown={handlePesquisaKeyDown}
            />

            <button
              type="button"
              className="search-button"
              onClick={executarPesquisa}
              title="Pesquisar"
              aria-label="Pesquisar aluno ou turma"
            >
              <Search size={19} />
            </button>
          </div>
        </div>

        <div className="action-buttons">
          <Permissao nome="PRESENCA_CRIAR">
            <button
              className="primary-button"
              onClick={() => navigate("/presencas/chamada")}
            >
              + Nova chamada
            </button>

            <button
              className="primary-button"
              onClick={() => navigate("/presencas/nova")}
            >
              + Nova presença
            </button>
          </Permissao>
        </div>
      </div>

      {erro && <div className="form-message error-message">{erro}</div>}

      <div className="table-container">
        <table className="data-table presencas-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Aluno</th>
              <th>Turma</th>

              <th
                onClick={() => ordenarPor("data")}
                style={{ cursor: "pointer" }}
              >
                Data {sort === "data" ? (direction === "asc" ? "↑" : "↓") : ""}
              </th>

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
                        className="icon-button delete-button"
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
