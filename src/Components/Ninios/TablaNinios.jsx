import React from "react";
import "./TablaNinios.css";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { toast } from "react-toastify";

const TablaNinios = ({ ninios }) => {
  const navigate = useNavigate();
  const [modal, showmodal] = React.useState(false);
  const [ninioSeleccionado, setNinioSeleccionado] = React.useState(null);
  const [nuevaDivision, setNuevaDivision] = React.useState("");

  const cambiarDivision = async (nin, nuevaDiv) => {
    try {
      const res = await api.put(`/ninno/${nin._id}/division`, {
        division: nuevaDiv,
      });
      if (res.status === 200) {
        toast.success(`División de ${nin.nombre} actualizada a ${nuevaDiv}`);
        cerrarModal();
      } else {
        toast.error(`Error al actualizar división: ${res.statusText}`);
        cerrarModal();
      }
    } catch (err) {
      console.error("Error al cambiar división:", err);
      toast.error("Error al cambiar división");
    }
  };

  const cerrarModal = () => {
    showmodal(false);
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
          {ninios.map((nin) => (
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
                  className="btn btn-sm btn-info"
                  onClick={() => {
                    setNinioSeleccionado(nin);
                    showmodal(true);
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

      {showmodal && (
        <div className="modal" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Cambiar división</h2>

            <p>
              Seleccione la nueva división para {ninioSeleccionado?.nombre}:
            </p>

            <select
              value={nuevaDivision || ninioSeleccionado?.division}
              onChange={(e) => setNuevaDivision(e.target.value)}
            >
              <option value="Chiquitos">Chiquitos</option>
              <option value="Medianitos">Medianitos</option>
              <option value="Medianos">Medianos</option>
              <option value="Grandes">Grandes</option>
            </select>

            <div className="btn-actions">
              <button
                className="btn-confirmar"
                onClick={() => {
                  cambiarDivision(ninioSeleccionado, nuevaDivision);
                }}
              >
                Confirmar
              </button>

              <button className="btn-cancelar" onClick={cerrarModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaNinios;
