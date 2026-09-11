import express, { type Express, type Request, type Response } from 'express';
import {equipmentRouter} from './routes/equipment.route.ts'
import { cleaningRecordRouter } from './routes/cleaning-record.route.ts';

export const app: Express = express();

app.use(express.json());
app.use("/api/equipment", equipmentRouter);
app.use("/api/cleaning-records", cleaningRecordRouter);
