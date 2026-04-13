import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf } from "lucide-react";

export default function DesignOpportunitiesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Design Opportunities</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            Available Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Design opportunities page is coming soon. Here you will find projects from brands looking for design services.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
