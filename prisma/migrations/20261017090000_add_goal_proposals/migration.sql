-- CreateTable
CREATE TABLE "goal_proposals" (
    "id" UUID NOT NULL,
    "consultation_id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "is_selected" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "goal_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "goal_proposals_consultation_id_idx" ON "goal_proposals"("consultation_id");

-- AddForeignKey
ALTER TABLE "goal_proposals" ADD CONSTRAINT "goal_proposals_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill active goals created before proposal storage was introduced.
INSERT INTO "goal_proposals" ("id", "consultation_id", "title", "description", "is_selected", "updated_at")
SELECT gen_random_uuid(), "consultation_id", "title", "description", true, CURRENT_TIMESTAMP
FROM "training_goals"
WHERE "status" = 'active';

INSERT INTO "goal_proposals" ("id", "consultation_id", "title", "description", "is_selected", "updated_at")
SELECT gen_random_uuid(), "consultation_id", 'フォームを優先して丁寧に行う', '軽めの重量で8回を4セット行い、動作を安定させましょう。', false, CURRENT_TIMESTAMP
FROM "training_goals"
WHERE "status" = 'active';

INSERT INTO "goal_proposals" ("id", "consultation_id", "title", "description", "is_selected", "updated_at")
SELECT gen_random_uuid(), "consultation_id", '無理のない範囲で前回を超える', '体調を確認しながら、前回より1回多い回数を目指しましょう。', false, CURRENT_TIMESTAMP
FROM "training_goals"
WHERE "status" = 'active';
