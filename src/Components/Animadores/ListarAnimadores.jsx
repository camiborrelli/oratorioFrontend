import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import api from "../../api";
import { listarAnimadores } from "../../features/animador.slice";
// import "../Ninios/Listado.css";
import "./ListarAnimadores.css";

const ListarAnimadores = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [animadores, setAnimadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState(null);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const storedUsuario = localStorage.getItem("Usuario");
    if (storedUsuario) {
      setUsuario(JSON.parse(storedUsuario));
      console.log(
        "Usuario cargado desde localStorage:",
        JSON.parse(storedUsuario),
      );
    }
  }, []);

  const isCoordinador = usuario?.roles?.includes("coordinador");
  const isAdmin = usuario?.roles?.includes("admin");

  const API_BASE = api.defaults?.baseURL || import.meta.env.VITE_API_URL || "";
  const FALLBACK_IMG = "/img/image.png";

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

  const buildFotoSrc = (foto) => {
    if (!foto) return FALLBACK_IMG;
    if (
      typeof foto === "string" &&
      (foto.startsWith("http") || foto.startsWith("data:"))
    ) {
      return foto;
    }
    return `${API_BASE}${String(foto).startsWith("/") ? "" : "/"}${foto}`;
  };

  const openPerfil = (anim) => {
    navigate(`/animadores/perfil/${anim._id}`);
  };

  const handleAsignarRol = async (event, anim) => {
    event.stopPropagation();

    try {
      const res = await api.post(`/animador/${anim._id}/coordinador`, {});

      if (res.status === 200) {
        toast.success("Rol asignado correctamente");
        fetchAnimadores();
      }
    } catch (err) {
      console.error("Error asignando rol:", err);
      const msg = err?.response?.data?.message || "Error al asignar rol";
      toast.error(msg);
    }
  };

  const handleQuitarRol = async (event, anim) => {
    event.stopPropagation();

    try {
      const res = await api.delete(`/animador/${anim._id}/animador`, {});

      if (res.status === 200) {
        toast.success("Rol quitado correctamente");
        fetchAnimadores();
      }
    } catch (err) {
      console.error("Error quitando rol:", err);
      const msg = err?.response?.data?.message || "Error al quitar rol";
      toast.error(msg);
    }
  };

  if (loading) return <div className="listado-root">Cargando...</div>;

  if (error) {
    return (
      <div className="listado-root animadores-listado">
        <div className="card">
          <h3>Error al cargar animadores</h3>
          <p>{String(error)}</p>
          <button className="add-btn" onClick={fetchAnimadores}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="listado-root animadores-listado">
      <header className="listado-header">
        {/* <button className="back-btn" onClick={() => navigate(-1)}>
          {"<"}
        </button> */}
        <h1>Animadores</h1>
      </header>

      <div className="search-row">
        <input
          className="search-input"
          placeholder="Buscar por nombre..."
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

      <p className="results-count">
        Mostrando {filtered.length} de {animadores.length}
      </p>

      <div className="cards">
        {filtered.length === 0 ? (
          <div className="animadores-empty">No se encontraron resultados</div>
        ) : (
          filtered.map((anim, idx) => (
            <div
              key={anim._id || anim.id || idx}
              className="card"
              onClick={() => openPerfil(anim)}
            >
              <div className="card-left">
                <img
                  className="avatar avatar-circle"
                  src={buildFotoSrc(anim.foto)}
                  alt={anim.nombre || "avatar"}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                />
              </div>

              <div className="card-main">
                <div className="card-title">
                  {anim.nombre || anim.name || "Sin nombre"}
                </div>
                <div className="badges-row">
                  <span className="pill small">
                    {anim.division ||
                      anim.grupo ||
                      anim.seccion ||
                      "Sin division"}
                  </span>
                </div>
                <div className="badges-row">
                  <span className="pill small">
                    {anim.roles || anim.rol || "Animador"}
                  </span>
                </div>

                {isAdmin && anim.roles?.includes("coordinador") && (
                  <button
                    className="btn-asign-role"
                    onClick={(event) => handleQuitarRol(event, anim)}
                  >
                    Quitar Rol
                  </button>
                )}
                {usuario?.roles?.includes("coordinador") && (
                  <>
                    <button
                      className="btn-asign-role"
                      onClick={(event) => handleAsignarRol(event, anim)}
                    >
                      Asignar Rol
                    </button>
                  </>
                )}
              </div>

              <div className="card-right">
                <div className="card-arrow">{" >"}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListarAnimadores;
