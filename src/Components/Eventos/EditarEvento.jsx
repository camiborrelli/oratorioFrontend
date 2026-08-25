import React, { useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import "./EditarEvento.css";

const EditarEvento = ({ evento, setEditarEvento, setEvento }) => {
  const [formData, setFormData] = useState({
    nombre: evento.nombre || "",
    fecha: evento.fecha
      ? new Date(evento.fecha).toISOString().slice(0, 16)
      : "",
    descripcion: evento.descripcion || "",
    lugar: evento.lugar || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        ...formData,
        nombre: formData.nombre.trim(),
        lugar: formData.lugar.trim(),
        fecha: fechaPayload,
        descripcion: formData.descripcion.trim(),
      };

      const res = await api.put(`/evento/${evento._id}`, payload);

      toast.success("Evento actualizado exitosamente");
      setEvento(res.data);
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
    <div
      className="editar-evento-modal-overlay"
      onClick={() => setEditarEvento(false)}
    >
      <div
        className="editar-evento-modal-box"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Editar evento</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del evento"
            value={formData.nombre}
            onChange={handleChange}
          />
          <input
            type="datetime-local"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
          />
          <input
            type="text"
            name="lugar"
            placeholder="Lugar del evento"
            value={formData.lugar}
            onChange={handleChange}
          />
          <textarea
            name="descripcion"
            placeholder="Descripción del evento"
            value={formData.descripcion}
            onChange={handleChange}
          />
          <button type="submit">Guardar cambios</button>
        </form>
      </div>
    </div>
  );
};

export default EditarEvento;
