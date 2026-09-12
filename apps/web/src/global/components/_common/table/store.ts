import { createStore } from "solid-js";

const createTableStore = (data: any, columns: any) => {
  // STORE
  const [store, setStore] = createStore({
    data: data || [],
    columns: columns || [],
    selectedRows: {} as Record<string, boolean>,
    expandedRows: {} as Record<string, boolean>,
    currentPage: 1,
    pageSize: 5,
  });

  // ACTIONS
  // a) toggleRow action
  const toggleRow = (id: number) => {
    setStore((s) => {
      s.selectedRows[id.toString()] = !s.selectedRows[id.toString()];
    });
  };

  // b) selectAll row action
  const selectAllRow = () => {
    setStore((s) => {
      const selected: Record<string, boolean> = {};
      s.data.forEach((row: any) => (selected[row.id] = true));
      s.selectedRows = selected;
    });
  };

  // c) clearAll row action
  const clearAllRow = () => {
    setStore((s) => {
      Object.keys(s.selectedRows).forEach((id) => {
        s.selectedRows[id] = false;
      });
    });
  };

  // d) isAllSelected
  const isAllSelected = () =>
    store.data.length > 0 && store.data.every((row: any) => store.selectedRows[row.id] === true);

  // e) isIndeterminate
  const isIndeterminate = () => store.data.some((row: any) => store.selectedRows[row.id]) && !isAllSelected();

  // f) toggle accordion expand
  const toggleExpand = (id: string) => {
    setStore((s) => {
      s.expandedRows[id] = !s.expandedRows[id];
    });
  };

  // g) current page set
  const setPage = (page: number) => {
    setStore((s) => {
      s.currentPage = page;
    });
  };

  // h) current page size
  const setPageSize = (size: number) => {
    setStore((s) => {
      s.pageSize = size;
      s.currentPage = 1;
    });
  };

  // i) paginated data
  const paginatedData = () => {
    const start = (store.currentPage - 1) * store.pageSize;
    const end = start + store.pageSize;
    return store.data.slice(start, end);
  };

  // j) total pages count
  const totalPages = () => Math.ceil(store.data.length / store.pageSize);

  return {
    store,
    setStore,
    toggleRow,
    selectAllRow,
    clearAllRow,
    isAllSelected,
    isIndeterminate,
    toggleExpand,
    setPage,
    setPageSize,
    paginatedData,
    totalPages,
  };
};

export { createTableStore };
