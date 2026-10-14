import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  cadastrarTipoCobranca,
  buscarTipoCobrancaPorId,
  atualizarTipoCobranca,
} from "../services/tipoCobrancaService";

const TipoCobrancaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorUnitario, setValorUnitario] = useState("");
  const [ativo, setAtivo] = useState(true);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    const carregarTipoCobranca = async () => {
      try {
        const tipoCobranca = await buscarTipoCobrancaPorId(id);

        setNome(tipoCobranca.nome);
        setDescricao(tipoCobranca.descricao || "");
        setValorUnitario(tipoCobranca.valorUnitario);
        setAtivo(tipoCobranca.ativo);
      } catch (error) {
        setErro(error.message);
      }
    };

    carregarTipoCobranca();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErro("");
    setSucesso("");

    const tipoCobranca = {
      nome,
      descricao,
      valorUnitario: Number(valorUnitario),
      ativo,
    };

    try {
      if (id) {
        await atualizarTipoCobranca(id, tipoCobranca);

        setSucesso("Tipo de cobrança atualizado com sucesso!");
      } else {
        await cadastrarTipoCobranca(tipoCobranca);

        setSucesso("Tipo de cobrança cadastrado com sucesso!");
      }

      setTimeout(() => {
        navigate("/tipos-cobranca");
      }, 1000);
    } catch (error) {
      setErro(error.message);
    }
  };

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>{id ? "Editar tipo de cobrança" : "Novo tipo de cobrança"}</h2>

          <p>
            {id
              ? "Altere os dados do tipo de cobrança."
              : "Cadastre um novo tipo de cobrança na academia."}
          </p>
        </div>
      </div>

      <form className="form-container" onSubmit={handleSubmit}>
        {erro && <div className="form-message error-message">{erro}</div>}

        {sucesso && (
          <div className="form-message success-message">{sucesso}</div>
        )}

        <div className="form-grid">
          <div className="form-group full-width">
            <label>Nome</label>

            <input
              type="text"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Digite o nome do tipo de cobrança"
            />
          </div>

          <div className="form-group full-width">
            <label>Descrição</label>

            <textarea
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Digite uma descrição para o tipo de cobrança"
              rows="5"
            />
          </div>

          <div className="form-group">
            <label>Valor unitário</label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={valorUnitario}
              onChange={(event) => setValorUnitario(event.target.value)}
              placeholder="Digite o valor unitário"
            />
          </div>

          <div className="form-group">
            <label>Situação</label>

            <select
              value={ativo}
              onChange={(event) => setAtivo(event.target.value === "true")}
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/tipos-cobranca")}
          >
            Cancelar
          </button>

          <button type="submit" className="primary-button">
            {id ? "Atualizar tipo de cobrança" : "Salvar tipo de cobrança"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default TipoCobrancaForm;
