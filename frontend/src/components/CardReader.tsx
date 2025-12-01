'use client';

import { useState, useEffect, useRef } from 'react';
import Input from './Input';
import Button from './Button';
import Loading from './Loading';

interface CardReaderProps {
  onCardRead: (cardId: string) => void;
  loading?: boolean;
  error?: string | null;
}

export default function CardReader({ onCardRead, loading = false, error }: CardReaderProps) {
  const [cardId, setCardId] = useState('');
  const [isReading, setIsReading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Simular leitura automática (quando implementar leitor físico, será aqui)
  useEffect(() => {
    // Focar no input quando o componente montar
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleManualInput = (value: string) => {
    setCardId(value);
    // Se o valor tiver um tamanho mínimo (ex: 8 caracteres), pode auto-submeter
    // Por enquanto, vamos deixar manual
  };

  const handleReadCard = () => {
    if (!cardId.trim()) {
      return;
    }
    setIsReading(true);
    // Simular delay de leitura
    setTimeout(() => {
      onCardRead(cardId.trim());
      setIsReading(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleReadCard();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Input
          ref={inputRef}
          label="ID do Cartão"
          type="text"
          value={cardId}
          onChange={(e) => handleManualInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Passe o cartão ou digite o ID"
          disabled={loading || isReading}
          error={error || undefined}
        />
        <p className="text-xs text-gray-500 mt-1">
          Passe o cartão no leitor ou digite o ID manualmente
        </p>
      </div>

      <Button
        variant="primary"
        onClick={handleReadCard}
        isLoading={loading || isReading}
        disabled={!cardId.trim() || loading || isReading}
        className="w-full"
      >
        {isReading ? 'Lendo cartão...' : 'Buscar Cartão'}
      </Button>
    </div>
  );
}

