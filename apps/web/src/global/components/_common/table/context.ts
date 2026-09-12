import { createContext, useContext } from "solid-js";

const TableContext = createContext<any>();

const useTable = () => {
  const ctx = useContext(TableContext);
  if (!ctx) throw new Error("Table components must be inside [Table]");
  return ctx;
};

export { useTable, TableContext };
