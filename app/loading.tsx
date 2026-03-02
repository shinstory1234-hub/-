import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-3">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-4/5" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
