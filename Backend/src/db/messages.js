import { query } from "../config/db.js";

export async function ensureMessagesTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
      booking_id TEXT REFERENCES bookings(id) ON DELETE SET NULL,
      client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      host_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (client_id, host_id, property_id)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_conversations_client ON conversations (client_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_conversations_host ON conversations (host_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id);`);
}

export function mapConversationRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    propertyId: row.property_id || null,
    bookingId: row.booking_id || null,
    clientId: row.client_id,
    hostId: row.host_id,
    lastMessageAt: row.last_message_at,
    createdAt: row.created_at,
    propertyName: row.property_name || null,
    propertyImg: row.property_img || null,
    clientName: row.client_name || null,
    hostName: row.host_name || null,
    lastMessage: row.last_message || null,
  };
}

export function mapMessageRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
  };
}
