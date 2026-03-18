import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { adminApi } from "@/services/adminApi"

export default function AdminPage() {
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalServices: 0
  })

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminApi.analytics.overview()
        setSummary(data.summary)
      } catch {
        // keep default zeros if API fails
      }
    }
    void load()
  }, [])

  return (
    <div className="p-8">
      <h1 className="font-serif text-4xl font-bold text-foreground">Admin Dashboard</h1>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Users", value: summary.totalUsers },
          { label: "Total Orders", value: summary.totalOrders },
          { label: "Revenue", value: `$${summary.totalRevenue}` },
          { label: "Products / Services", value: summary.totalServices },
        ].map((stat) => (
          <Card key={stat.label} className="p-6">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 font-serif text-2xl font-bold text-foreground">{stat.value}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
