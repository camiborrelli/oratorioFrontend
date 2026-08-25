import React from "react";
import api from "../../api";
import { toast } from "react-toastify";
import "./ModalEliminarAnimador.css";

const ModalEliminarAnimador = ({ animador, onClose, onConfirm }) => {
  if (!animador) return null;

  const eliminarAnimador = async () => {
    try {
      const res = await api.delete(`/animador/${animador._id}`);

      toast.success(res.data?.message || "Animador eliminado exitosamente");

      // Avisamos al componente padre que se eliminó correctamente
      if (onConfirm) {
        onConfirm(animador);
      }

      onClose();
    } catch (error) {
      console.error("Error eliminando animador:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Error al eliminar animador",
      );
    }
  };

  const handleOverlayClick = (e) => {
    // Solo cerrar si se hizo click en el fondo
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Confirmar eliminación</h2>

        <p>
          ¿Estás seguro de que deseas eliminar al animador{" "}
          <strong>{animador.nombre}</strong>?
        </p>

        <div className="modal-actions">
          <button
            type="button"
            onClick={eliminarAnimador}
            className="confirm-btn"
          >
            Sí, eliminar
          </button>

          <button type="button" onClick={onClose} className="cancel-btn">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEliminarAnimador;
