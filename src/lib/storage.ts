const FAVORITES_KEY = "eureka-dev-tools:favorites";
const RECENT_KEY = "eureka-dev-tools:recent";
const THEME_KEY = "eureka-dev-tools:theme";

export function getStoredFavorites(): string[] {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveStoredFavorites(favorites: string[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.error("Failed to save favorites to localStorage", e);
  }
}

export function getStoredRecentTools(): string[] {
  try {
    const data = localStorage.getItem(RECENT_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function recordRecentTool(toolId: string) {
  try {
    const existing = getStoredRecentTools();
    const updated = [toolId, ...existing.filter((id) => id !== toolId)].slice(
      0,
      10,
    );
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save recent tools to localStorage", e);
  }
}

export function getStoredTheme(): "light" | "dark" | "system" {
  try {
    return (
      (localStorage.getItem(THEME_KEY) as "light" | "dark" | "system") ||
      "system"
    );
  } catch {
    return "system";
  }
}

export function saveStoredTheme(theme: "light" | "dark" | "system") {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error("Failed to save theme to localStorage", e);
  }
}
