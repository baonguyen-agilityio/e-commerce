import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler";
import { IOrderService } from "./order.interface";

export class OrderController {
  constructor(private orderService: IOrderService) {}
  checkoutOrder = asyncHandler(async (req: Request, res: Response) => {
    const auth = req.auth!;
    const result = await this.orderService.checkoutOrder(auth.userId!);
    res.status(200).json(result);
  });

  getOrders = asyncHandler(async (req: Request, res: Response) => {
    const auth = req.auth!;
    const result = await this.orderService.getOrders(auth.userId!, auth.role!);
    res.status(200).json(result);
  });

  getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const auth = req.auth!;
    const orderId = parseInt(req.params.orderId, 10);
    const result = await this.orderService.getOrderById(orderId, auth.userId!, auth.role!);

    res.status(200).json(result);
  });
}
