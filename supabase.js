// Supabase configuration
// Replace these values with your actual Supabase project credentials
// You can find these in your Supabase project settings -> API
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // e.g., 'https://abcdefghijklmnopqrst.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // e.g., 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

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
    const user = await getCurrentUser();
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
    const user = await getCurrentUser();
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
    const user = await getCurrentUser();
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
    const user = await getCurrentUser();
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

// Export functions
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