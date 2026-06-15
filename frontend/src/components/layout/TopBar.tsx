import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopBarProps {
  title: string;
  back?: boolean;
  right?: React.ReactNode;
  className?: string;
}

export function TopBar({ title, back, right, className }: TopBarProps) {
  const navigate = useNavigate();
  return (
    <header
      className={cn(
        'sticky top-0 z-10 bg-surface/95 backdrop-blur border-b border-border',
        'flex items-center gap-2 px-4 h-14',
        className,
      )}
    >
      {back && (
        <button
          type="button"
          aria-label="Voltar"
          onClick={() => navigate(-1)}
          className="-ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <h1 className="flex-1 text-lg font-bold truncate">{title}</h1>
      {right && <div className="flex items-center gap-1">{right}</div>}
    </header>
  );
}
