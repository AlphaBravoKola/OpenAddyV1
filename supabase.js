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
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) throw error;
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

// Database functions for instructions
async function savePropertyInstructions(propertyId, instructions) {
  try {
    const { data, error } = await supabaseClient
      .from('property_instructions')
      .upsert({
        property_id: propertyId,
        instructions: instructions,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving property instructions:', error);
    return { success: false, message: error.message };
  }
}

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
  saveSpecialInstruction,
  getSpecialInstructions,
  deleteSpecialInstruction
}; 