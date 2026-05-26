import React from "react";
import { useState } from "react";
import "./TablaNinios.css";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { toast } from "react-toastify";
import { set } from "react-hook-form";
import { useEffect } from "react";

const TablaNinios = ({ ninios }) => {
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  const [ninioSeleccionado, setNinioSeleccionado] = useState(null);
  const [nuevaDivision, setNuevaDivision] = useState("");
  const [niniosList, setNiniosList] = useState(ninios || []);

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
        division: nuevaDiv,
      });
      if (res.status === 200) {
        setNiniosList(
          niniosList.map((n) =>
            n._id === nin._id ? { ...n, division: nuevaDiv } : n,
          ),
        );
        toast.success(`División de ${nin.nombre} actualizada a ${nuevaDiv}`);
        console.log(nin.division);
        cerrarModal();
      }
    } catch (err) {
      console.error("Error al cambiar división:", err);
      toast.error("Error al cambiar división");
    }
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

              <td>{nin.contactos.nombre}</td>
              <td>
                {/* Aquí podrías agregar botones para editar o eliminar */}
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => navigate("/ninios/edit", { state: { nin } })}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-change"
                  onClick={() => {
                    setNinioSeleccionado(nin);
                    setModal(true);
                  }}
                >
                  Cambiar División
                </button>
                <button className="btn btn-sm btn-danger">Eliminar</button>
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
    </div>
  );
};

export default TablaNinios;
