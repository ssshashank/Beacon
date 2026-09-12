import { As, PolymorphicComponent } from "../../../types";
import { PrimitiveDivProps, PrimitiveTableBodyElementProps, PrimitiveTableHeaderElementProps } from "../../../types/primitive";
import { createEffect, createSignal, For, ParentComponent, Show } from "solid-js";
import { JSX } from "@solidjs/web/jsx-runtime";
import { TableContext, useTable } from "./context";
import { ChevronDownIcon } from "../../_icons/chevronDown";
import { ChevronLeftIcon } from "../../_icons/chevronLeft";
import { ChevronRightIcon } from "../../_icons/chevronRight";
import { ChevronUpIcon } from "../../_icons/chevronUp";
import { ChevronsUpDownIcon } from "../../_icons/chevronsUpDown";
import { _CN } from "../../../utils/cn";

type TableType = {
  children?: JSX.Element;
  table?: any;
  isSelectable?: boolean;
  isPagination?: boolean;
  onRowClick?: (row: any) => void;
};

const Table: ParentComponent<TableType> = (props) => {
  const _tableValue = {
    ...props.table,
    isSelectable: props.isSelectable ?? false,
    isPagination: props?.isPagination ?? false,
    onRowClick: props.onRowClick,
  };

  return (
    <TableContext value={_tableValue}>
      <table class="w-full">{props.children}</table>
    </TableContext>
  );
};

interface TableHeaderBaseProps extends PrimitiveTableHeaderElementProps, As {
  style?: string;
}
type TableHeaderProps = PolymorphicComponent<TableHeaderBaseProps, "thead">;

const TableHeader = (props: TableHeaderProps) => {
  const ctx = useTable();
  let checkboxRef!: HTMLInputElement;
  const [sortKey, setSortKey] = createSignal<string | null>(null);
  const [sortOrder, setSortOrder] = createSignal<"asc" | "desc">("asc");

  createEffect(
    () => ctx.isIndeterminate(),
    (indeterminate) => {
      if (checkboxRef) checkboxRef.indeterminate = indeterminate;
    }
  );

  const handleSort = (col: any) => {
    const key = col.sortKey || col.key;
    const _newOrder = sortKey() === key ? (sortOrder() === "asc" ? "desc" : "asc") : "asc";
    setSortKey(key);
    setSortOrder(_newOrder);

    let sorted;

    if (col.sortFn) {
      sorted = [...ctx.store.data].sort((a, b) => {
        const res = col.sortFn(a, b);
        return _newOrder === "asc" ? res : -res;
      });
    } else {
      sorted = [...ctx.store.data].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];

        if (aVal < bVal) return _newOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return _newOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    ctx.setStore((s: any) => {
      s.data = sorted;
    });
  };

  return (
    <thead class={_CN("bg-gray-100 rounded-md", props?.style)}>
      <tr>
        <Show when={ctx.isSelectable}>
          <th class="p-3 text-start w-[50px]">
            <input
              type="checkbox"
              ref={(el) => (checkboxRef = el)}
              checked={ctx.isAllSelected()}
              onChange={(e) => {
                if (e.currentTarget.checked) ctx.selectAllRow();
                else ctx.clearAllRow();
              }}
              style={{
                "accent-color": "#FF5200",
                width: "15px",
                height: "15px",
              }}
            />
          </th>
        </Show>
        <For each={ctx.store.columns}>
          {(col) => (
            <th class="p-3 cursor-pointer select-none text-center" onClick={() => (col.isSortable ? handleSort(col) : null)}>
              <div class="flex items-center justify-start gap-3">
                <span class="text-sm text-gray-500 font-normal">{col.label}</span>
                <Show when={col?.isSortable}>
                  <span>
                    {sortKey() === col.key ? (
                      sortOrder() === "asc" ? (
                        <ChevronUpIcon size={16} color="gray" />
                      ) : (
                        <ChevronDownIcon size={16} color="gray" />
                      )
                    ) : (
                      <ChevronsUpDownIcon size={16} color="gray" />
                    )}
                  </span>
                </Show>
              </div>
            </th>
          )}
        </For>
      </tr>
    </thead>
  );
};

interface TableBodyBaseProps extends PrimitiveTableBodyElementProps, As {}
type TableBodyProps = PolymorphicComponent<TableBodyBaseProps, "thead">;

/**
 * Returns true when the click started on a control inside the row (checkbox, button,
 * link, menu, or a cell marked with data-row-click-ignore) so the row onClick handler
 * can skip navigation and avoid double actions (e.g. select + open row).
 */
const isRowClickFromInteractiveTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest('input[type="checkbox"], button, a, [role="menu"], [role="menuitem"], [data-row-click-ignore]'));
};

const TableBody = (_props: TableBodyProps) => {
  const ctx = useTable();

  return (
    <tbody>
      <For each={ctx.isPagination ? ctx.paginatedData() : ctx.store.data}>
        {(row: any, index) => {
          return (
            <>
              <tr
                class={ctx.store.selectedRows[row.id] ? "" : "cursor-pointer"}
                onClick={(event) => {
                  if (isRowClickFromInteractiveTarget(event.target)) return;
                  ctx.onRowClick?.(row);
                }}>
                <Show when={ctx.isSelectable}>
                  <td
                    class={`px-3 py-3 ${index() < ctx.store.data.length - 1 ? "border-b-[0.5px] border-gray-300" : ""} text-sm`}
                    data-row-click-ignore>
                    <input
                      type="checkbox"
                      checked={ctx.store.selectedRows[row.id]}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        ctx.toggleRow(row.id);
                      }}
                      style={{
                        cursor: "pointer",
                        "accent-color": "#FF5200",
                        width: "15px",
                        height: "15px",
                      }}
                    />
                  </td>
                </Show>
                <For each={ctx.store.columns}>
                  {(col) => (
                    <td class={`px-3 py-3 ${index() < ctx.store.data.length - 1 ? "border-b-[0.5px] border-gray-300" : ""} text-left text-sm`}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  )}
                </For>
              </tr>
              {/* Expand row */}
              <Show when={ctx.store.expandedRows[row.id]}>
                <tr>
                  <td colspan={ctx.store.columns.length + 1}>
                    <div class="p-4 bg-gray-100">
                      <div class="text-sm text-gray-600">Email: {row.email}</div>
                      <div class="text-sm text-gray-600">Extra info here...</div>
                    </div>
                  </td>
                </tr>
              </Show>
            </>
          );
        }}
      </For>
    </tbody>
  );
};

interface TablePaginationBaseProps extends PrimitiveDivProps, As {}
type TablePaginationProps = PolymorphicComponent<TablePaginationBaseProps, "div">;

const TablePagination = (_props: TablePaginationProps) => {
  const ctx = useTable();

  return (
    <Show when={ctx.isPagination}>
      <div class="flex items-center justify-between p-3">
        <div class="text-sm text-gray-500">
          Page {ctx.store.currentPage} of {ctx.totalPages()}
        </div>
        <div class="flex gap-2">
          <button
            class={ctx.store.currentPage === 1 ? "" : "cursor-pointer"}
            disabled={ctx.store.currentPage === 1}
            onClick={() => ctx.setPage(ctx.store.currentPage - 1)}>
            <ChevronLeftIcon size={18} color={ctx.store.currentPage === 1 ? "" : "black"} />
          </button>
          {/* Pages */}
          <For each={Array.from({ length: ctx.totalPages() })}>
            {(_, i) => (
              <button
                class={`px-[9px] py-[4px] ${ctx.store.currentPage === i() + 1 ? "bg-gray-200 rounded" : ""} cursor-pointer text-sm`}
                onClick={() => ctx.setPage(i() + 1)}>
                {i() + 1}
              </button>
            )}
          </For>
          {/* Next */}
          <button
            class={ctx.store.currentPage === ctx.totalPages() ? "" : "cursor-pointer"}
            disabled={ctx.store.currentPage === ctx.totalPages()}
            onClick={() => ctx.setPage(ctx.store.currentPage + 1)}>
            <ChevronRightIcon size={18} color={ctx.store.currentPage === ctx.totalPages() ? "" : "black"} />
          </button>
        </div>
      </div>
    </Show>
  );
};

export { Table, TableHeader, TableBody, TablePagination, useTable };
