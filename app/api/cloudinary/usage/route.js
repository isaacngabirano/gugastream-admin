import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function GET() {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Check if credentials exist
    if (cloudName && apiKey && apiSecret) {
      
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret
      });
      
      // Fetch usage details
      // Note: usage() API might require specific permissions or plan
      try {
        const result = await cloudinary.api.usage();
        
        // Map Cloudinary response to our format
        // result.storage.usage is in bytes
        return NextResponse.json({
          total_size_bytes: result.storage.usage,
          plan_limit_bytes: result.storage.limit,
          usage_percentage: result.storage.usage / result.storage.limit * 100,
          // Other fields if available
          file_count: result.resources, 
        });
      } catch (apiError) {
        console.error("Cloudinary API usage fetch error:", apiError);
        // Fallback to mock if API fails (e.g. permission denied) but creds are present
        throw new Error("API call failed: " + apiError.message);
      }
    }
    
    // Log missing credentials for debugging
    const missing = [];
    if (!cloudName) missing.push("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
    if (!apiKey) missing.push("NEXT_PUBLIC_CLOUDINARY_API_KEY");
    if (!apiSecret) missing.push("CLOUDINARY_API_SECRET");
    
    console.warn("Missing Cloudinary credentials:", missing.join(", "));
    
    throw new Error("Missing Cloudinary credentials");
  } catch (error) {
    console.warn("Using mock data for Cloudinary usage. Reason:", error.message);
    
    // Fallback Mock Data
    const mockUsage = {
      total_size_bytes: 124500000000, // ~124.5 GB
      total_duration_seconds: 45000,
      file_count: 150,
      plan_limit_bytes: 500000000000, // 500 GB
      usage_percentage: 24.9,
      is_mock: true
    };
    return NextResponse.json(mockUsage);
  }
}
