
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, RefreshCcw } from 'lucide-react';
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

export default function AdminPage() {
  const [initialData, setInitialData] = useState({ 
    ruleGroups: defaultRuleGroups, 
    prompts: defaultPrompts, 
    modifiers: defaultModifiers,
    buzzerCountdown: defaultBuzzerCountdown,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedRules = localStorage.getItem('cms_rules');
    const savedPrompts = localStorage.getItem('cms_prompts');
    const savedModifiers = localStorage.getItem('cms_modifiers');
    const savedBuzzerCountdown = localStorage.getItem('cms_buzzer_countdown');

    setInitialData({
        ruleGroups: savedRules ? JSON.parse(savedRules) : defaultRuleGroups,
        prompts: savedPrompts ? JSON.parse(savedPrompts) : defaultPrompts,
        modifiers: savedModifiers ? JSON.parse(savedModifiers) : defaultModifiers,
        buzzerCountdown: savedBuzzerCountdown ? JSON.parse(savedBuzzerCountdown) : defaultBuzzerCountdown,
    });
    
    setIsLoading(false);
  }, []);

  const handleResetToDefaults = () => {
    localStorage.removeItem('cms_rules');
    localStorage.removeItem('cms_prompts');
    localStorage.removeItem('cms_modifiers');
    localStorage.removeItem('cms_is_buzzer_enabled');
    localStorage.removeItem('cms_buzzer_countdown');
    window.location.reload();
  };

  if (isLoading) {
    return (
      <main className="container mx-auto p-4 lg:p-8">
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
    <main className="container mx-auto p-4 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-headline text-4xl lg:text-5xl">CMS - Card Content</h1>
        <div className="flex items-center gap-2">
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
        initialData={initialData} 
      />
    </main>
  );
}
