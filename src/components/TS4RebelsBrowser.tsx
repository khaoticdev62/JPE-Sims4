"use client";

/**
 * TS4Rebels Mod Browser
 *
 * Browse Sims 4 mod donations from ts4rebels.cc.
 * Fetches forum topics, extracts download links, and displays mod metadata.
 */
import { useState, useEffect, useMemo } from "react";
import {
  Search, Download, ExternalLink, Calendar, User, MessageSquare,
  Eye, RefreshCw, FolderOpen, AlertCircle,
} from "lucide-react";
import { T } from "./robust/jpe-theme";
import { TS4RebelsService, type TS4RebelsTopicSummary, type TS4RebelsPost } from "@/services/api/TS4RebelsService";

interface TopicWithLinks extends TS4RebelsTopicSummary {
  links?: Array<{ url: string; label: string | null }>;
}

export function TS4RebelsBrowser() {
  const [topics, setTopics] = useState<TopicWithLinks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedTopic, setSelectedTopic] = useState<TopicWithLinks | null>(null);
  const [topicPosts, setTopicPosts] = useState<TS4RebelsPost[]>([]);
  const [topicLoading, setTopicLoading] = useState(false);

  // Fetch forum topics on mount
  useEffect(() => {
    loadForumTopics();
  }, [page]);

  const loadForumTopics = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await TS4RebelsService.listForum(59, page);
      if (result.success && result.data.topics) {
        setTopics(result.data.topics);
      } else {
        setError(result.error || "Failed to load forum topics");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const loadTopicPosts = async (topic: TopicWithLinks) => {
    setSelectedTopic(topic);
    setTopicLoading(true);
    try {
      const result = await TS4RebelsService.getTopic(topic.topic_id);
      if (result.success && result.data.posts) {
        const links = TS4RebelsService.extractDownloadLinks(result.data.posts);
        setTopicPosts(result.data.posts);
        setSelectedTopic({ ...topic, links });
      }
    } catch {
      // Silently fail — user can retry
    } finally {
      setTopicLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search) return topics;
    const q = search.toLowerCase();
    return topics.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.author.toLowerCase().includes(q)
    );
  }, [topics, search]);

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: T.sans }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${T.violet}15`, border: `1px solid ${T.borderSubtle}` }}>
            <FolderOpen size={16} color={T.violet} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>TS4Rebels Mod Browser</div>
            <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.mono }}>Community mod donations · Page {page}</div>
          </div>
        </div>
        <button
          onClick={loadForumTopics}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
          style={{ background: T.bgInput, border: `1px solid ${T.borderSubtle}`, color: T.textSecondary, fontSize: 11 }}
          disabled={loading}
        >
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-2 flex-shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: T.bgInput, border: `1px solid ${T.borderSubtle}` }}>
          <Search size={11} color={T.textMuted} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mod title or author..."
            className="bg-transparent outline-none flex-1"
            style={{ fontSize: 11, color: T.textSecondary }}
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mx-4 mb-2 px-3 py-2 rounded-lg flex items-center gap-2" style={{ background: `${T.rose}10`, border: `1px solid ${T.rose}30` }}>
          <AlertCircle size={12} color={T.rose} />
          <span style={{ fontSize: 11, color: T.rose }}>{error}</span>
          <button onClick={loadForumTopics} style={{ fontSize: 10, color: T.violetBright, background: "none", border: "none", cursor: "pointer" }} className="ml-auto">
            Retry
          </button>
        </div>
      )}

      {/* Body: two-panel layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: topic list */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden" style={{ borderRight: `1px solid ${T.border}` }}>
          <div className="grid px-4 py-1.5 flex-shrink-0" style={{ gridTemplateColumns: "1fr 60px 60px 60px", gap: 8, background: T.bgSurface, borderBottom: `1px solid ${T.border}` }}>
            {["Topic", "Replies", "Views", "Date"].map((h) => (
              <span key={h} style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {h}
              </span>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw size={16} color={T.textMuted} className="animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <FolderOpen size={20} color={T.textDim} />
                <span style={{ fontSize: 11, color: T.textMuted }}>No topics found</span>
              </div>
            ) : (
              filtered.map((topic) => {
                const isSelected = selectedTopic?.topic_id === topic.topic_id;
                return (
                  <div
                    key={topic.topic_id}
                    className="grid items-center px-4 py-2.5 cursor-pointer transition-colors"
                    style={{
                      gridTemplateColumns: "1fr 60px 60px 60px",
                      gap: 8,
                      borderBottom: `1px solid ${T.borderSubtle}`,
                      background: isSelected ? `${T.violet}08` : "transparent",
                      borderLeft: `2px solid ${isSelected ? T.violet : "transparent"}`,
                    }}
                    onClick={() => loadTopicPosts(topic)}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = T.bgHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? `${T.violet}08` : "transparent"; }}
                  >
                    <div className="min-w-0">
                      <div className="truncate" style={{ fontSize: 11, fontWeight: isSelected ? 600 : 400, color: isSelected ? T.textPrimary : T.textSecondary }}>
                        {topic.title}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <User size={8} color={T.textMuted} />
                        <span style={{ fontSize: 9, color: T.textMuted }}>{topic.author}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1" style={{ fontSize: 10, fontFamily: T.mono, color: T.textTertiary }}>
                      <MessageSquare size={10} />
                      {topic.reply_count}
                    </div>
                    <div className="flex items-center gap-1" style={{ fontSize: 10, fontFamily: T.mono, color: T.textTertiary }}>
                      <Eye size={10} />
                      {topic.view_count}
                    </div>
                    <div style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>
                      {topic.created_at?.slice(0, 10) ?? ""}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          <div className="px-4 py-2 flex items-center justify-between flex-shrink-0" style={{ borderTop: `1px solid ${T.borderSubtle}`, background: "rgba(0,0,0,0.1)" }}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              style={{ fontSize: 10, color: page <= 1 ? T.textMuted : T.cyan, background: "none", border: "none", cursor: page <= 1 ? "default" : "pointer", opacity: page <= 1 ? 0.5 : 1 }}
            >
              ← Prev
            </button>
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              style={{ fontSize: 10, color: T.cyan, background: "none", border: "none", cursor: "pointer" }}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Right: topic detail + download links */}
        <div className="flex flex-col flex-shrink-0 overflow-hidden" style={{ width: 340, background: "rgba(0,0,0,0.08)" }}>
          {selectedTopic ? (
            <>
              <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, lineHeight: 1.4, marginBottom: 6 }}>
                  {selectedTopic.title}
                </div>
                <div className="flex items-center gap-3" style={{ fontSize: 9, color: T.textMuted }}>
                  <span className="flex items-center gap-1"><User size={8} /> {selectedTopic.author}</span>
                  <span className="flex items-center gap-1"><Calendar size={8} /> {selectedTopic.created_at?.slice(0, 10)}</span>
                </div>
              </div>

              {topicLoading ? (
                <div className="flex items-center justify-center flex-1">
                  <RefreshCw size={16} color={T.textMuted} className="animate-spin" />
                </div>
              ) : selectedTopic.links && selectedTopic.links.length > 0 ? (
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em", marginBottom: 8 }}>
                    DOWNLOAD LINKS ({selectedTopic.links.length})
                  </div>
                  {selectedTopic.links.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                      style={{ background: T.bgInput, border: `1px solid ${T.borderSubtle}`, textDecoration: "none" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = T.bgHover; e.currentTarget.style.borderColor = T.borderActive; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = T.bgInput; e.currentTarget.style.borderColor = T.borderSubtle; }}
                    >
                      <Download size={12} color={T.emerald} />
                      <span className="truncate flex-1" style={{ fontSize: 10, color: T.textSecondary }}>{link.label || link.url}</span>
                      <ExternalLink size={10} color={T.textMuted} />
                    </a>
                  ))}
                </div>
              ) : topicPosts.length > 0 ? (
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em", marginBottom: 8 }}>
                    POSTS ({topicPosts.length})
                  </div>
                  {topicPosts.map((post) => (
                    <div key={post.post_id} className="px-3 py-2 rounded-lg" style={{ background: T.bgInput, border: `1px solid ${T.borderSubtle}` }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <User size={8} color={T.textMuted} />
                        <span style={{ fontSize: 9, color: T.textSecondary }}>{post.author ?? "Anonymous"}</span>
                        <span style={{ fontSize: 8, color: T.textMuted, marginLeft: "auto" }}>{post.created_at?.slice(0, 10)}</span>
                      </div>
                      {post.links.length > 0 && (
                        <div className="space-y-1 mt-1">
                          {post.links.filter((l) => !l.url.includes("ts4rebels.cc")).map((link, i) => (
                            <a
                              key={i}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                              style={{ fontSize: 9, color: T.cyan, textDecoration: "none" }}
                            >
                              <Download size={8} />
                              <span className="truncate">{link.label || link.url}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 gap-3">
                  <Download size={20} color={T.textDim} strokeWidth={1.5} />
                  <span style={{ fontSize: 11, color: T.textMuted }}>No download links found</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 gap-3">
              <FolderOpen size={20} color={T.textDim} strokeWidth={1.5} />
              <span style={{ fontSize: 11, color: T.textMuted }}>Select a topic to view downloads</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
