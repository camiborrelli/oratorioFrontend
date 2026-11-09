import React, { useState } from "react";
import api from "../../api";
import { eliminarNinio } from "../../features/ninio.slice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const BotonEliminar = ({ id, onDeleted }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const ok = window.confirm("¿Confirma que desea eliminar este niño?");
    if (!ok) return;
    setLoading(true);
    try {
      await api.delete(`/ninios/${id}`);
      toast.success("Niño eliminado");
      dispatch(eliminarNinio(id));
      if (typeof onDeleted === "function") onDeleted();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "No tenés permisos para eliminar niños";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="delete-btn"
      onClick={handleDelete}
      disabled={loading}
      aria-label="Eliminar"
      type="button"
    >
      {loading ? "Eliminando..." : "Eliminar perfil"}
    </button>
  );
};

export default BotonEliminar;
