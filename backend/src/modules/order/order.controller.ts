import { Request, Response } from "express";
import { IOrderService, OrderQueryParams } from "./order.interface";
import { getAuthContext } from "@shared/dtos/AuthContext";

export class OrderController {
  constructor(private orderService: IOrderService) { }

  checkoutOrder = async (req: Request, res: Response) => {
    const authContext = getAuthContext(req);
    const { paymentMethodId } = req.body;
    const result = await this.orderService.checkoutOrder(
      authContext.userId,
      paymentMethodId,
    );
    res.status(200).json(result);
  };

  getOrders = async (req: Request, res: Response): Promise<void> => {
    const result = await this.orderService.getOrders(req.query as unknown as OrderQueryParams);
    res.status(200).json(result);
  };

  getOrdersByUser = async (req: Request, res: Response): Promise<void> => {
    const authContext = getAuthContext(req);
    const result = await this.orderService.getOrdersByUser(authContext.userId, req.query as unknown as OrderQueryParams);
    res.status(200).json(result);
  };

  getOrderById = async (req: Request, res: Response): Promise<void> => {
    const authContext = getAuthContext(req);
    const publicId = req.params.orderId;
    const result = await this.orderService.getOrderById(
      publicId,
      authContext.userId,
      authContext.role,
    );

    res.status(200).json(result);
  };
}
