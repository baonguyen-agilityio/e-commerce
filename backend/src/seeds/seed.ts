import { AppDataSource } from "../config/database";
import { Category } from "../modules/category/entities/Category";
import { Product } from "../modules/product/entities/Product";
import { PLANT_CATALOG, PlantProductSeed } from "./data/plants";

type SeedMode = "upsert" | "wipe" | "skip_if_not_empty";

const DEFAULT_PRODUCT_COUNT = 50;
const DEFAULT_USD_EXCHANGE_RATE = 25000;
const VALID_SEED_MODES: SeedMode[] = ["upsert", "wipe", "skip_if_not_empty"];

interface SeedStats {
  categoriesCreated: number;
  categoriesUpdated: number;
  productsCreated: number;
  productsUpdated: number;
  productsSkipped: number;
}

function parseSeedMode(): SeedMode {
  const rawMode = (process.env.SEED_MODE || process.argv[2] || "upsert").trim();
  if (VALID_SEED_MODES.includes(rawMode as SeedMode)) {
    return rawMode as SeedMode;
  }

  console.warn(
    `[seed] Invalid SEED_MODE "${rawMode}", fallback to "upsert". Valid values: ${VALID_SEED_MODES.join(", ")}`,
  );
  return "upsert";
}

function parseProductCount(): number {
  const rawCount = process.env.SEED_PRODUCT_COUNT?.trim();
  if (!rawCount) return DEFAULT_PRODUCT_COUNT;

  const parsed = Number(rawCount);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    console.warn(
      `[seed] Invalid SEED_PRODUCT_COUNT "${rawCount}", fallback to ${DEFAULT_PRODUCT_COUNT}.`,
    );
    return DEFAULT_PRODUCT_COUNT;
  }

  return Math.floor(parsed);
}

function parseUsdExchangeRate(): number {
  const rawRate = process.env.SEED_USD_EXCHANGE_RATE?.trim();
  if (!rawRate) return DEFAULT_USD_EXCHANGE_RATE;

  const parsed = Number(rawRate);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    console.warn(
      `[seed] Invalid SEED_USD_EXCHANGE_RATE "${rawRate}", fallback to ${DEFAULT_USD_EXCHANGE_RATE}.`,
    );
    return DEFAULT_USD_EXCHANGE_RATE;
  }

  return parsed;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stableNumericHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildImageQuery(categoryName: string, productName: string): string {
  const words = slugify(`${productName} ${categoryName}`)
    .split("-")
    .filter((word) => word.length > 2)
    .slice(0, 5);

  const tags = Array.from(new Set(["plant", ...words]));
  return tags.join(",");
}

function buildImageUrl(categoryName: string, productName: string): string {
  const signature = stableNumericHash(`${categoryName}-${productName}`) % 100000;
  const query = buildImageQuery(categoryName, productName);
  return `https://loremflickr.com/400/400/${query}?lock=${signature}`;
}

function normalizeUsdPrice(value: number, exchangeRate: number): number {
  const usdValue = value > 1000 ? value / exchangeRate : value;
  return Number(usdValue.toFixed(2));
}

function selectProducts(limit: number): Array<{
  categoryName: string;
  product: PlantProductSeed;
}> {
  const flattened = PLANT_CATALOG.flatMap((category) =>
    category.products.map((product) => ({
      categoryName: category.name,
      product,
    })),
  );

  return flattened.slice(0, Math.max(0, limit));
}

async function seed(): Promise<void> {
  const mode = parseSeedMode();
  const productCount = parseProductCount();
  const usdExchangeRate = parseUsdExchangeRate();
  const stats: SeedStats = {
    categoriesCreated: 0,
    categoriesUpdated: 0,
    productsCreated: 0,
    productsUpdated: 0,
    productsSkipped: 0,
  };

  try {
    await AppDataSource.initialize();
    console.log("[seed] Database connected");

    const categoryRepo = AppDataSource.getRepository(Category);
    const productRepo = AppDataSource.getRepository(Product);

    if (mode === "skip_if_not_empty") {
      const existingProducts = await productRepo
        .createQueryBuilder("product")
        .withDeleted()
        .getCount();
      if (existingProducts > 0) {
        console.log(
          `[seed] Skip seed because products table already has ${existingProducts} rows.`,
        );
        return;
      }
    }

    if (mode === "wipe") {
      console.log("[seed] Wipe mode: deleting existing products and categories...");
      await productRepo.createQueryBuilder().delete().execute();
      await categoryRepo.createQueryBuilder().delete().execute();
      console.log("[seed] Existing data deleted");
    }

    const savedCategoriesByName = new Map<string, Category>();
    for (const categorySeed of PLANT_CATALOG) {
      const existingCategory = await categoryRepo.findOne({
        where: { name: categorySeed.name },
        withDeleted: true,
      });

      if (existingCategory) {
        existingCategory.description = categorySeed.description;
        existingCategory.deletedAt = null;
        const updatedCategory = await categoryRepo.save(existingCategory);
        savedCategoriesByName.set(updatedCategory.name, updatedCategory);
        stats.categoriesUpdated += 1;
      } else {
        const createdCategory = categoryRepo.create({
          name: categorySeed.name,
          description: categorySeed.description,
        });
        const savedCategory = await categoryRepo.save(createdCategory);
        savedCategoriesByName.set(savedCategory.name, savedCategory);
        stats.categoriesCreated += 1;
      }
    }

    const selectedProducts = selectProducts(productCount);
    console.log(
      `[seed] Seeding ${selectedProducts.length} products with mode "${mode}"...`,
    );
    console.log(
      `[seed] Price currency: USD (exchange rate ${usdExchangeRate} VND/USD for values > 1000)`,
    );

    for (const item of selectedProducts) {
      const category = savedCategoriesByName.get(item.categoryName);
      if (!category) {
        stats.productsSkipped += 1;
        continue;
      }

      const imageUrl = buildImageUrl(item.categoryName, item.product.name);
      const usdPrice = normalizeUsdPrice(item.product.price, usdExchangeRate);
      const existingProduct = await productRepo.findOne({
        where: {
          name: item.product.name,
          category: { id: category.id },
        },
        relations: { category: true },
        withDeleted: true,
      });

      if (existingProduct) {
        existingProduct.description = item.product.description;
        existingProduct.price = usdPrice;
        existingProduct.stock = item.product.stock;
        existingProduct.imageUrl = imageUrl;
        existingProduct.isActive = item.product.isActive ?? true;
        existingProduct.category = category;
        existingProduct.deletedAt = null;
        await productRepo.save(existingProduct);
        stats.productsUpdated += 1;
      } else {
        const newProduct = productRepo.create({
          name: item.product.name,
          description: item.product.description,
          price: usdPrice,
          stock: item.product.stock,
          imageUrl,
          isActive: item.product.isActive ?? true,
          category,
        });
        await productRepo.save(newProduct);
        stats.productsCreated += 1;
      }
    }

    console.log("[seed] Done");
    console.log(
      `[seed] Categories created=${stats.categoriesCreated}, updated=${stats.categoriesUpdated}`,
    );
    console.log(
      `[seed] Products created=${stats.productsCreated}, updated=${stats.productsUpdated}, skipped=${stats.productsSkipped}`,
    );
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[seed] Failed:", error);
    process.exit(1);
  });
