import { OrderEmailData } from "../../../interfaces/IEmailService";

export function renderOrderConfirmationEmail(data: OrderEmailData) {
  const { order, customer } = data;
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background-color: #f9fafb;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white;
    }
    .header { 
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white; 
      padding: 40px 20px; 
      text-align: center;
    }
    .header h1 { margin: 0 0 10px 0; font-size: 28px; }
    .header p { margin: 0; font-size: 16px; opacity: 0.95; }
    .content { padding: 40px 20px; }
    .order-info { 
      background: #f9fafb; 
      padding: 20px; 
      border-radius: 8px; 
      margin: 20px 0;
    }
    .order-info h2 { 
      margin: 0 0 10px 0; 
      font-size: 20px; 
      color: #111827;
    }
    .order-info p { 
      margin: 5px 0; 
      color: #6b7280; 
      font-size: 14px;
    }
    .items { margin: 30px 0; }
    .item { 
      border-bottom: 1px solid #e5e7eb; 
      padding: 15px 0;
      display: flex;
      justify-content: space-between;
    }
    .item:last-child { border-bottom: none; }
    .item-name { 
      font-weight: 600; 
      color: #111827; 
      font-size: 15px;
    }
    .item-details { 
      color: #6b7280; 
      font-size: 14px; 
      margin-top: 5px;
    }
    .item-price { 
      font-weight: 600; 
      color: #111827;
      text-align: right;
    }
    .total { 
      background: #f0fdf4; 
      padding: 20px; 
      border-radius: 8px; 
      margin: 20px 0;
      text-align: right;
    }
    .total-label { 
      font-size: 16px; 
      color: #059669; 
      margin-bottom: 5px;
    }
    .total-amount { 
      font-size: 32px; 
      font-weight: bold; 
      color: #047857;
      margin: 0;
    }
    .footer { 
      background: #f9fafb; 
      padding: 30px 20px; 
      text-align: center; 
      color: #6b7280;
      font-size: 14px;
    }
    .footer a { color: #10b981; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌿 Order Confirmed!</h1>
      <p>Thank you for your order, ${customer.name}!</p>
    </div>
    
    <div class="content">
      <div class="order-info">
        <h2>Order #${order.id}</h2>
        <p>Order Date: ${orderDate}</p>
        <p>Payment ID: ${order.paymentId}</p>
      </div>
      
      <div class="items">
        <h3 style="margin: 0 0 15px 0; color: #111827;">Order Items</h3>
        ${order.items.map(item => {
    const subtotal = item.quantity * Number(item.priceAtPurchase);
    return `
            <div class="item">
              <div>
                <div class="item-name">${item.product.name}</div>
                <div class="item-details">
                  Quantity: ${item.quantity} × $${Number(item.priceAtPurchase).toFixed(2)}
                </div>
              </div>
              <div class="item-price">
                $${subtotal.toFixed(2)}
              </div>
            </div>
          `;
  }).join('')}
      </div>
      
      <div class="total">
        <div class="total-label">Total Amount</div>
        <div class="total-amount">$${Number(order.total).toFixed(2)}</div>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        Your order has been confirmed and will be processed shortly. 
        You'll receive another email when your order ships.
      </p>
    </div>
    
    <div class="footer">
      <p>Questions? Contact us at <a href="mailto:support@greenhaven.com">support@greenhaven.com</a></p>
      <p style="margin-top: 10px;">© 2026 GreenHaven. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
  return {
    subject: `Order Confirmation #${order.id} - GreenHaven`,
    html,
  };
}