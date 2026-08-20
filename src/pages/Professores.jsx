import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

import {
  listarProfessores,
  excluirProfessor,
} from "../services/professorService";

import ConfirmModal from "../components/ConfirmModal";

import Permissao from "../components/Permissao";

function formatarCpf(cpf) {
  if (!cpf) {
    return "";
  }

  const numeros = cpf.replace(/\D/g, "");

  if (numeros.length !== 11) {
    return cpf;
  }

  return (
    numeros.slice(0, 3) +
    "." +
    numeros.slice(3, 6) +
    "." +
    numeros.slice(6, 9) +
    "-" +
    numeros.slice(9)
  );
}

function formatarTelefone(telefone) {
  if (!telefone) {
    return "";
  }

  const numeros = telefone.replace(/\D/g, "");

  if (numeros.length === 11) {
    return (
      "(" +
      numeros.slice(0, 2) +
      ") " +
      numeros.slice(2, 7) +
      "-" +
      numeros.slice(7)
    );
  }

  if (numeros.length === 10) {
    return (
      "(" +
      numeros.slice(0, 2) +
      ") " +
      numeros.slice(2, 6) +
      "-" +
      numeros.slice(6)
    );
  }

  return telefone;
}

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

function formatarValor(valor) {
  if (valor === null || valor === undefined) {
    return "";
  }

  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function Professores() {
  const navigate = useNavigate();

  const [professores, setProfessores] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [professorSelecionado, setProfessorSelecionado] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  async function carregarProfessores() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await listarProfessores(paginaAtual, 10);

      setProfessores(dados.content);
      setTotalPaginas(dados.totalPages);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarProfessores();
  }, [paginaAtual]);

  function handleExcluir(professor) {
    setErro("");
    setProfessorSelecionado(professor);
    setModalExcluirAberto(true);
  }

  async function confirmarExclusao() {
    if (!professorSelecionado) {
      return;
    }

    const id = professorSelecionado.id;

    try {
      setExcluindo(true);
      setErro("");

      await excluirProfessor(id);

      setModalExcluirAberto(false);
      setProfessorSelecionado(null);

      if (professores.length === 1 && paginaAtual > 0) {
        setPaginaAtual(paginaAtual - 1);
      } else {
        await carregarProfessores();
      }
    } catch (error) {
      setModalExcluirAberto(false);
      setProfessorSelecionado(null);
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
    setProfessorSelecionado(null);
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
        <h2>Professores</h2>
        <p>Carregando professores...</p>
      </main>
    );
  }

  if (erro && professores.length === 0) {
    return (
      <main className="main">
        <h2>Professores</h2>
        <p>{erro}</p>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>Professores</h2>

          <p>Gerencie os professores cadastrados na academia.</p>
        </div>

        <Permissao nome="PROFESSOR_CRIAR">
          <button
            className="primary-button"
            onClick={() => navigate("/professores/novo")}
          >
            + Novo professor
          </button>
        </Permissao>
      </div>

      {erro && <div className="form-message error-message">{erro}</div>}

      <div className="table-container">
        <table className="data-table professores-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>E-mail</th>
              <th>Contratação</th>
              <th>Hora/aula</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {professores.map((professor) => (
              <tr key={professor.id}>
                <td>{professor.id}</td>

                <td className="name-cell">{professor.nome}</td>

                <td>{formatarCpf(professor.cpf)}</td>

                <td>{formatarTelefone(professor.telefone)}</td>

                <td>{professor.email}</td>

                <td>{formatarData(professor.dataContratacao)}</td>

                <td>{formatarValor(professor.valorHoraAula)}</td>

                <td>
                  <span
                    className={
                      professor.ativo ? "status active" : "status inactive"
                    }
                  >
                    {professor.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>

                <td>
                  <div className="action-buttons">
                    <Permissao nome="PROFESSOR_EDITAR">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => navigate("/professores/" + professor.id)}
                        title="Editar professor"
                      >
                        <Pencil size={18} />
                      </button>
                    </Permissao>

                    <Permissao nome="PROFESSOR_EXCLUIR">
                      <button
                        type="button"
                        className="btn-delete"
                        onClick={() => handleExcluir(professor)}
                        title="Excluir professor"
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
        titulo="Excluir professor?"
        mensagem={
          professorSelecionado
            ? "Deseja realmente excluir o professor " +
              professorSelecionado.nome +
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

export default Professores;
