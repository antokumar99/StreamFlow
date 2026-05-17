import ProtectedRoute from "./../../components/auth/ProtectedRoute";
import Navbar from "@/components/ui/Navbar";


export default function HomeLayout({
  children,
}: {
    children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>

    
   <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col">
        <Navbar />

        <main className="p-6 flex-1">
          {children}
        </main>
    </div>
  
      
      
      
    
    </ProtectedRoute>
  );
}

