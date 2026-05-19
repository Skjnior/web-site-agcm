'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { X, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  type: 'text' | 'select' | 'date' | 'boolean';
  key: string;
  label: string;
  options?: FilterOption[];
  placeholder?: string;
  /** Valeur affichée quand aucun paramètre dans l’URL (select uniquement) */
  selectDefault?: string;
}

interface FiltersProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onReset: () => void;
  className?: string;
}

/** Champ texte avec debounce pour limiter les requêtes à l’API */
function DebouncedTextFilter({
  filterKey,
  value,
  placeholder,
  onCommit,
}: {
  filterKey: string;
  value: string;
  placeholder?: string;
  onCommit: (key: string, v: string) => void;
}) {
  const [inner, setInner] = useState(value ?? '');
  const skipFirstDebounce = useRef(true);

  useEffect(() => {
    setInner(value ?? '');
  }, [value]);

  useEffect(() => {
    if (skipFirstDebounce.current) {
      skipFirstDebounce.current = false;
      return;
    }
    const t = setTimeout(() => {
      if (inner !== (value ?? '')) {
        onCommit(filterKey, inner);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [inner, filterKey, onCommit, value]);

  return (
    <Input
      id={filterKey}
      placeholder={placeholder}
      value={inner}
      onChange={(e) => setInner(e.target.value)}
    />
  );
}

export function Filters({ filters, values, onChange, onReset, className = '' }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const hasActiveFilters = Object.values(values).some((v) => v !== '' && v !== null && v !== undefined);

  const handleChange = (key: string, value: any) => {
    onChange({ ...valuesRef.current, [key]: value });
  };

  const commitText = (key: string, v: string) => {
    onChange({ ...valuesRef.current, [key]: v });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
        >
          <Filter className="h-4 w-4" />
          Filtres
          {hasActiveFilters && (
            <span className="ml-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
              {Object.values(values).filter(v => v !== '' && v !== null && v !== undefined).length}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="dark:text-slate-300 dark:hover:bg-slate-800">
            <X className="h-4 w-4 mr-1" />
            Réinitialiser
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2 lg:grid-cols-3 dark:border-slate-600 dark:bg-slate-900/90">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-2">
              <Label htmlFor={filter.key} className="text-slate-700 dark:text-slate-300">
                {filter.label}
              </Label>
              {filter.type === 'text' && (
                <DebouncedTextFilter
                  filterKey={filter.key}
                  value={values[filter.key] || ''}
                  placeholder={filter.placeholder || `Rechercher ${filter.label.toLowerCase()}...`}
                  onCommit={commitText}
                />
              )}
              {filter.type === 'select' && (
                <Select
                  value={
                    values[filter.key] !== undefined && values[filter.key] !== ''
                      ? String(values[filter.key])
                      : (filter.selectDefault ?? 'ALL')
                  }
                  onValueChange={(v) => handleChange(filter.key, v)}
                >
                  <SelectTrigger id={filter.key}>
                    <SelectValue placeholder={filter.placeholder || `Sélectionner ${filter.label.toLowerCase()}...`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tous</SelectItem>
                    {filter.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {filter.type === 'date' && (
                <Input
                  id={filter.key}
                  type="date"
                  value={values[filter.key] || ''}
                  onChange={(e) => handleChange(filter.key, e.target.value)}
                />
              )}
              {filter.type === 'boolean' && (
                <Select
                  value={
                    values[filter.key] === undefined
                      ? 'ALL'
                      : values[filter.key]
                        ? 'true'
                        : 'false'
                  }
                  onValueChange={(value) =>
                    handleChange(
                      filter.key,
                      value === 'ALL' ? undefined : value === 'true'
                    )
                  }
                >
                  <SelectTrigger id={filter.key}>
                    <SelectValue placeholder={filter.placeholder || `Sélectionner ${filter.label.toLowerCase()}...`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tous</SelectItem>
                    <SelectItem value="true">Oui</SelectItem>
                    <SelectItem value="false">Non</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



