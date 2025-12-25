import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Try public directory first, then parent directory
    let filePath = path.join(process.cwd(), 'public', 'current_fighters_elo.csv');
    if (!fs.existsSync(filePath)) {
      filePath = path.join(process.cwd(), '..', 'current_fighters_elo.csv');
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    const lines = fileContent.trim().split('\n');
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        fighter: values[0],
        elo: parseFloat(values[1])
      };
    }).filter(item => !isNaN(item.elo)).sort((a, b) => b.elo - a.elo);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading Elo data:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}

