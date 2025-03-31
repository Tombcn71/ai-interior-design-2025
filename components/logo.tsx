import { Home } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="flex items-center justify-center text-primary">
        <Home className="h-6 w-6" />
      </div>
      <span className="inline-block text-2xl font-extrabold text-primary">
        interieurGPT
      </span>
    </Link>
  );
}
