import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";

export default function DesignProposalsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Design Proposals</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            My Proposals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Design proposals page is coming soon. Here you will manage your submitted proposals and track their status.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
