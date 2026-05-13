import { NextRequest } from "next/server";
import { connectMongo } from "@/lib/db/mongo";
import Session from "@/lib/db/models/session.model";
import CognitiveEntity from "@/lib/db/models/entity.model";
import DebateExchange from "@/lib/db/models/debate.model";
import ArbitrationResult from "@/lib/db/models/arbitration.model";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  void req;

  const stream = new ReadableStream({
    async start(controller) {
      await connectMongo();

      const encoder = new TextEncoder();
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Hard timeout at 90 seconds
      const timeout = setTimeout(() => controller.close(), 90000);

      const poll = async () => {
        try {
          const [session, entities, debates, arbitration] = await Promise.all([
            Session.findOne({ sessionId }).lean(),
            CognitiveEntity.find({ sessionId }).lean(),
            DebateExchange.find({ sessionId }).lean(),
            ArbitrationResult.findOne({ sessionId }).lean(),
          ]);

          send({ session, entities, debates, arbitration });

          if (session?.status === "resolved") {
            clearTimeout(timeout);
            controller.close();
            return;
          }

          setTimeout(poll, 1500);
        } catch {
          clearTimeout(timeout);
          controller.close();
        }
      };

      poll();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
