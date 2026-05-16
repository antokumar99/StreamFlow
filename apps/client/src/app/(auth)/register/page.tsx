import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Start collaborating with StreamFlow"
    >
      <RegisterForm />
      <div>
        <p className="text-sm text-gray-400 mt-4">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-500 hover:underline">
            Sign in 
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}