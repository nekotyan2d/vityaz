import type { ServerResponse } from "http";

type SsePayload = {
    allowed: boolean;
    employeeFullName: string;
    room: string;
    direction: "in" | "out";
};

class SseService {
    private connections = new Map<number, Set<ServerResponse>>();

    subscribe(roomId: number, response: ServerResponse) {
        if (!this.connections.has(roomId)) {
            this.connections.set(roomId, new Set());
        }
        this.connections.get(roomId)!.add(response);
    }

    unsubscribe(roomId: number, response: ServerResponse) {
        this.connections.get(roomId)?.delete(response);
    }

    broadcast(roomId: number, payload: SsePayload) {
        const connections = this.connections.get(roomId);
        if (!connections || connections.size === 0) return;
        const data = `data: ${JSON.stringify(payload)}\n\n`;
        for (const conn of connections) {
            try {
                conn.write(data);
            } catch {
                connections.delete(conn);
            }
        }
    }
}

export const sseService = new SseService();