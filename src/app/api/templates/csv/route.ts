import { type NextRequest, NextResponse } from "next/server"

/**
 * API route to serve the CSV template file
 * This can be rate-limited using Vercel WAF
 */
export async function GET(request: NextRequest) {
  try {
    // Get the template URL from environment variable
    const templateUrl = process.env.NEXT_PUBLIC_CSV_TEMPLATE_URL

    // Log the template URL for debugging
    console.log("Template URL:", templateUrl)

    // Check if we're in development mode
    const isDev = process.env.NODE_ENV === "development"

    let csvContent: string

    if (isDev && templateUrl?.startsWith("http://127.0.0.1")) {
      // In development with local Supabase, use a static template
      // This is a fallback for when the localhost URL isn't accessible
      csvContent = getStaticCsvTemplate()
      console.log("Using static CSV template in development")
    } else {
      // In production or when URL is accessible, fetch from the URL
      if (!templateUrl) {
        console.error("CSV template URL is not configured")
        return NextResponse.json({ error: "CSV template not available" }, { status: 500 })
      }

      try {
        // Fetch the CSV template from storage with detailed error logging
        console.log("Fetching CSV template from:", templateUrl)
        const response = await fetch(templateUrl, {
          // Add cache: 'no-store' to avoid caching issues during development
          cache: isDev ? "no-store" : "default",
        })

        console.log("Fetch response status:", response.status, response.statusText)

        if (!response.ok) {
          throw new Error(`Error fetching CSV template: ${response.status} ${response.statusText}`)
        }

        // Get the CSV content
        csvContent = await response.text()
        console.log("CSV content length:", csvContent.length)
      } catch (fetchError) {
        console.error("Error fetching template:", fetchError)

        // Fall back to static template if fetch fails
        console.log("Falling back to static CSV template")
        csvContent = getStaticCsvTemplate()
      }
    }

    // Return the CSV with appropriate headers
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=parcel_and_recipient_template.csv",
        // Add cache control headers to reduce load
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error("Error serving CSV template:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * Provides a static CSV template as fallback
 */
function getStaticCsvTemplate(): string {
  // Return a basic CSV template with header and example rows
  return `weight,length,width,height,name,contactNumber,email,street,unitNo,postalCode
5,30,20,15,John Doe,12345678,john@example.com,123 Main St,#01-01,123456
10,40,30,20,Jane Smith,87654321,jane@example.com,456 Elm St,#02-02,654321`
}
