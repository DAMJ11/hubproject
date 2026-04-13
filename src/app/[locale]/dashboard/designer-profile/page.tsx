import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from "lucide-react";

export default function DesignerProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Designer Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your designer profile page is coming soon. Here you will be able to manage your specialties, availability, rates, and public profile.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
