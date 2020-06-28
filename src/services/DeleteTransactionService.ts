import { getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

interface RequestDTO {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: RequestDTO): Promise<void> {
    if (!id) throw new AppError('Transaction id is required');
    const transactionRepository = getRepository(Transaction);
    await transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
