"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, ExternalLink } from "lucide-react"

const funds = [
    {
        name: "SEFA SMME Fund",
        provider: "Small Enterprise Finance Agency",
        amount: "R50k - R5m",
        focus: "Small Business Development",
        status: "Open"
    },
    {
        name: "Technology Innovation Agency Seed Fund",
        provider: "TIA",
        amount: "Up to R1m",
        focus: "Tech Innovation",
        status: "Open"
    },
    {
        name: "NEF Women Empowerment Fund",
        provider: "National Empowerment Fund",
        amount: "R250k - R75m",
        focus: "Women-owned Businesses",
        status: "Open"
    },
    {
        name: "IDC Green Energy Fund",
        provider: "Industrial Development Corporation",
        amount: "Variable",
        focus: "Green Energy Projects",
        status: "Closed"
    },
]

export default function FundingInfoPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <h1 className="text-2xl font-bold tracking-tight">Funding Information</h1>
            <p className="text-muted-foreground">
                Available funding sources and grants for ELIDZ tenants and STP partners.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
                {funds.map((fund) => (
                    <Card key={fund.name}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{fund.name}</CardTitle>
                                <Badge variant={fund.status === "Open" ? "default" : "secondary"}>
                                    {fund.status}
                                </Badge>
                            </div>
                            <CardDescription>{fund.provider}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                </div>
                                <span className="font-semibold">{fund.amount}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Focus: {fund.focus}
                            </p>
                            <Button variant="outline" className="w-full gap-2">
                                Visit Website <ExternalLink className="h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
