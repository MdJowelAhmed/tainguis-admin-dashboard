export type Subcategory = {
  id: string
  name: string
}

export type Category = {
  id: string
  name: string
  description: string
  image?: string
  slug: string
  productsCount: number
  status: 'active' | 'inactive'
  createdAt: string
  subcategories: Subcategory[]
}

function emojiIcon(emoji: string, bg: string): string {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'>` +
    `<rect width='200' height='200' rx='28' fill='${bg}'/>` +
    `<text x='100' y='130' font-size='110' text-anchor='middle' ` +
    `font-family='Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif'>${emoji}</text>` +
    `</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function makeSubs(catNum: string, names: string[]): Subcategory[] {
  return names.map((name, i) => ({
    id: `sub_${catNum}_${i + 1}`,
    name,
  }))
}

export const initialCategories: Category[] = [
  {
    id: 'cat_001',
    name: 'Sneakers & Streetwear',
    description: 'Sneakers, hype apparel, and streetwear drops',
    image: emojiIcon('👟', '#fef3c7'),
    slug: 'sneakers-streetwear',
    productsCount: 124,
    status: 'active',
    createdAt: '2024-01-15',
    subcategories: makeSubs('001', [
      'Nike',
      'Adidas',
      'Jordan',
      'Yeezy',
      'New Balance',
      'Asics',
      'Supreme',
      'Hoodies',
      'T-Shirts',
      'Caps',
      'Bags',
    ]),
  },
  {
    id: 'cat_002',
    name: 'Sports Cards',
    description: 'Trading cards from major sports leagues',
    image: emojiIcon('🏀', '#fed7aa'),
    slug: 'sports-cards',
    productsCount: 86,
    status: 'active',
    createdAt: '2024-01-22',
    subcategories: makeSubs('002', [
      'Basketball',
      'Football',
      'Baseball',
      'Soccer',
      'Hockey',
      'MMA & Boxing',
      'Golf',
      'Racing',
      'Graded Cards',
      'Rookie Cards',
    ]),
  },
  {
    id: 'cat_003',
    name: 'Pokemon Cards',
    description: 'Singles, booster packs, and graded Pokemon cards',
    image: emojiIcon('🎴', '#fee2e2'),
    slug: 'pokemon-cards',
    productsCount: 142,
    status: 'active',
    createdAt: '2024-02-04',
    subcategories: makeSubs('003', [
      'Singles',
      'Booster Boxes',
      'Booster Packs',
      'Elite Trainer Boxes',
      'Graded Cards',
      'Vintage WOTC',
      'Modern Sets',
      'Japanese Cards',
      'Sealed Products',
    ]),
  },
  {
    id: 'cat_004',
    name: 'Trading Cards Games',
    description: 'Magic, Yu-Gi-Oh, and other TCG titles',
    image: emojiIcon('🃏', '#e9d5ff'),
    slug: 'trading-card-games',
    productsCount: 64,
    status: 'active',
    createdAt: '2024-02-18',
    subcategories: makeSubs('004', [
      'Magic: The Gathering',
      'Yu-Gi-Oh!',
      'Flesh and Blood',
      'Lorcana',
      'Digimon',
      'One Piece TCG',
      'Weiss Schwarz',
      'Cardfight Vanguard',
    ]),
  },
  {
    id: 'cat_005',
    name: 'Coins & Money',
    description: 'Coins, banknotes, and currency collectibles',
    image: emojiIcon('🪙', '#fde68a'),
    slug: 'coins-money',
    productsCount: 41,
    status: 'active',
    createdAt: '2024-03-03',
    subcategories: makeSubs('005', [
      'US Coins',
      'World Coins',
      'Banknotes',
      'Bullion',
      'Ancient Coins',
      'Graded Coins',
      'Commemoratives',
      'Error Coins',
    ]),
  },
  {
    id: 'cat_006',
    name: 'Video Games',
    description: 'Retro and modern console and PC games',
    image: emojiIcon('🎮', '#ddd6fe'),
    slug: 'video-games',
    productsCount: 98,
    status: 'active',
    createdAt: '2024-03-17',
    subcategories: makeSubs('006', [
      'Retro Games',
      'Modern Games',
      'PlayStation',
      'Xbox',
      'Nintendo',
      'PC Games',
      'Handhelds',
      'Accessories',
      'Consoles',
    ]),
  },
  {
    id: 'cat_007',
    name: 'Toys & Hobbies',
    description: 'Action figures, plush, and collectible toys',
    image: emojiIcon('🧸', '#fce7f3'),
    slug: 'toys-hobbies',
    productsCount: 156,
    status: 'active',
    createdAt: '2024-04-02',
    subcategories: makeSubs('007', [
      'Disney',
      'Funko',
      'Action Figures',
      'Diecast',
      'Star Wars',
      'Dolls',
      'Plush',
      'LEGO',
      'Hot Wheels',
      'Marvel Legends',
      'Transformers',
      'Model Kits',
    ]),
  },
  {
    id: 'cat_008',
    name: 'Comics',
    description: 'Single issues, graphic novels, and graded comics',
    image: emojiIcon('📚', '#dbeafe'),
    slug: 'comics',
    productsCount: 73,
    status: 'active',
    createdAt: '2024-04-19',
    subcategories: makeSubs('008', [
      'Marvel',
      'DC',
      'Image',
      'Indie',
      'Graded (CGC/CBCS)',
      'Golden Age',
      'Silver Age',
      'Bronze Age',
      'Modern Age',
      'Variants',
    ]),
  },
  {
    id: 'cat_009',
    name: 'Anime & Manga',
    description: 'Anime figures, manga volumes, and merch',
    image: emojiIcon('📖', '#fbcfe8'),
    slug: 'anime-manga',
    productsCount: 89,
    status: 'active',
    createdAt: '2024-05-08',
    subcategories: makeSubs('009', [
      'Manga',
      'Figures',
      'Posters',
      'Apparel',
      'Plush',
      'Wall Scrolls',
      'Statues',
      'Limited Editions',
    ]),
  },
  {
    id: 'cat_010',
    name: "Man's Vintage Clothing",
    description: 'Vintage menswear and retro apparel',
    image: emojiIcon('👔', '#d1fae5'),
    slug: 'mans-vintage-clothing',
    productsCount: 52,
    status: 'active',
    createdAt: '2024-05-21',
    subcategories: makeSubs('010', [
      'T-Shirts',
      'Jackets',
      'Denim',
      'Workwear',
      'Band Tees',
      'Hawaiian Shirts',
      'Sweaters',
      'Suits',
      'Hats',
    ]),
  },
  {
    id: 'cat_011',
    name: 'Electronics',
    description: 'Everyday electronics, cameras, and gadgets',
    image: emojiIcon('📱', '#cffafe'),
    slug: 'electronics',
    productsCount: 67,
    status: 'active',
    createdAt: '2024-06-04',
    subcategories: makeSubs('011', [
      'Everyday Electronics',
      'Cameras & Photography',
      'Audio & Hi-Fi',
      'Computers',
      'Gaming Hardware',
      'Phones & Tablets',
      'Wearables',
      'Vintage Tech',
    ]),
  },
  {
    id: 'cat_012',
    name: 'Sports Memorabilia',
    description: 'Signed jerseys, balls, and game-worn gear',
    image: emojiIcon('🏆', '#fde047'),
    slug: 'sports-memorabilia',
    productsCount: 38,
    status: 'inactive',
    createdAt: '2024-06-18',
    subcategories: makeSubs('012', [
      'Signed Jerseys',
      'Game-Worn',
      'Signed Balls',
      'Display Cases',
      'Helmets',
      'Photos',
      'Bats',
      'Pennants',
    ]),
  },
]
