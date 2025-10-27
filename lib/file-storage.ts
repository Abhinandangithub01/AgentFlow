/**
 * File-based storage fallback for when DynamoDB is not available
 * Stores data in JSON files in the .data directory
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');

// Ensure data directory exists
if (typeof window === 'undefined') {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log('[FileStorage] Created data directory:', DATA_DIR);
    }
  } catch (error) {
    console.error('[FileStorage] Failed to create data directory:', error);
  }
}

export class FileStorage {
  private static getFilePath(table: string): string {
    return path.join(DATA_DIR, `${table}.json`);
  }

  private static readFile(table: string): any[] {
    try {
      const filePath = this.getFilePath(table);
      if (!fs.existsSync(filePath)) {
        return [];
      }
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`[FileStorage] Error reading ${table}:`, error);
      return [];
    }
  }

  private static writeFile(table: string, data: any[]): void {
    try {
      const filePath = this.getFilePath(table);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error(`[FileStorage] Error writing ${table}:`, error);
      throw error;
    }
  }

  static async put(table: string, item: any): Promise<void> {
    console.log(`[FileStorage] PUT ${table}:`, { PK: item.PK, SK: item.SK });
    const items = this.readFile(table);
    
    // Remove existing item with same PK/SK
    const filtered = items.filter(i => !(i.PK === item.PK && i.SK === item.SK));
    
    // Add new item
    filtered.push(item);
    
    this.writeFile(table, filtered);
    console.log(`[FileStorage] ✅ Saved to ${table}`);
  }

  static async get(table: string, key: { PK: string; SK: string }): Promise<any | null> {
    console.log(`[FileStorage] GET ${table}:`, key);
    const items = this.readFile(table);
    const item = items.find(i => i.PK === key.PK && i.SK === key.SK);
    
    if (item) {
      console.log(`[FileStorage] ✅ Found in ${table}`);
    } else {
      console.log(`[FileStorage] ⚠️ Not found in ${table}`);
    }
    
    return item || null;
  }

  static async query(
    table: string,
    condition: string,
    values: Record<string, any>
  ): Promise<any[]> {
    console.log(`[FileStorage] QUERY ${table}:`, condition, values);
    const items = this.readFile(table);
    
    // Simple query implementation
    // Supports: "PK = :pk" and "PK = :pk AND begins_with(SK, :sk)"
    const pk = values[':pk'];
    const sk = values[':sk'];
    
    let results = items.filter(i => i.PK === pk);
    
    if (sk && condition.includes('begins_with')) {
      results = results.filter(i => i.SK && i.SK.startsWith(sk));
    } else if (sk) {
      results = results.filter(i => i.SK === sk);
    }
    
    console.log(`[FileStorage] ✅ Found ${results.length} items in ${table}`);
    return results;
  }

  static async delete(table: string, key: { PK: string; SK: string }): Promise<void> {
    console.log(`[FileStorage] DELETE ${table}:`, key);
    const items = this.readFile(table);
    const filtered = items.filter(i => !(i.PK === key.PK && i.SK === key.SK));
    
    this.writeFile(table, filtered);
    console.log(`[FileStorage] ✅ Deleted from ${table}`);
  }
}
