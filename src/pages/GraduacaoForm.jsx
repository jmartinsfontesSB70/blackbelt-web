import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  cadastrarGraduacao,
  buscarGraduacaoPorId,
  atualizarGraduacao,
} from "../services/graduacaoService";

const GraduacaoForm = () => {
  const navigate = useNavigate();

  const { modalidadeId, id } = useParams();

  const [nome, setNome] = useState("");
  const [ordem, setOrdem] = useState("");
  const [quantidadeGraus, setQuantidadeGraus] = useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    const carregarGraduacao = async () => {
      try {
        const graduacao = await buscarGraduacaoPorId(id);

        setNome(graduacao.nome);
        setOrdem(graduacao.ordem);
        setQuantidadeGraus(graduacao.quantidadeGraus);
      } catch (error) {
        setErro(error.message);
      }
    };

    carregarGraduacao();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErro("");
    setSucesso("");

    const graduacao = {
      modalidadeId: Number(modalidadeId),
      nome,
      ordem: Number(ordem),
      quantidadeGraus: Number(quantidadeGraus),
    };

    try {
      if (id) {
        await atualizarGraduacao(id, graduacao);

        setSucesso("Graduação atualizada com sucesso!");
      } else {
        await cadastrarGraduacao(graduacao);

        setSucesso("Graduação cadastrada com sucesso!");
      }

      setTimeout(() => {
        navigate("/modalidades/" + modalidadeId + "/graduacoes");
      }, 1000);
    } catch (error) {
      setErro(error.message);
    }
  };

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>{id ? "Editar graduação" : "Nova graduação"}</h2>

          <p>
            {id
              ? "Altere os dados da graduação."
              : "Cadastre uma nova graduação para a modalidade."}
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
              placeholder="Digite o nome da graduação"
            />
          </div>

          <div className="form-group">
            <label>Ordem</label>

            <input
              type="number"
              min="0"
              value={ordem}
              onChange={(event) => setOrdem(event.target.value)}
              placeholder="Digite a ordem"
            />
          </div>

          <div className="form-group">
            <label>Quantidade de graus</label>

            <input
              type="number"
              min="0"
              value={quantidadeGraus}
              onChange={(event) => setQuantidadeGraus(event.target.value)}
              placeholder="Digite a quantidade de graus"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              navigate("/modalidades/" + modalidadeId + "/graduacoes")
            }
          >
            Cancelar
          </button>

          <button type="submit" className="primary-button">
            {id ? "Atualizar graduação" : "Salvar graduação"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default GraduacaoForm;
