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
        },
        emailRedirectTo: window.location.origin + '/login.html'
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

    if (error) throw error;
    return data || [];
  } catch (error) {
    return [];
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

    let result;
    if (existingInstructions) {
      console.log('Updating existing instructions');
      // Update existing instructions
      result = await supabaseClient
        .from('property_instructions')
        .update({
          packageLocation: instructions.packageLocation,
          specialInstructions: instructions.specialInstructions,
          accessCode: instructions.accessCode,
          accessNotes: instructions.accessNotes,
          authorizedServices: instructions.authorizedServices,
          updated_at: new Date().toISOString()
        })
        .eq('property_id', propertyId)
        .select();
    } else {
      console.log('Creating new instructions');
      // Insert new instructions
      result = await supabaseClient
        .from('property_instructions')
        .insert({
          property_id: propertyId,
          packageLocation: instructions.packageLocation,
          specialInstructions: instructions.specialInstructions,
          accessCode: instructions.accessCode,
          accessNotes: instructions.accessNotes,
          authorizedServices: instructions.authorizedServices,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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

    return { success: true, data: instructions };
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
    if (!user) throw new Error('User not authenticated');

    // First, verify the property belongs to the user
    const { data: property, error: propertyError } = await supabaseClient
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .eq('landlord_id', user.id)
      .single();

    if (propertyError || !property) {
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

    if (error) throw error;
    
    // If data exists but is in the old format (nested under instructions), extract it
    if (data.instructions && typeof data.instructions === 'object') {
      return { success: true, data: data.instructions };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error getting property instructions:', error);
    return { success: false, message: error.message };
  }
}

// Database functions for instructions
async function saveSpecialInstruction(userId, title, content) {
  try {
    const { data, error } = await supabaseClient
      .from('special_instructions')
      .insert({
        user_id: userId,
        title: title,
        content: content,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving special instruction:', error);
    return { success: false, message: error.message };
  }
}

async function getSpecialInstructions(userId) {
  try {
    const { data, error } = await supabaseClient
      .from('special_instructions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching special instructions:', error);
    return { success: false, message: error.message };
  }
}

async function deleteSpecialInstruction(instructionId) {
  try {
    const { data, error } = await supabaseClient
      .from('special_instructions')
      .delete()
      .eq('id', instructionId);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error deleting special instruction:', error);
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
  saveSpecialInstruction,
  getSpecialInstructions,
  deleteSpecialInstruction
}; 