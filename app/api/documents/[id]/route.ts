import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;

    // Fetch the document first to check existence and get the storage path
    const { data: doc, error: selectError } = await supabaseAdmin
      .from("documents")
      .select("name")
      .eq("id", id)
      .single();

    if (selectError || !doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Remove from storage (best-effort; don't block delete on failure)
    await supabaseAdmin.storage.from("pdfs").remove([`${id}/${doc.name}`]);

    const { error: deleteError } = await supabaseAdmin
      .from("documents")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
