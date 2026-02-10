import { notFound } from "next/navigation"
import { getParcelDetails } from "@/app/actions/ordering/guest-order/getParcelDetails"
import { ParcelStatusPage } from "@/components/ordering/ParcelStatusPage"

export default async function ParcelPage({
  params,
}: {
  params: Promise<{ parcelId: string }>
}) {
  const { parcelId } = await params

  // Fetch parcel details from Supabase
  const parcelData = await getParcelDetails(parcelId)

  // If parcel not found, show 404
  if (!parcelData) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-yellow-400 py-12">
      <div className="container mx-auto max-w-5xl px-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-black mb-8">Parcel Tracking</h1>
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <ParcelStatusPage parcelData={parcelData} />
        </div>
      </div>
    </div>
  )
}
