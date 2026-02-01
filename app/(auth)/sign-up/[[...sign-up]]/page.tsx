import { SignUp } from "@clerk/nextjs";


export default function SignUpPage() {
return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
    <div className="w-full max-w-md">
    <SignUp appearance={{ baseTheme: undefined }} />
    </div>
    </div>
);
}