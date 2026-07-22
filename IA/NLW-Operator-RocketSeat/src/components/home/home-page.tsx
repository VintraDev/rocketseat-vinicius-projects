"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import Header from "@/components/ui/header";
import { Toggle } from "@/components/ui/toggle";
import { H1, Text } from "@/components/ui/typography";
import type { SupportedLanguage } from "@/lib/syntax-highlighting";
import { useTRPC } from "@/trpc/client";

type HomePageProps = {
  metrics: React.ReactNode;
  leaderboard: React.ReactNode;
};

export function HomePage({ metrics, leaderboard }: HomePageProps) {
  const trpc = useTRPC();
  const router = useRouter();
  const [roastMode, setRoastMode] = useState(true);
  const [detectedLanguage, setDetectedLanguage] =
    useState<SupportedLanguage | null>(null);
  const [detectionConfidence, setDetectionConfidence] = useState<number>(0);
  const [isCodeOverLimit, setIsCodeOverLimit] = useState(false);
  const [code, setCode] = useState("");

  const roastCreateMutation = useMutation(
    trpc.roast.create.mutationOptions({
      onSuccess: ({ roastId }) => {
        router.push(`/results/${roastId}`);
      },
    }),
  );

  const handleRoastCode = () => {
    if (!code.trim() || isCodeOverLimit) {
      return;
    }

    roastCreateMutation.mutate({
      code,
      language: detectedLanguage || "plaintext",
      roastMode: roastMode ? "roast" : "honest",
    });
  };

  return (
    <div className="min-h-screen bg-devroast-bg text-white">
      <Header />

      <main className="flex flex-col items-center px-4 sm:px-6 lg:px-10 pt-12 lg:pt-20">
        <div className="flex w-full max-w-6xl flex-col items-center gap-6 lg:gap-8">
          <div className="flex flex-col items-center gap-2 lg:gap-3 px-4 lg:px-0">
            <div className="flex flex-col sm:flex-row items-center gap-2 lg:gap-3">
              <span className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold text-devroast-green">
                $
              </span>
              <H1 className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold text-center sm:text-left">
                paste your code. get roasted.
              </H1>
            </div>
            <Text
              variant="small"
              className="font-[IBM_Plex_Mono] text-xs sm:text-sm text-devroast-text-secondary text-center px-2 sm:px-0"
            >
              {`// drop your code below and we'll rate it - brutally honest or full roast mode`}
            </Text>
          </div>

          <div className="w-full max-w-full lg:w-195 px-2 sm:px-0">
            <CodeEditor
              value={code}
              onChange={setCode}
              placeholder="// paste your code here for roasting..."
              height="adaptive"
              autoDetectLanguage={true}
              showLanguageSelector={true}
              showLineNumbers={true}
              showHeader={true}
              responsive={true}
              maxLength={2000}
              showCharacterCount={true}
              onLimitExceeded={setIsCodeOverLimit}
              onLanguageChange={(language, confidence) => {
                setDetectedLanguage(language);
                setDetectionConfidence(confidence || 0);
              }}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full lg:w-195 gap-4 sm:gap-0 px-2 sm:px-0">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <Toggle
                checked={roastMode}
                onCheckedChange={setRoastMode}
                aria-label="Toggle roast mode"
                className="w-fit"
              />
              <span className="font-[IBM_Plex_Mono] text-xs sm:text-[13px] text-devroast-text-secondary">
                {roastMode ? "roast mode" : "brutally honest"}
              </span>

              {detectedLanguage && (
                <div className="flex items-center gap-2">
                  <span className="font-[IBM_Plex_Mono] text-xs text-devroast-text-muted">
                    detected:
                  </span>
                  <span className="font-mono text-xs text-devroast-green">
                    {detectedLanguage}
                  </span>
                  {detectionConfidence > 0 && (
                    <span className="font-mono text-xs text-devroast-text-muted">
                      ({Math.round(detectionConfidence * 100)}%)
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-center sm:justify-end w-full sm:w-auto">
              <Button
                variant="primary"
                responsive={true}
                onClick={handleRoastCode}
                className="w-full sm:w-auto"
                disabled={isCodeOverLimit || roastCreateMutation.isPending}
              >
                {roastCreateMutation.isPending
                  ? "$ roasting..."
                  : "$ roast_my_code"}
              </Button>
            </div>
          </div>

          {metrics}
        </div>

        <div className="h-15" />

        {leaderboard}
      </main>
    </div>
  );
}
