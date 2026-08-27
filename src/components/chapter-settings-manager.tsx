'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { 
  getGlobalSettings, 
  updateChapterSettingsAction, 
  setActiveChapterAction,
  createNewChapterAction 
} from '@/app/actions';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FolderGit2, Users, Briefcase, Sparkles, Plus } from 'lucide-react';

interface ChapterConfig {
  isHiringOpen: boolean;
  isTeamVisible: boolean;
}

interface GlobalSettings {
  activeChapter: string;
  chapters: Record<string, ChapterConfig>;
}

export function ChapterSettingsManager() {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [newChapterName, setNewChapterName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const { toast } = useToast();
  const router = useRouter();

  const loadSettings = async () => {
    setIsLoading(true);
    const result = await getGlobalSettings();
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error loading settings',
        description: result.error,
      });
    } else if (result.settings) {
      const data = result.settings as GlobalSettings;
      if (!data.chapters) {
        data.chapters = {};
      }
      if (!data.chapters['3.0']) {
        data.chapters['3.0'] = { isHiringOpen: false, isTeamVisible: true };
      }
      if (!data.chapters['4.0']) {
        data.chapters['4.0'] = { isHiringOpen: true, isTeamVisible: true };
      }
      setSettings(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleActiveChapterChange = async (value: string) => {
    if (!settings) return;
    
    startTransition(async () => {
      const result = await setActiveChapterAction(value);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Failed to update active chapter',
          description: result.error,
        });
      } else {
        setSettings(prev => prev ? { ...prev, activeChapter: value } : null);
        toast({
          title: 'Active Chapter Updated',
          description: `Chapter ${value} is now set as the global active chapter.`,
        });
        router.refresh();
      }
    });
  };

  const handleCreateChapter = async () => {
    const trimmed = newChapterName.trim();
    if (!trimmed) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Chapter name cannot be empty.',
      });
      return;
    }
    if (!/^\d+\.\d+$/.test(trimmed)) {
      toast({
        variant: 'destructive',
        title: 'Invalid format',
        description: 'Use format like "5.0" or "4.1".',
      });
      return;
    }

    setIsCreating(true);
    try {
      const result = await createNewChapterAction(trimmed);
      if (result.error) {
        throw new Error(result.error);
      }
      toast({
        title: 'Success!',
        description: `Chapter ${trimmed} has been successfully created.`,
      });
      setNewChapterName('');
      await loadSettings();
      router.refresh();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to create chapter',
        description: err.message || 'Failed to create chapter.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggle = async (chapter: string, key: keyof ChapterConfig, checked: boolean) => {
    if (!settings) return;

    // Optimistically update UI
    const originalSettings = { ...settings };
    const chaptersMap = settings.chapters || {};
    const updatedChapters = {
      ...chaptersMap,
      [chapter]: {
        ...(chaptersMap[chapter] || { isHiringOpen: false, isTeamVisible: true }),
        [key]: checked,
      },
    };
    setSettings(prev => prev ? { ...prev, chapters: updatedChapters } : null);

    try {
      const result = await updateChapterSettingsAction(chapter, { [key]: checked });
      if (result.error) {
        throw new Error(result.error);
      }
      toast({
        title: 'Settings Saved',
        description: `Chapter ${chapter} ${key === 'isHiringOpen' ? 'Hiring' : 'Team visibility'} is now ${checked ? 'enabled' : 'disabled'}.`,
      });
      router.refresh();
    } catch (err: any) {
      // Revert on error
      setSettings(originalSettings);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: err.message || 'Failed to update chapter settings.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-[#4285F4]" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-8 text-sm text-slate-400">
        Could not load configurations. Please try again.
      </div>
    );
  }

  // Generate dynamic chapters list from database keys
  const chaptersList = Object.keys(settings?.chapters || {}).sort();

  return (
    <div className="space-y-6">
      {/* Active Chapter Selector & Chapter Creator */}
      <Card className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <CardHeader className="p-6 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-[#4285F4]">
            <FolderGit2 className="h-5 w-5" />
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white m-0">Global Active Chapter</CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
            Choose which chapter is currently active for registrations and portal submissions, or initialize a new chapter.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-zinc-800/80">
            {/* Active selector */}
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Current Recruiting Chapter</Label>
                <div className="text-sm font-medium text-slate-800 dark:text-zinc-300">
                  Applications will be tagged with <span className="font-extrabold text-[#4285F4]">Chapter {settings.activeChapter}</span>
                </div>
              </div>
              <div className="w-full sm:w-60">
                <Select
                  value={settings.activeChapter}
                  onValueChange={handleActiveChapterChange}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800">
                    <SelectValue placeholder="Select active chapter" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-zinc-800">
                    {chaptersList.map(chap => (
                      <SelectItem key={chap} value={chap} className="text-xs font-medium cursor-pointer rounded-lg">
                        Chapter {chap}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Create new chapter */}
            <div className="space-y-4 pt-6 md:pt-0 md:pl-8">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Create New Chapter</Label>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                  Initialize a new recruitment chapter (e.g. "5.0" or "4.1").
                </p>
              </div>
              <div className="flex gap-2 max-w-sm">
                <Input
                  value={newChapterName}
                  onChange={(e) => setNewChapterName(e.target.value)}
                  placeholder="e.g. 5.0"
                  disabled={isCreating}
                  className="rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-sm focus:ring-[#4285F4]"
                />
                <Button 
                  onClick={handleCreateChapter} 
                  disabled={isCreating || !newChapterName}
                  className="rounded-xl bg-[#4285F4] hover:bg-[#4285F4]/90 text-white font-bold text-xs shrink-0 px-4"
                >
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                  Create
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Chapter Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {chaptersList.map(chap => {
          const config = (settings?.chapters && settings.chapters[chap]) || { isHiringOpen: false, isTeamVisible: true };
          const isActive = settings?.activeChapter === chap;

          return (
            <Card key={chap} className={`bg-white dark:bg-zinc-900 border ${isActive ? 'border-[#4285F4]/40 shadow-[0_0_15px_rgba(66,133,244,0.05)]' : 'border-slate-200 dark:border-zinc-800'} rounded-2xl transition-all`}>
              <CardHeader className="p-6 border-b border-slate-100 dark:border-zinc-800 flex flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Chapter {chap}</CardTitle>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-[#4285F4]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#4285F4] border border-blue-200/50 dark:border-[#4285F4]/20">
                        Active
                      </span>
                    )}
                  </div>
                  <CardDescription className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
                    Manage form gates and team display settings.
                  </CardDescription>
                </div>
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 shrink-0">
                  <Sparkles className={`size-5 ${isActive ? 'text-[#4285F4]' : ''}`} />
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Hiring toggle */}
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label htmlFor={`hiring-toggle-${chap}`} className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                      <Briefcase className="h-3.5 w-3.5 text-[#4285F4]" />
                      Recruitment status
                    </Label>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                      Open or close application forms for Chapter {chap}.
                    </p>
                  </div>
                  <Switch
                    id={`hiring-toggle-${chap}`}
                    checked={config.isHiringOpen}
                    onCheckedChange={(checked) => handleToggle(chap, 'isHiringOpen', checked)}
                    disabled={isPending}
                  />
                </div>

                {/* Team Visibility toggle */}
                <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                  <div className="space-y-0.5">
                    <Label htmlFor={`team-toggle-${chap}`} className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                      <Users className="h-3.5 w-3.5 text-[#34A853]" />
                      Public Team Visibility
                    </Label>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                      Toggle whether Chapter {chap} members are visible on the team roster page.
                    </p>
                  </div>
                  <Switch
                    id={`team-toggle-${chap}`}
                    checked={config.isTeamVisible}
                    onCheckedChange={(checked) => handleToggle(chap, 'isTeamVisible', checked)}
                    disabled={isPending}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
