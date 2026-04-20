// --- Generic wrappers ---
export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// --- Config ---
export interface AppConfig {
  eras: string[];
  bridge_types: string[];
  regions: string[];
  map: { provider: string; approval_number: string };
}

// --- Knowledge ---
export interface KnowledgeTreeLine {
  id: string;
  name: string;
  icon_url: string | null;
  children: KnowledgeTreeCategory[];
}

export interface KnowledgeTreeCategory {
  id: string;
  name: string;
  children: KnowledgeTreePoint[];
}

export interface KnowledgeTreePoint {
  id: string;
  name: string;
  type: 'knowledge_point';
  tags: string[];
  summary: string;
}

export interface KnowledgeTree {
  lines: KnowledgeTreeLine[];
}

export interface Illustration { url: string; caption: string; }
export interface RelatedTerm { id: string; name: string; }

export interface Citation {
  source_id: string;
  title: string;
}

export interface KeyPoint {
  id: string;
  summary: string;
  order: number;
  explanation?: string;
  illustrations?: Illustration[];
  related_terms?: RelatedTerm[];
  citations?: Citation[];
}

export interface Comparison { title: string; content: string; citations: Citation[]; }

export interface Controversy {
  title: string;
  description: string;
  confidence: string;
  views: { position: string; citations: Citation[] }[];
}

export interface FurtherReading { title: string; source_id: string; }

export interface Source {
  id: string;
  title: string;
  type: string;
  author?: string;
  excerpt?: string;
  location?: string;
  /**
   * English summary of the source chunk. Only present when the request locale
   * is `en-US` and the backend LLM generation succeeded. UI should prefer
   * `text_en` in English locale and fall back to `text_zh` / `excerpt` when
   * missing (e.g. degraded responses).
   */
  text_en?: string;
  /** Raw Chinese chunk text — always present. */
  text_zh?: string;
  /** Optional stable chunk identifier (distinct from citation `source_id`). */
  chunk_id?: string;
  source_id?: string;
  source_title?: string;
}

export interface KnowledgePointDetail {
  id: string;
  name: string;
  aliases: string[];
  line: { id: string; name: string };
  category: { id: string; name: string };
  tags: string[];
  difficulty: string;
  l0: { key_points: KeyPoint[]; typical_bridges_count: number };
  l1: { key_points: KeyPoint[] };
  l2: {
    comparisons: Comparison[];
    evolution: string;
    controversies: Controversy[];
    further_reading: FurtherReading[];
  };
  sources: Source[];
}

// --- Bridges ---
export interface BridgeListItem {
  id: string;
  name: string;
  aliases: string | null;
  bridge_type: string;
  era: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
  thumbnail: string | null;
  distance?: number | null;
  relevance_note?: string;
}

export interface Cluster {
  latitude: number;
  longitude: number;
  count: number;
  representative: { id: string; name: string };
}

export interface ClustersResponse {
  clusters: Cluster[];
  points: { id: string; name: string; bridge_type: string; latitude: number; longitude: number }[];
}

export interface BridgeImage { url: string; caption: string; type: string; }

export interface SectionContent {
  id?: string;
  summary: string;
  order?: number;
  detail?: string;
  citations?: Citation[];
}

export interface BridgeSectionLevel {
  l0: SectionContent[];
  l1: SectionContent[];
}

export type BridgeSections = Record<string, BridgeSectionLevel>;

export interface BridgeDetail {
  id: string;
  name: string;
  aliases: string;
  bridge_type: string;
  era: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
  tags: string[];
  images: BridgeImage[];
  sections: BridgeSections;
  related_knowledge_points: { id: string; name: string; relevance: string }[];
  sources: Source[];
  sources_count: number;
}

// --- Search ---
export interface SearchResult {
  type: 'bridge' | 'knowledge_point';
  id: string;
  name: string;
  aliases: string | null;
  highlight: string;
  bridge_type: string | null;
  era: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  line: string | null;
  thumbnail: string | null;
}

export interface SearchResponse {
  results: SearchResult[];
  suggestions: string[];
}

// --- Recognition ---
export interface RecognitionCandidate {
  bridge_id: string;
  name: string;
  bridge_type: string;
  era: string;
  region: string;
  thumbnail: string | null;
  confidence_hints: string[];
}

export interface RecognitionResponse {
  candidates: RecognitionCandidate[];
  fallback_suggestions?: { search_hint: string | null; region_hint: string | null };
}

// --- QA (SSE events) ---
export interface QAOutlineEvent {
  key_points: { id: string; summary: string; order: number }[];
}

export interface QADetailEvent {
  key_point_id: string;
  explanation: string;
  citations: Citation[];
}

export interface QADeepDiveEvent {
  comparisons: Comparison[];
  controversies: Controversy[];
  further_reading: FurtherReading[];
}

export interface QASourcesEvent { sources: Source[]; }

/**
 * Fired at stream start to communicate the locale the backend decided to
 * answer in. For `en-US` requests the backend may also echo the original
 * Chinese translation of the query for debugging.
 */
export interface QAStartedEvent {
  locale: 'zh-CN' | 'en-US';
  question_zh?: string;
}

/**
 * Fired when the stream finishes. Extends the legacy `{qa_id}` shape with
 * Phase 4 i18n fields:
 * - `locale` — what the backend actually produced (may differ on fallback)
 * - `degraded` — true when English generation failed and the answer fell
 *   back to Chinese; UI shows an inline amber banner when set
 * - `reason` — optional machine-readable explanation (e.g.
 *   `translate_answer_failed`) for logging / analytics
 */
export interface QADoneEvent {
  qa_id?: string;
  locale?: 'zh-CN' | 'en-US';
  degraded?: boolean;
  reason?: string | null;
}

export interface QAErrorEvent {
  /**
   * Machine-readable error code. Phase 4 may additionally surface
   * `TRANSLATE_TIMEOUT` / `GENERATE_FAILED` on top of the legacy codes; the
   * UI layer resolves the copy via `t(\`errors.\${code}\`)` and falls back
   * to `errors.UNKNOWN` when the key is missing.
   */
  code: string;
  message: string;
  /** Optional HTTP status passed through from the transport layer (SSE client). */
  status?: number;
  fallback_actions: { type: string; label: string; id?: string; ids?: string[] }[];
}

// --- Flash Cards ---
export interface FlashCard {
  id: string;
  knowledge_point_id?: string;
  card_type: 'concept' | 'identification';
  front: { title: string; hint: string };
  back: { answer: string; key_features: string[]; example_bridge: { id: string; name: string } | null };
  last_reviewed_at?: string;
  mastery?: 'mastered' | 'needs_review';
}

// --- Favorites ---
export interface FavoriteItem {
  id: string;
  target_type: 'bridge' | 'knowledge_point' | 'flashcard';
  target_id: string;
  target_name: string;
  target_summary: string;
  thumbnail: string | null;
  created_at: string;
}

export interface FavoriteCheckResult {
  [targetId: string]: { favorited: boolean; favorite_id: string | null };
}

// --- Review ---
export interface ReviewCard extends FlashCard {
  last_reviewed_at: string;
  mastery: 'mastered' | 'needs_review';
}

export interface ReviewTodayResponse {
  cards: ReviewCard[];
  total_due: number;
}

// --- History ---
export interface HistoryItem {
  target_type: 'bridge' | 'knowledge_point';
  target_id: string;
  target_name: string;
  viewed_at: string;
}
