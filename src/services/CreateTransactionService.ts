import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    if (type === 'outcome') {
      const balance = await transactionRepository.getBalance({
        transactions: null,
      });
      if (value > balance.total)
        throw new AppError('Despesa maior que o caixa da empresa.');
    }

    const categoryRepository = getRepository(Category);

    const categoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    let category_id = categoryExists ? categoryExists.id : null;

    if (!categoryExists) {
      const categoryNew = categoryRepository.create({
        title: category,
      });

      const { id } = await categoryRepository.save(categoryNew);

      category_id = id;
    }

    if (!category_id) throw new AppError('Error in get category.');
    if (!type) throw new AppError('Field type is required.');

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
