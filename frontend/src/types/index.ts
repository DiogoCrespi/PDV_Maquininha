// Tipos principais da aplicação

export interface Usuario {
  id: number;
  nome: string;
  usuario: string;
  tipo: string;
  pos?: PontoVenda;
}

export interface PontoVenda {
  id: number;
  nome: string;
  descricao?: string;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
  ordem?: number;
  ativo: boolean;
}

export interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  categoria_id: number;
  categoria_nome?: string;
  imagem?: string;
  ativo: boolean;
}

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  observacao?: string;
}

export interface Pedido {
  id: number;
  numero_mesa?: number | null;
  valor_total: number;
  status: string;
  pago: number; // 0 ou 1
  criado_em: string;
  usuario_id?: number;
  pos_id?: number;
  usuario_nome?: string;
  itens?: ItemPedido[];
}

export interface ItemPedido {
  id: number;
  produto_id: number;
  produto_nome: string;
  quantidade: number;
  preco_unitario: number;
  observacao?: string;
}

export interface Cartao {
  id: string;
  nome_cliente: string;
  saldo: number;
  status: 'ativo' | 'inativo' | 'cancelado';
  created_at: string;
  data_expiracao?: string;
}

export interface Transacao {
  id: number;
  cartao_id: string;
  tipo: 'pagamento' | 'recarga' | 'devolucao' | 'ativacao' | 'cancelamento';
  valor: number;
  pedido_id?: number;
  saldo_anterior?: number;
  saldo_posterior?: number;
  descricao?: string;
  nome_cliente?: string;
  numero_mesa?: string;
  pedido_valor?: number;
  criado_em: string;
  created_at?: string; // Alias para compatibilidade
}

