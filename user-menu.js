// Function to initialize user menu
function initializeUserMenu() {
    const profileButton = document.getElementById('userMenuButton');
    const profileMenu = document.getElementById('profileMenu');
    const logoutButton = document.getElementById('logoutButton');

    if (!profileButton || !profileMenu || !logoutButton) return;

    // Toggle profile menu
    profileButton.addEventListener('click', () => {
        profileMenu.classList.toggle('hidden');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!profileButton.contains(e.target) && !profileMenu.contains(e.target)) {
            profileMenu.classList.add('hidden');
        }
    });

    // Handle logout
    logoutButton.addEventListener('click', async () => {
        const { error } = await supabaseClient.auth.signOut();
        if (!error) {
            window.location.href = 'login.html';
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeUserMenu); 