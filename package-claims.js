// Package Claims functionality
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in
    const user = await window.supabaseFunctions.getCurrentUser();
    if (!user) {
        // Although user-data.js also checks, keep a check here 
        // for page-specific logic if needed, but don't redirect immediately
        console.warn("User not found in package-claims.js, page might redirect soon.");
        return; // Stop claims-specific logic if no user
    }
    
    // Load properties for dropdowns
    await loadProperties();
    
    // Load claims
    await loadClaims();
});

async function loadProperties() {
    console.log("Attempting to load properties...");
    try {
        const { data: propertiesData, error: fetchError } = await window.supabaseFunctions.getUserProperties();
        console.log("getUserProperties returned:", { propertiesData, fetchError });

        if (fetchError) {
            console.error("Error received directly from getUserProperties:", fetchError);
            // Throw a slightly more descriptive error for the catch block
            throw new Error(`Failed to fetch properties: ${fetchError.message || 'Unknown database error'}`);
        }

        // Explicitly check if propertiesData is an array before proceeding
        const properties = Array.isArray(propertiesData) ? propertiesData : [];
        console.log(`Processing ${properties.length} properties.`);

        const propertySelects = document.querySelectorAll('select[id="filterProperty"], select[id="claimProperty"]');
        console.log(`Found ${propertySelects.length} select elements to populate.`);

        if (propertySelects.length === 0) {
            console.warn("Did not find #filterProperty or #claimProperty select elements! Cannot populate dropdowns.");
            // This isn't necessarily an error stopping execution, but dropdowns won't be filled.
        }

        propertySelects.forEach((select, index) => {
             // Add a check to ensure 'select' is a valid select element
            if (!select || typeof select.options === 'undefined') {
                console.warn(`Element at index ${index} found by querySelectorAll is not a valid <select> element.`);
                return; // Skip to the next element
            }
            
            console.log(`Processing select element #${index + 1} (ID: ${select.id})`);
            while (select.options.length > 1) {
                select.remove(1);
            }
            console.log(`Cleared existing options for #${select.id}`);

            // Loop through properties (safe even if properties is empty array)
            properties.forEach((property, propIndex) => {
                 if (!property || typeof property.id === 'undefined' || typeof property.name === 'undefined') {
                    console.warn(`Skipping invalid property object at index ${propIndex}:`, property);
                    return;
                }
                // console.log(`Adding property ${propIndex + 1}: ${property.name} (ID: ${property.id}) to #${select.id}`); // Keep console less noisy
                const option = document.createElement('option');
                option.value = property.id;
                option.textContent = property.name;
                select.appendChild(option);
            });
            console.log(`Finished adding properties to #${select.id}`);
        });
        console.log("Finished populating property dropdowns successfully.");

    } catch (error) {
        // Log the specific error caught more clearly
        console.error('Error caught during loadProperties execution:', error);
        // Try to show a more informative alert
        let alertMessage = 'Failed to load properties.';
        if (error instanceof Error && error.message) {
            alertMessage += ` Reason: ${error.message}`;
        }
        showError(alertMessage); // Use the existing showError function to display the alert
    }
}

async function loadClaims() {
    try {
        const propertyFilter = document.getElementById('filterProperty').value;
        const statusFilter = document.getElementById('filterStatus').value;
        const serviceFilter = document.getElementById('filterDeliveryService').value;

        let query = supabaseClient
            .from('package_claims')
            .select(`
                *,
                properties (
                    name
                )
            `);

        if (propertyFilter) {
            query = query.eq('property_id', propertyFilter);
        }
        if (statusFilter) {
            query = query.eq('status', statusFilter);
        }
        if (serviceFilter) {
            query = query.eq('delivery_service', serviceFilter);
        }

        const { data: claims, error } = await query;
        if (error) throw error;

        const claimsList = document.getElementById('claimsList');
        claimsList.innerHTML = '';

        if (claims.length === 0) {
            claimsList.innerHTML = `
                <div class="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                    <p class="text-gray-600">No package claims found.</p>
                </div>
            `;
            return;
        }

        claims.forEach(claim => {
            const claimElement = document.createElement('div');
            claimElement.className = 'bg-white p-4 rounded-lg shadow-sm border border-gray-200';
            claimElement.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-medium text-gray-900">${claim.recipient_name}</h3>
                        <p class="text-sm text-gray-500">${claim.properties.name}</p>
                    </div>
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${
                        claim.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                        claim.status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                    }">
                        ${claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                    </span>
                </div>
                <div class="mt-2">
                    <p class="text-sm text-gray-600">
                        <span class="font-medium">Delivery Service:</span> ${claim.delivery_service}
                    </p>
                    ${claim.tracking_number ? `
                        <p class="text-sm text-gray-600">
                            <span class="font-medium">Tracking Number:</span> ${claim.tracking_number}
                        </p>
                    ` : ''}
                    <p class="text-sm text-gray-600">
                        <span class="font-medium">Claim Date:</span> ${new Date(claim.claim_date).toLocaleDateString()}
                    </p>
                </div>
                ${claim.description ? `
                    <div class="mt-2">
                        <p class="text-sm text-gray-600">
                            <span class="font-medium">Description:</span> ${claim.description}
                        </p>
                    </div>
                ` : ''}
            `;
            claimsList.appendChild(claimElement);
        });
    } catch (error) {
        console.error('Error loading claims:', error);
        showError('Failed to load package claims');
    }
}

function showAddClaimModal() {
    document.getElementById('addClaimModal').classList.remove('hidden');
}

function closeAddClaimModal() {
    document.getElementById('addClaimModal').classList.add('hidden');
}

async function handleAddClaim(event) {
    event.preventDefault();
    
    const propertyId = document.getElementById('claimProperty').value;
    const recipientName = document.getElementById('recipientName').value;
    const deliveryService = document.getElementById('deliveryService').value;
    const trackingNumber = document.getElementById('trackingNumber').value;
    const description = document.getElementById('claimDescription').value;

    try {
        const { data, error } = await supabaseClient
            .from('package_claims')
            .insert([{
                property_id: propertyId,
                recipient_name: recipientName,
                delivery_service: deliveryService,
                tracking_number: trackingNumber,
                description: description,
                status: 'open'
            }]);

        if (error) throw error;

        closeAddClaimModal();
        await loadClaims();
        showSuccess('Package claim added successfully');
    } catch (error) {
        console.error('Error adding claim:', error);
        showError('Failed to add package claim');
    }
}

function filterClaims() {
    loadClaims();
}

function showError(message) {
    // Implement error notification
    alert(message);
}

function showSuccess(message) {
    // Implement success notification
    alert(message);
}

// Add event listeners
document.getElementById('addClaimForm')?.addEventListener('submit', handleAddClaim);
document.getElementById('filterProperty')?.addEventListener('change', filterClaims);
document.getElementById('filterStatus')?.addEventListener('change', filterClaims);
document.getElementById('filterDeliveryService')?.addEventListener('change', filterClaims); 