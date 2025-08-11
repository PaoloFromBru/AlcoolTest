"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        reg.addEventListener("updatefound", () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener("statechange", () => {
            if (nw.state === "installed" && navigator.serviceWorker.controller) {
              console.log("Nuovi contenuti disponibili. Aggiorna per applicare.");
            }
          });
        });
      } catch (err) {
        console.error("Registrazione SW fallita", err);
      }
    };

    setTimeout(register, 0);
  }, []);

  return null;
}
