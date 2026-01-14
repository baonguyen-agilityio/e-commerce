import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary:
              "bg-primary hover:bg-primary/90 text-primary-foreground",
            card: "shadow-xl",
          },
        }}
      />
    </div>
  );
}

