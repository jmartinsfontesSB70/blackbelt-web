import { useEffect, useState } from "react";

import {
  buscarAcademia,
  buscarLogoAcademia,
} from "../services/academiaService";

import "./Dashboard.css";

function Dashboard() {
  const [academia, setAcademia] = useState(null);
  const [logo, setLogo] = useState("");

  useEffect(() => {
    let ativo = true;
    let urlLogo = "";

    async function carregarDados() {
      try {
        const dados = await buscarAcademia();

        if (!ativo) return;

        setAcademia(dados);

        if (dados.possuiLogo) {
          const blob = await buscarLogoAcademia();

          if (!ativo) return;

          urlLogo = URL.createObjectURL(blob);
          setLogo(urlLogo);
        }
      } catch (error) {
        console.error("Erro ao carregar dados da academia:", error);
      }
    }

    carregarDados();

    return () => {
      ativo = false;

      if (urlLogo) {
        URL.revokeObjectURL(urlLogo);
      }
    };
  }, []);

  return (
    <main className="main dashboard">
      <div className="dashboard-overlay">
        <div className="dashboard-conteudo">
          {logo && (
            <img src={logo} alt="Logo da academia" className="dashboard-logo" />
          )}

          <h1>{academia?.nome || "BlackBelt"}</h1>

          <div className="dashboard-divisor" />

          <h2>Bem-vindo ao sistema BlackBelt.</h2>

          <p>
            Gerencie sua academia com organização, praticidade e eficiência.
          </p>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
