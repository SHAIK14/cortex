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
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search memories..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-background pl-10"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {memoryTypes.map((type) => (
            <DropdownMenuCheckboxItem
              key={type}
              checked={selectedTypes.includes(type)}
              onCheckedChange={() => toggleType(type)}
              className="capitalize"
            >
              {type}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={sortBy === 'date'}
            onCheckedChange={() => onSortChange('date')}
          >
            Date (newest)
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortBy === 'confidence'}
            onCheckedChange={() => onSortChange('confidence')}
          >
            Confidence (highest)
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortBy === 'access'}
            onCheckedChange={() => onSortChange('access')}
          >
            Access count
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
