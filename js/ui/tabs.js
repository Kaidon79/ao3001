// Verwaltet die Tab-Navigation und Sidebar
export function initTabs() {
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');

  window.showTab = function(tabId) {
    // Alle deaktivieren
    navItems.forEach(item => item.classList.remove('active'));
    tabPanes.forEach(pane => pane.classList.remove('active'));

    // Aktiven Tab aktivieren
    const activeNav = document.getElementById(`nav-${tabId}`);
    const activePane = document.getElementById(`tab-${tabId}`);
    if (activeNav) activeNav.classList.add('active');
    if (activePane) activePane.classList.add('active');

    // Mobile Sidebar schließen
    document.getElementById('sidebar').classList.remove('open');

    // Event für Modul auslösen (falls gewünscht)
    // Z.B. eventBus.emit('tab.changed', tabId);
  };

  window.toggleSidebar = function() {
    document.getElementById('sidebar').classList.toggle('open');
  };

  // Standard-Tab setzen (Dashboard)
  showTab('dashboard');
}