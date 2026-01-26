import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler";
import { IOrderService } from "./order.interface";
import { getAuthContext } from "../../shared/dtos/AuthContext";

export class OrderController {
  constructor(private orderService: IOrderService) {}
  checkoutOrder = asyncHandler(async (req: Request, res: Response) => {
    const authContext = getAuthContext(req);
    const { paymentMethodId } = req.body;
    const result = await this.orderService.checkoutOrder(
      authContext.userId,
      paymentMethodId,
    );
    res.status(200).json(result);
  });

  getOrders = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const result = await this.orderService.getOrders({ page, limit, search });
    res.status(200).json(result);
  });

  getOrdersByUser = asyncHandler(async (req: Request, res: Response) => {
    const authContext = getAuthContext(req);
    const result = await this.orderService.getOrdersByUser(authContext.userId);
    res.status(200).json(result);
  });

  getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const authContext = getAuthContext(req);
    const orderId = parseInt(req.params.orderId, 10);
    const result = await this.orderService.getOrderById(
      orderId,
      authContext.userId,
      authContext.role,
    );

    res.status(200).json(result);
  });
}
