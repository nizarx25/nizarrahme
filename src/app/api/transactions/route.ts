import { NextResponse } from 'next/server'

// Hardcoded public transactions (not from database)
const transactions = [
  {
    domain: 'ScalableAIAgents.com',
    status: 'Completed sale',
    amount: 375,
  },
  {
    domain: 'RiyadhSalon.com',
    status: 'Wholesale sale',
    amount: 50,
  },
]

export async function GET() {
  return NextResponse.json({ transactions })
}
