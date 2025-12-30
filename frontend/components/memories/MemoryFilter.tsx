'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import type { MemoryType } from '@/types';

interface MemoryFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedTypes: MemoryType[];
  onTypesChange: (types: MemoryType[]) => void;
  sortBy: 'date' | 'confidence' | 'access';
  onSortChange: (sort: 'date' | 'confidence' | 'access') => void;
}

const memoryTypes: MemoryType[] = ['identity', 'preference', 'fact', 'event', 'context'];

export function MemoryFilter({
  search,
  onSearchChange,
  selectedTypes,
  onTypesChange,
  sortBy,
  onSortChange,
}: MemoryFilterProps) {
  const toggleType = (type: MemoryType) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full">
      <div className="relative flex-1 group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Search className="h-3 w-3 text-primary/40 group-focus-within:text-primary transition-colors" />
            <span className="text-[9px] font-bold text-muted-foreground/20 hidden sm:inline">FIND_{">"}</span>
        </div>
        <input
          placeholder="SEARCH_NEURAL_SPACE..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[var(--obsidian-card)] border border-[var(--obsidian-border)] py-2.5 pl-20 pr-4 text-[11px] font-mono leading-relaxed text-foreground placeholder:text-muted-foreground/20 focus:outline-none focus:border-primary/50 transition-all duration-300 rounded-none shadow-sm"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-20 group-focus-within:opacity-40 transition-opacity">
            <span className="text-[8px] font-bold uppercase tracking-tighter">CTRL+K</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 border-[var(--obsidian-border)] bg-[var(--obsidian-card)] text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--obsidian-hover)] rounded-none gap-2 px-4 group transition-all">
                <Filter className="h-3 w-3 text-primary/50 group-hover:text-primary" />
                Filter_Type
                {selectedTypes.length > 0 && <span className="ml-1 text-primary">[{selectedTypes.length}]</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[var(--obsidian-card)] border-[var(--obsidian-border)] p-2 rounded-none">
              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground p-2">Neural Segment Selection</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[var(--obsidian-border)]" />
              {memoryTypes.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() => toggleType(type)}
                  className="capitalize text-[11px] font-medium py-2 focus:bg-primary/10 focus:text-primary cursor-pointer rounded-none"
                >
                  {type}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 border-[var(--obsidian-border)] bg-[var(--obsidian-card)] text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--obsidian-hover)] rounded-none gap-2 px-4 group transition-all">
                <ArrowUpDown className="h-3 w-3 text-primary/50 group-hover:text-primary" />
                Sort_By
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[var(--obsidian-card)] border-[var(--obsidian-border)] p-2 rounded-none">
              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground p-2">Sort Vector</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[var(--obsidian-border)]" />
              {[
                { id: 'date', label: 'Archival_Date (Newest)' },
                { id: 'confidence', label: 'Confidence_Rank (Highest)' },
                { id: 'access', label: 'Recall_Frequency (Active)' },
              ].map((item) => (
                <DropdownMenuCheckboxItem
                  key={item.id}
                  checked={sortBy === item.id}
                  onCheckedChange={() => onSortChange(item.id as any)}
                  className="text-[11px] font-medium py-2 focus:bg-primary/10 focus:text-primary cursor-pointer rounded-none"
                >
                  {item.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
    </div>
  );
}
