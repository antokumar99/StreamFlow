import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import Link from "next/dist/client/link";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Login to continue your meeting">
      <LoginForm />
      <div className="text-sm text-gray-400 mt-4">
      <p>Don&#39;t have an account?{" "}</p>
      <Link
          href="/register"
          className="text-indigo-500 hover:text-indigo-400 transition-colors duration-200">
          Sign up
      </Link>
      </div>
    </AuthLayout>
  );
}