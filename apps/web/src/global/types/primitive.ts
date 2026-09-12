// imports
import { JSX } from "@solidjs/web/jsx-runtime";

// Heading
type PrimitiveHeadingElement = HTMLHeadingElement;
type PrimitveHeadingrops = JSX.IntrinsicElements['h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'];

// Paragraph
type PrimitiveParagraphElement = HTMLParagraphElement;
type PrimitiveParagraphProps = JSX.IntrinsicElements['p'];

// Button
type PrimitiveButtonElement = HTMLButtonElement;
type PrimitiveButtonProps = JSX.IntrinsicElements['button'];

// Div
type PrimitiveDivElement = HTMLDivElement;
type PrimitiveDivProps = JSX.IntrinsicElements['div'];

// Span
type PrimitiveSpanElement = HTMLSpanElement;
type PrimitiveSpanProps = JSX.IntrinsicElements['span'];

// Input
type PrimitiveInputElement = HTMLInputElement;
type PrimitiveInputProps = JSX.IntrinsicElements['input'];

// Label
type PrimitiveLabelElement = HTMLLabelElement;
type PrimitiveLabelProps = JSX.IntrinsicElements['label'];

// Image
type PrimitiveImageElement = HTMLImageElement;
type PrimitiveImageProps = JSX.IntrinsicElements['image'];

// Select
type PrimitiveSelectElement = HTMLSelectElement;
type PrimitiveSelectProps = JSX.IntrinsicElements['select'];

// Option
type PrimitiveOptionElement = HTMLOptionElement;
type PrimitiveOptionsProps = JSX.IntrinsicElements['option'];

// Table Header
type PrimitiveTableHeaderElement = HTMLTableCellElement;
type PrimitiveTableHeaderElementProps = JSX.IntrinsicElements['thead'];

// Table Body
type PrimitiveTableBodyElement = HTMLTableSectionElement;
type PrimitiveTableBodyElementProps = JSX.IntrinsicElements['tbody'];

// Table Footer
type PrimitiveTableFooterElement = HTMLTableSectionElement;
type PrimitiveTableFooterElementProps = JSX.IntrinsicElements['tfoot'];

// Table Row
type PrimitiveTableRowElement = HTMLTableRowElement;
type PrimitiveTableRowElementProps = JSX.IntrinsicElements['tr'];

// Table Data
type PrimitiveTableDataElement = HTMLTableCellElement;
type PrimitiveTableDataElementProps = JSX.IntrinsicElements['td'];

// Table Column
type PrimitiveTableColumnElement = HTMLTableColElement;
type PrimitiveTableColumnElementProps = JSX.IntrinsicElements['col'];

/**
 ========= ELEMENT ENDS =============
**/

// exports
export type {
  PrimitiveHeadingElement,
  PrimitveHeadingrops,
  PrimitiveParagraphElement,
  PrimitiveParagraphProps,
  PrimitiveButtonElement,
  PrimitiveButtonProps,
  PrimitiveDivElement,
  PrimitiveDivProps,
  PrimitiveSpanElement,
  PrimitiveSpanProps,
  PrimitiveInputElement,
  PrimitiveInputProps,
  PrimitiveLabelElement,
  PrimitiveLabelProps,
  PrimitiveImageElement,
  PrimitiveImageProps,
  PrimitiveSelectElement,
  PrimitiveSelectProps,
  PrimitiveOptionElement,
  PrimitiveOptionsProps,
  PrimitiveTableHeaderElement,
  PrimitiveTableHeaderElementProps,
  PrimitiveTableBodyElement,
  PrimitiveTableBodyElementProps,
  PrimitiveTableFooterElement,
  PrimitiveTableFooterElementProps,
  PrimitiveTableRowElement,
  PrimitiveTableRowElementProps,
  PrimitiveTableDataElement,
  PrimitiveTableDataElementProps,
  PrimitiveTableColumnElement,
  PrimitiveTableColumnElementProps
}
