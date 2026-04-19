import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { fetchList } from "../../api";
import { toast } from "react-toastify";
import "./Eventos.css";
import ConfirmarAsistencia from "./ConfirmarAsistencia";

// Lightweight carousel component (no external deps)
const SimpleCarousel = ({ images = [], interval = 3000 }) => {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (paused || images.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [images.length, interval, paused]);

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div
      className="simple-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="simple-carousel__track"
        style={{ transform: `translateX(${index * -100}%)` }}
      >
        {images.map((src, i) => (
          <div className="simple-carousel__slide" key={i}>
            <img src={src} alt={`slide-${i}`} />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <button
            className="simple-carousel__nav prev"
            onClick={prev}
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            className="simple-carousel__nav next"
            onClick={next}
            aria-label="Siguiente"
          >
            ›
          </button>
          <div className="simple-carousel__indicators">
            {images.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === index ? "active" : ""}`}
                onClick={() => setIndex(i)}
                aria-label={`Ir a la diapositiva ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const ListarEventos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [eventos, setEventos] = useState([]);

  const listarEventos = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchList("/evento");

      const today = new Date();
      const upcoming = (list || [])
        .map((e) => ({ ...e, _fecha: e.fecha ? new Date(e.fecha) : null }))
        .filter(
          (e) => e._fecha && e._fecha >= new Date(today.setHours(0, 0, 0, 0)),
        )
        .sort((a, b) => a._fecha - b._fecha);

      setEventos(upcoming);
    } catch (err) {
      console.error("Error fetching /eventos", err);
      if (err?.response?.status === 404) {
        setEventos([]);
        setError(`No se encontró /eventos (404).`);
      } else {
        setError(err?.response?.data || err.message || String(err));
        toast.error("No se pudieron cargar los eventos");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    listarEventos().catch(() => {});
  }, []);

  const decodeJwt = (token) => {
    try {
      if (!token) return null;
      const parts = token.split(".");
      if (parts.length < 2) return null;
      let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      while (payload.length % 4) payload += "=";
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  };

  const getCurrentRoles = () => {
    try {
      const fromStorage = JSON.parse(localStorage.getItem("roles") || "null");
      if (Array.isArray(fromStorage)) return fromStorage;
    } catch (e) {
      // ignore
    }
    try {
      const token =
        localStorage.getItem("Token") || localStorage.getItem("token");
      const payload = decodeJwt(token);
      if (!payload) return [];
      if (Array.isArray(payload.roles)) return payload.roles;
      if (typeof payload.roles === "string") return [payload.roles];
      if (payload.role)
        return Array.isArray(payload.role) ? payload.role : [payload.role];
      return [];
    } catch (e) {
      return [];
    }
  };

  const isCoordinator = getCurrentRoles().includes("coordinador");
  const navigate = useNavigate();

  const crearEvento = () => {
    navigate("/eventos/crear");
  };

  const formatDate = (d) =>
    d
      ? new Intl.DateTimeFormat("es-AR", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(d))
      : "--";

  return (
    <div className="eventos-container">
      {loading && (
        <div className="evt-loading text-center py-6">Cargando eventos...</div>
      )}

      {error && (
        <div className="evt-error p-4 rounded-md">
          <h3 className="text-lg font-semibold">Error al cargar eventos</h3>
          <p className="evt-error__msg text-sm mt-2">{String(error)}</p>
          <div className="evt-error__actions mt-3">
            <button
              className="btn bg-gray-100 px-3 py-1 rounded-md"
              onClick={crearEvento}
            >
              Agregar evento
            </button>
          </div>
        </div>
      )}

      <div className="eventos-header flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Próximos eventos</h1>
        <div className="eventos-header__actions">
          <button
            className="btn btn-primary bg-green-600 text-white px-3 py-1 rounded-md"
            onClick={crearEvento}
          >
            Agregar evento
          </button>
        </div>
      </div>

      {!loading && !error && (
        <div className="eventos-grid">
          {eventos.length === 0 ? (
            <div className="h-56 sm:h-64 xl:h-80 2xl:h-96">
              <SimpleCarousel
                images={["/img/fondo1.jpg", "/img/fondo1.jpg"]}
                interval={3500}
              />
            </div>
          ) : (
            eventos.map((evento) => (
              <article
                key={evento.id || evento._id}
                className="evento-card"
                aria-labelledby={`evt-${evento.id || evento._id}-title`}
              >
                <div className="evento-card__media">
                  <div className="evento-card__date text-sm">
                    {formatDate(evento.fecha)}
                  </div>
                </div>
                <div className="evento-card__body">
                  <h3
                    id={`evt-${evento.id || evento._id}-title`}
                    className="evento-title text-lg font-semibold"
                  >
                    {evento.nombre || evento.title || "Sin título"}
                  </h3>
                  <p className="evento-desc text-sm text-slate-600 mt-1">
                    {evento.descripcion || "Sin descripción"}
                  </p>
                </div>
                <div className="evento-card__footer">
                  {/* <span className="evento-tag">{evento.tipo || "General"}</span> */}
                  <div className="evento-actions">
                    <ConfirmarAsistencia
                      evento={evento}
                      eventoId={evento.id || evento._id}
                      // Try common localStorage keys for animador id; ConfirmarAsistencia will try /animador/me if missing
                      animadorId={localStorage.getItem("animadorId") || null}
                      onSuccess={() => listarEventos()}
                    />
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ListarEventos;
