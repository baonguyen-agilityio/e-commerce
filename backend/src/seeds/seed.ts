import { faker } from '@faker-js/faker';
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

const categoryKeywords: Record<string, string> = {
  'Electronics': 'technics',
  'Clothing': 'fashion',
  'Books': 'books',
  'Home & Garden': 'nature',
  'Sports': 'sports',
};

function generateProducts(count: number, savedCategories: { id: number; name: string }[]) {
  return Array.from({ length: count }, () => {
    const categoryIndex = faker.number.int({ min: 0, max: savedCategories.length - 1 });
    const category = savedCategories[categoryIndex];
    const keyword = categoryKeywords[category.name] || 'abstract';

    return {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 10, max: 1000, dec: 2 })),
      stock: faker.number.int({ min: 0, max: 500 }),
      imageUrl: faker.image.urlLoremFlickr({ category: keyword, width: 400, height: 400 }),
      categoryIndex,
    };
  });
}

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const categoryRepo = AppDataSource.getRepository(Category);
    const productRepo = AppDataSource.getRepository(Product);

    console.log('Clearing existing data...');
    await productRepo.createQueryBuilder().delete().execute();
    await categoryRepo.createQueryBuilder().delete().execute();
    console.log('Data cleared');

    const savedCategories = await categoryRepo.save(categories);

    const products = generateProducts(50, savedCategories);

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
    console.log(`Seeded ${productsToSave.length} products`);

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();