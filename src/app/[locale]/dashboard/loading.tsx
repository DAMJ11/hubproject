import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  const pulse = "animate-pulse bg-gray-200 rounded";
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className={`${pulse} h-7 w-64`} />
          <div className={`${pulse} h-4 w-48`} />
        </div>
        <div className={`${pulse} h-10 w-40 rounded-lg`} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className={`${pulse} w-12 h-12 rounded-xl`} />
              <div className="space-y-2">
                <div className={`${pulse} h-6 w-16`} />
                <div className={`${pulse} h-4 w-28`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className={`${pulse} h-5 w-40`} />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className={`${pulse} h-4 w-48`} />
                      <div className={`${pulse} h-5 w-16 rounded-full`} />
                    </div>
                    <div className="flex gap-4">
                      <div className={`${pulse} h-3 w-20`} />
                      <div className={`${pulse} h-3 w-24`} />
                      <div className={`${pulse} h-3 w-28`} />
                    </div>
                  </div>
                  <div className={`${pulse} h-5 w-24`} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <div className={`${pulse} h-5 w-32`} />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`${pulse} h-10 w-full rounded-lg`} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
