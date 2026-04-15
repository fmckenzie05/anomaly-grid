import DashboardNav from '@/components/DashboardNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#030305]">
      <DashboardNav />
      {children}
    </div>
  )
}
