'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { ItemCarrinho, Produto } from '@/types';

interface CartContextType {
  itens: ItemCarrinho[];
  adicionarItem: (produto: Produto, quantidade: number, observacao?: string) => void;
  removerItem: (produtoId: number) => void;
  atualizarQuantidade: (produtoId: number, quantidade: number) => void;
  atualizarObservacao: (produtoId: number, observacao: string) => void;
  limparCarrinho: () => void;
  total: number;
  quantidadeItens: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  // Carregar carrinho do localStorage ao montar
  useEffect(() => {
    const savedCart = localStorage.getItem('carrinho');
    if (savedCart) {
      try {
        setItens(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem('carrinho');
      }
    }
  }, []);

  // Salvar carrinho no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('carrinho', JSON.stringify(itens));
  }, [itens]);

  const adicionarItem = (produto: Produto, quantidade: number, observacao?: string) => {
    setItens((prev) => {
      const existingItem = prev.find((item) => item.produto.id === produto.id);
      if (existingItem) {
        return prev.map((item) =>
          item.produto.id === produto.id
            ? { ...item, quantidade: item.quantidade + quantidade, observacao: observacao || item.observacao }
            : item
        );
      }
      return [...prev, { produto, quantidade, observacao }];
    });
  };

  const removerItem = (produtoId: number) => {
    setItens((prev) => prev.filter((item) => item.produto.id !== produtoId));
  };

  const atualizarQuantidade = (produtoId: number, quantidade: number) => {
    if (quantidade <= 0) {
      removerItem(produtoId);
      return;
    }
    setItens((prev) =>
      prev.map((item) =>
        item.produto.id === produtoId ? { ...item, quantidade } : item
      )
    );
  };

  const atualizarObservacao = (produtoId: number, observacao: string) => {
    setItens((prev) =>
      prev.map((item) =>
        item.produto.id === produtoId ? { ...item, observacao } : item
      )
    );
  };

  const limparCarrinho = () => {
    setItens([]);
    localStorage.removeItem('carrinho');
  };

  const total = itens.reduce(
    (acc, item) => acc + item.produto.preco * item.quantidade,
    0
  );

  const quantidadeItens = itens.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <CartContext.Provider
      value={{
        itens,
        adicionarItem,
        removerItem,
        atualizarQuantidade,
        atualizarObservacao,
        limparCarrinho,
        total,
        quantidadeItens,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}

