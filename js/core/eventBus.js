// Einfacher Event-Bus für lose Kopplung zwischen Modulen
class EventBus {
  constructor() {
    this.events = {};
  }

  // Event abonnieren
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return () => this.off(event, callback); // Rückgabe einer Funktion zum Entfernen
  }

  // Event einmalig abonnieren
  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  // Event abbestellen
  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  // Event auslösen
  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(...args));
  }

  // Alle Events eines Typs entfernen (optional)
  clear(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

// Singleton-Instanz
export const eventBus = new EventBus();