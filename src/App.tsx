import React, { useState, useEffect } from "react";
import { App as CapApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { getStoredFamily, getActiveUser, getStoredUsers, subscribeStore } from "./lib/mobile-storage";
import { dayKey } from "./lib/model";
import { getScreenLockSetting, applyScreenLock } from "./lib/screen-lock";
import { Portal } from "./components/portal";
import { Welcome } from "./components/welcome";

export function App() {
  const [, setTick] = useState(0);

  useEffect(() => {
    // Configure native status bar for Android (sin superponer para proteger el reloj)
    try {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: "#233d33" });
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
    } catch {
      // Ignored in browser preview
    }

    // Inicializar bloqueo de desplazamiento vertical y márgenes seguros de 0.5cm
    const fam = getStoredFamily();
    applyScreenLock(getScreenLockSetting(fam?.settings.screenLockMargins));

    // Handle Android hardware back button
    let backListenerHandle: { remove: () => Promise<void> } | null = null;
    try {
      CapApp.addListener("backButton", ({ canGoBack }) => {
        if (!canGoBack) {
          CapApp.exitApp();
        } else {
          window.history.back();
        }
      }).then((handle) => {
        backListenerHandle = handle;
      }).catch(() => {});
    } catch {
      // Ignored
    }

    const unsub = subscribeStore(() => {
      setTick((t) => t + 1);
    });

    return () => {
      unsub();
      if (backListenerHandle) {
        backListenerHandle.remove().catch(() => {});
      }
    };
  }, []);

  const family = getStoredFamily();
  const user = getActiveUser();
  const members = getStoredUsers();

  const handleUpdate = () => {
    setTick((t) => t + 1);
  };

  if (!family || !user) {
    return <Welcome setup={!family} onComplete={handleUpdate} />;
  }

  const today = dayKey(family.settings.timezone);

  return (
    <Portal
      snapshot={{
        family,
        user,
        members: user.role === "parent" ? members : [user],
        today,
      }}
      onUpdate={handleUpdate}
    />
  );
}

export default App;
