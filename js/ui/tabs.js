export function initTabs() {
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');

  window.showTab = function(tabId) {
    navItems.forEach(item => item.classList.remove('active'));
    tabPanes.forEach(pane => pane.classList.remove('active'));

    const activeNav = document.getElementById(`nav-${tabId}`);
    const activePane = document.getElementById(`tab-${tabId}`);
    if (activeNav) activeNav.classList.add('active');
    if (activePane) activePane.classList.add('active');

    document.getElementById('sidebar').classList.remove('open');
  };

  window.toggleSidebar = function() {
    document.getElementById('sidebar').classList.toggle('open');
  };

  showTab('dashboard');
}