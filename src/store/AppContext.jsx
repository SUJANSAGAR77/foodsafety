// ============================================================
// AppContext.jsx — Global state management
// ============================================================
import { createContext, useContext, useReducer } from "react";
import {
  INITIAL_REPORTS, HANDLERS, ROUTING_RULES,
  ESCALATION_LOG, QUEUED_REPORTS
} from "./mockData";

const AppContext = createContext(null);

const initialState = {
  reports: INITIAL_REPORTS,
  handlers: HANDLERS,
  routingRules: ROUTING_RULES,
  escalationLog: ESCALATION_LOG,
  queuedReports: QUEUED_REPORTS,
};

function reducer(state, action) {
  switch (action.type) {
    case "ADD_REPORT":
      return { ...state, reports: [action.payload, ...state.reports] };

    case "UPDATE_REPORT_STATUS":
      return {
        ...state,
        reports: state.reports.map((r) =>
          r.id === action.payload.id
            ? { ...r, status: action.payload.status }
            : r
        ),
      };

    case "UPDATE_HANDLER":
      return {
        ...state,
        handlers: state.handlers.map((h) =>
          h.id === action.payload.id ? { ...h, ...action.payload } : h
        ),
      };

    case "ADD_ESCALATION":
      return { ...state, escalationLog: [action.payload, ...state.escalationLog] };

    case "REMOVE_FROM_QUEUE":
      return {
        ...state,
        queuedReports: state.queuedReports.filter((q) => q.id !== action.payload),
      };

    case "ADD_TO_QUEUE":
      return { ...state, queuedReports: [...state.queuedReports, action.payload] };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
