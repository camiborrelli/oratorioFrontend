import React, { useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import "./CrearRecorrida.css";

const CrearRecorrida = ({ onClose }) => {
  const [formData, setFormData] = useState({
    nombre: "",
  });

  const handleChange = async (e) => {
    e.preventDefault();
    const { name } = e.target;

    try {
      const res = await api.post("/recorrida", formData);
      if (res?.status === 200 || res?.status === 201) {
        toast.success("Recorrida creada exitosamente");
        window.dispatchEvent(
          new CustomEvent("oratorio:creado", {
            detail: {
              tipo: "recorrida",
              item: res.data,
            },
          }),
        );
      }

      if (typeof onClose === "function") {
        onClose();
      }
    } catch (error) {
      console.error("Error al crear la recorrida:", error);
      toast.error(
        "Hubo un error al crear la recorrida. Por favor, inténtalo de nuevo.",
      );
    }
  };

  return (
    <div className="crear-recorrida-overlay" onClick={onClose}>
      <div
        className="crear-recorrida-container"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Crear Recorrida</h2>
        <form onSubmit={handleChange}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre de la Recorrida:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nombre: e.target.value }))
              }
              required
            />
          </div>
          <button type="submit" className="btn btn-primary crear-reco">
            Crear
          </button>
        </form>
      </div>
    </div>
  );
};

export default CrearRecorrida;
