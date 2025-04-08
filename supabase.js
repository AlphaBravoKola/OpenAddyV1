// Supabase configuration
// Replace these values with your actual Supabase project credentials
// You can find these in your Supabase project settings -> API
const SUPABASE_URL = 'https://cnbbjqapgkvopswduhgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuYmJqcWFwZ2t2b3Bzd2R1aGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMjcxNTgsImV4cCI6MjA1OTcwMzE1OH0.Wm8zunhwE3MQQ81B6_WhXYDnV-kJRjEkp5_6ocYR2wI';

// Initialize Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Authentication functions
async function signUp(email, password, firstName, lastName, accountType) {
  try {
    const { data, error } = await supabase.auth.signUp({
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
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    return null;
  }
}

// Property management functions
async function addProperty(propertyData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
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

// Export functions and client
window.supabase = supabase;
window.supabaseFunctions = {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  addProperty,
  getUserProperties,
  updateProperty,
  deleteProperty
}; 