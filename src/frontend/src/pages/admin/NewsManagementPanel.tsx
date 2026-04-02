import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Loader2, Plus, Star, StarOff, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../../hooks/useActor";

interface NewsPost {
  id: bigint;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  imageUrl: string;
  publishedAt: bigint;
  featured: boolean;
}

const EMPTY_FORM = {
  title: "",
  summary: "",
  content: "",
  category: "Market Trends",
  author: "GlobalInvest Editorial",
  imageUrl: "",
  featured: false,
};

const CATEGORIES = [
  "Market Trends",
  "Investment",
  "Global Markets",
  "Regulation",
  "Technology",
];

function formatDate(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function NewsManagementPanel() {
  const { actor } = useActor();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [imgError, setImgError] = useState(false);

  const fetchPosts = useCallback(() => {
    if (!actor) return;
    actor
      .getAllNewsPosts()
      .then((result) => {
        const sorted = [...(result as NewsPost[])].sort((a, b) =>
          Number(b.publishedAt - a.publishedAt),
        );
        setPosts(sorted);
      })
      .catch(() => toast.error("Failed to load news posts"))
      .finally(() => setLoading(false));
  }, [actor]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const openCreate = () => {
    setEditingPost(null);
    setForm(EMPTY_FORM);
    setImgError(false);
    setDialogOpen(true);
  };

  const openEdit = (post: NewsPost) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      summary: post.summary,
      content: post.content,
      category: post.category,
      author: post.author,
      imageUrl: post.imageUrl,
      featured: post.featured,
    });
    setImgError(false);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!actor) return;
    if (!form.title.trim() || !form.summary.trim()) {
      toast.error("Title and summary are required");
      return;
    }
    setSaving(true);
    try {
      if (editingPost) {
        await actor.updateNewsPost(
          editingPost.id,
          form.title,
          form.summary,
          form.content,
          form.category,
          form.author,
          form.imageUrl,
          form.featured,
        );
        toast.success("News post updated");
      } else {
        await actor.createNewsPost(
          form.title,
          form.summary,
          form.content,
          form.category,
          form.author,
          form.imageUrl,
          form.featured,
        );
        toast.success("News post created");
      }
      setDialogOpen(false);
      fetchPosts();
    } catch {
      toast.error("Failed to save news post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    setDeletingId(id);
    try {
      await actor.deleteNewsPost(id);
      toast.success("News post deleted");
      fetchPosts();
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleFeatured = async (post: NewsPost) => {
    if (!actor) return;
    try {
      await actor.updateNewsPost(
        post.id,
        post.title,
        post.summary,
        post.content,
        post.category,
        post.author,
        post.imageUrl,
        !post.featured,
      );
      toast.success(post.featured ? "Unfeatured" : "Featured on home page");
      fetchPosts();
    } catch {
      toast.error("Failed to update featured status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            News Management
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create, edit, and feature news posts shown on the home page.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          New Post
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading posts...
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium mb-1">No news posts yet</p>
          <p className="text-sm">
            Create your first post to show it on the home page.
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={String(post.id)}>
                  <TableCell className="font-medium max-w-xs">
                    <p className="truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {post.summary}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {post.author}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(post.publishedAt)}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => toggleFeatured(post)}
                      className="p-1 rounded hover:bg-muted transition-colors"
                      title={
                        post.featured ? "Unfeature" : "Feature on home page"
                      }
                    >
                      {post.featured ? (
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ) : (
                        <StarOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(post)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        disabled={deletingId === post.id}
                        className="h-8 w-8 p-0 hover:text-destructive hover:bg-destructive/10"
                      >
                        {deletingId === post.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Edit News Post" : "Create News Post"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Article headline"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Summary *</Label>
              <Textarea
                value={form.summary}
                onChange={(e) =>
                  setForm((f) => ({ ...f, summary: e.target.value }))
                }
                placeholder="Brief summary shown on the card"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Author</Label>
                <Input
                  value={form.author}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, author: e.target.value }))
                  }
                  placeholder="Author name"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Image URL</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => {
                  setImgError(false);
                  setForm((f) => ({ ...f, imageUrl: e.target.value }));
                }}
                placeholder="https://..."
              />
              {form.imageUrl && !imgError && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">
                    Preview
                  </p>
                  <img
                    src={form.imageUrl}
                    alt="News post preview"
                    className="w-full max-h-40 object-cover rounded-lg border border-border"
                    onError={() => setImgError(true)}
                  />
                </div>
              )}
              {form.imageUrl && imgError && (
                <p className="text-xs text-destructive mt-1">
                  Unable to load image from this URL.
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                id="featured-check"
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm((f) => ({ ...f, featured: e.target.checked }))
                }
                className="w-4 h-4 accent-primary"
              />
              <Label htmlFor="featured-check" className="cursor-pointer">
                Feature on home page
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingPost ? "Save Changes" : "Create Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
