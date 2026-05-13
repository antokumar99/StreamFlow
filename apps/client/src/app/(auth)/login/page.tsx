import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Login to continue your meeting">
      <LoginForm />
    </AuthLayout>
  );
}