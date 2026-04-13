import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import { toast } from "react-toastify";
import "./Perfil.css";

const Perfil = () => {
  const { id } = useParams();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPerfil = async (animId) => {
    setLoading(true);
    setError(null);
    // candidate endpoint paths to try (order matters)
    const candidates = animId
      ? [
          `/animadores/id/${animId}`,
          `/animadores/${animId}`,
          `/animador/id/${animId}`,
          `/animador/${animId}`,
          `/animadores?id=${animId}`,
        ]
      : ["/animador/me"];

    let lastErr = null;
    try {
      for (const p of candidates) {
        try {
          console.info("Perfil: intentando", p);
          const res = await api.get(p);
          const d = res?.data;
          if (d == null) continue;
          if (typeof d === "string") {
            // likely HTML error page
            if (d.trim().startsWith("<!DOCTYPE") || d.includes("<html")) {
              console.warn("Perfil: respuesta HTML desde", p);
              continue;
            }
            try {
              const parsed = JSON.parse(d);
              if (parsed && typeof parsed === "object") {
                setPerfil(parsed);
                return;
              }
            } catch (e) {
              continue;
            }
          }

          const candidate = d?.animador || d?.usuario || d?.user || d;
          if (
            candidate &&
            typeof candidate === "object" &&
            (candidate.nombre ||
              candidate.email ||
              candidate.id ||
              candidate._id)
          ) {
            setPerfil(candidate);
            return;
          }
        } catch (err) {
          lastErr = err;
          const status = err?.response?.status;
          console.warn("Perfil: intento fallido", p, { status });
          // continue to next candidate
        }
      }

      // nothing returned usable
      if (lastErr) {
        const server = lastErr?.response?.data;
        setError(
          server?.message ||
            server ||
            lastErr.message ||
            "No se puede obtener el perfil",
        );
        toast.error("No se pudo cargar el perfil");
      } else {
        setError("No se encontró perfil en los endpoints probados");
        toast.error("No se pudo cargar el perfil");
      }
    } catch (err) {
      console.error("Perfil: error inesperado", err);
      setError(err?.message || String(err));
      toast.error("No se pudo cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const animId = id || localStorage.getItem("animadorId") || null;
    fetchPerfil(animId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const formatDate = (d) => {
    if (!d) return "-";
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return String(d);
    }
  };

  const navigate = useNavigate();
  const goToEdit = () => {
    const aid = perfil?._id || perfil?.id;
    if (aid) {
      navigate(`/animadores/editar/${aid}`, { state: { anim: perfil } });
    } else {
      navigate(`/animadores/editar`, { state: { anim: perfil } });
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("animadorId");
    navigate("/login");
  };

  const phoneGuardian =
    perfil?.contactos?.[0]?.telefono ||
    perfil?.telefono ||
    perfil?.telefono_celular ||
    perfil?.guardianPhone;

  return (
    <div className="animador-profile-root">
      {loading && <div className="loading">Cargando perfil...</div>}

      {error && (
        <div className="perfil-error">
          <h3>Error</h3>
          <p>{String(error)}</p>
          <button className="btn" onClick={() => fetchPerfil(id)}>
            Reintentar
          </button>
        </div>
      )}

      {perfil && (
        <div className="perfil-grid">
          <aside className="perfil-left">
            <div className="avatar-wrap">
              <img
                src={
                  // perfil.foto ||
                  // perfil.imagen ||
                  // "/img/avatar-placeholder.png" ||
                  "/img/image.png"
                }
                alt={perfil.nombre || "Animador"}
                onError={(e) =>
                  (e.currentTarget.src = "/img/avatar-placeholder.png")
                }
                className="perfil-avatar"
              />
            </div>
            <h2 className="perfil-name">
              {perfil.nombre} {perfil.apellido || ""}
            </h2>
            <div className="badges">
              {perfil.activo || perfil.status ? (
                <span className="badge badge-active">Active</span>
              ) : null}
            </div>

            <div className="actions">
              {/* <a className="btn btn-call" href={`tel:${phoneGuardian || ""}`}>
                Enviar mensaje
              </a> */}
              <button className="btn btn-asign" onClick={goToEdit}>
                Editar perfil
              </button>
              <button className="btn btn-alert" onClick={logout}>
                Cerrar sesión
              </button>
            </div>
          </aside>

          <main className="perfil-main">
            <div className="info-cards">
              <div className="info-card">
                <h4>ASSIGNED DIVISION</h4>
                <div className="info-card-body">
                  <strong> {perfil.division || "-"}</strong>
                </div>
              </div>

              <div className="info-card">
                <h4>Recorrida</h4>
                <div className="info-card-body">
                  <strong>{perfil.recorrida || perfil.route || "-"}</strong>
                  <div className="muted">{perfil.bus || ""}</div>
                </div>
              </div>

              <div className="info-card">
                <h4>Email</h4>
                <div className="info-card-body">
                  <strong>{perfil.email}</strong>
                </div>
              </div>
            </div>

            <section className="activity">
              <div className="activity-header">
                <h3>Activity History</h3>
                <a className="link" href="#">
                  VIEW ALL
                </a>
              </div>
              <div className="activity-list">
                {(perfil.activity || perfil.historial || []).length === 0 ? (
                  <div className="muted">No activity yet</div>
                ) : (
                  (perfil.activity || perfil.historial || []).map((it, i) => (
                    <div key={i} className="activity-item">
                      <div className="activity-title">
                        {it.title || it.name || it.evento || "Actividad"}
                      </div>
                      <div className="activity-meta muted">
                        {it.subtitle || it.desc || it.where}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </main>
        </div>
      )}
    </div>
  );
};

export default Perfil;
