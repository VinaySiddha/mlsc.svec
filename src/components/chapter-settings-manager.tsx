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
import { Loader2, FolderGit2, Users, Briefcase, Sparkles, Plus, Check, Terminal, Radio } from 'lucide-react';

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
      if (!data.chapters['3.0'] && !data.chapters['3']) {
        data.chapters['3.0'] = { isHiringOpen: false, isTeamVisible: true };
      }
      if (!data.chapters['4.0'] && !data.chapters['4']) {
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
          description: `Chapter ${value} is now set as the active chapter across the entire website.`,
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

    if (trimmed.length > 20) {
      toast({
        variant: 'destructive',
        title: 'Invalid length',
        description: 'Chapter name must be 20 characters or fewer.',
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
    <div className="space-y-6 font-sans">
      {/* Active Chapter Selector & Chapter Creator */}
      <Card className="bg-white border-2 border-black rounded-none shadow-[6px_6px_0px_0px_#000000]">
        <CardHeader className="p-6 border-b-2 border-black bg-[#F9F9FB]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-black" />
              <CardTitle className="text-sm font-mono font-black uppercase tracking-wider text-black m-0">
                [ GLOBAL ACTIVE CHAPTER CONTROLLER ]
              </CardTitle>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFE600] text-black border-2 border-black font-mono font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000000]">
              <Radio className="h-3 w-3 animate-pulse text-red-600" />
              LIVE: CHAPTER {settings.activeChapter}
            </span>
          </div>
          <CardDescription className="text-xs text-zinc-600 font-semibold mt-1">
            Change the active chapter number (e.g. 3, 4, 3.0, 4.0). This dynamically updates the entire website: header, hero, team roster, forms, and recruitments.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x-2 divide-black">
            
            {/* Active selector */}
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-mono font-black text-black uppercase">Select Active Chapter for Entire Website</Label>
                <div className="text-sm font-semibold text-zinc-700">
                  Currently broadcasting as: <span className="font-black text-black bg-[#00FF66] px-2 py-0.5 border border-black text-xs">Chapter {settings.activeChapter}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {chaptersList.map((chap) => {
                  const isCurrentActive = settings.activeChapter === chap;
                  return (
                    <button
                      key={chap}
                      onClick={() => handleActiveChapterChange(chap)}
                      disabled={isPending}
                      className={`px-3.5 py-1.5 text-xs font-mono font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer ${
                        isCurrentActive
                          ? 'bg-[#4285F4] text-white shadow-[3px_3px_0px_0px_#000000] translate-x-[1px] translate-y-[1px]'
                          : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000000]'
                      }`}
                    >
                      {isCurrentActive && <Check className="inline-block h-3 w-3 mr-1" />}
                      Chapter {chap}
                    </button>
                  );
                })}
              </div>

              <div className="w-full sm:w-64 pt-2">
                <Select
                  value={settings.activeChapter}
                  onValueChange={handleActiveChapterChange}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full rounded-none bg-white border-2 border-black font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#000000]">
                    <SelectValue placeholder="Select active chapter" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-2 border-black bg-white">
                    {chaptersList.map(chap => (
                      <SelectItem key={chap} value={chap} className="text-xs font-mono font-bold cursor-pointer">
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
                <Label className="text-xs font-mono font-black text-black uppercase">Add New Chapter Number</Label>
                <p className="text-[11px] text-zinc-600 font-semibold">
                  Enter any chapter identifier (e.g. 3, 4, 3.0, 4.0, 5).
                </p>
              </div>
              <div className="flex gap-2 max-w-sm">
                <Input
                  value={newChapterName}
                  onChange={(e) => setNewChapterName(e.target.value)}
                  placeholder="e.g. 4 or 4.0"
                  disabled={isCreating}
                  className="rounded-none bg-white border-2 border-black font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#000000] focus:ring-0 focus:border-black"
                />
                <Button 
                  onClick={handleCreateChapter} 
                  disabled={isCreating || !newChapterName}
                  className="rounded-none bg-[#FFE600] text-black hover:bg-[#FFE600]/90 border-2 border-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] shrink-0 px-4 cursor-pointer"
                >
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                  Add Chapter
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
            <Card key={chap} className={`bg-white border-2 border-black rounded-none ${isActive ? 'shadow-[6px_6px_0px_0px_#4285F4]' : 'shadow-[4px_4px_0px_0px_#000000]'} transition-all`}>
              <CardHeader className="p-6 border-b-2 border-black flex flex-row items-center justify-between gap-4 bg-[#F9F9FB]">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-display font-black uppercase italic tracking-tight text-black">
                      CHAPTER {chap}
                    </CardTitle>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 bg-[#FFE600] text-black px-2 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider border border-black shadow-[1px_1px_0px_0px_#000000]">
                        ACTIVE SITEWIDE
                      </span>
                    )}
                  </div>
                  <CardDescription className="text-xs text-zinc-600 font-semibold mt-1">
                    Manage recruitment gate and team roster visibility.
                  </CardDescription>
                </div>
                <div className="flex aspect-square size-10 items-center justify-center border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000000] text-black shrink-0">
                  <Sparkles className={`size-5 ${isActive ? 'text-[#4285F4]' : 'text-black'}`} />
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Hiring toggle */}
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label htmlFor={`hiring-toggle-${chap}`} className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                      <Briefcase className="h-3.5 w-3.5 text-[#4285F4]" />
                      Recruitment Applications Gate
                    </Label>
                    <p className="text-[11px] text-zinc-600 font-semibold">
                      Open or close application submissions for Chapter {chap}.
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
                <div className="flex items-center justify-between gap-4 pt-4 border-t-2 border-black">
                  <div className="space-y-0.5">
                    <Label htmlFor={`team-toggle-${chap}`} className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                      <Users className="h-3.5 w-3.5 text-[#00FF66]" />
                      Public Team Visibility
                    </Label>
                    <p className="text-[11px] text-zinc-600 font-semibold">
                      Toggle whether Chapter {chap} members are visible on the public team page.
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
