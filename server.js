const express = require("express");
const { Pool } = require("pg");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "https://your-frontend-domain.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Mauve Beauty Backend API",
    status: "Server is running successfully",
  });
});

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function generateOrderCode() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `MAUVE-${timestamp}-${random}`;
}

function calculateDeliveryFee(location) {
  const locationLower = location.toLowerCase();

  if (locationLower.includes("futa")) return 0;

  if (locationLower.includes("akure")) return 1000;
  if (locationLower.includes("ondo")) return 2000;

  if (locationLower.includes("ekiti")) return 3000;
  if (
    locationLower.includes("osun") ||
    locationLower.includes("oshogbo") ||
    locationLower.includes("ile-ife")
  )
    return 4000;
  if (
    locationLower.includes("oyo") ||
    locationLower.includes("ibadan") ||
    locationLower.includes("ogbomoso")
  )
    return 4500;
  if (
    locationLower.includes("ogun") ||
    locationLower.includes("abeokuta") ||
    locationLower.includes("ijebu")
  )
    return 5000;
  if (locationLower.includes("lagos")) return 6000;

  if (locationLower.includes("edo") || locationLower.includes("benin"))
    return 6000;
  if (
    locationLower.includes("delta") ||
    locationLower.includes("warri") ||
    locationLower.includes("asaba")
  )
    return 7000;
  if (
    locationLower.includes("rivers") ||
    locationLower.includes("port harcourt")
  )
    return 8000;
  if (locationLower.includes("bayelsa") || locationLower.includes("yenagoa"))
    return 8000;
  if (locationLower.includes("akwa ibom") || locationLower.includes("uyo"))
    return 8500;
  if (
    locationLower.includes("cross river") ||
    locationLower.includes("calabar")
  )
    return 9000;

  if (
    locationLower.includes("anambra") ||
    locationLower.includes("awka") ||
    locationLower.includes("onitsha")
  )
    return 7000;
  if (locationLower.includes("enugu")) return 7500;
  if (locationLower.includes("ebonyi") || locationLower.includes("abakaliki"))
    return 7500;
  if (locationLower.includes("imo") || locationLower.includes("owerri"))
    return 8000;
  if (
    locationLower.includes("abia") ||
    locationLower.includes("umuahia") ||
    locationLower.includes("aba")
  )
    return 8000;

  if (locationLower.includes("kogi") || locationLower.includes("lokoja"))
    return 6000;
  if (locationLower.includes("kwara") || locationLower.includes("ilorin"))
    return 5000;
  if (locationLower.includes("abuja") || locationLower.includes("fct"))
    return 8000;
  if (locationLower.includes("nasarawa") || locationLower.includes("lafia"))
    return 8500;
  if (locationLower.includes("benue") || locationLower.includes("makurdi"))
    return 9000;
  if (locationLower.includes("plateau") || locationLower.includes("jos"))
    return 9000;
  if (locationLower.includes("niger") || locationLower.includes("minna"))
    return 8000;

  if (locationLower.includes("kaduna")) return 10000;
  if (locationLower.includes("kano")) return 12000;
  if (locationLower.includes("katsina")) return 12000;
  if (locationLower.includes("sokoto")) return 12000;
  if (locationLower.includes("zamfara") || locationLower.includes("gusau"))
    return 11000;
  if (locationLower.includes("kebbi") || locationLower.includes("birnin kebbi"))
    return 12000;
  if (locationLower.includes("jigawa") || locationLower.includes("dutse"))
    return 12000;

  if (locationLower.includes("bauchi")) return 10000;
  if (locationLower.includes("gombe")) return 11000;
  if (locationLower.includes("taraba") || locationLower.includes("jalingo"))
    return 11000;
  if (locationLower.includes("adamawa") || locationLower.includes("yola"))
    return 12000;
  if (locationLower.includes("borno") || locationLower.includes("maiduguri"))
    return 13000;
  if (locationLower.includes("yobe") || locationLower.includes("damaturu"))
    return 13000;

  return 8000;
}

async function sendOrderConfirmationEmail(orderDetails) {
  const {
    customer_email,
    customer_name,
    order_code,
    products_total,
    delivery_fee,
    total_amount,
    status,
    items,
    delivery_address,
  } = orderDetails;

  const itemsList = items
    .map(
      (item) =>
        `<tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
        item.product_name
      }</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
        item.quantity
      }</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">₦${parseFloat(
        item.product_price
      ).toLocaleString()}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">₦${parseFloat(
        item.subtotal
      ).toLocaleString()}</td>
    </tr>`
    )
    .join("");

  const mailOptions = {
    from: `"Mauve Beauty" <${process.env.EMAIL_USER}>`,
    to: customer_email,
    subject: `Order Confirmation - ${order_code}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #8B7BA8; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .order-info { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background-color: #8B7BA8; color: white; padding: 10px; text-align: left; }
          .total-row { font-weight: bold; background-color: #f0f0f0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Mauve Beauty</h1>
            <p>Thank you for your order!</p>
          </div>
          
          <div class="content">
            <h2>Hello ${customer_name},</h2>
            <p>Your order has been received and is ${
              status === "paid" ? "confirmed" : "awaiting payment"
            }.</p>
            
            <div class="order-info">
              <h3>Order Details</h3>
              <p><strong>Order Code:</strong> ${order_code}</p>
              <p><strong>Status:</strong> ${status
                .replace("_", " ")
                .toUpperCase()}</p>
              <p><strong>Delivery Address:</strong> ${delivery_address}</p>
            </div>
            
            <h3>Order Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
                <tr>
                  <td colspan="3" style="padding: 8px; text-align: right;"><strong>Products Total:</strong></td>
                  <td style="padding: 8px;"><strong>₦${parseFloat(
                    products_total
                  ).toLocaleString()}</strong></td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 8px; text-align: right;"><strong>Delivery Fee:</strong></td>
                  <td style="padding: 8px;"><strong>₦${parseFloat(
                    delivery_fee
                  ).toLocaleString()}</strong></td>
                </tr>
                <tr class="total-row">
                  <td colspan="3" style="padding: 12px; text-align: right; font-size: 18px;">TOTAL AMOUNT:</td>
                  <td style="padding: 12px; font-size: 18px;">₦${parseFloat(
                    total_amount
                  ).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            
            ${
              status === "pending_payment"
                ? `
            <div class="order-info" style="background-color: #fff3cd; border-left: 4px solid #ffc107;">
              <h3>Payment Instructions</h3>
              <p>Please transfer <strong>₦${parseFloat(
                total_amount
              ).toLocaleString()}</strong> to:</p>
              <p><strong>Bank:</strong> Access Bank<br>
              <strong>Account Number:</strong> 1234567890<br>
              <strong>Account Name:</strong> Mauve Beauty</p>
              <p><strong>Reference:</strong> ${order_code}</p>
              <p style="color: #856404;">After payment, your order will be processed within 24 hours.</p>
            </div>
            `
                : `
            <div class="order-info" style="background-color: #d4edda; border-left: 4px solid #28a745;">
              <h3>✓ Payment Confirmed</h3>
              <p>Your payment has been received and confirmed. We'll process your order shortly!</p>
            </div>
            `
            }
            
            <p>You can track your order anytime using your order code: <strong>${order_code}</strong></p>
          </div>
          
          <div class="footer">
            <p>Need help? Contact us at support@mauvebeauty.com</p>
            <p>&copy; 2024 Mauve Beauty. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${customer_email}`);
  } catch (error) {
    console.error("Email send error:", error);
  }
}

app.post("/api/orders", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      delivery_location,
      items,
    } = req.body;

    if (
      !customer_name ||
      !customer_email ||
      !customer_phone ||
      !delivery_address ||
      !delivery_location ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const delivery_fee = calculateDeliveryFee(delivery_location);

    let products_total = 0;
    const orderItems = [];

    for (const item of items) {
      const productResult = await client.query(
        "SELECT id, name, price, stock_quantity FROM products WHERE id = $1",
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        throw new Error(`Product with ID ${item.product_id} not found`);
      }

      const product = productResult.rows[0];

      if (product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const subtotal = product.price * item.quantity;
      products_total += subtotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        quantity: item.quantity,
        subtotal,
      });
    }

    const total_amount = products_total + delivery_fee;
    const order_code = generateOrderCode();

    const orderResult = await client.query(
      `INSERT INTO orders (order_code, customer_name, customer_email, customer_phone, 
       delivery_address, delivery_location, delivery_fee, products_total, total_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending_payment')
       RETURNING *`,
      [
        order_code,
        customer_name,
        customer_email,
        customer_phone,
        delivery_address,
        delivery_location,
        delivery_fee,
        products_total,
        total_amount,
      ]
    );

    const order = orderResult.rows[0];

    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          order.id,
          item.product_id,
          item.product_name,
          item.product_price,
          item.quantity,
          item.subtotal,
        ]
      );

      await client.query(
        "UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2",
        [item.quantity, item.product_id]
      );
    }

    await client.query("COMMIT");

    try {
      await sendOrderConfirmationEmail({
        ...order,
        items: orderItems,
      });
    } catch (emailError) {
      console.error("Failed to send email, but order was created:", emailError);
    }

    res.status(201).json({
      message: "Order created successfully",
      order: {
        order_code: order.order_code,
        total_amount: order.total_amount,
        delivery_fee: order.delivery_fee,
        products_total: order.products_total,
        status: order.status,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Order creation error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.post("/api/admin/orders/:orderCode/confirm-payment", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { orderCode } = req.params;
    const { verified_by, notes } = req.body;

    const orderResult = await client.query(
      "SELECT * FROM orders WHERE order_code = $1",
      [orderCode]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderResult.rows[0];

    if (order.status === "paid") {
      return res.status(400).json({ error: "Order already paid" });
    }

    await client.query(
      "UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      ["paid", order.id]
    );

    await client.query(
      `INSERT INTO payments (order_id, payment_method, amount, payment_status, verified_by, verified_at, notes)
       VALUES ($1, 'bank_transfer', $2, 'confirmed', $3, CURRENT_TIMESTAMP, $4)`,
      [order.id, order.total_amount, verified_by || "admin", notes]
    );

    await client.query("COMMIT");

    const itemsResult = await client.query(
      "SELECT * FROM order_items WHERE order_id = $1",
      [order.id]
    );

    try {
      await sendOrderConfirmationEmail({
        ...order,
        status: "paid",
        items: itemsResult.rows,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    res.json({
      message: "Payment confirmed successfully",
      order_code: order.order_code,
      status: "paid",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Payment confirmation error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.get("/api/orders/track/:orderCode", async (req, res) => {
  try {
    const { orderCode } = req.params;

    const orderResult = await pool.query(
      `SELECT o.*, 
        json_agg(json_build_object(
          'product_name', oi.product_name,
          'quantity', oi.quantity,
          'price', oi.product_price,
          'subtotal', oi.subtotal
        )) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.order_code = $1
       GROUP BY o.id`,
      [orderCode]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderResult.rows[0];

    res.json({
      order_code: order.order_code,
      customer_name: order.customer_name,
      delivery_address: order.delivery_address,
      delivery_location: order.delivery_location,
      products_total: order.products_total,
      delivery_fee: order.delivery_fee,
      total_amount: order.total_amount,
      status: order.status,
      items: order.items,
      created_at: order.created_at,
      updated_at: order.updated_at,
    });
  } catch (error) {
    console.error("Order tracking error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/admin/orders/:orderCode/status", async (req, res) => {
  try {
    const { orderCode } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending_payment",
      "paid",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const result = await pool.query(
      "UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_code = $2 RETURNING *",
      [status, orderCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      message: "Order status updated",
      order_code: orderCode,
      status,
    });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/orders", async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM orders";
    const params = [];

    if (status) {
      query += " WHERE status = $1";
      params.push(status);
    }

    query +=
      " ORDER BY created_at DESC LIMIT $" +
      (params.length + 1) +
      " OFFSET $" +
      (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      orders: result.rows,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Orders fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mauve Backend running on port ${PORT}`);
});
