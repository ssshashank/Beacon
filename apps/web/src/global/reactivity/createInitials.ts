import { createMemo } from "solid-js";

const createInitial= (name: unknown) => {
  const initials = createMemo(() => {
    const currentName = typeof name === "function" ? name() : name;
    
    if (!currentName) return "";

    const nameParts = currentName.trim().split(/\s+/);
    let initials = "";

    if (nameParts.length > 1) {
      initials = (nameParts[0]?.[0] || "").toUpperCase() + (nameParts[1]?.[0] || "").toUpperCase();
    } else {
      initials = (nameParts[0]?.[0] || "").toUpperCase();
    }

    return initials;
  });

  return initials;
};

export default createInitial;
