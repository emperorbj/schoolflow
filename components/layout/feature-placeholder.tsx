import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type FeaturePlaceholderProps = {
  title: string;
  description: string;
};

export function FeaturePlaceholder({ title, description }: FeaturePlaceholderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Foundation is ready. Connect queries and forms to this page next.
        </p>
      </CardContent>
    </Card>
  );
}
