import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  verificarStatusInstalacao,
  cadastrarAcademia,
} from "../services/academiaService";

import "./AcademiaInstalacao.css";

const enderecoInicial = {
  rua: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
  pontoReferencia: "",
};

function AcademiaInstalacao() {
  const navigate = useNavigate();

  const [academia, setAcademia] = useState({
    nome: "",
    responsavel: "",
    cnpj: "",
    endereco: { ...enderecoInicial },
  });

  const [logo, setLogo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [dataExpiracao, setDataExpiracao] = useState("");

  useEffect(() => {
    async function verificarInstalacao() {
      try {
        const status = await verificarStatusInstalacao();

        if (status.academiaCadastrada) {
          navigate("/login", { replace: true });
        }
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    verificarInstalacao();
  }, [navigate]);

  function handleChange(event) {
    const { name, value } = event.target;

    if (name.startsWith("endereco.")) {
      const campo = name.split(".")[1];

      setAcademia((atual) => ({
        ...atual,
        endereco: {
          ...atual.endereco,
          [campo]: value,
        },
      }));

      return;
    }

    setAcademia((atual) => ({
      ...atual,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setEnviando(true);

    try {
      const resposta = await cadastrarAcademia(academia, logo);

      setDataExpiracao(resposta.dataExpiracao || "");
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  }

  function formatarData(data) {
    if (!data) return "";

    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;
  }

  if (carregando) {
    return (
      <div className="instalacao-container">
        <div className="instalacao-card">
          Verificando instalação do BlackBelt...
        </div>
      </div>
    );
  }

  if (dataExpiracao) {
    return (
      <div className="instalacao-container">
        <div className="instalacao-card">
          <div className="instalacao-logo">BB</div>

          <h1>BlackBelt</h1>

          <h2>Academia cadastrada!</h2>

          <p className="instalacao-sucesso">
            O cadastro foi realizado com sucesso.
          </p>

          <p>
            Sua avaliação termina em{" "}
            <strong>{formatarData(dataExpiracao)}</strong>.
          </p>

          <p>Agora você pode entrar no sistema.</p>

          <button
            type="button"
            className="instalacao-button"
            onClick={() => navigate("/login", { replace: true })}
          >
            Ir para o login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="instalacao-container">
      <div className="instalacao-card instalacao-card-largo">
        <div className="instalacao-logo">BB</div>

        <h1>BlackBelt</h1>

        <p className="instalacao-subtitulo">Vamos configurar sua academia!</p>

        <div className="instalacao-divisor" />

        <form onSubmit={handleSubmit}>
          <h2>Dados da academia</h2>

          <div className="instalacao-campo">
            <label htmlFor="nome">Nome da academia *</label>
            <input
              id="nome"
              name="nome"
              value={academia.nome}
              onChange={handleChange}
              required
              maxLength={150}
              autoComplete="organization"
            />
          </div>

          <div className="instalacao-campo">
            <label htmlFor="responsavel">Responsável *</label>
            <input
              id="responsavel"
              name="responsavel"
              value={academia.responsavel}
              onChange={handleChange}
              required
              maxLength={150}
              autoComplete="name"
            />
          </div>

          <div className="instalacao-campo">
            <label htmlFor="cnpj">CNPJ (opcional)</label>
            <input
              id="cnpj"
              name="cnpj"
              value={academia.cnpj}
              onChange={handleChange}
              maxLength={18}
              placeholder="00.000.000/0000-00"
            />
          </div>

          <h2>Endereço</h2>

          <div className="instalacao-campo">
            <label htmlFor="rua">Rua *</label>
            <input
              id="rua"
              name="endereco.rua"
              value={academia.endereco.rua}
              onChange={handleChange}
              required
              autoComplete="address-line1"
            />
          </div>

          <div className="instalacao-grade">
            <div className="instalacao-campo">
              <label htmlFor="numero">Número *</label>
              <input
                id="numero"
                name="endereco.numero"
                value={academia.endereco.numero}
                onChange={handleChange}
                required
              />
            </div>

            <div className="instalacao-campo">
              <label htmlFor="cep">CEP *</label>
              <input
                id="cep"
                name="endereco.cep"
                value={academia.endereco.cep}
                onChange={handleChange}
                required
                maxLength={9}
                autoComplete="postal-code"
              />
            </div>
          </div>

          <div className="instalacao-campo">
            <label htmlFor="bairro">Bairro *</label>
            <input
              id="bairro"
              name="endereco.bairro"
              value={academia.endereco.bairro}
              onChange={handleChange}
              required
              autoComplete="address-level3"
            />
          </div>

          <div className="instalacao-grade">
            <div className="instalacao-campo">
              <label htmlFor="cidade">Cidade *</label>
              <input
                id="cidade"
                name="endereco.cidade"
                value={academia.endereco.cidade}
                onChange={handleChange}
                required
                autoComplete="address-level2"
              />
            </div>

            <div className="instalacao-campo">
              <label htmlFor="estado">Estado *</label>
              <input
                id="estado"
                name="endereco.estado"
                value={academia.endereco.estado}
                onChange={handleChange}
                required
                maxLength={2}
                placeholder="BA"
                autoComplete="address-level1"
              />
            </div>
          </div>

          <div className="instalacao-campo">
            <label htmlFor="pontoReferencia">
              Ponto de referência (opcional)
            </label>
            <input
              id="pontoReferencia"
              name="endereco.pontoReferencia"
              value={academia.endereco.pontoReferencia}
              onChange={handleChange}
            />
          </div>

          <h2>Logotipo</h2>

          <div className="instalacao-campo">
            <label htmlFor="logo">Logotipo da academia (opcional)</label>
            <input
              id="logo"
              type="file"
              accept=".jpg,.jpeg,image/jpeg"
              onChange={(event) => setLogo(event.target.files?.[0] || null)}
            />
            <small>Formato JPG ou JPEG.</small>
          </div>

          {erro && (
            <p className="instalacao-erro" role="alert">
              {erro}
            </p>
          )}

          <button
            type="submit"
            className="instalacao-button"
            disabled={enviando}
          >
            {enviando ? "Cadastrando..." : "Cadastrar academia"}
          </button>

          <p className="instalacao-aviso">
            A avaliação de 14 dias começa após o cadastro.
          </p>
        </form>
      </div>
    </div>
  );
}

export default AcademiaInstalacao;
