'use client';

import { ReactNode } from 'react';
import Badge from './Badge';

interface PrintStatusProps {
  sucesso: boolean;
  mensagem?: string;
  className?: string;
}

export default function PrintStatus({ sucesso, mensagem, className = '' }: PrintStatusProps) {
  if (sucesso) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="success" size="sm">
          ✓ Impresso
        </Badge>
        {mensagem && <span className="text-sm text-green-700">{mensagem}</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="danger" size="sm">
        ⚠ Erro
      </Badge>
      {mensagem && <span className="text-sm text-red-700">{mensagem}</span>}
    </div>
  );
}

