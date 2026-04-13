import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import "./Listado.css";
import "../../App.css";
import { listarNinios } from "../../features/ninio.slice";
import { useSelector, useDispatch } from "react-redux";
import { listarRecorridas } from "../../features/recorrida.slice";

export async function fetchList(path) {
  const tryPaths = [path, `${path}s`, `${path}/all`];
  for (const p of tryPaths) {
    try {
      const res = await api.get(p);
      const d = res?.data;
      if (Array.isArray(d)) return d;
      if (d && typeof d === "object") {
        // common keys
        if (Array.isArray(d.recorridas)) return d.recorridas;
        if (Array.isArray(d.divisiones)) return d.divisiones;
        if (Array.isArray(d.data)) return d.data;
        if (Array.isArray(d.result)) return d.result;
        // first array value
        for (const v of Object.values(d)) {
          if (Array.isArray(v)) return v;
        }
      }
    } catch (e) {
      // try next
    }
  }
  return [];
}

const ListarNinios = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [ninios, setNinios] = useState([]);
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState(null);
  const [divisionFilter, setDivisionFilter] = useState("");
  const [recorridaFilter, setRecorridaFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE =
    api.defaults?.baseURL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";

  const listar = () => {
    api
      .get("/ninios")
      .then((res) => {
        const payload = res.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.ninios)
            ? payload.ninios
            : Array.isArray(payload?.data)
              ? payload.data
              : [];
        setNinios(list);
        dispatch(listarNinios(list));
      })
      .catch((err) => {
        console.error("Error fetching /ninios", err);
        setError({
          message: "No se pudo cargar la lista de Gurises",
          backendMsg: err?.response?.data || err.message || String(err),
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    listar();
  }, []);

  // Normalizers for division/recorrida to handle different backend shapes
  const normalizeDivision = (n) => {
    if (!n) return null;
    const raw = n.division || n.grupo;
    if (!raw) return null;
    if (typeof raw === "string") return raw;
    if (typeof raw === "object")
      return raw.nombre || raw.name || raw.title || null;
    return null;
  };

  const normalizeRecorrida = (n) => {
    if (!n) return null;
    if (typeof n === "string") return n;
    if (n.recorrida || n.recorrido || n.recorridas) {
      const raw = n.recorrida || n.recorrido || n.recorridas;
      if (typeof raw === "string") return raw;
      if (typeof raw === "object")
        return raw.nombre || raw.name || raw.titulo || null;
    }
    // if n itself looks like a recorrida object
    if (n.nombre || n.name || n.titulo) return n.nombre || n.name || n.titulo;
    return null;
  };

  // build groups deduped by a canonical key (lowercased + trimmed) to avoid
  // duplicate entries that differ only by case or trailing spaces
  const groups = (() => {
    const map = new Map();
    (ninios || [])
      .map((n) => normalizeDivision(n))
      .filter(Boolean)
      .forEach((label) => {
        const key = String(label).trim().toLowerCase();
        if (!map.has(key)) map.set(key, label);
      });
    return Array.from(map.values());
  })();

  const reduxRecorridas = useSelector(
    (state) => state.recorrida?.recorridas || [],
  );
  if (!reduxRecorridas || reduxRecorridas.length === 0) {
    fetchList("/recorrida").then((data) => dispatch(listarRecorridas(data)));
  }

  const recorridasOptions = Array.from(
    new Set(
      (reduxRecorridas || []).map((r) => normalizeRecorrida(r)).filter(Boolean),
    ),
  );

  const divisions = (() => {
    const map = new Map();
    (ninios || [])
      .map((n) => normalizeDivision(n))
      .filter(Boolean)
      .forEach((label) => {
        const key = String(label).trim().toLowerCase();
        if (!map.has(key)) map.set(key, label);
      });
    return Array.from(map.values());
  })();
  const recorridaKey = (item) => {
    if (!item) return null;
    if (typeof item === "string") return item;
    // if passed a nin object with a recorrida field
    const raw = item.recorrida || item.recorrido || item.recorridas;
    if (raw) {
      if (typeof raw === "string") return raw;
      if (typeof raw === "object")
        return (
          raw._id || raw.id || raw.nombre || raw.name || raw.titulo || null
        );
    }
    // if item itself is a recorrida object
    return (
      item._id || item.id || item.nombre || item.name || item.titulo || null
    );
  };

  // build option objects with canonical key+label from reduxRecorridas
  const recorridasOptionsMap = (reduxRecorridas || []).reduce((acc, r) => {
    const key = recorridaKey(r);
    const label = normalizeRecorrida(r) || key;
    if (key) acc.set(key, { key, label });
    return acc;
  }, new Map());
  const recorridasOptionsList = Array.from(recorridasOptionsMap.values());

  const filtered = (ninios || []).filter((n) => {
    const displayName = (n.nombre || n.name || "").toString();
    const matchesQuery = displayName
      .toLowerCase()
      .includes(query.toLowerCase());
    const division = normalizeDivision(n);
    const matchesGroup = groupFilter ? division === groupFilter : true;
    const matchesDivision = divisionFilter ? division === divisionFilter : true;
    const ninRecKey = recorridaKey(n);
    const matchesRecorrida = recorridaFilter
      ? ninRecKey === recorridaFilter
      : true;
    return matchesQuery && matchesGroup && matchesDivision && matchesRecorrida;
  });

  const openPerfil = (nin) => {
    const id = nin._id || nin.id;
    // navigate to profile without exposing id in URL when possible
    if (id) {
      navigate(`/ninios/perfil`, { state: { nin } });
    } else {
      // fallback: still navigate without id
      navigate(`/ninios/perfil`, { state: { nin } });
    }
  };

  const FALLBACK_IMG = "/img/image.png";
  const buildFotoSrc = (foto) => {
    if (!foto) return FALLBACK_IMG;
    if (typeof foto === "string" && foto.startsWith("http")) return foto;
    // relative path stored by backend, prepend backend base
    return `${API_BASE}${String(foto).startsWith("/") ? "" : "/"}${foto}`;
  };

  if (loading) return <div className="listado-root">Cargando...</div>;
  if (error)
    return (
      <div className="listado-root">
        <div className="card">
          <h3>Error al cargar la lista</h3>
          <p>Ocurrió un problema al obtener los Gurises desde el servidor.</p>
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button
              onClick={() => window.location.reload()}
              className="add-btn"
            >
              Reintentar
            </button>
          </div>
          {error.backendMsg && (
            <details style={{ marginTop: 10 }}>
              <summary>Detalles técnicos</summary>
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {String(error.backendMsg)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );

  return (
    <div className="listado-root">
      <header className="listado-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <span role="img" aria-label="atrás">
            ‹
          </span>
        </button>
        <h1>Gurises</h1>
        {/* Eliminamos el botón "Agregar" del header porque usaremos el FAB flotante en móvil */}
      </header>

      {/* Top add-card removed — use FAB at bottom */}

      <div className="search-row">
        <input
          className="search-input"
          placeholder="🔍 Buscar por nombre..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          className="filter-select"
          onClick={() => navigate("/ninios/asistencia")}
        >
          Pasar lista
        </button>
      </div>

      <div className="chips-row">
        <button
          className={`chip ${groupFilter === null ? "active" : ""}`}
          onClick={() => setGroupFilter(null)}
        >
          Todos
        </button>
        {groups.map((g) => (
          <button
            key={g}
            className={`chip ${groupFilter === g ? "active" : ""}`}
            onClick={() => setGroupFilter((prev) => (prev === g ? null : g))}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="cards">
        {filtered.length > 0 ? (
          filtered.map((nin) => {
            const divLabel = normalizeDivision(nin) || "Sin división";
            const recLabel = normalizeRecorrida(nin) || null;
            return (
              <div
                key={nin._id || nin.id}
                className="card"
                onClick={() => openPerfil(nin)}
              >
                <div className="card-left">
                  <img
                    className="avatar avatar-circle"
                    src={buildFotoSrc(nin.foto)}
                    alt={nin.nombre}
                    onError={(e) => (e.target.src = FALLBACK_IMG)}
                  />
                </div>
                <div className="card-main">
                  <div className="card-title">
                    {nin.nombre || nin.name || "Sin nombre"}
                  </div>
                  <div className="badges-row">
                    <span className="pill small">{divLabel}</span>
                    {recLabel && (
                      <span className="pill small">
                        {String(recLabel).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="card-right">
                  <div className="card-arrow">›</div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: "center", marginTop: 40, color: "#64748b" }}>
            No se encontraron resultados
          </div>
        )}
      </div>

      {/* El botón flotante es clave para la experiencia mobile */}
      <button className="fab-add" onClick={() => navigate("/ninios/register")}>
        +
      </button>
    </div>
  );
};

export default ListarNinios;
