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
    const tryDelete = async (path) => {
      try {
        const res = await api.delete(path);
        return res;
      } catch (e) {
        return null;
      }
    };

    const paths = [`/ninios/${id}`, `/ninios/id/${id}`, `/ninio/${id}`];
    let res = null;
    for (const p of paths) {
      res = await tryDelete(p);
      if (res) break;
    }

    setLoading(false);
    if (res) {
      toast.success("Niño eliminado");
      dispatch(eliminarNinio(id));
      if (typeof onDeleted === "function") onDeleted();
    } else {
      toast.error("No se pudo eliminar el niño");
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
