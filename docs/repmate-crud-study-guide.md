# RepMateで学ぶ TypeScript・Next.js 実装ガイド

- 対象: TypeScript / React / Next.js App Router / Prisma / Supabase Auth / Gemini APIを学習中の方向け
- 題材: RepMateの認証、AI相談、目標設定、トレーニング記録、進捗表示
- 更新日: 2026年10月31日

---

## 1. この資料のゴール

まず、次の一文を自分の言葉で説明できることを目標にしてください。

> 画面から `fetch` でAPIを呼び、APIで認証と入力検証を行い、PrismaでDBを操作し、結果をJSONで画面へ返す。

最低限、次の8点は必ず身につけたい内容です。

1. CRUDとHTTPメソッドの対応
2. `async / await`を使った非同期処理
3. TypeScriptの型と`unknown`の意味
4. Zodによる実行時の入力検証
5. PrismaによるDB操作と、ログインユーザー本人のデータだけを扱う方法
6. React Hook FormとZodを組み合わせたフォーム管理
7. Gemini APIへ会話を送り、返答を再検証する方法
8. Server ComponentとClient Componentの役割分担

この5点を理解すると、Todoアプリ、日報、投稿、予約、プロフィール編集などにも応用できます。

---

## 2. RepMateのCRUD対応表

CRUDはデータ操作の4種類をまとめた呼び方です。

| CRUD | 意味 | HTTP | RepMateの処理 | Prisma |
|---|---|---|---|---|
| Create | 新規作成 | `POST` | トレーニング記録を保存 | `createMany()` |
| Read | 取得 | `GET` | 本日の記録を一覧表示 | `findMany()` |
| Update | 更新 | `PATCH` | 重量・回数を編集 | `update()` |
| Delete | 削除 | `DELETE` | 記録を削除してセット順を振り直す | `delete()`・`update()` |

APIのURLは次の2種類です。

```text
/api/training-records       GET / POST
/api/training-records/[id]  PATCH / DELETE
```

`[id]`は動的ルートです。例えば、IDが`abc`なら次のURLになります。

```text
/api/training-records/abc
```

### RepMate全体のAPI早見表

| パス | HTTP | 役割 |
|---|---|---|
| `/api/chat` | `POST` | Geminiまたはモックから会話の返答を取得 |
| `/api/goals/proposals` | `POST` | 会話から目標候補を生成 |
| `/api/goals` | `POST` | 相談・候補・選択目標を保存 |
| `/api/goals/[id]` | `GET` | 保存済みの目標候補を取得 |
| `/api/goals/[id]` | `PATCH` | 選択中の目標候補を変更 |
| `/api/goals/[id]` | `DELETE` | 目標を`cancelled`へ変更 |
| `/api/training-records` | `GET` | 本日の記録を取得 |
| `/api/training-records` | `POST` | セット記録を作成 |
| `/api/training-records/[id]` | `PATCH` | 1セットの重量・回数・メモを更新 |
| `/api/training-records/[id]` | `DELETE` | 1セットを削除して順番を振り直す |
| `/api/profile` | `PATCH` | 名前・性別・パスワードを更新 |

---

## 3. 最初に覚える全体の流れ

```text
ユーザー操作
  ↓
ReportScreenのイベント関数
  ↓ fetch
Next.js Route Handler
  ↓
Supabase Authでログイン確認
  ↓
Zodでリクエスト内容を検証
  ↓
PrismaでPostgreSQLを操作
  ↓
NextResponse.json()で結果を返す
  ↓
画面のstateを更新して再表示
```

### requestとresponseをファイル単位で追う図

新規作成（POST）を例にすると、実際には次の2ファイル間で通信しています。

```text
【画面・クライアント側】
src/app/(app)/report/_components/ReportScreen.tsx

saveRecord()
  |
  |  fetch("/api/training-records", { method: "POST", body: ... })
  |  ここから「HTTPリクエスト」を送信
  v
================================================================ HTTP
  v
【API・サーバー側】
src/app/api/training-records/route.ts

POST(request: Request)
  |  画面から送られたHTTPリクエストをrequestとして受け取る
  |  request.json()でbodyを取り出す
  |  Zodで検証する
  |  PrismaでDBへ保存する
  |
  |  NextResponse.json({ records }, { status: 201 })
  |  ここから「HTTPレスポンス」を返す
  v
================================================================ HTTP
  v
【画面・クライアント側】
src/app/(app)/report/_components/ReportScreen.tsx

const response = await fetch(...)
  |  APIから返されたHTTPレスポンスがresponseへ入る
  |
  +-- response.ok      成功したか
  +-- response.status  201などのステータス
  +-- response.json()  JSON本文を取り出す
```

ここで重要なのは、`response`という変数がAPI側で`request`へ変換されるわけではないことです。

```text
画面からAPIへ向かう通信 = request
APIから画面へ戻る通信   = response
```

変数名は任意ですが、RepMateでは役割が分かりやすいように次の名前を使っています。

```ts
// API側: 受け取ったリクエスト
export const POST = async (request: Request) => {
  const body = await request.json();
};

// 画面側: APIから返されたレスポンス
const response = await fetch("/api/training-records");
const data = await response.json();
```

### CRUDごとの送信元と受信先

| 処理 | 画面側の関数 | HTTP | API側のファイル・関数 |
|---|---|---|---|
| 一覧取得 | `fetchRecords()` | `GET` | `api/training-records/route.ts`の`GET()` |
| 新規作成 | `saveRecord()` | `POST` | `api/training-records/route.ts`の`POST()` |
| 更新 | `saveRecordEdit()` | `PATCH` | `api/training-records/[id]/route.ts`の`PATCH()` |
| 削除 | `deleteRecord()` | `DELETE` | `api/training-records/[id]/route.ts`の`DELETE()` |

`GET`と`POST`はIDを指定しないため通常の`route.ts`へ届きます。`PATCH`と`DELETE`は対象のIDをURLへ含めるため、`[id]/route.ts`へ届きます。

### 最重要: 覚えておくCRUDテンプレート早見表

この2つは、まず何度も書いて流れを覚えたいテンプレートです。後半の「21. 最低限、自力で書けるようにしたいテンプレート」にも、同じ内容と説明を残しています。

#### 画面・クライアント側

```ts
const createItem = async () => {
  try {
    const response = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "sample" }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    // 一覧を再取得する、またはstateへ追加する
  } catch (error) {
    console.error(error);
  }
};
```

#### API・サーバー側

```ts
export const POST = async (request: Request) => {
  const body: unknown = await request.json().catch(() => null);
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "入力エラー" }, { status: 400 });
  }

  const item = await prisma.item.create({
    data: result.data,
  });

  return NextResponse.json({ item }, { status: 201 });
};
```

```text
画面: 送る → レスポンスを確認する → 画面を更新する
API : 受け取る → 検証する → DB操作する → 結果を返す
```

関連ファイルは次のとおりです。

| 役割 | ファイル |
|---|---|
| 画面・API呼び出し | `src/app/(app)/report/_components/ReportScreen.tsx` |
| 一覧取得・新規作成API | `src/app/api/training-records/route.ts` |
| 更新・削除API | `src/app/api/training-records/[id]/route.ts` |
| 入力検証 | `src/app/api/training-records/_schemas/training-record.ts` |
| レスポンスの型 | `src/lib/_types/training-record.ts` |
| DBモデル | `prisma/schema.prisma` |

---

## 4. DBモデルを読む

中心となるのは`TrainingRecord`モデルです。

```prisma
model TrainingRecord {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String   @map("user_id") @db.Uuid
  reportId   String?  @map("report_id") @db.Uuid
  exerciseId String   @map("exercise_id") @db.Uuid
  weight     Decimal  @db.Decimal(6, 2)
  reps       Int
  setOrder   Int      @map("set_order")
  memo       String?  @db.Text
  recordedAt DateTime @map("recorded_at") @db.Timestamptz(6)
}
```

### TypeScriptとの対応

| Prisma | TypeScriptで扱う値 | 意味 |
|---|---|---|
| `String` | `string` | IDなどの文字列 |
| `Int` | `number` | 回数・セット順 |
| `Decimal` | Prismaの`Decimal` | 誤差を避けたい数値 |
| `String?` | `string \| null` | 値がない可能性がある |
| `DateTime` | `Date` | 日時 |

`?`は「省略可能」または「NULLを許容する」という意味です。DBの`memo String?`は、レスポンス型では`memo: string | null`になっています。

```ts
export type TrainingRecordItem = {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  setOrder: number;
  memo: string | null;
  recordedAt: string;
};
```

DBでは`recordedAt`が`Date`でも、JSONでは日時を文字列として送るため、画面側は`string`で受け取ります。

---

## 5. Create: 記録を作成する

### 5-1. 画面からPOSTする

`saveRecord`の核は次の部分です。

```ts
const response = await fetch("/api/training-records", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ exercise, weight, reps, sets }),
});
```

覚えるポイント:

- `fetch()`はAPIへHTTPリクエストを送る
- `method: "POST"`は新規作成
- `Content-Type`は送信内容がJSONだと伝える
- `JSON.stringify()`はオブジェクトをJSON文字列へ変換する
- `await`は非同期処理が終わるまで待つ

入力値は`input`から来るため、最初は文字列です。

```ts
const weight = Number(recordDraft.weight);
const reps = Number(recordDraft.reps);
const sets = Number(recordDraft.sets);
```

`Number()`で数値へ変換してからAPIへ送っています。TypeScriptの型は、実行時に文字列を数値へ変換してくれるものではありません。

### 5-2. APIでリクエストを受け取る

```ts
export const POST = async (request: Request) => {
  const body: unknown = await request.json().catch(() => null);
  const result = createTrainingRecordSchema.safeParse(body);
};
```

`body`を`unknown`にする理由は、ブラウザから何が送られてくるか信用できないためです。`unknown`のままではプロパティを利用できません。Zodの検証に成功して初めて、安全な`result.data`として使えます。

```ts
if (!result.success) {
  return NextResponse.json(
    { error: "記録内容が正しくありません" },
    { status: 400 },
  );
}

const { exercise, weight, reps, sets, memo } = result.data;
```

これはTypeScriptで重要な「型の絞り込み」です。`result.success`を確認した後では、TypeScriptが`result.data`の存在と型を理解します。

### 5-3. Zodで入力を検証する

```ts
export const createTrainingRecordSchema = z.object({
  exercise: z.string().trim().min(1).max(100),
  weight: z.number().positive().max(2000),
  reps: z.number().int().min(1).max(1000),
  sets: z.number().int().min(1).max(20),
  memo: z.string().trim().max(500).optional(),
});
```

主な指定の意味:

- `string()`：文字列だけ許可
- `number()`：数値だけ許可
- `positive()`：0より大きい
- `int()`：整数だけ許可
- `min()` / `max()`：範囲を制限
- `optional()`：項目自体がなくてもよい
- `nullable()`：`null`を許可

フロント側のチェックは操作性のため、API側のチェックは安全性のために必要です。フロント側だけを信用してはいけません。

### 5-4. Prismaで保存する

```ts
await transaction.trainingRecord.createMany({
  data: Array.from({ length: sets }, (_, index) => ({
    userId: user.id,
    reportId: report.id,
    exerciseId: exerciseRecord.id,
    weight,
    reps,
    setOrder: nextSetOrder + index,
    memo: memo || null,
    recordedAt: new Date(),
  })),
});
```

`Array.from({ length: sets })`でセット数分のデータを作っています。3セットなら3件の`TrainingRecord`が保存されます。

`nextSetOrder`は、その日の同じ種目について最大の`setOrder`を取得して計算します。

```ts
const latestRecord = await transaction.trainingRecord.findFirst({
  where: {
    userId: user.id,
    exerciseId: exerciseRecord.id,
    recordedAt: { gte: start, lt: end },
  },
  orderBy: { setOrder: "desc" },
  select: { setOrder: true },
});

const nextSetOrder = (latestRecord?.setOrder ?? 0) + 1;
```

件数ではなく最大番号を見ることで、途中のセットを削除した場合でも番号の重複を防ぎます。

### 5-5. transactionが必要な理由

新規作成では以下をまとめて実行しています。

1. プロフィールを確認・作成
2. 種目を確認・作成
3. Reportを作成
4. TrainingRecordを作成

```ts
const records = await prisma.$transaction(async (transaction) => {
  // 複数のDB操作
});
```

途中で1つ失敗した場合、すべてを取り消して不完全なデータが残るのを防ぎます。これをトランザクションと呼びます。

### 5-6. 保存済み記録へ1セット追加する

本日の記録が1件以上ある場合、一覧下部に「セットを追加」を表示します。

```ts
const latestRecord = records[records.length - 1];

setRecordDraft({
  weight: String(latestRecord.weight),
  reps: String(latestRecord.reps),
  sets: "1",
});
```

直前セットの重量と回数を引き継ぎ、確認カードで修正してから既存の`POST /api/training-records`へ送ります。追加専用APIを増やさず、Create処理を再利用している点がポイントです。

---

## 6. Read: 本日の記録を取得する

### 6-1. 画面からGETする

```ts
const response = await fetch(
  `/api/training-records?exercise=${encodeURIComponent(targetExercise)}`,
);
```

GETは`method`を省略できます。`?exercise=...`はクエリパラメータです。`encodeURIComponent()`で日本語や記号をURL用に安全な形へ変換します。

### 6-2. APIでクエリパラメータを読む

```ts
const exercise = new URL(request.url).searchParams.get("exercise")?.trim();
```

`?.`はオプショナルチェーンです。値が`null`なら、その先の`trim()`を実行せず`undefined`になります。

### 6-3. Prismaで一覧を取得する

```ts
const records = await prisma.trainingRecord.findMany({
  where: {
    userId: user.id,
    recordedAt: { gte: start, lt: end },
    ...(exercise ? { exercise: { name: exercise } } : {}),
  },
  include: { exercise: { select: { name: true } } },
  orderBy: [{ recordedAt: "asc" }, { setOrder: "asc" }],
});
```

必ず説明できるようにしたい部分:

- `where`：検索条件
- `userId: user.id`：本人のデータだけに限定
- `gte`：以上、`lt`：未満
- `include`：関連するExerciseも一緒に取得
- `select`：必要な`name`だけ取得
- `orderBy`：並び順
- `...`：スプレッド構文で条件を必要な場合だけ追加

### 6-4. useEffectで初回取得する

```ts
useEffect(() => {
  let ignore = false;

  void fetchRecords(exercise).then((nextRecords) => {
    if (!ignore) setRecords(nextRecords);
  });

  return () => {
    ignore = true;
  };
}, [exercise, fetchRecords]);
```

`useEffect`は画面表示後や依存値の変更後に副作用を実行します。ここでは種目が変わるたびに記録を再取得します。

`return`の関数はクリーンアップです。画面を離れた後や次のEffectへ切り替わった後に、古い通信結果でstateを更新しないようにしています。

---

## 7. Update: 記録を更新する

### 7-1. ID付きURLへPATCHする

```ts
const response = await fetch(`/api/training-records/${editingRecordId}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ weight, reps }),
});
```

`PATCH`はデータの一部を変更するときに使います。`editingRecordId`によって、どの記録を更新するかを指定します。

### 7-2. 動的ルートからIDを取得する

```ts
type TrainingRecordRouteContext = {
  params: Promise<{ id: string }>;
};

const { id } = await context.params;
```

`{ id: string }`は「`id`という文字列プロパティを持つオブジェクト」という型です。Next.js 16では動的ルートの`params`をPromiseとして受け取ります。

### 7-3. 所有者を確認してから更新する

```ts
const record = await prisma.trainingRecord.findFirst({
  where: { id, userId: user.id },
});
```

`id`だけで検索してはいけません。別ユーザーのIDが分かった場合に更新できてしまうためです。`userId: user.id`を同時に条件へ入れることが、認可の重要ポイントです。

```ts
const updated = await prisma.trainingRecord.update({
  where: { id: record.id },
  data: result.data,
});
```

Zodで検証済みの`result.data`だけを`data`へ渡しています。

---

## 8. Delete: 記録を削除する

### 8-1. 画面からDELETEする

```ts
const response = await fetch(`/api/training-records/${recordId}`, {
  method: "DELETE",
});
```

現在は誤操作を防ぐため、`window.confirm()`で確認してから削除します。成功後は一覧を再取得し、トーストを表示します。

### 8-2. 削除前に本人の記録か確認する

```ts
const record = await prisma.trainingRecord.findFirst({
  where: { id, userId: user.id },
  select: { id: true, exerciseId: true, recordedAt: true },
});
```

`id`だけでなく`userId`も条件に含め、他人の記録を削除できないようにします。対象が見つからなければ404を返します。

```ts
if (!record) {
  return NextResponse.json(
    { error: "記録が見つかりません" },
    { status: 404 },
  );
}
```

### 8-3. 削除とセット番号更新を同時に行う

```ts
await prisma.$transaction(async (transaction) => {
  await transaction.trainingRecord.delete({ where: { id: record.id } });

  const remainingRecords = await transaction.trainingRecord.findMany({
    where: {
      userId: user.id,
      exerciseId: record.exerciseId,
      recordedAt: { gte: start, lt: end },
    },
    orderBy: [{ recordedAt: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    select: { id: true },
  });

  for (const [index, remainingRecord] of remainingRecords.entries()) {
    await transaction.trainingRecord.update({
      where: { id: remainingRecord.id },
      data: { setOrder: index + 1 },
    });
  }
});
```

例えば2セット目を削除すると、残ったセットを`1, 2, 3...`へ振り直します。削除と並び替えを同じトランザクションへ入れることで、片方だけ成功する状態を防ぎます。

最後に`204 No Content`を返します。これは「処理は成功したが、返す本文はない」という意味です。

---

## 9. 認証と認可の違い

この違いは必ず覚えてください。

- 認証（Authentication）：「あなたは誰か」を確認する
- 認可（Authorization）：「そのデータを操作してよいか」を確認する

認証:

```ts
const supabase = await createClient();
const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
}
```

認可:

```ts
where: { id, userId: user.id }
```

ログイン確認だけでは不十分です。DB操作でも`userId`を条件に入れる必要があります。

---

## 10. HTTPステータスコード

| コード | 意味 | RepMateでの使用例 |
|---|---|---|
| `200` | 成功 | 一覧取得・更新 |
| `201` | 作成成功 | 記録の新規作成 |
| `204` | 本文なしで成功 | 削除成功 |
| `400` | リクエスト不正 | Zod検証失敗 |
| `401` | 未認証 | 未ログイン |
| `404` | 対象なし | 記録が存在しない、または本人のものではない |
| `500` | サーバー内部エラー | DB保存失敗 |

`response.ok`はステータスが200番台かどうかを表します。

```ts
if (!response.ok) {
  throw new Error(data.error ?? "記録を保存できませんでした");
}
```

`??`はNull合体演算子です。左側が`null`または`undefined`のときだけ右側を使います。

---

## 11. try / catch / finally

```ts
setIsSavingRecord(true);

try {
  // API通信
} catch (error) {
  setToastMessage(
    error instanceof Error
      ? error.message
      : "記録を保存できませんでした",
  );
} finally {
  setIsSavingRecord(false);
}
```

- `try`：成功する可能性のある処理
- `catch`：通信やDB操作が失敗した場合
- `finally`：成功・失敗に関係なく最後に実行
- `error instanceof Error`：`error`がErrorオブジェクトか型を絞り込む

保存中フラグを`finally`で戻すことで、エラー時にもボタンが永遠に無効になるのを防ぎます。

---

## 12. React Hooksで覚える箇所

### useState

画面内で変化する値を保持します。

```ts
const [records, setRecords] = useState<TrainingRecordItem[]>([]);
const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
```

`TrainingRecordItem[]`は「TrainingRecordItemの配列」です。`string | null`は文字列またはnullを許可するUnion型です。

### useEffect

画面表示後の取得や、種目変更後の再取得に使います。

### useCallback

関数を再利用し、依存している`useEffect`が不要に再実行されるのを抑えます。

```ts
const fetchRecords = useCallback(async (targetExercise: Exercise) => {
  // 取得処理
}, []);
```

### useMemo

依存値が変わったときだけ計算し直します。

```ts
const apiMessages = useMemo(
  () => messages.map(({ role, content }) => ({ role, content })),
  [messages],
);
```

CRUDの理解には、まず`useState`と`useEffect`を優先してください。`useCallback`と`useMemo`は、その後で十分です。

---

## 13. TypeScriptで必須の構文

### オブジェクト型

```ts
type Item = {
  id: string;
  weight: number;
};
```

### Union型

```ts
type Status = "idle" | "loading" | "success" | "error";
```

決められた文字列だけを許可できます。

### 配列型

```ts
const records: TrainingRecordItem[] = [];
```

### keyof

```ts
field: keyof TrainingRecordDraft
```

`TrainingRecordDraft`のキーである`weight | reps | sets`だけを許可します。存在しないキーの入力ミスをコンパイル時に防げます。

### ジェネリクス

```ts
useState<TrainingRecordItem[]>([])
```

`<TrainingRecordItem[]>`によって、stateへ入る値の型を指定しています。

### 型アサーション

```ts
const data = (await response.json()) as { error?: string };
```

`as`は「この型として扱う」とTypeScriptへ伝える構文ですが、実行時検証はしません。外部入力を本当に安全にするにはZodなどが必要です。

### 分割代入

```ts
const { exercise, weight, reps, sets, memo } = result.data;
```

オブジェクトから必要なプロパティを取り出します。

---

## 14. 画面更新が2種類ある理由

```ts
await loadRecords(exercise);
router.refresh();
```

- `loadRecords(exercise)`：ReportScreen内の本日の記録を即時更新
- `router.refresh()`：Server Componentを再取得し、ホームや進捗に最新DB情報を反映

Reactのstateと、Next.jsのServer Componentが持つデータは別物です。この違いを理解すると「DBは更新されたのに画面が変わらない」という問題を追いやすくなります。

---

## 15. 目標機能のCRUDはどうなっているか

目標機能はトレーニング記録とは少し異なります。

| 操作 | 実装 |
|---|---|
| Create | 選択した目標を`training_goals`へ保存 |
| Read | 現在のactive目標や保存済み候補を取得 |
| Update | 保存済み候補から目標を変更 |
| Delete相当 | 物理削除せず`status: "cancelled"`へ変更 |

DBから行そのものを消すことを物理削除、状態を変更して利用対象から外すことを論理削除と呼びます。履歴を残したい目標には論理削除が向いています。

一方、トレーニング記録の削除は現在`DELETE`による物理削除です。

### 15-1. 目標保存時に関連データも残す

`POST /api/goals`では、次のデータを1つのトランザクションで保存します。

1. 相談した種目
2. ユーザーとAIの会話履歴
3. Geminiが生成した目標候補
4. 選択した候補
5. 有効なトレーニング目標

これにより「最終的な目標」だけでなく、「どの相談と候補から決まったか」も追跡できます。

### 15-2. 目標と種目を一致させる

`TrainingGoal`は`exerciseId`を持っています。画面へ返す際は関連する種目名も取得します。

```ts
include: {
  exercise: {
    select: { name: true },
  },
}
```

`/report`では選択中の種目と目標の種目を比較します。

```ts
const selectedExerciseGoal =
  activeGoal?.exercise === exercise ? activeGoal : null;
```

ベンチプレスの目標がある状態でスクワットを選んでも、ベンチプレスの目標を誤表示しません。ホーム、相談、報告では次の順番に表示を統一しています。

```text
今日の目標
ベンチプレス
フォームを崩さず10回を3セット行う
```

### 15-3. 保存済み候補から目標を変更する

`GET /api/goals/[id]`で相談時の候補を取得し、`PATCH /api/goals/[id]`で選択候補を変更します。PATCHでは次を同じトランザクションで更新します。

- 全候補の`isSelected`を`false`にする
- 新しく選んだ候補だけ`true`にする
- `training_goals`のタイトルと説明を変更する

### 15-4. 目標削除は論理削除

```ts
await prisma.trainingGoal.updateMany({
  where: { id, userId: user.id, status: "active" },
  data: { status: "cancelled" },
});
```

画面ではブラウザ標準アラートではなく、共通の`GoalDeleteAction`を使ってカード内で確認します。

```text
削除しますか？ [キャンセル] [削除する]
```

`isGoalDeleteConfirming`は確認UIの表示、`isDeletingGoal`はAPI通信中かどうかを表します。似た状態でも役割を分けることで、表示と通信を正しく制御できます。

---

## 16. Gemini APIを使ったAI相談

AI機能は大きく2種類あります。

| API | 役割 |
|---|---|
| `POST /api/chat` | 相談・報告の会話に返答する |
| `POST /api/goals/proposals` | 会話内容から目標候補を2〜3件作る |

### 16-1. 外部入力を型ガードで確認する

チャットAPIでは、リクエストJSONを最初から信用しません。

```ts
const isChatRequestBody = (value: unknown): value is ChatRequestBody => {
  // messages・role・contentなどを実行時に確認
};
```

`value is ChatRequestBody`はユーザー定義型ガードです。関数が`true`を返した後、TypeScriptは値を`ChatRequestBody`として扱えます。

### 16-2. 画面の会話をGemini形式へ変換する

画面では`assistant`というroleを使いますが、Geminiでは`model`へ変換します。

```ts
contents: messages.map((message) => ({
  role: message.role === "assistant" ? "model" : "user",
  parts: [{ text: message.content }],
}));
```

アプリ内の型と外部APIの仕様が違う場合、境界で変換するのが基本です。

### 16-3. AIのJSONも再検証する

目標候補ではGeminiへJSON形式を指定していますが、返答をそのままDBへ保存しません。

```ts
const parsed = goalProposalListSchema.safeParse(
  JSON.parse(extractText(data)),
);
```

生成AIの返答は外部入力です。JSONとして解析できるか、必要な件数・文字列が揃っているかをZodで再確認します。

### 16-4. モックと本番AIを切り替える

```ts
const shouldUseMockAi = process.env.USE_MOCK_AI === "true";
```

- `true`: 固定応答を返し、API料金やネットワークに依存せず開発する
- `false`: `GEMINI_API_KEY`を使ってGeminiを呼び出す

秘密情報である`GEMINI_API_KEY`はサーバー側だけで使用し、`NEXT_PUBLIC_`を付けません。

---

## 17. React Hook Formと認証画面

ログイン・新規登録画面ではReact Hook FormとZodを組み合わせています。

```ts
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<LoginFormValues>({
  resolver: zodResolver(loginSchema),
});
```

### register

```tsx
<input {...register("email")} />
```

`register()`は`name`、`onChange`、`onBlur`、`ref`などを返し、通常のinputをフォーム管理へ接続します。

### handleSubmit

```tsx
<form onSubmit={handleSubmit(onSubmit)}>
```

入力検証に成功した場合だけ`onSubmit`を呼びます。

### Controller

新規登録の性別選択は通常のinputではなくボタンUIなので、`Controller`を使います。

```tsx
<Controller
  name="gender"
  control={control}
  render={({ field }) => (
    <GenderSelector value={field.value} onChange={field.onChange} />
  )}
/>
```

### Supabase Auth

- ログイン: `signInWithPassword()`
- 新規登録: `signUp()`
- パスワード変更: `updateUser()`
- サーバーでの本人確認: `getUser()`

認証成功後の`router.refresh()`は、Server Componentにも最新の認証状態を反映するために使います。

ブラウザの自動入力で背景色が変わらないよう、認証inputには`auth-input`クラスと`:autofill`スタイルを適用しています。

---

## 18. SP・PCのレスポンシブ構成

RepMateはデータ処理を共有し、見た目だけをSPとPCへ分けています。

```text
ReportScreen（state・API処理）
  ├─ MobileReportView
  └─ DesktopReportView
```

### 共通状態を親で管理する理由

`records`、`exercise`、`isSavingRecord`などを親の`ReportScreen`で管理すると、SPとPCで保存処理を二重実装せずに済みます。各ViewにはPropsで値とイベント関数を渡します。

### SPの固定領域

- `MobileAppHeader`: 画面上部
- スクロール可能な`main`: 中央
- `AppTabBar`: 画面下部

`min-h-0`、`flex-1`、`overflow-y-auto`を組み合わせ、固定領域を除いた残りの高さだけをスクロールさせます。

### ResponsiveScreen

SPとPCの表示切り替えを共通化しています。画面ごとのコンポーネントは、ブレークポイント判定を繰り返し書く必要がありません。

### モバイル入力の注意

iOS Safariは16px未満のinputへフォーカスすると自動拡大することがあります。SPの入力文字は16px以上にすると、入力後に画面倍率が残る問題を防ぎやすくなります。

---

## 19. 進捗画面は記録から算出する

`/progress`は保存済みの`training_records`を基に表示します。

主な処理は次のとおりです。

1. 過去90日分を種目ごとに取得
2. 重量と回数から推定1RMを計算
3. 日付ごとの最大値を作る
4. 前回値との増減率を計算
5. 自己ベストとAIトレーナーの分析文を表示

画面用の計算処理は`progress/_lib/progress.ts`へ分離しています。表示コンポーネントから複雑な集計を外すことで、関数単位で読みやすくなります。

AIトレーナーのアイコンは相談・報告・進捗で`trainer-avatar.png`へ統一しています。

---

## 20. コンポーネントと型を分ける判断

RepMateでは、再利用するUIや複雑なProps型を別ファイルへ分けています。

例:

| UI | Props型 |
|---|---|
| `TrainerChat.tsx` | `_types/trainer-chat.ts` |
| `GoalDeleteAction.tsx` | `_types/goal-delete-action.ts` |
| `HomeActionCard.tsx` | `_types/home.ts` |

一方、1コンポーネント内だけで使う単純な型は、近くに置く場合もあります。

```ts
const CurrentGoalSummary = ({ goal }: { goal: GoalSummary }) => ...;
```

すべての型を機械的に分離するのではなく、次を目安にします。

- 複数ファイルで使う
- Propsが多い
- 業務上の意味を持つ
- 別ファイルにした方が画面コードを読みやすくできる

ホームの「相談する」「報告する」「目標を設定する」にはNext.jsの`Link`を使います。単なる`button`では遷移しないため、見た目だけでなく実際の操作まで確認することが重要です。

---

## 21. 最低限、自力で書けるようにしたいテンプレート

### クライアント側

```ts
const createItem = async () => {
  try {
    const response = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "sample" }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    // 一覧を再取得する、またはstateへ追加する
  } catch (error) {
    console.error(error);
  }
};
```

### API側

```ts
export const POST = async (request: Request) => {
  const body: unknown = await request.json().catch(() => null);
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "入力エラー" }, { status: 400 });
  }

  const item = await prisma.item.create({
    data: result.data,
  });

  return NextResponse.json({ item }, { status: 201 });
};
```

丸暗記するより、次の順番を覚えてください。

```text
受け取る → 検証する → DB操作する → 結果を返す
```

---

## 22. セキュリティ上、外してはいけない記述

次は「短くしたいから」と削除してはいけません。

```ts
if (!user) {
  return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
}
```

```ts
const result = schema.safeParse(body);
if (!result.success) {
  // 400を返す
}
```

```ts
where: { id, userId: user.id }
```

認証・入力検証・所有者確認の3つが基本セットです。

---

## 23. 学習課題

### レベル1: 読んで答える

1. `POST`と`PATCH`の違いは何ですか？
2. なぜ`request.json()`の結果を`unknown`にしていますか？
3. `response.ok`が`false`になるのはどんな場合ですか？
4. `userId: user.id`を検索条件へ入れる理由は何ですか？
5. `finally`がない場合、どんな不具合が起きますか？

### レベル2: 小さく変更する

1. 記録編集で`memo`も変更できるようにする
2. 削除中だけ削除ボタンを無効化する
3. Zodの重量上限を変更し、なぜその値にしたか説明する
4. APIエラー時のメッセージをステータスごとに変える

### レベル3: 自力で追加する

1. 記録詳細を1件取得する`GET /api/training-records/[id]`
2. 今日ではなく日付を指定して取得する機能
3. 直前の削除を取り消せる論理削除方式

---

## 24. 理解度チェックリスト

- [ ] CRUDの4単語とHTTPメソッドを対応させられる
- [ ] `fetch`のPOSTを見ずに書ける
- [ ] `async / await`を説明できる
- [ ] `unknown`と`any`の違いを説明できる
- [ ] `safeParse()`成功後に`result.data`を使う理由が分かる
- [ ] `findMany`、`createMany`、`update`、`delete`の役割が分かる
- [ ] 認証と認可の違いを説明できる
- [ ] `userId: user.id`が必要な理由を説明できる
- [ ] `try / catch / finally`を書ける
- [ ] `useState`と`useEffect`の役割を説明できる
- [ ] `string | null`、配列型、`keyof`を読める
- [ ] DB更新後に画面を更新する方法を説明できる
- [ ] 物理削除と論理削除の違いを説明できる
- [ ] Geminiの返答を再検証する理由が分かる
- [ ] `register`、`handleSubmit`、`Controller`の役割を説明できる
- [ ] Server ComponentとClient Componentの役割を説明できる
- [ ] SPとPCで状態管理を共通化する理由が分かる

12個以上説明できれば、現在のRepMate実装の主要部分はかなり身についています。説明できない項目は、その項目に関係する実コードへ戻って確認してください。

---

## 25. 最後に押さえる要点

RepMateのCRUDで最も大切なのは、Prismaのメソッド名を暗記することだけではありません。

1. 画面が正しいHTTPリクエストを作る
2. APIがユーザーを認証する
3. APIが外部入力をZodで検証する
4. Prismaが本人のデータだけを操作する
5. 成功・失敗を適切なステータスで返す
6. 画面が結果を受けてstateを更新する
7. 外部AIの返答もZodで再検証する
8. SP・PCの表示を分けても、状態とAPI処理は共通化する
9. DBにある種目との関連を画面表示でも失わない
10. 破壊的な操作には確認UIを用意する

この一連の流れを実コードを指しながら説明できれば、CRUDだけでなく、認証・生成AI・レスポンシブ画面を含むアプリ機能を自力で組み立てやすくなります。
