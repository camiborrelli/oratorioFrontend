import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { desloguear } from "../features/animador.slice";
import api, { fetchCount, fetchList } from "../api";
import "./Inicio.compact.css";
import ListarEventos from "./Eventos/ListarEventos";
import CumplenMes from "./Ninios/CumplenMes";
import ListarRecordatorios from "./Eventos/ListarRecordatorios";
import ListarPlanificaciones from "./Eventos/ListarPlanificaciones";

const Inicio = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    ninios: 0,
    animadores: 0,
    recorridas: 0,
    divisiones: 0,
  });

  const dispatch = useDispatch();

  useEffect(() => {
    let mounted = true;

    const fetchSimpleCount = async (path) => {
      return await fetchCount(path);
    };

    (async () => {
      setLoading(true);
      try {
        const [ninios, animadores, recorridas, divisiones] = await Promise.all([
          fetchSimpleCount("/ninios"),
          fetchSimpleCount("/animador"),
          fetchSimpleCount("/recorrida"),
          fetchSimpleCount("/division"),
        ]);
        if (!mounted) return;
        setCounts({
          ninios,
          animadores,
          recorridas,
          divisiones,
        });
      } catch (err) {
        console.error("Error cargando contadores:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const apodo =
    localStorage.getItem("apodo") ||
    localStorage.getItem("username") ||
    "Animador";

  return (
    <div className="inicio-container">
      {/* Encabezado centrado */}
      <div className="inicio-hero inicio-hero--centered">
        <div className="welcome-pill">
          <span className="welcome-emoji">👋</span>
          <span>¡Hola, {apodo}!</span>
        </div>
        <h1 className="hero-title">Gestión del Oratorio Cordón</h1>
        <p className="hero-subtitle">
          Panel principal y seguimiento de actividades del oratorio
        </p>
      </div>

      {/* Tarjetas de Estadísticas Principales */}
      <div className="cards-grid">
        <div
          className="card card-hoverable"
          onClick={() => navigate("/ninios")}
        >
          <div className="card-icon card-icon--green">👦</div>
          <div className="card-info">
            <div className="card-count">{loading ? "—" : counts.ninios}</div>
            <div className="card-label">Niños Registrados</div>
          </div>
          <button
            className="card-add-btn"
            onClick={(e) => {
              e.stopPropagation();
              navigate("/ninios/register");
            }}
            title="Registrar nuevo niño"
            aria-label="Agregar niño"
          >
            +
          </button>
        </div>

        <div
          className="card card-hoverable"
          onClick={() => navigate("/animadores")}
        >
          <div className="card-icon card-icon--amber">👥</div>
          <div className="card-info">
            <div className="card-count">
              {loading ? "—" : counts.animadores}
            </div>
            <div className="card-label">Animadores Activos</div>
          </div>
        </div>

        <div
          className="card card-hoverable"
          onClick={() => navigate("/ninios")}
        >
          <div className="card-icon card-icon--red">📍</div>
          <div className="card-info">
            <div className="card-count">
              {loading ? "—" : counts.recorridas}
            </div>
            <div className="card-label">Recorridas</div>
          </div>
        </div>

        <div
          className="card card-hoverable"
          onClick={() => navigate("/ninios")}
        >
          <div className="card-icon card-icon--blue">📚</div>
          <div className="card-info">
            <div className="card-count">
              {loading ? "—" : counts.divisiones}
            </div>
            <div className="card-label">Divisiones</div>
          </div>
        </div>
      </div>

      {/* Contenido Central: Eventos + Planificaciones y Recordatorios */}
      <div className="inicio-top-layout">
        <section className="inicio-top-layout__main">
          <ListarEventos />
        </section>

        <aside className="inicio-top-layout__sidebar">
          <ListarPlanificaciones />
          <div className="inicio-top-layout__recordatorios">
            <ListarRecordatorios />
          </div>
        </aside>
      </div>

      {/* Sección Cumpleaños del Mes */}
      <section className="inicio-cumple-section">
        <div className="section-title-row">
          <h2 className="section-title">🎂 Cumpleaños de este Mes</h2>
          <p className="section-subtitle">
            Festejos de niños y animadores durante el mes actual
          </p>
        </div>
        <CumplenMes />
      </section>
    </div>
  );
};

export default Inicio;
