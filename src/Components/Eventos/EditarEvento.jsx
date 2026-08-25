import React, { useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import { FaCalendarAlt, FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import "./EditarEvento.css";

const EditarEvento = ({ evento, setEditarEvento, onEventoActualizado }) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: evento?.nombre || "",
    fecha: evento?.fecha
      ? new Date(evento.fecha).toISOString().slice(0, 16)
      : "",
    descripcion: evento?.descripcion || "",
    lugar: evento?.lugar || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const cerrarModal = () => {
    if (!loading) {
      setEditarEvento(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      cerrarModal();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      toast.error("El nombre del evento es obligatorio");
      return;
    }

    if (!formData.fecha) {
      toast.error("La fecha del evento es obligatoria");
      return;
    }

    if (!formData.lugar.trim()) {
      toast.error("El lugar del evento es obligatorio");
      return;
    }

    setLoading(true);

    try {
      let fechaPayload = formData.fecha;

      // Convertir datetime-local a ISO
      if (typeof fechaPayload === "string" && fechaPayload.includes("T")) {
        const dt = new Date(fechaPayload);

        if (!isNaN(dt.getTime())) {
          fechaPayload = dt.toISOString();
        }
      }

      const payload = {
        nombre: formData.nombre.trim(),
        fecha: fechaPayload,
        lugar: formData.lugar.trim(),
        descripcion: formData.descripcion.trim(),
      };

      const res = await api.put(`/evento/${evento._id}`, payload);

      toast.success("Evento actualizado exitosamente");

      onEventoActualizado(res.data);

      setEditarEvento(false);
    } catch (err) {
      console.error("Error updating evento:", err, err?.response?.data);

      toast.error(
        err?.response?.data?.message || "Error al actualizar el evento",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editar-evento-overlay" onClick={handleOverlayClick}>
      <div
        className="editar-evento-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editar-evento-title"
      >
        {/* Header */}
        <div className="editar-evento-header">
          <div>
            <h2 id="editar-evento-title">Editar evento</h2>

            <p>Modificá los datos del evento y guardá los cambios.</p>
          </div>

          <button
            type="button"
            className="editar-evento-close"
            onClick={cerrarModal}
            disabled={loading}
            aria-label="Cerrar"
          >
            <FaTimes />
          </button>
        </div>

        {/* Formulario */}
        <form className="editar-evento-form" onSubmit={handleSubmit}>
          {/* Nombre */}
          <div className="editar-evento-field">
            <label htmlFor="evento-nombre">Nombre del evento</label>

            <input
              id="evento-nombre"
              type="text"
              name="nombre"
              placeholder="Ej. Campamento de verano"
              value={formData.nombre}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          {/* Fecha */}
          <div className="editar-evento-field">
            <label htmlFor="evento-fecha">Fecha y hora</label>

            <div className="editar-evento-input-icon">
              <FaCalendarAlt />

              <input
                id="evento-fecha"
                type="datetime-local"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Lugar */}
          <div className="editar-evento-field">
            <label htmlFor="evento-lugar">Lugar</label>

            <div className="editar-evento-input-icon">
              <FaMapMarkerAlt />

              <input
                id="evento-lugar"
                type="text"
                name="lugar"
                placeholder="Ej. Parque Rivera"
                value={formData.lugar}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="editar-evento-field">
            <label htmlFor="evento-descripcion">Descripción</label>

            <textarea
              id="evento-descripcion"
              name="descripcion"
              placeholder="Agregá una descripción del evento..."
              value={formData.descripcion}
              onChange={handleChange}
              disabled={loading}
              rows={4}
            />
          </div>

          {/* Acciones */}
          <div className="editar-evento-actions">
            <button
              type="button"
              className="editar-evento-btn cancelar"
              onClick={cerrarModal}
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="editar-evento-btn guardar"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarEvento;
