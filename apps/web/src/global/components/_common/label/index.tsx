import { JSX } from '@solidjs/web/jsx-runtime';
import { As, PolymorphicComponent } from '../../../types';
import { PrimitiveLabelProps } from '../../../types/primitive';
import { omit } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import { _CN } from '../../../utils/cn';

// Inputfield Label
interface BaseLabelProps extends PrimitiveLabelProps, As {
  children?: JSX.Element;
  ref?: (el: HTMLElement) => void;
  style?: string;
}

type LabelProps = PolymorphicComponent<BaseLabelProps, 'label'>;
const Label = (props: LabelProps) => {
  const rest = omit(props, 'as', 'children', 'ref', 'style');

  return (
    <Dynamic
      component={props?.as || 'label'}
      ref={props?.ref}
      class={_CN('text-sm', props?.style)}
      {...rest}
    >
      {props?.children}
    </Dynamic>
  );
};

export { Label };
