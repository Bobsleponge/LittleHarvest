import { NextApiRequest, NextApiResponse } from 'next'

const products = [
  {
    id: '1',
    name: 'Organic Apple Puree',
    price: 45,
    image: '🍎',
    description: 'Fresh organic apples blended to perfection for your little one',
    ageRange: '4+ months',
    ingredients: ['Organic Apples', 'Water'],
    nutritionInfo: 'Rich in Vitamin C and fiber'
  },
  {
    id: '2',
    name: 'Sweet Potato Mash',
    price: 42,
    image: '🍠',
    description: 'Naturally sweet sweet potatoes, perfect first food',
    ageRange: '4+ months',
    ingredients: ['Organic Sweet Potatoes', 'Water'],
    nutritionInfo: 'High in Vitamin A and beta-carotene'
  },
  {
    id: '3',
    name: 'Banana & Oatmeal',
    price: 48,
    image: '🍌',
    description: 'Creamy banana with wholesome oats',
    ageRange: '6+ months',
    ingredients: ['Organic Bananas', 'Organic Oats', 'Water'],
    nutritionInfo: 'Great source of potassium and fiber'
  },
  {
    id: '4',
    name: 'Carrot & Pea Mix',
    price: 44,
    image: '🥕',
    description: 'Colorful blend of carrots and peas',
    ageRange: '6+ months',
    ingredients: ['Organic Carrots', 'Organic Peas', 'Water'],
    nutritionInfo: 'Packed with vitamins and minerals'
  },
  {
    id: '5',
    name: 'Chicken & Rice',
    price: 52,
    image: '🍗',
    description: 'Protein-rich chicken with gentle rice',
    ageRange: '8+ months',
    ingredients: ['Organic Chicken', 'Organic Rice', 'Water'],
    nutritionInfo: 'Complete protein and essential amino acids'
  },
  {
    id: '6',
    name: 'Mixed Berry Blend',
    price: 46,
    image: '🫐',
    description: 'Antioxidant-rich berry medley',
    ageRange: '8+ months',
    ingredients: ['Organic Blueberries', 'Organic Strawberries', 'Water'],
    nutritionInfo: 'High in antioxidants and Vitamin C'
  }
]

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json(products)
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
