// auth.js - Authentication utilities for OpenAddy

// Initialize localStorage on first load
function initializeStorage() {
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('properties')) {
      localStorage.setItem('properties', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('packageClaims')) {
      localStorage.setItem('packageClaims', JSON.stringify([]));
    }
  }
  
  // Call initialization on script load
  initializeStorage();
  
  // Register a new user
  function registerUser(userData) {
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if email already exists
    if (users.some(user => user.email === userData.email)) {
      return { success: false, message: 'Email already registered' };
    }
    
    // Add user to array
    users.push(userData);
    
    // Save back to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Create session (exclude password)
    const session = {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      accountType: userData.accountType,
      isLoggedIn: true
    };
    
    // Save current user session
    localStorage.setItem('currentUser', JSON.stringify(session));
    
    return { success: true };
  }
  
  // Authenticate a user
  function authenticateUser(email, password) {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Find user with matching email and password
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Create a session object (exclude password for security)
      const session = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accountType: user.accountType,
        isLoggedIn: true
      };
      
      // Save current user session
      localStorage.setItem('currentUser', JSON.stringify(session));
      return true;
    }
    
    return false;
  }
  
  // Check if user is logged in
  function isLoggedIn() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser && currentUser.isLoggedIn;
  }
  
  // Get current user data
  function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
  }
  
  // Logout user
  function logoutUser() {
    localStorage.removeItem('currentUser');
  }
  
  // Get properties for current user
  function getUserProperties() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const properties = JSON.parse(localStorage.getItem('properties')) || [];
    return properties.filter(property => property.owner === currentUser.email);
  }
  
  // Add a new property
  function addProperty(propertyData) {
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'User not logged in' };
    
    // Get existing properties
    let properties = JSON.parse(localStorage.getItem('properties')) || [];
    
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
  
  // Update property
  function updateProperty(propertyId, propertyData) {
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'User not logged in' };
    
    // Get existing properties
    let properties = JSON.parse(localStorage.getItem('properties')) || [];
    
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
  
  // Get property by ID
  function getPropertyById(propertyId) {
    const properties = JSON.parse(localStorage.getItem('properties')) || [];
    return properties.find(p => p.id.toString() === propertyId.toString());
  }
  
  // Add a new package claim
  function addPackageClaim(claimData) {
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'User not logged in' };
    
    // Get existing claims
    let claims = JSON.parse(localStorage.getItem('packageClaims')) || [];
    
    // Create new claim
    const newClaim = {
      id: Date.now(),
      ...claimData,
      owner: currentUser.email,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to array
    claims.push(newClaim);
    
    // Save back to localStorage
    localStorage.setItem('packageClaims', JSON.stringify(claims));
    
    return { success: true, claimId: newClaim.id };
  }
  
  // Get package claims for current user
  function getUserClaims() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const claims = JSON.parse(localStorage.getItem('packageClaims')) || [];
    return claims.filter(claim => claim.owner === currentUser.email);
  }
  
  // Update package claim status
  function updateClaimStatus(claimId, newStatus) {
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'User not logged in' };
    
    // Get existing claims
    let claims = JSON.parse(localStorage.getItem('packageClaims')) || [];
    
    // Find claim
    const claimIndex = claims.findIndex(c => 
      c.id.toString() === claimId.toString() && c.owner === currentUser.email
    );
    
    if (claimIndex === -1) {
      return { success: false, message: 'Claim not found or not authorized' };
    }
    
    // Update status
    claims[claimIndex].status = newStatus;
    claims[claimIndex].updatedAt = new Date().toISOString();
    
    // Save back to localStorage
    localStorage.setItem('packageClaims', JSON.stringify(claims));
    
    return { success: true };
  }