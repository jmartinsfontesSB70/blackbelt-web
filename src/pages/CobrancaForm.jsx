import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { cadastrarCobranca } from "../services/cobrancaService";

import { listarMatriculasParaSelecao } from "../services/matriculaService";
import { listarTiposCobranca } from "../services/tipoCobrancaService";

function obterDataAtual() {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function obterCompetenciaAtual() {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");

  return `${ano}-${mes}`;
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function CobrancaForm() {
  const navigate = useNavigate();

  const [matriculas, setMatriculas] = useState([]);
  const [tiposCobranca, setTiposCobranca] = useState([]);

  const [matriculaId, setMatriculaId] = useState("");
  const [tipoCobrancaId, setTipoCobrancaId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [competencia, setCompetencia] = useState(obterCompetenciaAtual());
  const [dataVencimento, setDataVencimento] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [observacao, setObservacao] = useState("");

  const [valorUnitario, setValorUnitario] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        const [dadosMatriculas, dadosTiposCobranca] = await Promise.all([
          listarMatriculasParaSelecao(),
          listarTiposCobranca(),
        ]);

        const matriculasAtivas = dadosMatriculas.filter(
          (matricula) => matricula.ativa,
        );

        const tiposAtivos = dadosTiposCobranca.filter(
          (tipoCobranca) => tipoCobranca.ativo,
        );

        setMatriculas(matriculasAtivas);
        setTiposCobranca(tiposAtivos);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  useEffect(() => {
    const tipoCobranca = tiposCobranca.find(
      (tipo) => String(tipo.id) === String(tipoCobrancaId),
    );

    if (!tipoCobranca) {
      setValorUnitario(0);
      setValorTotal(0);
      return;
    }

    const valor = Number(tipoCobranca.valorUnitario || 0);
    const qtd = Number(quantidade || 0);

    setValorUnitario(valor);
    setValorTotal(valor * qtd);
  }, [tipoCobrancaId, quantidade, tiposCobranca]);

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");
    setSalvando(true);

    if (!matriculaId) {
      setErro("A matrícula da cobrança deve ser informada.");
      setSalvando(false);
      return;
    }

    if (!tipoCobrancaId) {
      setErro("O tipo de cobrança deve ser informado.");
      setSalvando(false);
      return;
    }

    if (!descricao.trim()) {
      setErro("A descrição da cobrança deve ser informada.");
      setSalvando(false);
      return;
    }

    if (!competencia) {
      setErro("A competência da cobrança deve ser informada.");
      setSalvando(false);
      return;
    }

    if (!dataVencimento) {
      setErro("A data de vencimento deve ser informada.");
      setSalvando(false);
      return;
    }

    if (Number(quantidade) < 1) {
      setErro("A quantidade deve ser maior que zero.");
      setSalvando(false);
      return;
    }

    try {
      const dados = {
        matriculaId: Number(matriculaId),
        tipoCobrancaId: Number(tipoCobrancaId),
        descricao: descricao.trim(),
        competencia,
        dataVencimento,
        quantidade: Number(quantidade),
        observacao: observacao.trim() || null,
      };

      await cadastrarCobranca(dados);

      setSucesso("Cobrança cadastrada com sucesso!");

      setTimeout(() => {
        navigate("/cobrancas");
      }, 800);
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <main className="main">
        <h2>Nova cobrança</h2>

        <p>Carregando matrículas e tipos de cobrança...</p>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>Nova cobrança</h2>

          <p>Cadastre uma nova cobrança para uma matrícula.</p>
        </div>
      </div>

      <div className="form-container">
        {erro && <div className="form-message error-message">{erro}</div>}

        {sucesso && (
          <div className="form-message success-message">{sucesso}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-section-title">
              <h3>Dados da cobrança</h3>

              <p>
                Informe a matrícula, o tipo de cobrança, a competência e o
                vencimento.
              </p>
            </div>

            <div className="form-group full-width">
              <label htmlFor="matriculaId">Aluno / Turma</label>

              <select
                id="matriculaId"
                value={matriculaId}
                onChange={(event) => setMatriculaId(event.target.value)}
                required
                disabled={salvando}
              >
                <option value="">Selecione o aluno e a turma</option>

                {matriculas.map((matricula) => (
                  <option key={matricula.id} value={matricula.id}>
                    {matricula.alunoNome} - {matricula.turmaNome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="tipoCobrancaId">Tipo de cobrança</label>

              <select
                id="tipoCobrancaId"
                value={tipoCobrancaId}
                onChange={(event) => setTipoCobrancaId(event.target.value)}
                required
                disabled={salvando}
              >
                <option value="">Selecione o tipo de cobrança</option>

                {tiposCobranca.map((tipoCobranca) => (
                  <option key={tipoCobranca.id} value={tipoCobranca.id}>
                    {tipoCobranca.nome} -{" "}
                    {formatarMoeda(tipoCobranca.valorUnitario)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="descricao">Descrição</label>

              <input
                id="descricao"
                type="text"
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                placeholder="Ex.: Mensalidade Setembro/2026"
                maxLength={200}
                required
                disabled={salvando}
              />
            </div>

            <div className="form-group">
              <label htmlFor="competencia">Competência</label>

              <input
                id="competencia"
                type="month"
                value={competencia}
                onChange={(event) => setCompetencia(event.target.value)}
                required
                disabled={salvando}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dataVencimento">Data de vencimento</label>

              <input
                id="dataVencimento"
                type="date"
                value={dataVencimento}
                onChange={(event) => setDataVencimento(event.target.value)}
                required
                disabled={salvando}
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantidade">Quantidade</label>

              <input
                id="quantidade"
                type="number"
                min="1"
                step="1"
                value={quantidade}
                onChange={(event) => setQuantidade(event.target.value)}
                required
                disabled={salvando}
              />
            </div>

            <div className="form-group">
              <label>Valor unitário</label>

              <input
                type="text"
                value={formatarMoeda(valorUnitario)}
                readOnly
              />
            </div>

            <div className="form-group full-width">
              <label>Valor total</label>

              <input type="text" value={formatarMoeda(valorTotal)} readOnly />
            </div>

            <div className="form-group full-width">
              <label htmlFor="observacao">Observação</label>

              <textarea
                id="observacao"
                value={observacao}
                onChange={(event) => setObservacao(event.target.value)}
                maxLength={300}
                rows={4}
                placeholder="Digite uma observação, se necessário..."
                disabled={salvando}
              />

              <small className="character-counter">
                {observacao.length}/300
              </small>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/cobrancas")}
              disabled={salvando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Cadastrar cobrança"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default CobrancaForm;
