import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface DesignStatusProps {
  status: string;
}

export function DesignStatus({ status }: DesignStatusProps) {
  return (
    <div className="flex justify-center">
      {status === "processing" && (
        <Badge
          variant="outline"
          className="px-3 py-1 border-primary/30 bg-primary/10 text-primary">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Verwerken
        </Badge>
      )}
      {status === "completed" && (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
          <CheckCircle className="mr-2 h-4 w-4" />
          Voltooid
        </Badge>
      )}
      {status === "failed" && (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200 px-3 py-1">
          <AlertCircle className="mr-2 h-4 w-4" />
          Mislukt
        </Badge>
      )}
    </div>
  );
}
