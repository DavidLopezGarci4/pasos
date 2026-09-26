import { Family, Member } from "./model";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

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
  return JSON.stringify({ version: "1.2.0", exportDate: new Date().toISOString(), family, users }, null, 2);
}

export async function saveDiskBackupSnapshot(jsonStr?: string): Promise<{ success: boolean; uri?: string; error?: string }> {
  try {
    const content = jsonStr || exportFamilyBackup();
    const fileName = `pasos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const result = await Filesystem.writeFile({
      path: `Pasos/${fileName}`,
      data: content,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
      recursive: true,
    });
    return { success: true, uri: result.uri };
  } catch (err: unknown) {
    // Fallback to Data directory if Documents directory is restricted
    try {
      const content = jsonStr || exportFamilyBackup();
      const fileName = `pasos-backup-latest.json`;
      const result = await Filesystem.writeFile({
        path: fileName,
        data: content,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      return { success: true, uri: result.uri };
    } catch (innerErr: unknown) {
      console.warn("No se pudo escribir en Filesystem nativo:", innerErr);
      return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
    }
  }
}

export function importFamilyBackup(jsonStr: string): { success: boolean; error?: string } {
  try {
    if (!jsonStr || typeof jsonStr !== "string") {
      return { success: false, error: "El archivo no contiene texto legible." };
    }
    const data = JSON.parse(jsonStr);
    
    // Check if the backup contains family structure
    const targetFamily = data.family || (data.name && Array.isArray(data.children) ? data : null);
    if (!targetFamily || typeof targetFamily.name !== "string" || !Array.isArray(targetFamily.children)) {
      return { success: false, error: "El archivo no es una copia de seguridad válida de Pasos." };
    }

    saveStoredFamily(targetFamily);

    let users = Array.isArray(data.users) ? data.users : [];
    if (users.length === 0) {
      // Reconstruct members from family
      users.push({ id: "adult-restored", name: "Adulto", role: "parent" });
      targetFamily.children.forEach((c: { id: string; name: string }) => {
        users.push({ id: c.id, name: c.name, role: "child" });
      });
    }
    saveStoredUsers(users);

    // Auto-select a parent profile if available
    const parentUser = users.find((u: { role: string }) => u.role === "parent") || users[0];
    if (parentUser) {
      setActiveUser(parentUser);
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "JSON inválido o corrupto." };
  }
}
