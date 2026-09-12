import { JSX } from '@solidjs/web/jsx-runtime';
import { As, PolymorphicComponent } from '../../../types';
import { PrimitiveDivProps } from '../../../types/primitive';
import { omit } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import { _CN } from '../../../utils/cn';

// Container
interface ContainerBaseProps extends PrimitiveDivProps, As {
  children?: JSX.Element;
  ref?: (el: HTMLElement) => void;
  style?: string;
}

type ContainerProps = PolymorphicComponent<ContainerBaseProps, 'div'>;
const Container= (props: ContainerProps) => {
  const rest = omit(props, 'ref', 'as', 'children', 'style');

  return (
    <Dynamic
      class={_CN('', props?.style)}
      ref={props?.ref}
      component={props?.as || 'div'}
      {...rest}>
      {props?.children}
    </Dynamic>
  );
};

export default Container;
