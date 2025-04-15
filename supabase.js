// Supabase configuration
// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(
  'https://cnbbjqapgkvopswduhgb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuYmJqcWFwZ2t2b3Bzd2R1aGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMjcxNTgsImV4cCI6MjA1OTcwMzE1OH0.Wm8zunhwE3MQQ81B6_WhXYDnV-kJRjEkp5_6ocYR2wI'
);

// Authentication functions
async function signUp(email, password, firstName, lastName, accountType) {
  try {
    console.log('Attempting to sign up user:', { email, firstName, lastName, accountType });
    
    // Validate input
    if (!email || !password || !firstName || !lastName || !accountType) {
      throw new Error('All fields are required');
    }

    // First, sign out any existing session
    await supabaseClient.auth.signOut();

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          account_type: accountType
        }
      }
    });
    
    if (error) {
      console.error('Signup error:', error);
      throw error;
    }

    if (!data.user) {
      throw new Error('Failed to create user account');
    }

    console.log('Signup successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Signup failed:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to create account. Please try again.' 
    };
  }
}

async function signIn(email, password) {
  try {
    console.log('Attempting to sign in user:', email);
    
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // First, sign out any existing session
    await supabaseClient.auth.signOut();

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Signin error:', error);
      throw error;
    }

    if (!data.user) {
      throw new Error('Invalid email or password');
    }

    console.log('Signin successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Signin failed:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to sign in. Please check your credentials.' 
    };
  }
}

async function signOut() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function getCurrentUser() {
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    
    if (!session) {
      return null;
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError) throw userError;
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Property management functions
async function addProperty(propertyData) {
  try {
    console.log('Adding new property:', propertyData);
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      throw new Error('User not authenticated');
    }

    // Validate required fields
    if (!propertyData.name || !propertyData.address || !propertyData.units || !propertyData.type) {
      console.error('Missing required property fields:', propertyData);
      throw new Error('All property fields are required');
    }

    const { data, error } = await supabaseClient
      .from('properties')
      .insert([
        {
          ...propertyData,
          landlord_id: user.id,
          has_instructions: false
        }
      ])
      .select();

    if (error) {
      console.error('Error adding property:', error);
      throw error;
    }

    console.log('Property added successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error in addProperty:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to add property',
      error: error 
    };
  }
}

async function getUserProperties() {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabaseClient
      .from('properties')
      .select('*')
      .eq('landlord_id', user.id);

    if (error) {
      console.error('Error fetching properties:', error);
      return { data: [], error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getUserProperties:', error);
    return { data: [], error };
  }
}

async function updateProperty(propertyId, propertyData) {
  try {
    console.log('Updating property:', propertyId, propertyData);
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      throw new Error('User not authenticated');
    }

    // Validate required fields
    if (!propertyData.name || !propertyData.address || !propertyData.units || !propertyData.type) {
      console.error('Missing required property fields:', propertyData);
      throw new Error('All property fields are required');
    }

    const { data, error } = await supabaseClient
      .from('properties')
      .update(propertyData)
      .eq('id', propertyId)
      .eq('landlord_id', user.id)
      .select();

    if (error) {
      console.error('Error updating property:', error);
      throw error;
    }

    console.log('Property updated successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error in updateProperty:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to update property',
      error: error 
    };
  }
}

async function deleteProperty(propertyId) {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabaseClient
      .from('properties')
      .delete()
      .eq('id', propertyId)
      .eq('landlord_id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Property Instructions functions
async function savePropertyInstructions(propertyId, instructions) {
  try {
    console.log('Saving property instructions:', { propertyId, instructions });
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      throw new Error('User not authenticated');
    }

    // First, verify the property belongs to the user
    const { data: property, error: propertyError } = await supabaseClient
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .eq('landlord_id', user.id)
      .single();

    if (propertyError) {
      console.error('Error verifying property ownership:', propertyError);
      throw new Error('Failed to verify property ownership');
    }

    if (!property) {
      console.error('Property not found or unauthorized');
      throw new Error('Property not found or unauthorized');
    }

    // Check if instructions already exist
    const { data: existingInstructions, error: checkError } = await supabaseClient
      .from('property_instructions')
      .select('id')
      .eq('property_id', propertyId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing instructions:', checkError);
      throw checkError;
    }

    // Convert camelCase to snake_case for database
    const instructionsData = {
      property_id: propertyId,
      package_location: instructions.packageLocation,
      special_instructions: instructions.specialInstructions,
      access_code: instructions.accessCode,
      access_notes: instructions.accessNotes,
      authorized_services: instructions.authorizedServices,
      updated_at: new Date().toISOString()
    };

    let result;
    if (existingInstructions) {
      console.log('Updating existing instructions:', instructionsData);
      // Update existing instructions
      result = await supabaseClient
        .from('property_instructions')
        .update(instructionsData)
        .eq('property_id', propertyId)
        .select();
    } else {
      console.log('Creating new instructions:', instructionsData);
      // Insert new instructions
      result = await supabaseClient
        .from('property_instructions')
        .insert({
          ...instructionsData,
          created_at: new Date().toISOString()
        })
        .select();
    }

    if (result.error) {
      console.error('Error saving instructions:', result.error);
      throw result.error;
    }

    console.log('Instructions saved successfully:', result.data);

    // Update the property's has_instructions flag
    const { error: updateError } = await supabaseClient
      .from('properties')
      .update({ has_instructions: true })
      .eq('id', propertyId);

    if (updateError) {
      console.error('Error updating has_instructions flag:', updateError);
      // Don't throw here as the instructions were saved successfully
    }

    // Convert snake_case back to camelCase for frontend
    const responseData = {
      packageLocation: result.data[0].package_location,
      specialInstructions: result.data[0].special_instructions,
      accessCode: result.data[0].access_code,
      accessNotes: result.data[0].access_notes,
      authorizedServices: result.data[0].authorized_services
    };

    return { success: true, data: responseData };
  } catch (error) {
    console.error('Error in savePropertyInstructions:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to save property instructions',
      error: error 
    };
  }
}

async function getPropertyInstructions(propertyId) {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      throw new Error('User not authenticated');
    }

    // First, verify the property belongs to the user
    const { data: property, error: propertyError } = await supabaseClient
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .eq('landlord_id', user.id)
      .single();

    if (propertyError) {
      console.error('Error verifying property ownership:', propertyError);
      throw new Error('Failed to verify property ownership');
    }

    if (!property) {
      console.error('Property not found or unauthorized');
      throw new Error('Property not found or unauthorized');
    }

    const { data, error } = await supabaseClient
      .from('property_instructions')
      .select('*')
      .eq('property_id', propertyId)
      .single();

    // If no instructions exist, return empty instructions with default authorized services
    if (error && error.code === 'PGRST116') {
      return { 
        success: true, 
        data: { 
          packageLocation: '',
          specialInstructions: '',
          accessCode: '',
          accessNotes: '',
          authorizedServices: {
            amazon: false,
            fedex: false,
            ups: false,
            usps: false,
            dhl: false
          }
        }
      };
    }

    if (error) {
      console.error('Error fetching instructions:', error);
      throw error;
    }

    // Convert snake_case to camelCase for frontend
    const responseData = {
      packageLocation: data.package_location,
      specialInstructions: data.special_instructions,
      accessCode: data.access_code,
      accessNotes: data.access_notes,
      authorizedServices: data.authorized_services
    };

    return { success: true, data: responseData };
  } catch (error) {
    console.error('Error in getPropertyInstructions:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to get property instructions',
      error: error 
    };
  }
}

// Property Updates functions
async function addPropertyUpdate(propertyId, title, content, type, dangerLevel) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'User not authenticated' };
    }

    // Verify property ownership
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .eq('landlord_id', user.id)
      .single();

    if (propertyError || !property) {
      return { success: false, message: 'Property not found or unauthorized' };
    }

    // Add the update
    const { data, error } = await supabase
      .from('property_updates')
      .insert([
        {
          property_id: propertyId,
          title,
          content,
          type,
          danger_level: dangerLevel,
          active: true
        }
      ])
      .select();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error adding property update:', error);
    return { success: false, message: error.message };
  }
}

async function getPropertyUpdates(propertyId) {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabaseClient
      .from('property_updates')
      .select('*')
      .eq('property_id', propertyId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching property updates:', error);
    return { success: false, message: error.message };
  }
}

async function updatePropertyUpdate(updateId, title, content, type, isActive) {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabaseClient
      .from('property_updates')
      .update({
        title: title,
        content: content,
        type: type,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', updateId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating property update:', error);
    return { success: false, message: error.message };
  }
}

async function deletePropertyUpdate(updateId) {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabaseClient
      .from('property_updates')
      .delete()
      .eq('id', updateId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting property update:', error);
    return { success: false, message: error.message };
  }
}

// Export functions and client
window.supabase = supabaseClient;
window.supabaseFunctions = {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  addProperty,
  getUserProperties,
  updateProperty,
  deleteProperty,
  savePropertyInstructions,
  getPropertyInstructions,
  addPropertyUpdate,
  getPropertyUpdates,
  updatePropertyUpdate,
  deletePropertyUpdate
}; 