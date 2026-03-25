"use client";

import { useState } from "react";
import { useTermsQuery } from "@/features/admin/hooks";
import {
  useSendLowPerformanceAlertMutation,
  useSendResultsReleasedMutation,
} from "@/features/notifications/hooks";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function errorText(error: unknown) {
  return error instanceof ApiError ? error.message : "Request failed";
}

export default function NotificationsPage() {
  const terms = useTermsQuery();
  const sendResults = useSendResultsReleasedMutation();
  const sendLowPerformance = useSendLowPerformanceAlertMutation();

  const [termId, setTermId] = useState("");
  const [recipientsCsv, setRecipientsCsv] = useState("");
  const [subject, setSubject] = useState("Results released");
  const [message, setMessage] = useState("");
  const [thresholdAverage, setThresholdAverage] = useState(50);

  const recipients = recipientsCsv
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  const topError = terms.error ?? sendResults.error ?? sendLowPerformance.error;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Send result release and low-performance alert emails.
        </p>
      </div>

      {topError ? <p className="text-sm text-destructive">{errorText(topError)}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Email recipients</CardTitle>
          <CardDescription>Comma-separated email addresses and target term.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          <Select value={termId || undefined} onValueChange={setTermId}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Term" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {(terms.data?.terms ?? []).map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.name} (Order {t.order})
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Input
            value={recipientsCsv}
            placeholder="parent1@mail.com,parent2@mail.com"
            onChange={(e) => setRecipientsCsv(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results released</CardTitle>
          <CardDescription>Send a custom message when results are out.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input value={subject} placeholder="Subject" onChange={(e) => setSubject(e.target.value)} />
          <Input value={message} placeholder="Message body" onChange={(e) => setMessage(e.target.value)} />
          <Button
            disabled={sendResults.isPending || !termId || !recipients.length || message.trim().length < 3}
            onClick={async () => {
              await sendResults.mutateAsync({
                termId,
                recipients,
                subject: subject.trim() || undefined,
                message: message.trim(),
              });
            }}
          >
            Send results released
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Low performance alert</CardTitle>
          <CardDescription>Send automated low-performance summary.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            type="number"
            min={0}
            max={100}
            value={thresholdAverage}
            onChange={(e) => setThresholdAverage(Number(e.target.value || 0))}
          />
          <Button
            disabled={sendLowPerformance.isPending || !termId || !recipients.length}
            onClick={async () => {
              await sendLowPerformance.mutateAsync({
                termId,
                recipients,
                thresholdAverage,
              });
            }}
          >
            Send low performance alert
          </Button>

          {sendLowPerformance.data?.flagged?.length ? (
            <div className="space-y-1 pt-2">
              {sendLowPerformance.data.flagged.map((row) => (
                <p key={row.classId} className="text-sm text-muted-foreground">
                  {row.classId}: {row.average}
                </p>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
