import { useState } from "react";

import { cadastrarPagamento } from "../services/cobrancaService";

function PagamentoForm({
  cobrancaId,
  saldo,
  onPagamentoRegistrado,
  onCancelar,
}) {
  const [dataPagamento, setDataPagamento] = useState("");
  const [valorPagamento, setValorPagamento] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [observacao, setObservacao] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setSalvando(true);

    if (!dataPagamento) {
      setErro("A data do pagamento deve ser informada.");
      setSalvando(false);
      return;
    }

    if (!valorPagamento || Number(valorPagamento) <= 0) {
      setErro("O valor do pagamento deve ser maior que zero.");
      setSalvando(false);
      return;
    }

    if (Number(valorPagamento) > Number(saldo)) {
      setErro(
        `O valor do pagamento não pode ser maior que o saldo de ${formatarMoeda(
          saldo,
        )}.`,
      );
      setSalvando(false);
      return;
    }

    if (!formaPagamento) {
      setErro("A forma de pagamento deve ser informada.");
      setSalvando(false);
      return;
    }

    try {
      const dados = {
        dataPagamento,
        valor: Number(valorPagamento),
        formaPagamento,
        observacao: observacao.trim() || null,
      };

      await cadastrarPagamento(cobrancaId, dados);

      await onPagamentoRegistrado();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-section-title">
            <h3>Registrar pagamento</h3>

            <p>Informe os dados do pagamento realizado para esta cobrança.</p>
          </div>

          {erro && (
            <div className="form-message error-message full-width">{erro}</div>
          )}

          <div className="form-group">
            <label htmlFor="dataPagamento">Data do pagamento</label>

            <input
              id="dataPagamento"
              type="date"
              value={dataPagamento}
              onChange={(event) => setDataPagamento(event.target.value)}
              required
              disabled={salvando}
            />
          </div>

          <div className="form-group">
            <label htmlFor="valorPagamento">Valor do pagamento</label>

            <input
              id="valorPagamento"
              type="number"
              min="0.01"
              max={saldo}
              step="0.01"
              value={valorPagamento}
              onChange={(event) => setValorPagamento(event.target.value)}
              placeholder="0,00"
              required
              disabled={salvando}
            />

            <small>Saldo disponível: {formatarMoeda(saldo)}</small>
          </div>

          <div className="form-group full-width">
            <label htmlFor="formaPagamento">Forma de pagamento</label>

            <select
              id="formaPagamento"
              value={formaPagamento}
              onChange={(event) => setFormaPagamento(event.target.value)}
              required
              disabled={salvando}
            >
              <option value="">Selecione a forma de pagamento</option>
              <option value="DINHEIRO">Dinheiro</option>
              <option value="PIX">PIX</option>
              <option value="CARTAO_CREDITO">Cartão de crédito</option>
              <option value="CARTAO_DEBITO">Cartão de débito</option>
              <option value="TRANSFERENCIA">Transferência</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label htmlFor="observacaoPagamento">Observação</label>

            <textarea
              id="observacaoPagamento"
              value={observacao}
              onChange={(event) => setObservacao(event.target.value)}
              maxLength={300}
              rows={4}
              placeholder="Digite uma observação, se necessário..."
              disabled={salvando}
            />

            <small className="character-counter">{observacao.length}/300</small>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onCancelar}
            disabled={salvando}
          >
            Cancelar
          </button>

          <button type="submit" className="primary-button" disabled={salvando}>
            {salvando ? "Salvando..." : "Registrar pagamento"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PagamentoForm;
