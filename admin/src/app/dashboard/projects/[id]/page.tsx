"use client"

import { useParams } from "next/navigation"
import CenterFacilityPage from "@/components/center-facility-page"

export default function FacilityPage() {
  const params = useParams()
  const id = params.id as string

  // Map service_id slug to the service_name used in CenterFacilityPage
  const SERVICE_ID_TO_NAME: Record<string, string> = {
    "digital-hub": "Digital Hub",
    "design-centre": "Design Centre",
    "innospace": "INNOSPACE",
    "renewable-energy": "Renewable Energy Center",
    "food-water": "Analytics Laboratory",
    "automotive-incubator": "Automotive & Manufacturing Incubator",
  }

  const centerName = SERVICE_ID_TO_NAME[id] ?? id

  return <CenterFacilityPage centerServiceName={centerName} />
}
