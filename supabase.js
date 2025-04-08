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
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabaseClient
      .from('properties')
      .insert([
        {
          ...propertyData,
          landlord_id: user.id
        }
      ]);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
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
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabaseClient
      .from('properties')
      .update(propertyData)
      .eq('id', propertyId)
      .eq('landlord_id', user.id);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
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

    // Check if instructions already exist
    const { data: existingInstructions } = await supabaseClient
      .from('property_instructions')
      .select('id')
      .eq('property_id', propertyId)
      .single();

    let result;
    if (existingInstructions) {
      // Update existing instructions
      result = await supabaseClient
        .from('property_instructions')
        .update({
          instructions: instructions,
          updated_at: new Date().toISOString()
        })
        .eq('property_id', propertyId);
    } else {
      // Insert new instructions
      result = await supabaseClient
        .from('property_instructions')
        .insert({
          property_id: propertyId,
          instructions: instructions,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }

    if (result.error) throw result.error;
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error saving property instructions:', error);
    return { success: false, message: error.message };
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