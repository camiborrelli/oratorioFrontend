import React, { useState, useEffect } from "react";
import "./CambiarContrasenia.css";
import toast from "react-hot-toast";

const CambiarContrasenia = ({ isOpen, onClose }) => {
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [animadorId, setAnimadorId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingRecovery, setLoadingRecovery] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setRecoveryStep(1);
    setAnimadorId(null);
  }, [isOpen]);

  const verificarEmail = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "http://localhost:5000/animadores/verificar-email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: recoveryEmail }),
        },
      );

      const data = await res.json();
      if (res.ok) {
        setAnimadorId(data.animadorId);
        setRecoveryStep(2);
        toast.success(
          "Email verificado. Por favor, ingresa tu nueva contraseña.",
        );
      } else {
        toast.error(
          data.message ||
            data.error ||
            "Error al verificar el email. Por favor, intenta nuevamente.",
        );
      }
    } catch (error) {
      toast.error(
        "Error al verificar el email. Por favor, intenta nuevamente.",
      );
    } finally {
      setLoadingRecovery(false);
    }
  };

  const cambiarContrasenia = async (e) => {
    if (newPassword !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setErrorMessage("Por favor, completa ambos campos de contraseña");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/animadores/cambiar-contrasenia/${animadorId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newPassword }),
        },
      );
      const data = await response.json();
      if (response.ok) {
        toast.success("Contraseña cambiada exitosamente");
        onClose();
      } else {
        toast.error(
          data.message ||
            "Error al cambiar la contraseña. Por favor, intenta nuevamente.",
        );
      }
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      toast.error(
        "Error al cambiar la contraseña. Por favor, intenta nuevamente.",
      );
    }
  };

  const cerrarModal = () => {
    setRecoveryStep(1);
    setRecoveryEmail("");
    setAnimadorId(null);
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage("");
    setLoadingRecovery(false);
    onClose();
  };

  const volverPaso1 = () => {
    setRecoveryStep(1);
    setAnimadorId(null);
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage("");
    setLoadingRecovery(false);
  };

  if (!isOpen) return null; // Evita renderizar el modal si no está abierto

  return (
    <div className="modal-overlay-password">
      <div className="cambiar-contrasenia-modal">
        {recoveryStep === 1 ? (
          <form onSubmit={verificarEmail}>
            <h3>Recuperar contraseña</h3>

            <p>Ingresa tu correo electrónico para verificar tu cuenta.</p>

            <input
              type="email"
              placeholder="Correo electrónico"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              disabled={loadingRecovery}
            />

            <button
              type="submit"
              disabled={loadingRecovery}
              className="btn-change"
            >
              {loadingRecovery ? "Verificando..." : "Verificar email"}
            </button>

            <button type="button" onClick={cerrarModal} className="btn-cancel">
              Cerrar
            </button>
          </form>
        ) : (
          <>
            <h3>Cambiar contraseña</h3>

            <p>Ingresa tu nueva contraseña</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                cambiarContrasenia();
              }}
            >
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loadingRecovery}
                autoComplete="newPassword"
              />

              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loadingRecovery}
                autoComplete="confirmPassword"
              />

              <button
                type="submit"
                disabled={loadingRecovery}
                className="btn-change"
              >
                {loadingRecovery ? "Cambiando..." : "Cambiar contraseña"}
              </button>

              <button
                type="button"
                onClick={cerrarModal}
                className="btn-cancel"
              >
                Cerrar
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default CambiarContrasenia;
