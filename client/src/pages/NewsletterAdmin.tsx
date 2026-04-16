import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  ArrowLeft,
  Mail,
  Send,
  Eye,
  Users,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Copy,
  ExternalLink,
} from "lucide-react";

export default function NewsletterAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [digestResult, setDigestResult] = useState<any>(null);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  const statusQuery = trpc.newsletter.status.useQuery();
  const previewQuery = trpc.newsletter.previewDigest.useQuery(
    { siteUrl },
    { enabled: false }
  );

  const sendDigestMutation = trpc.newsletter.sendDigest.useMutation();

  const handlePreview = async () => {
    try {
      const result = await previewQuery.refetch();
      if (result.data) {
        setPreviewHtml(result.data.html);
      }
    } catch (err: any) {
      toast.error("Failed to generate preview: " + (err.message || "Unknown error"));
    }
  };

  const handleSendDigest = async (asDraft: boolean) => {
    setSending(true);
    try {
      const result = await sendDigestMutation.mutateAsync({
        siteUrl,
        sendViaBeehiiv: statusQuery.data?.configured ?? false,
        asDraft,
      });
      setDigestResult(result);
      if (result.success) {
        toast.success(
          result.method === "beehiiv_post"
            ? `Digest ${asDraft ? "saved as draft" : "sent"} via Beehiiv!`
            : "Digest generated and owner notified!"
        );
      } else {
        toast.error("Digest generation failed: " + (result.error || "Unknown error"));
      }
    } catch (err: any) {
      toast.error("Failed: " + (err.message || "Unknown error"));
    } finally {
      setSending(false);
    }
  };

  const handleCopyHtml = () => {
    if (previewHtml) {
      navigator.clipboard.writeText(previewHtml);
      toast.success("HTML copied to clipboard — paste into Beehiiv editor");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">You must be logged in to access this page.</p>
          <Link href="/login">
            <Button variant="outline" className="border-teal-500 text-teal-400">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Header */}
      <div className="border-b border-[#2a2f3a] bg-[#0f1117]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="h-6 w-px bg-[#2a2f3a]" />
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-teal-400" />
              <h1 className="text-lg font-semibold font-sans">Newsletter Manager</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-6 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Beehiiv Status */}
          <div className="bg-[#1a1f2e] border border-[#2a2f3a] rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              {statusQuery.data?.configured ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              )}
              <span className="text-sm font-medium text-gray-300">Beehiiv Connection</span>
            </div>
            <p className="text-2xl font-bold font-mono text-white">
              {statusQuery.isLoading ? "..." : statusQuery.data?.configured ? "Connected" : "Not Configured"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {statusQuery.data?.configured
                ? "API key and publication ID are set"
                : "Add BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID in Settings > Secrets"}
            </p>
          </div>

          {/* Subscribers */}
          <div className="bg-[#1a1f2e] border border-[#2a2f3a] rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-teal-400" />
              <span className="text-sm font-medium text-gray-300">Beehiiv Subscribers</span>
            </div>
            <p className="text-2xl font-bold font-mono text-white">
              {statusQuery.isLoading ? "..." : statusQuery.data?.totalSubscribers ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Active subscribers on Beehiiv</p>
          </div>

          {/* Last Digest */}
          <div className="bg-[#1a1f2e] border border-[#2a2f3a] rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-medium text-gray-300">Digest Status</span>
            </div>
            <p className="text-2xl font-bold font-mono text-white">
              {digestResult ? (digestResult.success ? "Sent" : "Failed") : "Ready"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {digestResult?.method === "beehiiv_post"
                ? "Published via Beehiiv"
                : digestResult?.method === "notification"
                ? "Owner notified"
                : "Generate a preview to get started"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-[#1a1f2e] border border-[#2a2f3a] rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-teal-400" />
            Weekly Digest Actions
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Generate the weekly IPO summary email with the latest SEC EDGAR filings, upcoming events,
            and links to AI initiation reports. Preview the content before sending.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handlePreview}
              disabled={previewQuery.isFetching}
              className="bg-[#252a3a] hover:bg-[#2a3040] text-white border border-[#3a3f4a]"
            >
              {previewQuery.isFetching ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              Preview Digest
            </Button>

            {previewHtml && (
              <Button
                onClick={handleCopyHtml}
                className="bg-[#252a3a] hover:bg-[#2a3040] text-white border border-[#3a3f4a]"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy HTML for Beehiiv
              </Button>
            )}

            <Button
              onClick={() => handleSendDigest(true)}
              disabled={sending}
              className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/40"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Save as Draft
            </Button>

            <Button
              onClick={() => handleSendDigest(false)}
              disabled={sending}
              className="bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-600/40"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send Now
            </Button>
          </div>

          {!statusQuery.data?.configured && (
            <div className="mt-4 p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg">
              <p className="text-sm text-amber-300">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Beehiiv is not configured. The digest will be generated and you can copy the HTML to paste
                into Beehiiv manually. To enable direct API posting, add your Beehiiv API key and Publication ID
                in Settings &gt; Secrets.
              </p>
            </div>
          )}
        </div>

        {/* Digest Result */}
        {digestResult && (
          <div className={`border rounded-lg p-5 mb-8 ${
            digestResult.success
              ? "bg-emerald-900/10 border-emerald-700/30"
              : "bg-red-900/10 border-red-700/30"
          }`}>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              {digestResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              )}
              {digestResult.success ? "Digest Generated Successfully" : "Digest Failed"}
            </h3>
            {digestResult.data && (
              <div className="text-sm text-gray-400 space-y-1">
                <p>Period: {digestResult.data.weekStart} — {digestResult.data.weekEnd}</p>
                <p>Filings included: {digestResult.data.totalFilingsThisWeek}</p>
                <p>Delivery method: <span className="text-teal-400 font-mono">{digestResult.method}</span></p>
                {digestResult.postId && (
                  <p>Beehiiv Post ID: <span className="text-teal-400 font-mono">{digestResult.postId}</span></p>
                )}
              </div>
            )}
            {digestResult.error && (
              <p className="text-sm text-red-400 mt-2">{digestResult.error}</p>
            )}
          </div>
        )}

        {/* Preview Panel */}
        {previewHtml && (
          <div className="border border-[#2a2f3a] rounded-lg overflow-hidden">
            <div className="bg-[#1a1f2e] px-5 py-3 border-b border-[#2a2f3a] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Eye className="w-4 h-4 text-teal-400" />
                Email Preview
              </h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyHtml}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy HTML
                </Button>
              </div>
            </div>
            <div className="bg-[#0a0b0f] p-4">
              <div
                className="max-w-[640px] mx-auto rounded-lg overflow-hidden"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>
        )}

        {/* Setup Guide */}
        <div className="mt-8 bg-[#1a1f2e] border border-[#2a2f3a] rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Setup Guide</h2>
          <div className="space-y-4 text-sm text-gray-400">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">1</span>
              <div>
                <p className="text-white font-medium">Create a Beehiiv account</p>
                <p>Sign up at <a href="https://beehiiv.com" target="_blank" rel="noopener" className="text-teal-400 hover:underline">beehiiv.com</a> and create a publication for your IPO newsletter.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">2</span>
              <div>
                <p className="text-white font-medium">Get your API credentials</p>
                <p>Go to Settings &gt; Integrations &gt; API in Beehiiv. Copy your API Key and Publication ID.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">3</span>
              <div>
                <p className="text-white font-medium">Add secrets to IPO Radar</p>
                <p>In your Manus project, go to Settings &gt; Secrets and add <code className="text-teal-400 bg-teal-900/20 px-1 rounded">BEEHIIV_API_KEY</code> and <code className="text-teal-400 bg-teal-900/20 px-1 rounded">BEEHIIV_PUBLICATION_ID</code>.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">4</span>
              <div>
                <p className="text-white font-medium">Send your first digest</p>
                <p>Click "Preview Digest" above to see the email, then "Send Now" or copy the HTML to paste into Beehiiv's editor.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
