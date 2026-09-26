import { Family, Member } from "./model";

const FAMILY_KEY = "pasos_mobile_family";
const USERS_KEY = "pasos_mobile_users";
const ACTIVE_USER_KEY = "pasos_mobile_active_user";

const listeners = new Set<() => void>();

export function subscribeStore(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((l) => l());
}

export function getStoredFamily(): Family | null {
  try {
    const raw = localStorage.getItem(FAMILY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredFamily(family: Family) {
  try {
    localStorage.setItem(FAMILY_KEY, JSON.stringify(family));
    notifyListeners();
  } catch (err) {
    console.error("Error al guardar datos de familia en almacenamiento local:", err);
  }
}

export function getStoredUsers(): Member[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredUsers(users: Member[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    notifyListeners();
  } catch (err) {
    console.error("Error al guardar usuarios:", err);
  }
}

export function getActiveUser(): Member | null {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setActiveUser(user: Member | null) {
  try {
    if (user) {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(ACTIVE_USER_KEY);
    }
    notifyListeners();
  } catch (err) {
    console.error("Error al establecer usuario activo:", err);
  }
}

export function exportFamilyBackup(): string {
  const family = getStoredFamily();
  const users = getStoredUsers();
  return JSON.stringify({ version: "1.0.0", exportDate: new Date().toISOString(), family, users }, null, 2);
}

export function importFamilyBackup(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.family) {
      saveStoredFamily(data.family);
    }
    if (Array.isArray(data.users)) {
      saveStoredUsers(data.users);
    }
    return true;
  } catch {
    return false;
  }
}
