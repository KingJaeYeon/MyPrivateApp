import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { formatBytes } from '@/lib/utils.ts';

export default function MemoryBadge() {
  const [stats, setStats] = useState({
    cpu: 0,
    appMem: 0,
    totalMem: 0,
    freeMem: 0,
    pid: 0,
  });

  // Electron preload 에서 systemApi.getSystemStats() 사용
  useEffect(() => {
    async function fetchStats() {
      const res = await window.electronAPI.getMemoryInfo();
      setStats(res);
    }

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const appPct = stats.totalMem > 0 ? Math.round((stats.appMem / stats.totalMem) * 100) : 0;

  const tone =
    appPct >= 90
      ? 'bg-red-500'
      : appPct >= 75
        ? 'bg-orange-500'
        : appPct >= 50
          ? 'bg-yellow-500'
          : 'bg-green-600';

  return (
    <Popover>
      <PopoverTrigger>
        <Badge
          variant="secondary"
          className="text-2xs h-5 cursor-pointer gap-1 font-normal"
          title={`CPU ${stats.cpu.toFixed(1)}% / App ${appPct}%`}
        >
          <span className={`inline-block h-2 w-2 rounded-full ${tone}`} />
          <span className="tabular-nums">
            {appPct}% · {formatBytes(stats.appMem)}
          </span>
        </Badge>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-64 text-xs">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">CPU</span>
            <span className="font-medium tabular-nums">{stats.cpu.toFixed(1)}%</span>
          </div>

          <div className="bg-muted/60 h-1.5 w-full rounded">
            <div
              className="bg-primary h-1.5 rounded transition-[width]"
              style={{ width: `${Math.min(100, Math.max(0, stats.cpu))}%` }}
            />
          </div>

          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
            <span className="text-muted-foreground">프로세스 ID</span>
            <span className="text-right tabular-nums">{stats.pid}</span>

            <span className="text-muted-foreground">앱 메모리</span>
            <span className="text-right tabular-nums">
              {formatBytes(stats.appMem)} ({appPct}%)
            </span>

            <span className="text-muted-foreground">전체 메모리</span>
            <span className="text-right tabular-nums">{formatBytes(stats.totalMem)}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
