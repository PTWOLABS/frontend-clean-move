import { Card, CardContent, CardHeader } from "@/components/ui/card";

type AppointmentInfoCardProps = {
  title: string;
  mainContent: string;
  description: string;
};

export function AppointmentInfoCard({ title, mainContent, description }: AppointmentInfoCardProps) {
  return (
    <Card className="min-w-0 rounded-2xl border-border/80 bg-card/80 shadow-xs backdrop-blur-sm">
      <CardHeader className="p-4 pb-2">
        <p className="truncate text-xs font-medium text-muted-foreground">{title}</p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="truncate font-display text-lg font-semibold text-card-foreground">
          {mainContent}
        </p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
