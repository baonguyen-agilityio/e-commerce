import { AppDataSource } from '../config/database';
import { Category } from '../modules/category/entities/Category';
import { Product } from '../modules/product/entities/Product';

const categories = [
  { name: 'Electronics', description: 'Electronic devices and gadgets' },
  { name: 'Clothing', description: 'Fashion and apparel' },
  { name: 'Books', description: 'Books and literature' },
  { name: 'Home & Garden', description: 'Home decor and garden supplies' },
  { name: 'Sports', description: 'Sports equipment and accessories' },
];

const products = [
  // Electronics
  { name: 'iPhone 15 Pro', description: 'Latest Apple smartphone with A17 chip', price: 999.99, stock: 50, imageUrl: 'https://picsum.photos/seed/iphone/400/400', categoryIndex: 0 },
  { name: 'MacBook Air M3', description: '13-inch laptop with M3 chip', price: 1299.99, stock: 30, imageUrl: 'https://picsum.photos/seed/macbook/400/400', categoryIndex: 0 },
  { name: 'Sony WH-1000XM5', description: 'Noise cancelling wireless headphones', price: 349.99, stock: 100, imageUrl: 'https://picsum.photos/seed/headphones/400/400', categoryIndex: 0 },
  { name: 'Samsung 4K TV 55"', description: 'Smart TV with Crystal UHD display', price: 599.99, stock: 25, imageUrl: 'https://picsum.photos/seed/tv/400/400', categoryIndex: 0 },
  
  // Clothing
  { name: 'Nike Air Max 90', description: 'Classic running shoes', price: 129.99, stock: 200, imageUrl: 'https://picsum.photos/seed/nike/400/400', categoryIndex: 1 },
  { name: 'Levi\'s 501 Jeans', description: 'Original fit denim jeans', price: 79.99, stock: 150, imageUrl: 'https://picsum.photos/seed/jeans/400/400', categoryIndex: 1 },
  { name: 'North Face Jacket', description: 'Waterproof winter jacket', price: 199.99, stock: 75, imageUrl: 'https://picsum.photos/seed/jacket/400/400', categoryIndex: 1 },
  
  // Books
  { name: 'Clean Code', description: 'A Handbook of Agile Software Craftsmanship by Robert C. Martin', price: 39.99, stock: 500, imageUrl: 'https://picsum.photos/seed/cleancode/400/400', categoryIndex: 2 },
  { name: 'The Pragmatic Programmer', description: 'Your Journey to Mastery by David Thomas', price: 49.99, stock: 300, imageUrl: 'https://picsum.photos/seed/pragmatic/400/400', categoryIndex: 2 },
  { name: 'Design Patterns', description: 'Elements of Reusable Object-Oriented Software', price: 54.99, stock: 200, imageUrl: 'https://picsum.photos/seed/patterns/400/400', categoryIndex: 2 },
  
  // Home & Garden
  { name: 'Dyson V15 Vacuum', description: 'Cordless vacuum cleaner with laser detection', price: 749.99, stock: 40, imageUrl: 'https://picsum.photos/seed/dyson/400/400', categoryIndex: 3 },
  { name: 'IKEA MALM Bed Frame', description: 'Queen size bed frame in white', price: 249.99, stock: 60, imageUrl: 'https://picsum.photos/seed/bed/400/400', categoryIndex: 3 },
  { name: 'Philips Hue Starter Kit', description: 'Smart LED bulbs with bridge', price: 179.99, stock: 120, imageUrl: 'https://picsum.photos/seed/hue/400/400', categoryIndex: 3 },
  
  // Sports
  { name: 'Yoga Mat Pro', description: 'Non-slip exercise mat 6mm thick', price: 49.99, stock: 300, imageUrl: 'https://picsum.photos/seed/yoga/400/400', categoryIndex: 4 },
  { name: 'Dumbbell Set 20kg', description: 'Adjustable dumbbell pair', price: 149.99, stock: 80, imageUrl: 'https://picsum.photos/seed/dumbbell/400/400', categoryIndex: 4 },
  { name: 'Wilson Tennis Racket', description: 'Professional grade tennis racket', price: 189.99, stock: 50, imageUrl: 'https://picsum.photos/seed/tennis/400/400', categoryIndex: 4 },
];

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const categoryRepo = AppDataSource.getRepository(Category);
    const productRepo = AppDataSource.getRepository(Product);

    const savedCategories = await categoryRepo.save(categories);

    const productsToSave = products.map((p) => ({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      imageUrl: p.imageUrl,
      categoryId: savedCategories[p.categoryIndex].id,
      isActive: true,
    }));

    await productRepo.save(productsToSave);

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

seed();