import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Search } from "lucide-react";

import { listarTurmas, excluirTurma } from "../services/turmaService";

import ConfirmModal from "../components/ConfirmModal";
import Permissao from "../components/Permissao";

function formatarHorario(horario) {
  if (!horario) {
    return "";
  }

  return horario.slice(0, 5);
}

function Turmas() {
  const navigate = useNavigate();

  const [turmas, setTurmas] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const [textoPesquisa, setTextoPesquisa] = useState("");
  const [pesquisa, setPesquisa] = useState("");

  const [sort, setSort] = useState("id");
  const [direction, setDirection] = useState("desc");

  async function carregarTurmas() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await listarTurmas(
        paginaAtual,
        10,
        pesquisa,
        sort,
        direction,
      );

      setTurmas(dados.content);
      setTotalPaginas(dados.totalPages);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarTurmas();
  }, [paginaAtual, pesquisa, sort, direction]);

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

  function handleExcluir(turma) {
    setErro("");
    setTurmaSelecionada(turma);
    setModalExcluirAberto(true);
  }

  async function confirmarExclusao() {
    if (!turmaSelecionada) {
      return;
    }

    const id = turmaSelecionada.id;

    try {
      setExcluindo(true);
      setErro("");

      await excluirTurma(id);

      setModalExcluirAberto(false);
      setTurmaSelecionada(null);

      if (turmas.length === 1 && paginaAtual > 0) {
        setPaginaAtual(paginaAtual - 1);
      } else {
        await carregarTurmas();
      }
    } catch (error) {
      /*
       * A exclusão pode ser recusada pelo backend.
       *
       * Nesse caso fechamos o modal e mostramos
       * a mensagem retornada pela API.
       */
      setModalExcluirAberto(false);
      setTurmaSelecionada(null);
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
    setTurmaSelecionada(null);
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
        <h2>Turmas</h2>
        <p>Carregando turmas...</p>
      </main>
    );
  }

  if (erro && turmas.length === 0) {
    return (
      <main className="main">
        <h2>Turmas</h2>
        <p>{erro}</p>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>Turmas</h2>

          <p>Gerencie as turmas cadastradas na academia.</p>

          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Pesquisar turma..."
              value={textoPesquisa}
              onChange={(event) => setTextoPesquisa(event.target.value)}
              onKeyDown={handlePesquisaKeyDown}
            />

            <button
              type="button"
              className="search-button"
              onClick={executarPesquisa}
              title="Pesquisar"
              aria-label="Pesquisar turma"
            >
              <Search size={19} />
            </button>
          </div>
        </div>

        <Permissao nome="TURMA_CRIAR">
          <button
            className="primary-button"
            onClick={() => navigate("/turmas/nova")}
          >
            + Nova turma
          </button>
        </Permissao>
      </div>

      {erro && <div className="form-message error-message">{erro}</div>}

      <div className="table-container">
        <table className="data-table turmas-table">
          <thead>
            <tr>
              <th>ID</th>

              <th
                onClick={() => ordenarPor("nome")}
                style={{ cursor: "pointer" }}
              >
                Nome {sort === "nome" ? (direction === "asc" ? "↑" : "↓") : ""}
              </th>

              <th>Professor</th>
              <th>Modalidade</th>
              <th>Dias</th>
              <th>Horário</th>
              <th>Capacidade</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {turmas.map((turma) => (
              <tr key={turma.id}>
                <td>{turma.id}</td>

                <td className="name-cell">{turma.nome}</td>

                <td>{turma.professorNome}</td>

                <td>{turma.modalidadeNome}</td>

                <td>{turma.diasSemana}</td>

                <td>
                  {formatarHorario(turma.horarioInicio)}
                  {" - "}
                  {formatarHorario(turma.horarioFim)}
                </td>

                <td>{turma.capacidade}</td>

                <td>
                  <span
                    className={
                      turma.ativa ? "status active" : "status inactive"
                    }
                  >
                    {turma.ativa ? "Ativa" : "Inativa"}
                  </span>
                </td>

                <td>
                  <div className="action-buttons">
                    <Permissao nome="TURMA_EDITAR">
                      <button
                        type="button"
                        className="icon-button edit-button"
                        onClick={() => navigate("/turmas/" + turma.id)}
                        title="Editar turma"
                      >
                        <Pencil size={18} />
                      </button>
                    </Permissao>

                    <Permissao nome="TURMA_EXCLUIR">
                      <button
                        type="button"
                        className="icon-button delete-button"
                        onClick={() => handleExcluir(turma)}
                        title="Excluir turma"
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
        titulo="Excluir turma?"
        mensagem={
          turmaSelecionada
            ? "Deseja realmente excluir a turma " + turmaSelecionada.nome + "?"
            : ""
        }
        onConfirmar={confirmarExclusao}
        onCancelar={cancelarExclusao}
        carregando={excluindo}
      />
    </main>
  );
}

export default Turmas;
