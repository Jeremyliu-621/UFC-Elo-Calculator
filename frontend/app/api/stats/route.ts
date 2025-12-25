import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Try public directory first, then parent directory
    let filePath = path.join(process.cwd(), 'public', 'fighter_stats.csv');
    if (!fs.existsSync(filePath)) {
      filePath = path.join(process.cwd(), '..', 'fighter_stats.csv');
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    const lines = fileContent.trim().split('\n');
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        fighter: values[0],
        fights: parseInt(values[1]) || 0,
        wins: parseInt(values[2]) || 0,
        losses: parseInt(values[3]) || 0,
        draws: parseInt(values[4]) || 0,
        ncs: parseInt(values[5]) || 0,
        knockdowns: parseInt(values[6]) || 0,
        strikes: parseInt(values[7]) || 0,
        takedowns: parseInt(values[8]) || 0,
        submissions: parseInt(values[9]) || 0,
      };
    }).filter(item => item.fighter);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading stats data:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}

