const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
});

const products = [
  {
    id: 1,
    name: "Glass Shine",
    price: 4000,
    stock_quantity: 50,
    description: "Soft clear with subtle shimmer for an effortless glow",
    image_url: "https://mauve-five.vercel.app/mauve-lip-gloss-tube-luxury.jpg",
  },
  {
    id: 2,
    name: "Soft Crush",
    price: 4000,
    stock_quantity: 50,
    description: "pink with velvety finish for timeless elegance",
    image_url:
      "https://mauve-five.vercel.app/nude-lip-gloss-luxury-product.jpg",
  },
  {
    id: 3,
    name: "Cocoa Charm",
    price: 4000,
    stock_quantity: 50,
    description: "chocolate gloss with high-shine finish",
    image_url: "https://mauve-five.vercel.app/clear-glass-lip-gloss-luxury.jpg",
  },
  {
    id: 4,
    name: "Mauve Balm",
    price: 3000,
    stock_quantity: 50,
    description:
      "A rich, glossy balm that keeps your lips soft, smooth, and glow-ready all day.",
    image_url: "https://mauve-five.vercel.app/clear-glass-lip-gloss-luxury.jpg",
  },
  {
    id: 5,
    name: "Mauve Scrub",
    price: 3000,
    stock_quantity: 50,
    description:
      "This all-natural scrub removes dead skin while locking in moisture",
    image_url: "https://mauve-five.vercel.app/clear-glass-lip-gloss-luxury.jpg",
  },
];

async function addProducts() {
  try {
    console.log("Adding products with specific IDs...");

    for (const product of products) {
      const result = await pool.query(
        `INSERT INTO products (id, name, price, stock_quantity, description, image_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           name = $2,
           price = $3,
           stock_quantity = $4,
           description = $5,
           image_url = $6
         RETURNING id, name`,
        [
          product.id,
          product.name,
          product.price,
          product.stock_quantity,
          product.description,
          product.image_url,
        ]
      );
      console.log(
        ` Added/Updated: ${result.rows[0].name} (ID: ${result.rows[0].id})`
      );
    }

    await pool.query(
      `SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))`
    );

    console.log("\n All products added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error adding products:", error);
    process.exit(1);
  }
}

addProducts();
