export interface PlantProductSeed {
  name: string;
  description: string;
  price: number;
  stock: number;
  isActive?: boolean;
}

export interface PlantCategorySeed {
  name: string;
  description: string;
  products: PlantProductSeed[];
}

export const PLANT_CATALOG: PlantCategorySeed[] = [
  {
    name: "Indoor Plants",
    description: "Low-maintenance foliage plants for desks, living rooms, and offices",
    products: [
      {
        name: "Monstera Deliciosa",
        description: "Split-leaf tropical plant that thrives in bright indirect light.",
        price: 320000,
        stock: 25,
      },
      {
        name: "Snake Plant Laurentii",
        description: "Very hardy upright plant, drought tolerant and beginner friendly.",
        price: 180000,
        stock: 40,
      },
      {
        name: "ZZ Plant",
        description: "Glossy dark leaves and excellent tolerance for low-light corners.",
        price: 260000,
        stock: 30,
      },
      {
        name: "Golden Pothos",
        description: "Fast-growing trailing vine, ideal for shelves and hanging pots.",
        price: 95000,
        stock: 60,
      },
      {
        name: "Fiddle Leaf Fig",
        description: "Statement indoor tree with broad leaves for modern interiors.",
        price: 540000,
        stock: 16,
      },
      {
        name: "Philodendron Birkin",
        description: "Striped foliage cultivar with compact growth and premium look.",
        price: 290000,
        stock: 22,
      },
      {
        name: "Aglaonema Red Siam",
        description: "Colorful foliage plant that adapts well to medium indoor light.",
        price: 210000,
        stock: 28,
      },
      {
        name: "Dracaena Fragrans",
        description: "Air-purifying cane plant suitable for lobbies and hallways.",
        price: 330000,
        stock: 20,
      },
      {
        name: "Calathea Orbifolia",
        description: "Round striped leaves; prefers stable humidity and soft light.",
        price: 360000,
        stock: 18,
      },
      {
        name: "Peace Lily Domino",
        description: "Variegated peace lily with elegant foliage and white blooms.",
        price: 230000,
        stock: 24,
      },
    ],
  },
  {
    name: "Succulents & Cacti",
    description: "Compact drought-resistant plants for sunny windows and work desks",
    products: [
      {
        name: "Echeveria Lola",
        description: "Pastel rosette succulent that loves direct morning sun.",
        price: 55000,
        stock: 90,
      },
      {
        name: "Echeveria Perle von Nurnberg",
        description: "Purple-toned rosette with strong color in bright light.",
        price: 65000,
        stock: 72,
      },
      {
        name: "Haworthia Cooperi",
        description: "Translucent leaf tips and compact growth for small spaces.",
        price: 70000,
        stock: 68,
      },
      {
        name: "Jade Plant",
        description: "Classic thick-leaf succulent, symbolic and easy to maintain.",
        price: 85000,
        stock: 58,
      },
      {
        name: "Burro's Tail",
        description: "Trailing succulent ideal for hanging baskets and bright balconies.",
        price: 78000,
        stock: 54,
      },
      {
        name: "Ghost Plant",
        description: "Powdery succulent that propagates quickly from leaf cuttings.",
        price: 52000,
        stock: 76,
      },
      {
        name: "Ladyfinger Cactus",
        description: "Clustering cactus with golden spines and easy care needs.",
        price: 60000,
        stock: 66,
      },
      {
        name: "Moon Cactus",
        description: "Colorful grafted cactus that adds contrast to plant shelves.",
        price: 69000,
        stock: 61,
      },
      {
        name: "Bunny Ear Cactus",
        description: "Distinct pad-shaped cactus; handle carefully due to glochids.",
        price: 74000,
        stock: 57,
      },
      {
        name: "Bishop's Cap Cactus",
        description: "Spineless star-shaped cactus with unique geometric form.",
        price: 95000,
        stock: 44,
      },
    ],
  },
  {
    name: "Bonsai & Mini Trees",
    description: "Decorative bonsai and compact trees for curated interior setups",
    products: [
      {
        name: "Ficus Ginseng Bonsai",
        description: "Thick-root bonsai with resilient growth for first-time growers.",
        price: 420000,
        stock: 14,
      },
      {
        name: "Fukien Tea Bonsai",
        description: "Fine foliage bonsai with dense branching and compact canopy.",
        price: 510000,
        stock: 10,
      },
      {
        name: "Wrightia Bonsai",
        description: "Mini flowering bonsai with graceful branch structure.",
        price: 460000,
        stock: 12,
      },
      {
        name: "Mini Bougainvillea Bonsai",
        description: "Colorful bracts and sculpted trunk ideal for bright balconies.",
        price: 390000,
        stock: 15,
      },
      {
        name: "Premna Bonsai",
        description: "Traditional bonsai species with flexible styling potential.",
        price: 580000,
        stock: 8,
      },
      {
        name: "Podocarpus Mini Bonsai",
        description: "Evergreen needle-like foliage with clean upright silhouette.",
        price: 640000,
        stock: 7,
      },
      {
        name: "Dwarf Schefflera Bonsai",
        description: "Compact tropical bonsai with glossy leaves and easy upkeep.",
        price: 210000,
        stock: 24,
      },
      {
        name: "Money Tree Mini Bonsai",
        description: "Braided trunk mini tree popular for office desks and gifts.",
        price: 270000,
        stock: 20,
      },
      {
        name: "Chinese Elm Bonsai",
        description: "Classic bonsai variety with fine branching and small leaves.",
        price: 490000,
        stock: 11,
      },
      {
        name: "Mini Weeping Fig Bonsai",
        description: "Elegant miniature tree with arching branches and dense crown.",
        price: 530000,
        stock: 9,
      },
    ],
  },
  {
    name: "Flowering Ornamentals",
    description: "Bright flowering plants for balconies, patios, and gift bundles",
    products: [
      {
        name: "Mini Rose",
        description: "Compact rose variety with recurring blooms in sunny spots.",
        price: 125000,
        stock: 36,
      },
      {
        name: "Hanging Petunia",
        description: "Cascading flowers ideal for baskets and rail planters.",
        price: 95000,
        stock: 42,
      },
      {
        name: "Hydrangea Pot",
        description: "Large bloom clusters with rich color in cool bright shade.",
        price: 190000,
        stock: 27,
      },
      {
        name: "Gerbera Daisy",
        description: "Vivid daisy-like flowers with long-lasting ornamental value.",
        price: 89000,
        stock: 45,
      },
      {
        name: "Wax Begonia",
        description: "Shade-tolerant flowering plant with glossy leaves and clusters.",
        price: 76000,
        stock: 47,
      },
      {
        name: "Chrysanthemum Pompon",
        description: "Dense rounded flower form, great for festive decor displays.",
        price: 220000,
        stock: 19,
      },
      {
        name: "Lavender Pot",
        description: "Fragrant flowering herb that prefers bright, airy conditions.",
        price: 145000,
        stock: 31,
      },
      {
        name: "Dwarf Sunflower",
        description: "Cheerful yellow blooms in compact form for small containers.",
        price: 99000,
        stock: 38,
      },
      {
        name: "Red Aster",
        description: "Strong red tones for colorful seasonal flower arrangements.",
        price: 110000,
        stock: 33,
      },
      {
        name: "Double Impatiens",
        description: "Soft layered petals and high bloom count in partial shade.",
        price: 85000,
        stock: 41,
      },
    ],
  },
  {
    name: "Seeds & Seedlings",
    description: "Starter seeds and young plants for home gardens and balcony farms",
    products: [
      {
        name: "Mint Seed Pack",
        description: "Fast-sprouting mint seeds for tea herbs and fresh garnish.",
        price: 28000,
        stock: 120,
      },
      {
        name: "Herb Mix Seed Pack",
        description: "Mixed basil, perilla, and cilantro seeds for kitchen gardens.",
        price: 32000,
        stock: 110,
      },
      {
        name: "Cherry Tomato Seed Pack",
        description: "Productive tomato variety suitable for pots and raised beds.",
        price: 35000,
        stock: 96,
      },
      {
        name: "Mini Cucumber Seed Pack",
        description: "Compact climbing cucumber seeds for balcony trellis setups.",
        price: 34000,
        stock: 92,
      },
      {
        name: "Bell Pepper Seed Pack",
        description: "Sweet pepper seed mix for colorful home-grown harvests.",
        price: 36000,
        stock: 88,
      },
      {
        name: "Kale Seed Pack",
        description: "Nutrient-rich kale seeds for healthy smoothies and salads.",
        price: 39000,
        stock: 84,
      },
      {
        name: "Rosemary Seedling",
        description: "Established rosemary starter for sunny windows and herb pots.",
        price: 65000,
        stock: 55,
      },
      {
        name: "Oregano Seedling",
        description: "Aromatic oregano starter that adapts well to container growth.",
        price: 62000,
        stock: 58,
      },
      {
        name: "Thyme Seedling",
        description: "Compact thyme plant for everyday cooking and indoor herb racks.",
        price: 60000,
        stock: 60,
      },
      {
        name: "Mixed Daisy Seed Pack",
        description: "Colorful daisy seed blend for easy seasonal flower beds.",
        price: 30000,
        stock: 105,
      },
    ],
  },
];
