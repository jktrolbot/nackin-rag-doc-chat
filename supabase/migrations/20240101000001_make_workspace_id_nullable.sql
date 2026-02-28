-- Fix CRITICAL: workspace_id NOT NULL constraint was breaking all PDF processing
-- because the application code never supplies a workspace_id during upload.
-- Make the column nullable so documents/chunks can be created without a workspace.

ALTER TABLE documents
  ALTER COLUMN workspace_id DROP NOT NULL;

ALTER TABLE document_chunks
  ALTER COLUMN workspace_id DROP NOT NULL;
