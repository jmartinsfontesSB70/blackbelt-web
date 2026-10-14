import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Search } from "lucide-react";

import { listarCobrancas, excluirCobranca } from "../services/cobrancaService";

import ConfirmModal from "../components/ConfirmModal";
import Permissao from "../components/Permissao";

function formatarData(data) {
  if (!data) {
    return "";
  }

  const partes = data.split("-");

  const ano = partes[0];
  const mes = partes[1];
  const dia = partes[2];

  return dia + "/" + mes + "/" + ano;
}

function formatarCompetencia(competencia) {
  if (!competencia) {
    return "";
  }

  const partes = competencia.split("-");

  return partes[1] + "/" + partes[0];
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarStatus(status) {
  switch (status) {
    case "PENDENTE":
      return "Pendente";
    case "PARCIAL":
      return "Parcial";
    case "PAGO":
      return "Pago";
    case "CANCELADO":
      return "Cancelada";
    default:
      return status;
  }
}

function Cobrancas() {
  const navigate = useNavigate();

  const [cobrancas, setCobrancas] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [textoPesquisa, setTextoPesquisa] = useState("");
  const [pesquisa, setPesquisa] = useState("");

  const [sort, setSort] = useState("dataVencimento");
  const [direction, setDirection] = useState("desc");

  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [cobrancaSelecionada, setCobrancaSelecionada] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  async function carregarCobrancas() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await listarCobrancas(
        paginaAtual,
        10,
        pesquisa,
        sort,
        direction,
      );

      setCobrancas(dados.content);
      setTotalPaginas(dados.totalPages);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarCobrancas();
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

  function handleExcluir(cobranca) {
    setErro("");
    setCobrancaSelecionada(cobranca);
    setModalExclusaoAberto(true);
  }

  async function confirmarExclusao() {
    if (!cobrancaSelecionada) {
      return;
    }

    const id = cobrancaSelecionada.id;

    try {
      setExcluindo(true);
      setErro("");

      await excluirCobranca(id);

      setModalExclusaoAberto(false);
      setCobrancaSelecionada(null);

      await carregarCobrancas();
    } catch (error) {
      setModalExclusaoAberto(false);
      setCobrancaSelecionada(null);
      setErro(error.message);
    } finally {
      setExcluindo(false);
    }
  }

  function cancelarExclusao() {
    if (excluindo) {
      return;
    }

    setModalExclusaoAberto(false);
    setCobrancaSelecionada(null);
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

  function obterClasseStatus(status) {
    switch (status) {
      case "PAGO":
        return "status active";
      case "CANCELADO":
        return "status inactive";
      case "PARCIAL":
        return "status partial";
      default:
        return "status pending";
    }
  }

  if (carregando) {
    return (
      <main className="main">
        <h2>Cobranças</h2>
        <p>Carregando cobranças...</p>
      </main>
    );
  }

  if (erro && cobrancas.length === 0) {
    return (
      <main className="main">
        <h2>Cobranças</h2>
        <p>{erro}</p>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>Cobranças</h2>

          <p>Gerencie as cobranças dos alunos.</p>

          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Pesquisar aluno ou descrição..."
              value={textoPesquisa}
              onChange={(event) => setTextoPesquisa(event.target.value)}
              onKeyDown={handlePesquisaKeyDown}
            />

            <button
              type="button"
              className="search-button"
              onClick={executarPesquisa}
              title="Pesquisar"
              aria-label="Pesquisar aluno ou descrição"
            >
              <Search size={19} />
            </button>
          </div>
        </div>

        <Permissao nome="COBRANCA_CADASTRAR">
          <button
            className="primary-button"
            onClick={() => navigate("/cobrancas/nova")}
          >
            + Nova cobrança
          </button>
        </Permissao>
      </div>

      {erro && <div className="form-message error-message">{erro}</div>}

      <div className="table-container">
        <table className="data-table cobrancas-table">
          <thead>
            <tr>
              <th
                onClick={() => ordenarPor("id")}
                style={{ cursor: "pointer" }}
              >
                ID {sort === "id" ? (direction === "asc" ? "↑" : "↓") : ""}
              </th>

              <th>Aluno</th>

              <th className="cobranca-tipo">Tipo</th>

              <th className="cobranca-descricao">Descrição</th>

              <th
                onClick={() => ordenarPor("dataVencimento")}
                style={{ cursor: "pointer" }}
              >
                Vencimento{" "}
                {sort === "dataVencimento"
                  ? direction === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </th>

              <th>Competência</th>

              <th>Valor</th>

              <th>Status</th>

              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {cobrancas.length === 0 ? (
              <tr>
                <td colSpan="9">Nenhuma cobrança encontrada.</td>
              </tr>
            ) : (
              cobrancas.map((cobranca) => {
                return (
                  <tr key={cobranca.id}>
                    <td>{cobranca.id}</td>

                    <td className="name-cell">{cobranca.alunoNome}</td>

                    <td className="cobranca-tipo">
                      {cobranca.tipoCobrancaNome}
                    </td>

                    <td className="cobranca-descricao">{cobranca.descricao}</td>

                    <td>{formatarData(cobranca.dataVencimento)}</td>

                    <td>{formatarCompetencia(cobranca.competencia)}</td>

                    <td>{formatarMoeda(cobranca.valor)}</td>

                    <td>
                      <span className={obterClasseStatus(cobranca.status)}>
                        {formatarStatus(cobranca.status)}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        <Permissao nome="COBRANCA_LISTAR">
                          <button
                            type="button"
                            className="icon-button edit-button"
                            onClick={() =>
                              navigate("/cobrancas/" + cobranca.id)
                            }
                            title="Visualizar cobrança"
                          >
                            <Pencil size={18} />
                          </button>
                        </Permissao>

                        <Permissao nome="COBRANCA_EXCLUIR">
                          <button
                            type="button"
                            className="icon-button delete-button"
                            onClick={() => handleExcluir(cobranca)}
                            title={
                              cobranca.status === "PENDENTE"
                                ? "Excluir cobrança"
                                : "Esta cobrança não pode ser excluída"
                            }
                            disabled={cobranca.status !== "PENDENTE"}
                          >
                            <Trash2 size={18} />
                          </button>
                        </Permissao>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
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
          Página {paginaAtual + 1} de {totalPaginas === 0 ? 1 : totalPaginas}
        </span>

        <button
          type="button"
          className="pagination-button"
          onClick={irParaProximaPagina}
          disabled={
            totalPaginas === 0 || paginaAtual >= totalPaginas - 1 || carregando
          }
        >
          Próxima →
        </button>
      </div>

      <ConfirmModal
        aberto={modalExclusaoAberto}
        titulo="Excluir cobrança?"
        mensagem={
          cobrancaSelecionada
            ? "Deseja realmente excluir a cobrança de " +
              cobrancaSelecionada.alunoNome +
              " no valor de " +
              formatarMoeda(cobrancaSelecionada.valor) +
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

export default Cobrancas;
