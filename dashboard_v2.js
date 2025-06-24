import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- Session Check: Redirect to login if not logged in ---
    (async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = 'login.html';
        }
    })();

    // --- Sidebar Mobile Toggle Logic ---
    const sidebar = document.getElementById('sidebar2');
    const menuToggle = document.getElementById('menuToggle2');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    function openSidebarMobile() {
        if (sidebar) sidebar.classList.remove('collapsed');
        if (sidebarOverlay) sidebarOverlay.style.display = 'block';
    }
    function closeSidebarMobile() {
        if (sidebar) sidebar.classList.add('collapsed');
        if (sidebarOverlay) sidebarOverlay.style.display = 'none';
    }
    if (menuToggle) menuToggle.addEventListener('click', openSidebarMobile);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebarMobile);
    // Close sidebar when clicking a link (on mobile)
    if (sidebar) {
        sidebar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeSidebarMobile);
        });
    }
    // Hide overlay by default
    closeSidebarMobile();

    function setSidebarState() {
        if (window.innerWidth < 900) {
            sidebar.classList.add('collapsed');
            sidebarOverlay.style.display = 'none';
        } else {
            sidebar.classList.remove('collapsed');
            sidebarOverlay.style.display = 'none';
        }
    }
    setSidebarState();
    window.addEventListener('resize', setSidebarState);

    // --- DOM Elements ---
    const userNameEl = document.getElementById('user-name');
    const userAvatarEl = document.getElementById('user-avatar');
    const logoutBtn = document.getElementById('logoutBtn');
    console.log('logoutBtn:', logoutBtn);
    const statsGrid = document.getElementById('stats-grid');
    const bloodGroupChartCanvas = document.getElementById('bloodGroupChart');
    const activityChartCanvas = document.getElementById('activityChart');
    const bloodAvailChartCanvas = document.getElementById('bloodAvailBar2');
    const mapContainer = document.getElementById('dashboardMap');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const languageSelector = document.getElementById('language-selector');

    // --- User Info Display ---
    const localUser = JSON.parse(localStorage.getItem('bloodlink_user'));
    if (localUser && userNameEl && userAvatarEl) {
        userNameEl.textContent = localUser.name || 'User';
        userAvatarEl.textContent = (localUser.name || 'U')[0].toUpperCase();
        userAvatarEl.setAttribute('aria-label', `User Avatar: ${(localUser.name || 'U')[0].toUpperCase()}`);
        userNameEl.setAttribute('aria-label', `User Name: ${localUser.name || 'User'}`);
    }

    // --- Logout Functionality ---
    function attachLogoutHandler() {
        const btn = document.getElementById('logoutBtn');
        if (btn) {
            console.log('Attaching logout handler');
            btn.onclick = null;
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    await supabase.auth.signOut();
                    localStorage.removeItem('bloodlink_user');
                    closeSidebarMobile();
                    alert('Logged out successfully!');
                    window.location.href = 'home.html';
                } catch (err) {
                    alert('Logout failed: ' + (err?.message || err));
                    console.error('Logout error:', err);
                }
            });
        } else {
            console.warn('logoutBtn not found');
        }
    }
    attachLogoutHandler();
    // Fallback: global click handler
    window.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'logoutBtn') {
            console.log('Global handler: logoutBtn clicked');
            e.preventDefault();
            attachLogoutHandler();
            document.getElementById('logoutBtn').click();
        }
    });
    // MutationObserver to re-attach handler if sidebar changes
    try {
        if (sidebar) {
            const observer = new MutationObserver(() => {
                attachLogoutHandler();
            });
            observer.observe(sidebar, { childList: true, subtree: true });
        }
    } catch (err) { console.error('MutationObserver error:', err); }

    // --- UI Preferences (Dark Mode & Language) ---
    const translations = {
        en: { dashboard_title: "Admin Dashboard" /* Add more translations */ },
        hi: { dashboard_title: "एडमिन डैशबोर्ड" /* Add more translations */ }
    };

    const applyTheme = () => {
        if (localStorage.getItem('dark-mode') === 'true') {
            document.documentElement.classList.add('dark-mode');
            if(darkModeToggle) darkModeToggle.checked = true;
        } else {
            document.documentElement.classList.remove('dark-mode');
            if(darkModeToggle) darkModeToggle.checked = false;
        }
    };

    const applyLanguage = () => {
        const lang = localStorage.getItem('language') || 'en';
        if (languageSelector) languageSelector.value = lang;
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            el.textContent = translations[lang]?.[key] || el.textContent;
        });
    };

    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            localStorage.setItem('dark-mode', darkModeToggle.checked);
            applyTheme();
        });
    }

    if (languageSelector) {
        languageSelector.addEventListener('change', () => {
            localStorage.setItem('language', languageSelector.value);
            applyLanguage();
        });
    }
    
    // Initial application of theme and language
    applyTheme();
    applyLanguage();

    // --- Dashboard Overview Rendering Logic ---
    async function renderOverview() {
        // Render Stats
        if (statsGrid) {
            statsGrid.innerHTML = '<div class="stat-card2" id="statsLoading">Loading stats...</div>';
            try {
                const { count: donorCount } = await supabase.from('donors').select('*', { count: 'exact', head: true });
                const { count: requestCount } = await supabase.from('requests').select('*', { count: 'exact', head: true });
                const { data: inventoryData } = await supabase.from('blood_inventory').select('units');
                const totalUnits = inventoryData ? inventoryData.reduce((sum, item) => sum + item.units, 0) : 0;
                statsGrid.innerHTML = `
                    <div class="stat-card2"><div class="stat-label2">Total Donors</div><div class="stat-value2">${donorCount ?? 0}</div></div>
                    <div class="stat-card2"><div class="stat-label2">Blood Requests</div><div class="stat-value2">${requestCount ?? 0}</div></div>
                    <div class="stat-card2"><div class="stat-label2">Total Units (ml)</div><div class="stat-value2">${totalUnits ?? 0}</div></div>
                    <div class="stat-card2"><div class="stat-label2">Campaigns</div><div class="stat-value2">5</div></div>
                `;
            } catch (err) {
                statsGrid.innerHTML = '<div class="stat-card2" style="color:red;">Failed to load stats.</div>';
            }
        }
        // Render Blood Group Chart
        if (bloodGroupChartCanvas) {
            document.getElementById('bloodGroupChartLoading').style.display = '';
            bloodGroupChartCanvas.style.display = 'none';
            try {
                const { data: bloodGroups } = await supabase.from('blood_inventory').select('blood_group, units');
                if (bloodGroups && bloodGroups.length > 0) {
                    const labels = bloodGroups.map(d => d.blood_group);
                    const data = bloodGroups.map(d => d.units);
                    new Chart(bloodGroupChartCanvas, {
                        type: 'doughnut',
                        data: { labels, datasets: [{ label: 'Units', data, backgroundColor: ['#E53935', '#1E88E5', '#43A047', '#FDD835', '#8E24AA', '#D81B60', '#00ACC1', '#FB8C00'] }] },
                        options: { responsive: true, maintainAspectRatio: false }
                    });
                    document.getElementById('bloodGroupChartLoading').style.display = 'none';
                    bloodGroupChartCanvas.style.display = '';
                } else {
                    document.getElementById('bloodGroupChartLoading').textContent = 'No data available.';
                }
            } catch (err) {
                document.getElementById('bloodGroupChartLoading').textContent = 'Failed to load chart.';
            }
        }
        // Render Activity Chart (Requests vs Donations) - Placeholder
        if (activityChartCanvas) {
            document.getElementById('activityChartLoading').style.display = '';
            activityChartCanvas.style.display = 'none';
            try {
                // Placeholder: Replace with real data if available
                new Chart(activityChartCanvas, {
                    type: 'line',
                    data: { labels: ['Jan', 'Feb', 'Mar', 'Apr'], datasets: [{ label: 'Requests', data: [10, 20, 15, 30], borderColor: '#E53935', fill: false }, { label: 'Donations', data: [8, 18, 12, 28], borderColor: '#43A047', fill: false }] },
                    options: { responsive: true, maintainAspectRatio: false }
                });
                document.getElementById('activityChartLoading').style.display = 'none';
                activityChartCanvas.style.display = '';
            } catch (err) {
                document.getElementById('activityChartLoading').textContent = 'Failed to load chart.';
            }
        }
        // Render Blood Availability Bar Chart
        if (bloodAvailChartCanvas) {
            document.getElementById('bloodAvailChartLoading').style.display = '';
            bloodAvailChartCanvas.style.display = 'none';
            try {
                const { data: bloodGroups } = await supabase.from('blood_inventory').select('blood_group, units');
                if (bloodGroups && bloodGroups.length > 0) {
                    const labels = bloodGroups.map(d => d.blood_group);
                    const data = bloodGroups.map(d => d.units);
                    new Chart(bloodAvailChartCanvas, {
                        type: 'bar',
                        data: { labels, datasets: [{ label: 'Units', data, backgroundColor: '#E53935' }] },
                        options: { responsive: true, maintainAspectRatio: false }
                    });
                    document.getElementById('bloodAvailChartLoading').style.display = 'none';
                    bloodAvailChartCanvas.style.display = '';
                } else {
                    document.getElementById('bloodAvailChartLoading').textContent = 'No data available.';
                }
            } catch (err) {
                document.getElementById('bloodAvailChartLoading').textContent = 'Failed to load chart.';
            }
        }
        // Render Map
        if (mapContainer) {
            const map = L.map(mapContainer).setView([20.5937, 78.9629], 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            // Example marker, can be expanded to show hospitals/camps
            L.marker([20.5937, 78.9629]).addTo(map).bindPopup('Central India');
            // Future: Fetch and display real data from Supabase
        }
    }

    // Only run overview logic if on the main dashboard page
    if (document.getElementById('overview-section')) {
        renderOverview();
    }
}); 