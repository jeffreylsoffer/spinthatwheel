
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, RefreshCcw, Share2, LoaderPinwheel } from 'lucide-react';
import CmsForm from './cms-form';
import { ruleGroups as defaultRuleGroups, prompts as defaultPrompts, modifiers as defaultModifiers, defaultBuzzerCountdown } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import type { RuleGroup, Prompt, Modifier } from '@/lib/types';

export default function AdminPage() {
  const [rules, setRules] = useState<RuleGroup[]>(defaultRuleGroups);
  const [prompts, setPrompts] = useState<Prompt[]>(defaultPrompts);
  const [modifiers, setModifiers] = useState<Modifier[]>(defaultModifiers);
  const [buzzerCountdown, setBuzzerCountdown] = useState(defaultBuzzerCountdown);
  const [isBuzzerRuleEnabled, setIsBuzzerRuleEnabled] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedRules = localStorage.getItem('cms_rules');
    const savedPrompts = localStorage.getItem('cms_prompts');
    const savedModifiers = localStorage.getItem('cms_modifiers');
    const savedBuzzerCountdown = localStorage.getItem('cms_buzzer_countdown');
    const savedIsBuzzerEnabled = localStorage.getItem('cms_is_buzzer_enabled');
    
    setRules(savedRules ? JSON.parse(savedRules) : defaultRuleGroups);
    setPrompts(savedPrompts ? JSON.parse(savedPrompts) : defaultPrompts);
    setModifiers(savedModifiers ? JSON.parse(savedModifiers) : defaultModifiers);
    setBuzzerCountdown(savedBuzzerCountdown ? JSON.parse(savedBuzzerCountdown) : defaultBuzzerCountdown);
    setIsBuzzerRuleEnabled(savedIsBuzzerEnabled ? JSON.parse(savedIsBuzzerEnabled) : true);

    setIsLoading(false);
  }, []);

  const handleSaveChanges = () => {
    try {
      localStorage.setItem('cms_rules', JSON.stringify(rules));
      localStorage.setItem('cms_prompts', JSON.stringify(prompts));
      localStorage.setItem('cms_modifiers', JSON.stringify(modifiers));
      localStorage.setItem('cms_is_buzzer_enabled', JSON.stringify(isBuzzerRuleEnabled));
      localStorage.setItem('cms_buzzer_countdown', JSON.stringify(buzzerCountdown));
      
      toast({
        title: "Changes Saved!",
        description: "Your new card and wheel configuration has been saved locally.",
      });
    } catch (error) {
      console.error("Failed to save to localStorage", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save changes to your browser's local storage.",
      });
    }
  };

  const handleResetToDefaults = () => {
    localStorage.removeItem('cms_rules');
    localStorage.removeItem('cms_prompts');
    localStorage.removeItem('cms_modifiers');
    localStorage.removeItem('cms_is_buzzer_enabled');
    localStorage.removeItem('cms_buzzer_countdown');
    window.location.reload();
  };

  const handleShare = async () => {
    setIsSharing(true);
    console.log('[SHARE] Starting share process...');
    try {
      const shareData = {
        rules,
        prompts,
        modifiers,
        isBuzzerEnabled,
        buzzerCountdown,
      };
      
      console.log('[SHARE] Preparing to send data to server:', shareData);

      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shareData),
      });

      console.log(`[SHARE] Received response from server with status: ${response.status}`);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[SHARE] Server returned an error:', errorBody);
        throw new Error('Failed to create share link on server.');
      }

      const { id } = await response.json();
      console.log(`[SHARE] Successfully created share link with ID: ${id}`);
      const shareUrl = `${window.location.origin}?share=${id}`;
      
      navigator.clipboard.writeText(shareUrl);

      toast({
        title: "Link Copied!",
        description: "A shareable link has been copied to your clipboard.",
      });

    } catch (error) {
      console.error("[SHARE] Failed to generate share link", error);
      toast({
        variant: "destructive",
        title: "Share Failed",
        description: "Could not create a shareable link. Please check the console for details.",
      });
    } finally {
      console.log('[SHARE] Ending share process.');
      setIsSharing(false);
    }
  };

  if (isLoading) {
    return (
      <main className="container mx-auto p-8">
          <div className="flex items-center justify-between mb-8">
              <Skeleton className="h-12 w-1/2" />
              <Skeleton className="h-10 w-36" />
          </div>
          <Skeleton className="h-8 w-3/4 mb-8" />
          <div className="space-y-8">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
          </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-headline text-4xl lg:text-5xl">Manage Cards</h1>
        <div className="flex items-center gap-2">
           <Button variant="outline" onClick={handleShare} disabled={isSharing}>
              {isSharing ? (
                <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="mr-2 h-4 w-4" />
              )}
              Share
            </Button>
           <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive-outline">
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Reset to Defaults
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action will delete all your custom content and restore the original default cards and settings. This cannot be undone.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetToDefaults}>Yes, reset everything</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
            </AlertDialog>
            <Link href="/">
                <Button variant="outline">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Game
                </Button>
            </Link>
        </div>
      </div>

      <p className="mb-8 text-muted-foreground max-w-prose">
        Use this page to edit the content for the various cards that appear on the wheel. Changes made here will be reflected in the game. Your changes are saved automatically to your browser.
      </p>

      <CmsForm 
        rules={rules}
        prompts={prompts}
        modifiers={modifiers}
        buzzerCountdown={buzzerCountdown}
        isBuzzerRuleEnabled={isBuzzerRuleEnabled}
        onRulesChange={setRules}
        onPromptsChange={setPrompts}
        onModifiersChange={setModifiers}
        onBuzzerCountdownChange={setBuzzerCountdown}
        onIsBuzzerRuleEnabledChange={setIsBuzzerRuleEnabled}
        onSaveChanges={handleSaveChanges}
      />
    </main>
  );
}
