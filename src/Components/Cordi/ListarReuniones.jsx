import React, { useEffect, useState } from "react";
import { fetchList } from "../../api";
import api from "../../api";
import toast from "react-hot-toast";
import "./ListarReuniones.css";
import AgregarReunionModal from "../Reunion/AgregarReunionModal";
import { IoMdAdd } from "react-icons/io";

function fmtDateParts(iso) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { month: "", day: "", weekday: "" };
    const months = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];
    const month = months[d.getMonth()] || "";
    const day = d.getDate();
    const weekday = d.toLocaleDateString("es-ES", { weekday: "long" });
    return { month, day, weekday };
  } catch (e) {
    return { month: "", day: "", weekday: "" };
  }
}

const ListarReuniones = () => {
  const [reuniones, setReuniones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAgregar, setShowAgregar] = useState(false);

  const listarReuniones = async () => {
    setLoading(true);
    try {
      const list = await fetchList("/reunion");
      setReuniones(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error fetching /reunion", err);
      setReuniones([]);
    } finally {
      setLoading(false);
    }
  };

  const eliminarReunion = async (id) => {
    api
      .delete(`/reunion/${id}`)
      .then(() => {
        toast.success("Reunión eliminada");
        listarReuniones();
      })
      .catch((err) => {
        console.error("Error deleting reunion", err);
        toast.error("No se pudo eliminar la reunión");
      });
  };

  useEffect(() => {
    listarReuniones().catch(() => {});
  }, []);

  return (
    <div className="reuniones-root">
      <h2 className="section-title">Historial de Crónicas</h2>

      <button className="btn btn-primary" onClick={() => setShowAgregar(true)}>
        <IoMdAdd /> Agregar reunión
      </button>

      {showAgregar && (
        <AgregarReunionModal
          onClose={() => setShowAgregar(false)}
          onCreated={(reunion) => {
            if (reunion) setReuniones((actuales) => [...actuales, reunion]);
            setShowAgregar(false);
          }}
        />
      )}

      <div className="reuniones-list">
        {loading && (
          <div
            style={{ textAlign: "center", padding: "20px", color: "#64748b" }}
          >
            Cargando crónicas...
          </div>
        )}

        {reuniones.map((r) => {
          const id = r._id || r.id;
          const fecha = r.fecha || r.createdAt || new Date();
          const { month, day, weekday } = fmtDateParts(fecha);

          return (
            <article className="reunion-card" key={id}>
              {/* Bloque de fecha superior */}
              <div className="date-badge-container">
                <span className="month">{month}</span>
                <span className="day">{day}</span>
                <span className="weekday">{weekday}</span>
              </div>

              {/* Contenido */}
              <div className="card-content">
                <div className="card-header-row">
                  <h3 className="card-title">
                    {r.titulo || "Capacitación de Animadores"}
                  </h3>
                  <span className="options-dots">⋮</span>
                </div>

                <p className="card-excerpt">
                  {r.descripcion ||
                    "Sin descripción disponible para esta crónica..."}
                </p>

                <button onClick={() => eliminarReunion(id)}>Eliminar</button>

                <div className="card-footer">
                  {r.archivosCount > 0 && (
                    <span className="meta-badge">
                      <span className="meta-icon">📄</span>
                      {r.archivosCount} ARCHIVOS
                    </span>
                  )}
                  {/* Ejemplo de badge de comentarios como en la imagen */}
                  {r.comentariosCount > 0 && (
                    <span className="meta-badge" style={{ marginLeft: "8px" }}>
                      <span className="meta-icon">💬</span>
                      {r.comentariosCount} COMENTARIOS
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default ListarReuniones;
