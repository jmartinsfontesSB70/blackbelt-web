import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

import Permissao from "../components/Permissao";

import {
  listarTiposCobranca,
  excluirTipoCobranca,
} from "../services/tipoCobrancaService";

import ConfirmModal from "../components/ConfirmModal";

function TipoCobrancas() {
  const navigate = useNavigate();

  const [tiposCobranca, setTiposCobranca] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [tipoCobrancaSelecionado, setTipoCobrancaSelecionado] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  async function carregarTiposCobranca() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await listarTiposCobranca();

      setTiposCobranca(dados);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarTiposCobranca();
  }, []);

  function handleExcluir(tipoCobranca) {
    setTipoCobrancaSelecionado(tipoCobranca);
    setModalExcluirAberto(true);
  }

  async function confirmarExclusao() {
    if (!tipoCobrancaSelecionado) {
      return;
    }

    try {
      setExcluindo(true);
      setErro("");

      await excluirTipoCobranca(tipoCobrancaSelecionado.id);

      setModalExcluirAberto(false);
      setTipoCobrancaSelecionado(null);

      await carregarTiposCobranca();
    } catch (error) {
      setModalExcluirAberto(false);
      setTipoCobrancaSelecionado(null);
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
    setTipoCobrancaSelecionado(null);
  }

  function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  if (carregando) {
    return (
      <main className="main">
        <h2>Tipos de Cobrança</h2>
        <p>Carregando tipos de cobrança...</p>
      </main>
    );
  }

  if (erro && tiposCobranca.length === 0) {
    return (
      <main className="main">
        <h2>Tipos de Cobrança</h2>
        <p>{erro}</p>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>Tipos de Cobrança</h2>

          <p>Gerencie os tipos de cobrança cadastrados na academia.</p>
        </div>

        <Permissao nome="TIPO_COBRANCA_CADASTRAR">
          <button
            className="primary-button"
            onClick={() => navigate("/tipos-cobranca/novo")}
          >
            + Novo tipo de cobrança
          </button>
        </Permissao>
      </div>

      {erro && <div className="form-message error-message">{erro}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Valor unitário</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {tiposCobranca.map((tipoCobranca) => (
              <tr key={tipoCobranca.id}>
                <td>{tipoCobranca.id}</td>

                <td className="name-cell">{tipoCobranca.nome}</td>

                <td>{tipoCobranca.descricao || ""}</td>

                <td>{formatarMoeda(tipoCobranca.valorUnitario)}</td>

                <td>
                  <span
                    className={
                      tipoCobranca.ativo ? "status active" : "status inactive"
                    }
                  >
                    {tipoCobranca.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>

                <td>
                  <div className="action-buttons">
                    <Permissao nome="TIPO_COBRANCA_EDITAR">
                      <button
                        type="button"
                        className="icon-button edit-button"
                        onClick={() =>
                          navigate("/tipos-cobranca/" + tipoCobranca.id)
                        }
                        title="Editar tipo de cobrança"
                      >
                        <Pencil size={18} />
                      </button>
                    </Permissao>

                    <Permissao nome="TIPO_COBRANCA_EXCLUIR">
                      <button
                        type="button"
                        className="icon-button delete-button"
                        onClick={() => handleExcluir(tipoCobranca)}
                        title="Excluir tipo de cobrança"
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

      <ConfirmModal
        aberto={modalExcluirAberto}
        titulo="Excluir tipo de cobrança?"
        mensagem={
          tipoCobrancaSelecionado
            ? "Deseja realmente excluir o tipo de cobrança " +
              tipoCobrancaSelecionado.nome +
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

export default TipoCobrancas;
