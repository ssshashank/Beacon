import { JSX } from "@solidjs/web/jsx-runtime";
import { createSignal, ParentComponent } from "solid-js";
import { InputType } from "../../../constants/app";
import { SwitchContext } from "./context";

type SwitchProps = {
  isDisabled?: boolean;
  defaultChecked?: boolean;
  children?: JSX.Element;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

const Switch: ParentComponent<SwitchProps> = (props) => {
  const [internalCheck, setInternalCheck] = createSignal(props?.defaultChecked ?? false);
  const isDisabled = () => props.isDisabled === true;
  const isControlled = () => props.checked !== undefined;
  const checked = () => (isControlled() ? props.checked! : internalCheck());

  const toggle = () => {
    if (isDisabled()) return;
    const next = !checked();
    if (!isControlled()) setInternalCheck(next);
    props.onCheckedChange?.(next);
  };

  return (
    <SwitchContext value={{ checked, toggle }}>
      <label class="relative inline-block w-10 h-6 cursor-pointer rounded">
        <input
          type={InputType.CHECKBOX}
          class="sr-only peer"
          checked={checked()}
          disabled={isDisabled()}
          onChange={toggle}
        />
        {props?.children ?? <>
          <div class="w-full h-full bg-neutral-700 transition-colors duration-300 peer-checked:bg-blue-600 rounded"></div>
          <div class="absolute top-1 left-1 w-4 h-4 bg-white transition-transform duration-300 peer-checked:translate-x-4 shadow-sm rounded-xs"></div>
        </>}
      </label>
    </SwitchContext>
  );
};

export default Switch;
