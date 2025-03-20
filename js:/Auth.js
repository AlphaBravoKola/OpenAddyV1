// Add to your existing auth.js file

// Function to add a new property
function addProperty(propertyData) {
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'User not logged in' };
    
    // Get existing properties
    let properties = JSON.parse(localStorage.getItem('properties') || '[]');
    
    // Create new property object
    const newProperty = {
      id: Date.now(),
      name: propertyData.name,
      address: propertyData.address,
      units: parseInt(propertyData.units),
      type: propertyData.type,
      owner: currentUser.email,
      hasInstructions: false,
      createdAt: new Date().toISOString()
    };
    
    // Add to array
    properties.push(newProperty);
    
    // Save back to localStorage
    localStorage.setItem('properties', JSON.stringify(properties));
    
    return { success: true, propertyId: newProperty.id };
  }
  
  // Function to update property
  function updateProperty(propertyId, propertyData) {
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'User not logged in' };
    
    // Get existing properties
    let properties = JSON.parse(localStorage.getItem('properties') || '[]');
    
    // Find property
    const propertyIndex = properties.findIndex(p => 
      p.id.toString() === propertyId.toString() && p.owner === currentUser.email
    );
    
    if (propertyIndex === -1) {
      return { success: false, message: 'Property not found or not authorized' };
    }
    
    // Update basic property details
    if (propertyData.name) properties[propertyIndex].name = propertyData.name;
    if (propertyData.address) properties[propertyIndex].address = propertyData.address;
    if (propertyData.units) properties[propertyIndex].units = parseInt(propertyData.units);
    if (propertyData.type) properties[propertyIndex].type = propertyData.type;
    
    // Update instructions if provided
    if (propertyData.instructions) {
      properties[propertyIndex].hasInstructions = true;
      properties[propertyIndex].instructions = propertyData.instructions;
    }
    
    // Save back to localStorage
    localStorage.setItem('properties', JSON.stringify(properties));
    
    return { success: true };
  }
  
  // Function to get property by ID
  function getPropertyById(propertyId) {
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    return properties.find(p => p.id.toString() === propertyId.toString());
  }