"use client";

import { useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Loader2, Sparkles } from "lucide-react";
import { getAISuggestions } from "@/actions/ai";

export function AISuggestionsButton({ accountId }) {
  const { data, loading, fn, setData } = useFetch(getAISuggestions);

  const suggestions = data;

  useEffect(() => {
    return () => setData(undefined);
  }, [setData]);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button onClick={() => fn(accountId)} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              AI Suggestions
            </>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">AI Suggestions</h3>
          <p className="text-sm text-muted-foreground">
            Personalized recommendations to improve your financial planning.
          </p>
        </div>

        {!suggestions && !loading && (
          <div className="text-sm text-muted-foreground">
            Click the button to generate insights.
          </div>
        )}

        {loading && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating
            suggestions...
          </div>
        )}

        {suggestions && (
          <div className="space-y-4">
            {suggestions.summary && (
              <p className="text-sm leading-6">{suggestions.summary}</p>
            )}

            {Array.isArray(suggestions.suggestions) && (
              <div className="space-y-3">
                {suggestions.suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{s.title}</div>
                      {s.impact && (
                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {s.impact}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {s.detail}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {Array.isArray(suggestions.reminders) && suggestions.reminders.length > 0 && (
              <div>
                <div className="font-medium mb-2">Reminders</div>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {suggestions.reminders.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}


