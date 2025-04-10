// Function to update user information in the header
async function updateUserHeader() {
    try {
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        
        if (userError) {
            console.error('Error fetching user:', userError);
            // Optionally redirect or handle the error state
            // window.location.href = 'login.html'; 
            return;
        }

        if (!user) {
            console.log('No user session found. Redirecting to login.');
            window.location.href = 'login.html';
            return;
        }

        console.log('Fetched user object:', user); // Log the user object
        console.log('User metadata:', user.user_metadata); // Log the metadata

        // Get user initials and name safely
        const firstName = user.user_metadata?.first_name || '';
        const lastName = user.user_metadata?.last_name || '';
        
        console.log(`First Name: "${firstName}", Last Name: "${lastName}"`); // Log extracted names
        
        // Construct display name, ensuring it's not just an empty string if names are missing
        let displayName = `${firstName} ${lastName}`.trim();
        if (!displayName) {
            displayName = user.email || 'User'; // Fallback to email or generic 'User'
            console.log('User name missing, falling back to:', displayName);
        }
        
        // Set initials (provide fallback if names are missing)
        let initials = 'U'; // Default initials
        if (firstName && lastName) {
            initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
        } else if (displayName && displayName !== 'User') {
             // Use first two letters of display name if available and not the generic fallback
            initials = displayName.slice(0, 2).toUpperCase();
        } else if (firstName) {
            initials = firstName.slice(0, 2).toUpperCase(); // Fallback to first name if only that exists
        } else if (lastName) {
             initials = lastName.slice(0, 2).toUpperCase(); // Fallback to last name if only that exists
        }
        console.log('Calculated Initials:', initials);
        console.log('Calculated Display Name:', displayName);


        // Update all user info elements on the page
        document.querySelectorAll('#userInitials').forEach(el => {
            el.textContent = initials;
        });
        document.querySelectorAll('#userName').forEach(el => {
            el.textContent = displayName;
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