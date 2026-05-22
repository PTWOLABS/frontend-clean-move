import { Card, CardContent, CardHeader } from "@/components/ui/card";

type AppointmentInfoCardProps = {
  title: string;
  mainContent: string;
  description: string;
};

export function AppointmentInfoCard({ title, mainContent, description }: AppointmentInfoCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <p>{title}</p>
      </CardHeader>
      <CardContent>
        <p>{mainContent}</p>
        <p>{description}</p>
      </CardContent>
    </Card>
  );
}
