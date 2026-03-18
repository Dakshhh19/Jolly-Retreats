import { Box } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function DashboardPage() {
  return (
    <div className="bg-background min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Box className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 font-serif text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">This page is being migrated to React.</p>
        <Link to="/">
          <Button className="mt-6">Back to Home</Button>
        </Link>
      </div>
    </div>
  )
}
