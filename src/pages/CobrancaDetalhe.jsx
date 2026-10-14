import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";

import {
  buscarCobrancaPorId,
  listarPagamentos,
  cancelarCobranca,
  excluirPagamento,
} from "../services/cobrancaService";

import PagamentoForm from "../components/PagamentoForm";
import Permissao from "../components/Permissao";
import ConfirmModal from "../components/ConfirmModal";

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data) {
  if (!data) {
    return "-";
  }

  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano}`;
}

function formatarCompetencia(competencia) {
  if (!competencia) {
    return "-";
  }

  const [ano, mes] = competencia.split("-");

  return `${mes}/${ano}`;
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

function formatarFormaPagamento(formaPagamento) {
  switch (formaPagamento) {
    case "DINHEIRO":
      return "Dinheiro";

    case "PIX":
      return "PIX";

    case "CARTAO_CREDITO":
      return "Cartão de crédito";

    case "CARTAO_DEBITO":
      return "Cartão de débito";

    case "TRANSFERENCIA":
      return "Transferência";

    default:
      return formaPagamento;
  }
}

function CobrancaDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cobranca, setCobranca] = useState(null);
  const [pagamentos, setPagamentos] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [mostrarPagamentoForm, setMostrarPagamentoForm] = useState(false);

  const [mostrarConfirmacaoCancelamento, setMostrarConfirmacaoCancelamento] =
    useState(false);

  const [mostrarConfirmacaoExclusao, setMostrarConfirmacaoExclusao] =
    useState(false);

  const [pagamentoSelecionado, setPagamentoSelecionado] = useState(null);

  const [cancelando, setCancelando] = useState(false);
  const [excluindoPagamento, setExcluindoPagamento] = useState(false);

  async function carregarDados() {
    try {
      setErro("");

      const [dadosCobranca, dadosPagamentos] = await Promise.all([
        buscarCobrancaPorId(id),
        listarPagamentos(id),
      ]);

      setCobranca(dadosCobranca);
      setPagamentos(dadosPagamentos);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [id]);

  function calcularTotalPago() {
    return pagamentos.reduce(
      (total, pagamento) => total + Number(pagamento.valor || 0),
      0,
    );
  }

  function calcularSaldo() {
    if (!cobranca) {
      return 0;
    }

    return Math.max(Number(cobranca.valor || 0) - calcularTotalPago(), 0);
  }

  async function handlePagamentoRegistrado() {
    setErro("");
    setSucesso("");

    setMostrarPagamentoForm(false);

    await carregarDados();

    setSucesso("Pagamento registrado com sucesso!");
  }

  async function handleCancelarCobranca() {
    setErro("");
    setSucesso("");
    setCancelando(true);

    try {
      await cancelarCobranca(id);

      setSucesso("Cobrança cancelada com sucesso!");

      await carregarDados();
    } catch (error) {
      setErro(error.message);
    } finally {
      setMostrarConfirmacaoCancelamento(false);
      setCancelando(false);
    }
  }

  function handleExcluirPagamento(pagamento) {
    setErro("");
    setSucesso("");

    setPagamentoSelecionado(pagamento);
    setMostrarConfirmacaoExclusao(true);
  }

  async function confirmarExclusaoPagamento() {
    if (!pagamentoSelecionado) {
      return;
    }

    try {
      setExcluindoPagamento(true);
      setErro("");
      setSucesso("");

      await excluirPagamento(id, pagamentoSelecionado.id);

      setMostrarConfirmacaoExclusao(false);
      setPagamentoSelecionado(null);

      await carregarDados();

      setSucesso("Pagamento excluído com sucesso!");
    } catch (error) {
      setErro(error.message);
    } finally {
      setExcluindoPagamento(false);
    }
  }

  function cancelarExclusaoPagamento() {
    if (excluindoPagamento) {
      return;
    }

    setMostrarConfirmacaoExclusao(false);
    setPagamentoSelecionado(null);
  }

  if (carregando) {
    return (
      <main className="main">
        <h2>Detalhes da cobrança</h2>

        <p>Carregando cobrança...</p>
      </main>
    );
  }

  if (!cobranca) {
    return (
      <main className="main">
        <h2>Detalhes da cobrança</h2>

        <div className="form-message error-message">
          Cobrança não encontrada.
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/cobrancas")}
          >
            Voltar
          </button>
        </div>
      </main>
    );
  }

  const totalPago = calcularTotalPago();
  const saldo = calcularSaldo();

  const podePagar =
    cobranca.status !== "PAGO" && cobranca.status !== "CANCELADO";

  const podeCancelar =
    cobranca.status !== "PAGO" && cobranca.status !== "CANCELADO";

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>Detalhes da cobrança</h2>

          <p>Consulte os dados da cobrança e o histórico de pagamentos.</p>
        </div>
      </div>

      {erro && <div className="form-message error-message">{erro}</div>}

      {sucesso && <div className="form-message success-message">{sucesso}</div>}

      <div className="form-container">
        <div className="form-grid">
          <div className="form-section-title">
            <h3>Dados da cobrança</h3>

            <p>Informações da cobrança vinculada à matrícula do aluno.</p>
          </div>

          <div className="form-group">
            <label>Aluno</label>

            <input type="text" value={cobranca.alunoNome || ""} readOnly />
          </div>

          <div className="form-group">
            <label>Tipo de cobrança</label>

            <input
              type="text"
              value={cobranca.tipoCobrancaNome || ""}
              readOnly
            />
          </div>

          <div className="form-group full-width">
            <label>Descrição</label>

            <input type="text" value={cobranca.descricao || ""} readOnly />
          </div>

          <div className="form-group">
            <label>Competência</label>

            <input
              type="text"
              value={formatarCompetencia(cobranca.competencia)}
              readOnly
            />
          </div>

          <div className="form-group">
            <label>Data de vencimento</label>

            <input
              type="text"
              value={formatarData(cobranca.dataVencimento)}
              readOnly
            />
          </div>

          <div className="form-group">
            <label>Quantidade</label>

            <input type="text" value={cobranca.quantidade} readOnly />
          </div>

          <div className="form-group">
            <label>Valor unitário</label>

            <input
              type="text"
              value={formatarMoeda(cobranca.valorUnitario)}
              readOnly
            />
          </div>

          <div className="form-group">
            <label>Valor total</label>

            <input type="text" value={formatarMoeda(cobranca.valor)} readOnly />
          </div>

          <div className="form-group">
            <label>Status</label>

            <div>
              <span className={obterClasseStatus(cobranca.status)}>
                {formatarStatus(cobranca.status)}
              </span>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Observação</label>

            <textarea value={cobranca.observacao || ""} readOnly rows={4} />
          </div>
        </div>
      </div>

      <div className="form-container">
        <div className="form-grid">
          <div className="form-section-title">
            <h3>Resumo financeiro</h3>

            <p>Acompanhe os valores recebidos e o saldo da cobrança.</p>
          </div>

          <div className="form-group">
            <label>Valor da cobrança</label>

            <input type="text" value={formatarMoeda(cobranca.valor)} readOnly />
          </div>

          <div className="form-group">
            <label>Total pago</label>

            <input type="text" value={formatarMoeda(totalPago)} readOnly />
          </div>

          <div className="form-group">
            <label>Saldo</label>

            <input type="text" value={formatarMoeda(saldo)} readOnly />
          </div>
        </div>

        {podePagar && (
          <div className="form-actions">
            <Permissao nome="PAGAMENTO_CADASTRAR">
              <button
                type="button"
                className="primary-button"
                onClick={() => setMostrarPagamentoForm(true)}
              >
                + Registrar pagamento
              </button>
            </Permissao>
          </div>
        )}
      </div>

      {mostrarPagamentoForm && podePagar && (
        <PagamentoForm
          cobrancaId={id}
          saldo={saldo}
          onPagamentoRegistrado={handlePagamentoRegistrado}
          onCancelar={() => setMostrarPagamentoForm(false)}
        />
      )}

      <div className="form-container cobranca-historico">
        <div className="form-grid">
          <div className="form-section-title">
            <h3>Histórico de pagamentos</h3>

            <p>Pagamentos registrados para esta cobrança.</p>
          </div>

          {pagamentos.length === 0 ? (
            <div className="form-group full-width">
              <p>Nenhum pagamento registrado.</p>
            </div>
          ) : (
            <div className="table-container full-width">
              <table className="data-table cobranca-pagamentos-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Forma de pagamento</th>
                    <th>Valor</th>
                    <th>Observação</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {pagamentos.map((pagamento) => (
                    <tr key={pagamento.id}>
                      <td>{formatarData(pagamento.dataPagamento)}</td>

                      <td>
                        {formatarFormaPagamento(pagamento.formaPagamento)}
                      </td>

                      <td>{formatarMoeda(pagamento.valor)}</td>

                      <td>{pagamento.observacao || "-"}</td>

                      <td>
                        <div className="action-buttons">
                          <Permissao nome="PAGAMENTO_EXCLUIR">
                            <button
                              type="button"
                              className="icon-button delete-button"
                              onClick={() => handleExcluirPagamento(pagamento)}
                              title="Excluir pagamento"
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
          )}
        </div>
      </div>

      <div className="form-container">
        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/cobrancas")}
          >
            Voltar
          </button>

          {podeCancelar && (
            <Permissao nome="COBRANCA_CANCELAR">
              <button
                type="button"
                className="delete-button"
                onClick={() => setMostrarConfirmacaoCancelamento(true)}
              >
                Cancelar cobrança
              </button>
            </Permissao>
          )}
        </div>
      </div>

      <ConfirmModal
        aberto={mostrarConfirmacaoCancelamento}
        titulo="Cancelar cobrança"
        mensagem="Tem certeza que deseja cancelar esta cobrança?"
        onConfirmar={handleCancelarCobranca}
        onCancelar={() => setMostrarConfirmacaoCancelamento(false)}
        carregando={cancelando}
        textoCancelar="Voltar"
        textoConfirmar="Cancelar cobrança"
        icone="⚠️"
      />

      <ConfirmModal
        aberto={mostrarConfirmacaoExclusao}
        titulo="Excluir pagamento?"
        mensagem={
          pagamentoSelecionado
            ? "Deseja realmente excluir o pagamento de " +
              formatarMoeda(pagamentoSelecionado.valor) +
              " realizado em " +
              formatarData(pagamentoSelecionado.dataPagamento) +
              "?"
            : ""
        }
        onConfirmar={confirmarExclusaoPagamento}
        onCancelar={cancelarExclusaoPagamento}
        carregando={excluindoPagamento}
        textoCancelar="Voltar"
        textoConfirmar="Excluir pagamento"
      />
    </main>
  );
}

export default CobrancaDetalhe;
