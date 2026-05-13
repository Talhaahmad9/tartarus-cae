import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/db/mongo";
import Session from "@/lib/db/models/session.model";
import CognitiveEntity from "@/lib/db/models/entity.model";
import DebateExchange from "@/lib/db/models/debate.model";
import ArbitrationResult from "@/lib/db/models/arbitration.model";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    await connectMongo();

    const [session, entities, debateExchanges, arbitration] = await Promise.all([
      Session.findOne({ sessionId }).lean(),
      CognitiveEntity.find({ sessionId }).lean(),
      DebateExchange.find({ sessionId }).sort({ round: 1, _id: 1 }).lean(),
      ArbitrationResult.findOne({ sessionId }).lean(),
    ]);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        session,
        entities,
        debateExchanges,
        arbitration,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load replay session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
