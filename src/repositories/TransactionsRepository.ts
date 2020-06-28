import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface RequestDTO {
  transactions: Transaction[] | null;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance({ transactions }: RequestDTO): Promise<Balance> {
    let arrayTransactions = transactions;
    if (!arrayTransactions) {
      const transactionsRepository = getRepository(Transaction);
      arrayTransactions = await transactionsRepository.find();
    }

    const income = arrayTransactions
      .filter(item => item.type === 'income')
      .reduce((acc, { value }) => acc + value, 0);

    const outcome = arrayTransactions
      .filter(item => item.type === 'outcome')
      .reduce((acc, { value }) => acc + value, 0);

    const total = income - outcome;

    return {
      income,
      outcome,
      total,
    };
  }
}

export default TransactionsRepository;
