import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// =========================================================================
// CORRECTED VERSION - Load the .env file from the project root
// =========================================================================
const result = dotenv.config({ path: 'C:/Users/Evinj/tinder_clone/.env' });
// Note: Using forward slashes works on all systems (Windows, Mac, Linux) and is safer.
// =========================================================================

// Check if dotenv found the file
if (result.error) {
  console.error("DOTENV ERROR: Could not find or read the .env file. Please ensure it exists at:", 'C:/Users/Evinj/tinder_clone/.env');
  throw result.error;
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Check if the variables are loaded
if (!supabaseUrl || !supabaseKey) {
  console.error("ERROR: .env file was found, but SUPABASE_URL or SUPABASE_SERVICE_KEY is missing from it.");
  throw new Error("Supabase environment variables are missing from the .env file.");
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});