# RepMate データベース設計

認証情報はSupabase Authの`auth.users`が管理し、アプリケーション固有の情報は`public`スキーマに保存します。`profiles.id`と各テーブルの`user_id`には`auth.users.id`と同じUUIDを使用します。

| テーブル                | 用途                               | 実装状況 |
| ----------------------- | ---------------------------------- | -------- |
| `profiles`              | 名前と性別                         | 使用中   |
| `exercises`             | トレーニング種目                   | 使用中   |
| `consultations`         | AI相談単位                         | 使用中   |
| `consultation_messages` | 目標設定時の相談履歴               | 使用中   |
| `goal_proposals`        | Geminiが生成した目標候補と選択状態 | 使用中   |
| `training_goals`        | 設定済みの目標                     | 使用中   |
| `reports`               | トレーニング報告単位               | 使用中   |
| `training_records`      | 重量、回数、セット順、メモ         | 使用中   |

## 現在の集計仕様

- 推定1RMは`weight * (1 + reps / 30)`で算出します。
- 成長レポートは過去90日間の`training_records`を対象にします。
- グラフは種目ごとの日別最高推定1RMから直近3記録日を表示します。
- 自己ベストは回数ごとの最高重量を最大3件表示します。
- AI分析欄は現在、記録件数から生成した定型文です。Geminiによる分析履歴の保存は今後の改善項目です。

詳細な型、制約、リレーションは[Prismaスキーマ](../prisma/schema.prisma)を正とします。
