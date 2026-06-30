import React from "react";
import { useState } from "react";
import "./TablaNinios.css";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { toast } from "react-toastify";
import { set } from "react-hook-form";
import { useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { MdOutlinePublishedWithChanges } from "react-icons/md";
import { TiDeleteOutline } from "react-icons/ti";

const TablaNinios = ({ ninios }) => {
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  const [ninioSeleccionado, setNinioSeleccionado] = useState(null);
  const [nuevaDivision, setNuevaDivision] = useState("");
  const [niniosList, setNiniosList] = useState(ninios || []);
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] =
    useState(false);

  useEffect(() => {
    setNiniosList(ninios || []);
  }, [ninios]);

  const cambiarDivision = async (nin, nuevaDiv) => {
    if (!nuevaDiv) {
      toast.error("Por favor, selecciona una nueva división");
      return;
    }
    try {
      const res = await api.put(`/ninios/cambiarDivision/${nin._id}`, {
        nuevaDivision: nuevaDiv,
      });
      console.log(nuevaDiv);
      if (res.status === 200) {
        const ninioActualizado = res.data.ninio; // usar el objeto del backend
        setNiniosList(
          niniosList.map((n) => (n._id === nin._id ? ninioActualizado : n)),
        );
        toast.success(`División de ${nin.nombre} actualizada`);
        cerrarModal();

        const dataNinios = await api.get("/ninios");
        setNiniosList(dataNinios.data);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Error al cambiar división";
      toast.error(msg);
    }
  };

  const confirmarEliminacion = async (id) => {
    setMostrarModalConfirmacion(true);
    setNinioSeleccionado(id);
  };

  const cerrarModal = () => {
    setModal(false);
    setNinioSeleccionado(null);
    setNuevaDivision("");
  };

  return (
    <div>
      <table className="tabla-ninios">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Edad</th>
            <th>División</th>
            <th>Recorrida</th>
            <th>Contactos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {niniosList.map((nin) => (
            <tr key={nin._id}>
              <td>{nin.nombre}</td>
              <td>{nin.apellido}</td>
              <td>{nin.edad}</td>
              <td>{nin.division}</td>
              <td className="recorrida">
                <span className={nin.recorrida.toLowerCase()}>
                  {nin.recorrida}
                </span>
              </td>

              <td>
                {nin.contactos &&
                Array.isArray(nin.contactos) &&
                nin.contactos.length > 0 ? (
                  <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
                    {nin.contactos.map((contact, idx) => (
                      <div key={idx}>
                        <strong>{contact.nombre}</strong>
                        {contact.telefono && <div>{contact.telefono}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: "#999" }}>-</span>
                )}
              </td>
              <td>
                {/* Aquí podrías agregar botones para editar o eliminar */}
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    sessionStorage.setItem("editarNinio", JSON.stringify(nin));
                    navigate("/ninios/edit", { state: { nin } });
                  }}
                >
                  <FaEdit />
                </button>
                <button
                  className="btn btn-sm btn-change"
                  onClick={() => {
                    setNinioSeleccionado(nin);
                    setModal(true);
                  }}
                >
                  <MdOutlinePublishedWithChanges />
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => confirmarEliminacion(nin._id)}
                >
                  <TiDeleteOutline />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {modal && (
        <div className="modal" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cambiar División</h2>
            </div>

            <div className="modal-body">
              <p>
                <strong>
                  Seleccione la nueva división para{" "}
                  {ninioSeleccionado?.nombre || "Sin reco"}:
                </strong>
              </p>
              <p>División actual: {ninioSeleccionado?.division}</p>
              <select
                value={nuevaDivision}
                onChange={(e) => setNuevaDivision(e.target.value)}
                className="modal-select"
              >
                <option value="">-- Selecciona una división --</option>
                <option value="chiquitos">Chiquitos</option>
                <option value="medianitos">Medianitos</option>
                <option value="medianos">Medianos</option>
                <option value="grandes">Grandes</option>
              </select>
            </div>

            <div className="btn-actions">
              <button
                type="button"
                className="btn-cancelar"
                onClick={() => setModal(false)} // ✅ ahora sí funciona
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-confirmar"
                onClick={() =>
                  cambiarDivision(ninioSeleccionado, nuevaDivision)
                }
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalConfirmacion && (
        <div className="modal" onClick={() => mostrarModalConfirmacion(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar Eliminación</h2>
            </div>
            <div className="modal-body">
              <p>
                ¿Estás seguro de que deseas eliminar a{" "}
                {niniosList.find((n) => n._id === ninioSeleccionado)?.nombre ||
                  "este niño"}
                ?
              </p>
            </div>
            <div className="btn-actions">
              <button
                type="button"
                className="btn-cancelar"
                onClick={() => setMostrarModalConfirmacion(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-confirmar"
                onClick={async () => {
                  try {
                    await api.delete(`/ninios/${ninioSeleccionado}`);
                    setNiniosList(
                      niniosList.filter((n) => n._id !== ninioSeleccionado),
                    );
                    toast.success("Niño eliminado correctamente");
                  } catch (err) {
                    const msg =
                      err?.response?.data?.message || "Error al eliminar niño";
                    toast.error(msg);
                  } finally {
                    setMostrarModalConfirmacion(false);
                  }
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaNinios;
