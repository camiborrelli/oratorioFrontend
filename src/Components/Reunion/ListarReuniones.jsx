import React, { useEffect, useState } from "react";
import { fetchList } from "../../api";
import api from "../../api";
import "./ListarReuniones.css";
import AgregarReunionModal from "./AgregarReunionModal";
import toast from "react-hot-toast";
import { set } from "react-hook-form";
import { IoMdAdd } from "react-icons/io";
import dayjs from "dayjs";
import "dayjs/locale/es"; // para español
dayjs.locale("es");

const fmtDateParts = (dateStr) => {
  const d = dayjs(dateStr, "YYYY-MM-DD"); // parsea como fecha local
  return {
    month: d.format("MMM"), // ej: "jun"
    day: d.format("DD"), // ej: "07"
    weekday: d.locale("es").format("dddd"), // ej: "domingo"
  };
};

const ListarReuniones = () => {
  const [reuniones, setReuniones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [animador, setAnimador] = useState({});
  const [editTitulo, setEditTitulo] = useState("");
  const [editFecha, setEditFecha] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return dayjs(dateStr, "YYYY-MM-DD").format("DD/MM/YYYY");
  };

  const listarReuniones = async () => {
    setLoading(true);
    try {
      const list = await fetchList("/reunion");
      setReuniones(Array.isArray(list) ? list : []);
      setAnimador(JSON.parse(localStorage.getItem("Animador")) || {});
    } catch (err) {
      console.error("Error fetching /reunion", err);
      setReuniones([]);
    } finally {
      setLoading(false);
    }
  };

  const [showAgregar, setShowAgregar] = useState(false);

  const handleOpenAgregar = () => setShowAgregar(true);

  const handleCreated = (created) => {
    if (!created) return;
    setReuniones((prev) => [...prev, created]);
  };

  const actualizarReunion = async (id, data) => {
    try {
      const updated = await api.put(`/reunion/${id}`, data);
      if (updated) {
        toast.success("Reunión actualizada");
        listarReuniones();
      }
    } catch (err) {
      console.error("Error updating reunion", err);
      toast.error(
        "Error al actualizar la reunión:" +
          (err?.response?.data?.message || err.message),
      );
    }

    setModal({ open: false, data: null });
    listarReuniones();
  };

  const openEditModal = (reunion) => {
    setModal({ open: true, data: reunion });
    setEditTitulo(reunion.titulo || "");
    const fechaFormato = reunion.fecha
      ? new Date(reunion.fecha).toISOString().split("T")[0]
      : "";
    setEditFecha(fechaFormato);

    setEditDescripcion(reunion.descripcion || "");
  };

  useEffect(() => {
    listarReuniones().catch(() => {});
  }, []);

  const cerrarModal = () => setModal({ open: false, data: null });

  return (
    <div className="reuniones-root">
      <h2 className="section-title">Historial de Reuniones de Animadores</h2>

      <button className="btn btn-primary" onClick={handleOpenAgregar}>
        <IoMdAdd /> Agregar reunion
      </button>

      {showAgregar && (
        <AgregarReunionModal
          onClose={() => setShowAgregar(false)}
          onCreated={(item) => {
            handleCreated(item);
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
          const { month, day, weekday } = fmtDateParts(r.fecha);

          return (
            <article className="reunion-card" key={id}>
              {/* Bloque de fecha superior */}
              <div className="date-badge-container">
                <span className="month">{month}</span>
                <span className="day">{day} </span>
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
              </div>

              <button className="btn btn-edit" onClick={() => openEditModal(r)}>
                Editar resumen
              </button>
            </article>
          );
        })}
      </div>

      {modal.open && (
        <div className="modal" onClick={() => cerrarModal()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar reunión</h2>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Título de la reunion"
                value={editTitulo}
                onChange={(e) => setEditTitulo(e.target.value)}
              />
              <input
                type="date" // mejor usar "date" si solo necesitas día
                placeholder="Fecha"
                value={editFecha}
                onChange={(e) => setEditFecha(e.target.value)}
              />
              <textarea
                placeholder="Descripción"
                value={editDescripcion}
                onChange={(e) => setEditDescripcion(e.target.value)}
              ></textarea>
              <button
                className="btn btn-primary"
                onClick={() =>
                  actualizarReunion(modal.data._id, {
                    titulo: editTitulo,
                    fecha: editFecha,
                    descripcion: editDescripcion,
                  })
                }
              >
                Guardar cambios
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => cerrarModal()}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListarReuniones;
