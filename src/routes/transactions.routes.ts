import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import path from 'path';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp');

const transactionsRouter = Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: tmpFolder,
    filename(request, file, callback) {
      return callback(null, file.originalname);
    },
  }),
});

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance({ transactions });
  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();
  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  let { id } = request.params;
  id = String(id);

  const deleteTransaction = new DeleteTransactionService();
  await deleteTransaction.execute({ id });

  return response.status(204).json({});
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { file } = request;

    const importTransaction = new ImportTransactionsService();

    const imports = await importTransaction.execute({
      filename: file.filename,
    });
    return response.json(imports);
  },
);

export default transactionsRouter;
