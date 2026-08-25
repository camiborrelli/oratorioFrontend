import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api";
import "./Notificaciones.css";

const iconos = {
  rol: "👤",
  evento: "📅",
  planificacion: "🗓️",
  recordatorio: "🔔",
};

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const noLeidas = useMemo(
    () => notificaciones.filter((notificacion) => !notificacion.leida).length,
    [notificaciones],
  );

  const cargar = async () => {
    setCargando(true);
    try {
      const { data } = await api.get("/notificaciones");
      setNotificaciones(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "No se pudieron cargar las notificaciones");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const marcarLeida = async (id) => {
    try {
      await api.put(`/notificaciones/${id}/leer`);
      setNotificaciones((actuales) =>
        actuales.map((notificacion) =>
          notificacion._id === id ? { ...notificacion, leida: true } : notificacion,
        ),
      );
    } catch (error) {
      toast.error("No se pudo actualizar la notificación");
    }
  };

  const marcarTodas = async () => {
    try {
      await api.put("/notificaciones/leer-todas");
      setNotificaciones((actuales) => actuales.map((notificacion) => ({ ...notificacion, leida: true })));
    } catch (error) {
      toast.error("No se pudieron marcar las notificaciones");
    }
  };

  const eliminar = async (id) => {
    try {
      await api.delete(`/notificaciones/${id}`);
      setNotificaciones((actuales) => actuales.filter((notificacion) => notificacion._id !== id));
    } catch (error) {
      toast.error("No se pudo eliminar la notificación");
    }
  };

  return (
    <main className="notificaciones-page">
      <header className="notificaciones-header">
        <div>
          <p className="notificaciones-eyebrow">ORATORIO CORDÓN</p>
          <h1>Notificaciones</h1>
          <p>{noLeidas ? `Tenés ${noLeidas} sin leer.` : "Estás al día."}</p>
        </div>
        <button type="button" onClick={marcarTodas} disabled={!noLeidas}>
          Marcar todas como leídas
        </button>
      </header>

      {cargando ? (
        <p className="notificaciones-empty">Cargando notificaciones...</p>
      ) : notificaciones.length === 0 ? (
        <p className="notificaciones-empty">Todavía no tenés notificaciones.</p>
      ) : (
        <section className="notificaciones-lista" aria-label="Lista de notificaciones">
          {notificaciones.map((notificacion) => (
            <article
              key={notificacion._id}
              className={`notificacion ${notificacion.leida ? "" : "notificacion--nueva"}`}
            >
              <span className="notificacion-icono">{iconos[notificacion.tipo] || "🔔"}</span>
              <span className="notificacion-contenido">
                <strong>{notificacion.titulo}</strong>
                <span>{notificacion.mensaje}</span>
                <time dateTime={notificacion.createdAt}>
                  {new Date(notificacion.createdAt).toLocaleString("es-UY", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
              </span>
              <div className="notificacion-acciones">
                {!notificacion.leida && (
                  <button type="button" className="notificacion-leer" onClick={() => marcarLeida(notificacion._id)}>
                    Marcar leída
                  </button>
                )}
                <button type="button" className="notificacion-eliminar" onClick={() => eliminar(notificacion._id)} aria-label={`Eliminar ${notificacion.titulo}`}>
                  Eliminar
                </button>
              </div>
              {!notificacion.leida && <span className="notificacion-punto" aria-label="No leída" />}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
