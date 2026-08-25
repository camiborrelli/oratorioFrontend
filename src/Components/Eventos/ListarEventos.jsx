import React, { useEffect, useState } from "react";
import api, { fetchList } from "../../api";
import { toast } from "react-toastify";
import "./Eventos.css";
import ConfirmarAsistencia from "./ConfirmarAsistencia";
import ListarRecordatorios from "./ListarRecordatorios";
import CrearPlanificacion from "./CrearPlanificacion";
import CrearRecordatorio from "./CrearRecordatorio";
import CrearEvento from "./CrearEvento";
import { IoAlertCircleOutline } from "react-icons/io5";
import { PiCalendar } from "react-icons/pi";
import { CiBoxList } from "react-icons/ci";
import EditarEvento from "./EditarEvento";
import { FaEdit } from "react-icons/fa";

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
  const [mostrarModalRecordatorio, setMostrarModalRecordatorio] =
    useState(false);
  const [mostrarModalPlanificacion, setMostrarModalPlanificacion] =
    useState(false);
  const [mostrarCrearEvento, setMostrarCrearEvento] = useState(false);
  const [mostrarModalAnimadores, setMostrarModalAnimadores] = useState(false);
  const [animadoresDelEvento, setAnimadoresDelEvento] = useState([]);
  const [animador, setAnimador] = useState(null);
  const [animadorId, setAnimadorId] = useState(null);
  const [isCoordinator, setIsCoordinator] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [evento, setEvento] = useState(null);

  const [editarEvento, setEditarEvento] = useState(false);

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

  useEffect(() => {
    const actualizarAlCrear = (event) => {
      if (event.detail?.tipo === "evento") listarEventos().catch(() => {});
    };
    window.addEventListener("oratorio:creado", actualizarAlCrear);
    return () =>
      window.removeEventListener("oratorio:creado", actualizarAlCrear);
  }, []);
  useEffect(() => {
    const cargarAnimador = async () => {
      try {
        const storedId = localStorage.getItem("animadorId");

        if (!storedId) {
          console.error("No existe animadorId en localStorage");
          return;
        }

        setAnimadorId(storedId);

        const res = await api.get(`/animador/id/${storedId}`);

        const datosAnimador = res.data?.animador || res.data;

        setAnimador(datosAnimador);

        const roles = Array.isArray(datosAnimador?.roles)
          ? datosAnimador.roles.map((rol) => String(rol).toLowerCase().trim())
          : [];

        const coordinator =
          roles.includes("coordinador") || roles.includes("cordi");

        setIsCoordinator(coordinator);

        const admin = roles.includes("admin");
        setIsAdmin(admin);
      } catch (error) {
        console.error(
          "Error obteniendo animador:",
          error?.response?.data || error,
        );

        setAnimador(null);
        setIsCoordinator(false);
      }
    };

    cargarAnimador();
  }, []);
  const API_BASE = api.defaults?.baseURL || import.meta.env.VITE_API_URL || "";
  const FALLBACK_EVT_IMG = "/img/fondo1.jpg";
  const getAnimadoresDelEvento = async (evento) => {
    if (!evento) return;
    try {
      const animadores = await api
        .get(`/evento/${evento.id || evento._id}/animadores`)
        .then((res) => res.data?.animadores || res.data || []);

      setAnimadoresDelEvento(animadores);
      setMostrarModalAnimadores(true);
      console.log("Animadores del evento", evento.id || evento._id, animadores);
    } catch (error) {
      console.error(
        "Error fetching animadores for evento",
        evento.id || evento._id,
        error?.response?.data || error,
      );
      toast.error("No se pudieron cargar los animadores del evento");
    }
  };

  const handleEditarEvento = (evento) => {
    if (!evento) return;
    setEvento(evento);
    setEditarEvento(true);
  };

  // Carousel images from public/img (fall back to fondo1.jpg)
  const CAROUSEL_IMAGES = [
    "/img/fondo1.jpg",
    "/img/fogon.png",
    "/img/636861e3-f2be-4aac-96f0-0a1b851d12f1-convertido-de-jpg (1).png",
    "/img/d33f9563-b866-4cae-8bec-4fdc05249f4c-convertido-de-jpg.png",
    "/img/ef1b27fc-f8e0-409b-b794-5edb1936152d-convertido-de-jpg.png",
    "/img/f2370e7e-012c-4aa9-97d7-879edea39c2c-convertido-de-jpg.png",
  ];

  const formatDate = (d) =>
    d
      ? new Intl.DateTimeFormat("es-AR", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(d))
      : "--";

  return (
    <div className="eventos-container">
      {/* Full-width carousel (bleed out of container) */}
      <div className="carousel-fullwidth">
        <SimpleCarousel images={CAROUSEL_IMAGES} interval={3500} />
      </div>
      {loading && (
        <div className="evt-loading text-center py-6">Cargando eventos...</div>
      )}
      {error && (
        <div className="evt-error p-4 rounded-md">
          <h3 className="text-lg font-semibold">Error al cargar eventos</h3>
          <p className="evt-error__msg text-sm mt-2">{String(error)}</p>
          <div className="evt-error__actions mt-3">
            <button
              onClick={() => setMostrarModalPlanificacion(true)}
              className="btn bg-gray-100 px-3 py-1 rounded-md"
            >
              Agregar planificacion
            </button>
            <button
              className="btn btn-primary bg-green-600 text-white px-3 py-1 rounded-md btn-add"
              onClick={() => setMostrarCrearEvento(true)}
            >
              <div>
                <PiCalendar style={{ marginRight: 8, color: "#10b981" }} />
              </div>
              Agregar <br /> evento
            </button>
            <button
              onClick={() => setMostrarModalRecordatorio(true)}
              className="btn bg-gray-100 px-3 py-1 rounded-md"
            >
              <IoAlertCircleOutline
                style={{ marginRight: 8, color: "#64748b" }}
              />
              Agregar recordatorio
            </button>
          </div>
        </div>
      )}

      <div className="eventos-header flex items-center ">
        <div
          className="eventos-header__actions"
          style={{ display: "flex", gap: "8px" }}
        >
          {(isCoordinator || isAdmin) && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => setMostrarCrearEvento(true)}
              >
                <div>
                  <PiCalendar style={{ marginRight: 8 }} />
                </div>
                Agregar evento
              </button>
              <button
                className="btn btn-primary bg-blue-600 text-white px-3 py-1 rounded-md btn-add"
                onClick={() => setMostrarModalPlanificacion(true)}
              >
                <div>
                  <div>
                    <CiBoxList style={{ marginRight: 8 }} />
                  </div>
                </div>
                Agregar <br /> planificacion
              </button>
              <button
                className="btn btn-primary bg-gray-600 text-white px-3 py-1 rounded-md btn-add"
                onClick={() => setMostrarModalRecordatorio(true)}
              >
                <div>
                  <IoAlertCircleOutline style={{ marginRight: 8 }} />
                </div>
                Agregar <br /> recordatorio
              </button>
            </>
          )}
        </div>
      </div>
      <h1 className="text-xl font-bold">Próximos eventos</h1>
      <div className="eventos-grid">
        {eventos.length === 0 ? (
          <div className="evt-empty h-40 flex items-center justify-center">
            <div style={{ textAlign: "center", color: "#64748b" }}>
              No hay próximos eventos
              <div style={{ marginTop: 8 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setMostrarCrearEvento(true)}
                >
                  Agregar evento
                </button>
              </div>
            </div>
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
                {evento.lugar && (
                  <p className="evento-lugar">📍 {evento.lugar}</p>
                )}
              </div>
              <div className="evento-card__footer">
                {/* <span className="evento-tag">{evento.tipo || "General"}</span> */}
                <div className="evento-actions">
                  <ConfirmarAsistencia
                    evento={evento}
                    eventoId={evento.id || evento._id}
                    animadorId={localStorage.getItem("animadorId") || null}
                    onSuccess={() => listarEventos()}
                  />

                  <button
                    type="button"
                    className="btn btn-primary detalles"
                    onClick={() => {
                      setEvento(evento);
                      getAnimadoresDelEvento(evento);
                    }}
                  >
                    Ver detalles
                  </button>
                  {isCoordinator && (
                    <button
                      type="button"
                      className="btn btn-primary editar"
                      onClick={() => handleEditarEvento(evento)}
                      title="Editar evento"
                      aria-label={`Editar ${
                        evento.nombre || evento.title || "evento"
                      }`}
                    >
                      <FaEdit aria-hidden="true" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
      {mostrarCrearEvento && (
        <CrearEvento
          embedded={true}
          onClose={() => setMostrarCrearEvento(false)}
        />
      )}
      <div className="recordatorios-mobile">
        <ListarRecordatorios />
      </div>
      <div>
        {mostrarModalRecordatorio && (
          <CrearRecordatorio
            onClose={() => setMostrarModalRecordatorio(false)}
          />
        )}
        {mostrarModalPlanificacion && (
          <CrearPlanificacion
            onClose={() => setMostrarModalPlanificacion(false)}
          />
        )}
      </div>

      {mostrarModalAnimadores && (
        <div
          className="modal-animadores-evento"
          onClick={() => setMostrarModalAnimadores(false)}
        >
          <div className="modal-animadores__content">
            <h2>
              Lista de animadores para el evento <br />
              <span>{evento.nombre || evento.title || "Sin título"}</span>
            </h2>
            {animadoresDelEvento.length === 0 ? (
              <p>No hay animadores asignados a este evento.</p>
            ) : (
              <ul>
                {animadoresDelEvento.map((animador) => (
                  <li key={animador.id || animador._id}>
                    {animador.nombre} {animador.apellido}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {editarEvento && (
        <EditarEvento
          evento={evento}
          setEditarEvento={setEditarEvento}
          onEventoActualizado={(eventoActualizado) => {
            setEventos((prev) =>
              prev.map((e) =>
                (e.id || e._id) ===
                (eventoActualizado.id || eventoActualizado._id)
                  ? eventoActualizado
                  : e,
              ),
            );

            setEvento(eventoActualizado);
          }}
        />
      )}
    </div>
  );
};
export default ListarEventos;
