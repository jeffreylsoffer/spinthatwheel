import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import CmsForm from './cms-form';
import { ruleGroups, prompts, modifiers } from '@/lib/data';

export default function AdminPage() {
  return (
    <main className="container mx-auto p-4 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-headline text-4xl lg:text-5xl">CMS - Card Content</h1>
        <Link href="/">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Game
          </Button>
        </Link>
      </div>

      <p className="mb-8 text-muted-foreground max-w-prose">
        Use this page to edit the content for the various cards that appear on the wheel. Changes made here will be reflected in the game. Note: Saving functionality is currently a placeholder.
      </p>

      <CmsForm initialData={{ ruleGroups, prompts, modifiers }} />
    </main>
  );
}
