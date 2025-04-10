// Function to update user information in the header
async function updateUserHeader() {
    try {
        const user = await window.supabaseFunctions.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        // Get user initials and name
        const firstName = user.user_metadata?.first_name || '';
        const lastName = user.user_metadata?.last_name || '';
        const displayName = user.user_metadata?.full_name || `${firstName} ${lastName}`.trim();
        
        // Set initials (use first letter of first and last name, or first two letters of display name)
        const initials = firstName && lastName 
            ? (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
            : displayName.slice(0, 2).toUpperCase();

        // Update all user info elements on the page
        document.querySelectorAll('#userInitials').forEach(el => {
            el.textContent = initials;
        });
        document.querySelectorAll('#userName').forEach(el => {
            el.textContent = displayName || 'User';
        });

        // Update account settings form if it exists
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const companyInput = document.getElementById('company');

        if (firstNameInput) firstNameInput.value = firstName;
        if (lastNameInput) lastNameInput.value = lastName;
        if (emailInput) emailInput.value = user.email;
        if (phoneInput) phoneInput.value = user.user_metadata?.phone || '';
        if (companyInput) companyInput.value = user.user_metadata?.company || '';
    } catch (error) {
        console.error('Error updating user header:', error);
    }
}

// Initialize user data when the page loads
document.addEventListener('DOMContentLoaded', async function() {
    await updateUserHeader();
}); 