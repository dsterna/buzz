import { useEffect, useState } from "react";
import { nanoid } from "nanoid";

export function useStoredUuid() {
  const [uuid, setUuid] = useState<string>("");

  useEffect(() => {
    // TODO: change to localStorage in prod (?)
    const localUuid: string = sessionStorage.getItem("uuid") ?? "";

    if (localUuid) {
      setUuid(localUuid);
    } else {
      const id = nanoid();
      sessionStorage.setItem("uuid", id);
      setUuid(id); //=> "V1StGXR8_Z5jdHi6B-myT")
    }
  }, []);

  return uuid;
}
