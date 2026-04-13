import { configureStore, createSlice } from "@reduxjs/toolkit";
import animadorReducer from "./features/animador.slice";
import ninioReducer from "./features/ninio.slice";
import divisionReducer from "./features/division.slice";
import recorridaReducer from "./features/recorrida.slice";
import eventoReducer from "./features/evento.slice";

// Slice mínimo para autentificación
const authSlice = createSlice({
  name: "auth",
  initialState: { user: null },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    // register feature reducers under plural keys expected by selectors/components
    animadores: animadorReducer,
    ninios: ninioReducer,
    division: divisionReducer,
    recorrida: recorridaReducer,
    evento: eventoReducer,
  },
});

export default store;
