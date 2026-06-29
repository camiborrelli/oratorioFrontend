import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../../api";
import { asignarRol, listarAnimadores } from "../../features/animador.slice";
import "../Ninios/Listado.css";
import "./ListarAnimadores.css";
import { toast } from "react-toastify";

const ListarAnimadores = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [animadores, setAnimadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState(null);
  const [selected, setSelected] = useState(null);

  const API_BASE = api.defaults?.baseURL || import.meta.env.VITE_API_URL || "";

  const fetchAnimadores = () => {
    setLoading(true);
    api
      .get("/animador")
      .then((response) => {
        const data = response.data?.animadores || response.data || [];
        setAnimadores(data);
        dispatch(listarAnimadores(data));
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching animadores:", err);
        setError(err?.response?.data || err.message || String(err));
      })
      .finally(() => setLoading(false));
  };

  const openPerfil = (anim) => {
    navigate(`/animadores/perfil/${anim._id}`);
  };

  useEffect(() => {
    fetchAnimadores();
  }, []);

  const groups = Array.from(
    new Set((animadores || []).map((a) => a.division).filter(Boolean)),
  );

  const filtered = (animadores || []).filter((a) => {
    const name = (a.nombre || a.name || "").toString().toLowerCase();
    const matchesQuery = name.includes(query.toLowerCase());
    const matchesGroup = groupFilter ? a.division === groupFilter : true;
    return matchesQuery && matchesGroup;
  });

  const FALLBACK_IMG = "/img/image.png";
  const buildFotoSrc = (foto) => {
    if (!foto) return FALLBACK_IMG;
    if (
      typeof foto === "string" &&
      (foto.startsWith("http") || foto.startsWith("data:"))
    )
      return foto;
    return `${API_BASE}${String(foto).startsWith("/") ? "" : "/"}${foto}`;
  };

  const closePerfil = () => setSelected(null);

  if (loading) return <div className="animadores-container">Cargando...</div>;
  if (error)
    return (
      <div className="animadores-container">
        <div className="animadores-card">
          <h3>Error al cargar animadores</h3>
          <p>{String(error)}</p>
          <button className="btn-refresh" onClick={fetchAnimadores}>
            Reintentar
          </button>
        </div>
      </div>
    );

  const asignarRol = async (anim) => {
    try {
      const res = await api.post(`/animador/${anim._id}/coordinador`, {});

      if (res.status === 200) {
        toast.success("Rol asignado correctamente");
        fetchAnimadores();
      }
    } catch (err) {
      console.error("Error asignando rol:", err);
      toast.error("Error al asignar rol");

      const msg = err?.response?.data?.message || "Error al asignar rol";
      toast.error(msg);
    }
  };

  return (
    <div className="listado-root">
      <header className="listado-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <span role="img" aria-label="atrás">
            ‹
          </span>
        </button>
        <h1>Animadores</h1>
        {/* Eliminamos el botón "Agregar" del header porque usaremos el FAB flotante en móvil */}
      </header>

      <div className="search-row">
        <input
          className="search-input"
          placeholder="🔍 Buscar por nombre..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
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
          filtered.map((anim, idx) => (
            <div
              key={anim._id || anim.id || idx}
              className="card"
              onClick={() => openPerfil(anim)}
            >
              <img
                className="avatar"
                src={buildFotoSrc(anim.foto) || FALLBACK_IMG}
                alt={anim.nombre || "avatar"}
                loading="lazy"
                onError={(e) => {
                  // prevent infinite onError loop if fallback also fails
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMG;
                }}
              />
              <div className="card-body">
                <div className="card-title">
                  {anim.nombre || anim.name || "Sin nombre"}
                </div>
                <div className="card-sub">
                  <span className="pill">
                    {anim.division ||
                      anim.grupo ||
                      anim.seccion ||
                      "Sin división"}
                  </span>
                </div>

                <button
                  className="btn-asign-role"
                  onClick={() => asignarRol(anim)}
                >
                  Asignar Rol
                </button>
              </div>
              <div className="card-arrow">›</div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", marginTop: 40, color: "#64748b" }}>
            No se encontraron resultados
          </div>
        )}
      </div>
    </div>
  );
};

export default ListarAnimadores;
