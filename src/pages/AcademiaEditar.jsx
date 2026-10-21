import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  buscarAcademia,
  atualizarAcademia,
  buscarLogoAcademia,
  atualizarLogoAcademia,
} from "../services/academiaService";

import "./AcademiaInstalacao.css";

function mascararCNPJ(valor = "") {
  const numeros = valor.replace(/\D/g, "").slice(0, 14);

  return numeros
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function mascararCEP(valor = "") {
  const numeros = valor.replace(/\D/g, "").slice(0, 8);

  return numeros.replace(/^(\d{5})(\d)/, "$1-$2");
}

function formatarData(data) {
  if (!data) return "";

  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano}`;
}

function AcademiaEditar() {
  const navigate = useNavigate();

  const [academia, setAcademia] = useState({
    nome: "",
    responsavel: "",
    cnpj: "",
    endereco: {
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      pontoReferencia: "",
    },
  });

  const [previewLogo, setPreviewLogo] = useState("");
  const [arquivoLogo, setArquivoLogo] = useState(null);
  const [dataCadastro, setDataCadastro] = useState("");
  const [dataExpiracao, setDataExpiracao] = useState("");
  const [possuiLogo, setPossuiLogo] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    let ativo = true;
    let urlTemporaria = "";

    async function carregarAcademia() {
      try {
        const resposta = await buscarAcademia();

        if (!ativo) return;

        setAcademia({
          nome: resposta.nome ?? "",
          responsavel: resposta.responsavel ?? "",
          cnpj: mascararCNPJ(resposta.cnpj ?? ""),
          endereco: {
            rua: resposta.endereco?.rua ?? "",
            numero: resposta.endereco?.numero ?? "",
            bairro: resposta.endereco?.bairro ?? "",
            cidade: resposta.endereco?.cidade ?? "",
            estado: resposta.endereco?.estado ?? "",
            cep: mascararCEP(resposta.endereco?.cep ?? ""),
            pontoReferencia: resposta.endereco?.pontoReferencia ?? "",
          },
        });

        setDataCadastro(resposta.dataCadastro ?? "");
        setDataExpiracao(resposta.dataExpiracao ?? "");
        setPossuiLogo(Boolean(resposta.possuiLogo));

        if (resposta.possuiLogo) {
          try {
            const blob = await buscarLogoAcademia();

            if (!ativo) return;

            urlTemporaria = URL.createObjectURL(blob);
            setPreviewLogo(urlTemporaria);
          } catch {
            if (ativo) {
              setErro(
                "Os dados foram carregados, mas não foi possível exibir a logo atual.",
              );
            }
          }
        }
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os dados da academia.",
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarAcademia();

    return () => {
      ativo = false;

      if (urlTemporaria) {
        URL.revokeObjectURL(urlTemporaria);
      }
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    let valorFormatado = value;

    if (name === "cnpj") {
      valorFormatado = mascararCNPJ(value);
    }

    if (name === "endereco.cep") {
      valorFormatado = mascararCEP(value);
    }

    if (name.startsWith("endereco.")) {
      const campo = name.split(".")[1];

      setAcademia((atual) => ({
        ...atual,
        endereco: {
          ...atual.endereco,
          [campo]: valorFormatado,
        },
      }));

      return;
    }

    setAcademia((atual) => ({
      ...atual,
      [name]: valorFormatado,
    }));
  }

  function handleLogoChange(event) {
    const arquivo = event.target.files?.[0] ?? null;

    if (arquivo) {
      const tipoValido = ["image/jpeg", "image/png"].includes(arquivo.type);

      if (!tipoValido) {
        setErro("Selecione uma imagem JPG, JPEG ou PNG.");
        event.target.value = "";
        return;
      }
    }

    setErro("");
    setSucesso("");
    setArquivoLogo(arquivo);

    if (previewLogo) {
      URL.revokeObjectURL(previewLogo);
    }

    if (arquivo) {
      setPreviewLogo(URL.createObjectURL(arquivo));
    } else {
      setPreviewLogo("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");
    setEnviando(true);

    try {
      const academiaSemMascara = {
        ...academia,
        cnpj: academia.cnpj.replace(/\D/g, ""),
      };

      await atualizarAcademia(academiaSemMascara);

      if (arquivoLogo) {
        await atualizarLogoAcademia(arquivoLogo);
        setPossuiLogo(true);
        setArquivoLogo(null);
      }

      setSucesso("Dados da academia atualizados com sucesso!");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar os dados da academia.",
      );
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <div className="instalacao-container">
        <div className="instalacao-card">Carregando dados da academia...</div>
      </div>
    );
  }

  return (
    <div className="instalacao-container">
      <div className="instalacao-card instalacao-card-largo">
        <div className="instalacao-logo">BB</div>

        <h1>BlackBelt</h1>

        <p className="instalacao-subtitulo">Dados cadastrais da academia</p>

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
              disabled={enviando}
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
              disabled={enviando}
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
              inputMode="numeric"
              placeholder="00.000.000/0000-00"
              disabled={enviando}
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
              disabled={enviando}
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
                disabled={enviando}
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
                inputMode="numeric"
                placeholder="00000-000"
                autoComplete="postal-code"
                disabled={enviando}
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
              disabled={enviando}
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
                disabled={enviando}
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
                disabled={enviando}
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
              disabled={enviando}
            />
          </div>

          <h2>Logotipo</h2>

          <div className="instalacao-campo">
            <label htmlFor="logo">Logotipo da academia (opcional)</label>

            {previewLogo && (
              <div className="instalacao-preview-logo">
                <img src={previewLogo} alt="Logotipo da academia" />
              </div>
            )}

            {!previewLogo && possuiLogo && (
              <p>
                A academia possui uma logo cadastrada, mas ela não pôde ser
                exibida.
              </p>
            )}

            <input
              id="logo"
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={handleLogoChange}
              disabled={enviando}
            />

            <small>
              Formatos JPG, JPEG ou PNG. Selecione uma imagem para substituir a
              logo atual.
            </small>
          </div>

          <h2>Informações da avaliação</h2>

          <div className="instalacao-campo">
            <label>Data do cadastro</label>
            <input value={formatarData(dataCadastro)} readOnly />
          </div>

          <div className="instalacao-campo">
            <label>Data de expiração</label>
            <input value={formatarData(dataExpiracao)} readOnly />
          </div>

          {erro && (
            <p className="instalacao-erro" role="alert">
              {erro}
            </p>
          )}

          {sucesso && (
            <p className="instalacao-sucesso" role="status">
              {sucesso}
            </p>
          )}

          <button
            type="submit"
            className="instalacao-button"
            disabled={enviando}
          >
            {enviando ? "Salvando..." : "Salvar alterações"}
          </button>

          <button
            type="button"
            className="instalacao-button"
            onClick={() => navigate(-1)}
            disabled={enviando}
          >
            Voltar
          </button>
        </form>
      </div>
    </div>
  );
}

export default AcademiaEditar;
