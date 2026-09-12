import { JSX } from '@solidjs/web/jsx-runtime';
import { Component} from 'solid-js';

export type Polymorphic<P = {}> = {
  as?: keyof JSX.IntrinsicElements | Component<any>;
} & P;

export type PolymorphicComponent<P = {}, E extends keyof JSX.IntrinsicElements = 'button'> =
  Polymorphic<P & JSX.IntrinsicElements[E]>;

export type As = {
  as?: keyof JSX.IntrinsicElements | Component<HTMLElement>;
};

// TS can't prove standard attributes (title, style...) exist for an unresolved
// generic `E` (some JSX.IntrinsicElements, like SVG/MathML, lack them). Any
// polymorphic component's body can call this once instead of casting locally.
export function asPolymorphic<P = {}>(props: Polymorphic<P> & Record<string, any>): PolymorphicComponent<P, 'button'> {
  return props as PolymorphicComponent<P, 'button'>;
}

export type IconProps = JSX.SvgSVGAttributes<SVGSVGElement> & {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
};

