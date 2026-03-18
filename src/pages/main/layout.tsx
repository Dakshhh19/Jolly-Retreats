import { Outlet } from "react-router-dom"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[73px]">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
