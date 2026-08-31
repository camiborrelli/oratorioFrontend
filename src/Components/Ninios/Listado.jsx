import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import "./Listado.css";
import "../../App.css";
import TablaNinios from "./TablaNinios";

const ListarNinios = () => {
  const navigate = useNavigate();
  const [ninios, setNinios] = useState([]);
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDivisiones, setShowDivisiones] = useState(false);
  const [showRecorridas, setShowRecorridas] = useState(false);
  const [filterMode, setFilterMode] = useState("division"); // "division" o "recorrida"

  const FALLBACK_IMG = "/img/image.png";

  const normalizeDivision = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const formatDivisionLabel = (value) => {
    const normalized = normalizeDivision(value);
    if (!normalized) return "Sin división";
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const obtenerDivisiones = async () => {
    try {
      const res = await api.get("/divisiones");
      return res.data || [];
    } catch (err) {
      console.error("Error al obtener divisiones:", err);
      return [];
    }
  };

  console.log("Divisiones obtenidas:", obtenerDivisiones());

  useEffect(() => {
    api
      .get("/ninios")
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data)
          ? data
          : data?.ninios || data?.data || [];
        setNinios(list);
      })
      .catch((err) => setError(err?.response?.data || err.message))
      .finally(() => setLoading(false));
  }, []);

  // Cada niño tiene division y recorrida como string simple desde el backend
  const getDivision = (n) => n?.division || n?.grupo || "Sin división";
  const getRecorrida = (n) => n?.recorrida || n?.recorrido || null;
  const getFoto = (n) =>
    n?.foto?.startsWith?.("http")
      ? n.foto
      : n?.foto
        ? `${api.defaults.baseURL}/${n.foto}`
        : FALLBACK_IMG;

  const groups = Array.from(
    ninios
      .reduce((acc, nin) => {
        const rawValue =
          filterMode === "division" ? getDivision(nin) : getRecorrida(nin);
        const key = normalizeDivision(rawValue);
        if (!key) return acc;
        if (!acc.has(key)) {
          acc.set(key, formatDivisionLabel(rawValue));
        }
        return acc;
      }, new Map())
      .entries(),
  );

  const filtered = ninios.filter((n) => {
    const matchesQuery = (n.nombre || "")
      .toLowerCase()
      .includes(query.toLowerCase());
    const rawValue =
      filterMode === "division" ? getDivision(n) : getRecorrida(n);
    const matchesGroup = groupFilter
      ? normalizeDivision(rawValue) === normalizeDivision(groupFilter)
      : true;
    return matchesQuery && matchesGroup;
  });

  if (loading) return <div className="listado-root">Cargando...</div>;

  if (error)
    return (
      <div className="listado-root">
        <div className="card">
          <h3>Error al cargar la lista</h3>
          <p>{String(error)}</p>
          <button onClick={() => window.location.reload()} className="add-btn">
            Reintentar
          </button>
        </div>
      </div>
    );

  return (
    <div className="listado-root">
      <header className="listado-header">
        {/* <button className="back-btn" onClick={() => navigate(-1)}>
          ‹
        </button> */}
        <h1>Gurises</h1>
      </header>
      <div className="search-row">
        <input
          className="search-input"
          placeholder="🔍 Buscar por nombre..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {/* <button
          className="filter-select"
          onClick={() => navigate("/ninios/asistencia")}
        >
          Pasar lista
        </button> */}
      </div>
      <div className="filter-toggle">
        <button
          className={`filter-select ${filterMode === "division" ? "active" : ""}`}
          onClick={() => setFilterMode("division")}
        >
          Filtrar por divisiones
        </button>
        <button
          className={`filter-select ${filterMode === "recorrida" ? "active" : ""}`}
          onClick={() => setFilterMode("recorrida")}
        >
          Filtrar por recorridas
        </button>
      </div>
      <div className="chips-row">
        <button
          className={`chip ${groupFilter === null ? "active" : ""}`}
          onClick={() => setGroupFilter(null)}
        >
          Todos
        </button>

        {groups.map(([key, label]) => (
          <button
            key={key}
            className={`chip ${normalizeDivision(groupFilter) === key ? "active" : ""}`}
            onClick={() =>
              setGroupFilter((prev) =>
                normalizeDivision(prev) === key ? null : key,
              )
            }
          >
            {label}
          </button>
        ))}
      </div>{" "}
      <p className="results-count">
        Mostrando {filtered.length} de {ninios.length}
      </p>
      <div className="cards-ninios">
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 40, color: "#64748b" }}>
            No se encontraron resultados
          </div>
        ) : (
          filtered.map((nin) => (
            <div
              key={nin._id || nin.id}
              className="card"
              onClick={() => navigate("/ninios/perfil", { state: { nin } })}
            >
              <div className="card-left">
                <img
                  className="avatar avatar-circle"
                  src={getFoto(nin)}
                  alt={nin.nombre}
                  onError={(e) => (e.target.src = FALLBACK_IMG)}
                />
              </div>
              <div className="card-main">
                <div className="card-title">{nin.nombre || "Sin nombre"}</div>
                <div className="badges-row">
                  <span className="pill small">{getDivision(nin)}</span>
                  {getRecorrida(nin) && (
                    <span className="pill small">
                      {String(getRecorrida(nin)).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div className="card-right">
                <div className="card-arrow">›</div>
              </div>
            </div>
          ))
        )}
      </div>
      <button className="fab-add" onClick={() => navigate("/ninios/register")}>
        +
      </button>
      <TablaNinios
        ninios={filtered}
        className="tabla-ninios"
        onDivisionChange={(id, nuevaDiv) =>
          setNinios((prev) =>
            prev.map((n) => (n._id === id ? { ...n, division: nuevaDiv } : n)),
          )
        }
      />
    </div>
  );
};

export default ListarNinios;
