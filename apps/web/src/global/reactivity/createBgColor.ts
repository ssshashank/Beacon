import { createMemo } from "solid-js";

type BGColorMode = "default" | "soft-bg";

type CreateBGColorOptions = {
  mode?: BGColorMode;
};

const stringToHexColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 4) - hash);
  }

  const color = (hash & 0x00ffffff).toString(16);
  return `#${"00000".substring(0, 6 - color.length) + color}`;
};

const getHexBrightness = (color: string) => {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
};

const getTextColor = (hex: string, mode: BGColorMode = "default") => {
  const brightness = getHexBrightness(hex);

  if (mode === "soft-bg") {
    return brightness > 200 ? "#000000" : "#ffffff";
  }

  return brightness < 128 ? "#ffffff" : "#000000";
};

const createBGColorGenerator = (
  name: string | (() => string | undefined) = "John Doe",
  options?: CreateBGColorOptions,
) => {
  const hexColor = createMemo(() => {
    const currentName = typeof name === "function" ? name() : name;
    return stringToHexColor(currentName ?? "");
  });

  const textColor = createMemo(() => getTextColor(hexColor(), options?.mode));

  return [hexColor, textColor] as const;
};

export { createBGColorGenerator, getTextColor, stringToHexColor };
