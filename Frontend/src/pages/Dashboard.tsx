import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAnalysis } from "@/context/analysis-context";
import { fetchMe } from "@/lib/auth";
import { compactINR, formatINR, shortFundName } from "@/lib/format";
import type { AnalysisData } from "@/types/analysis";

function findMaxOverlapRow(data: AnalysisData) {
  const matrix = data.overlap_analysis?.matrix;
  if (!matrix?.length) return null;
  let best = matrix[0];
  for (const row of matrix) {
    if ((row.overlap ?? 0) > (best.overlap ?? 0)) best = row;
  }
  return best;
}

export default function Dashboard() {
  const { state } = useAnalysis();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetchMe()
      .then((u) =>
        setUserName(u.username || u.email?.split("@")[0] || ""),
      )
      .catch(() => setUserName(""));
  }, []);

  const hasAnalysis = Boolean(state.result);
  const data = state.result;

  const overlapRow = useMemo(
    () => (data ? findMaxOverlapRow(data) : null),
    [data],
  );

  return (
    <div className="pb-12">
      <h1
        className="font-fraunces text-[28px] text-text-primary"
        style={{ fontVariationSettings: "'opsz' 72, 'wght' 700" }}
      >
        {hasAnalysis ? `Welcome back, ${userName || "there"}.` : `Welcome, ${userName || "there"}.`}
      </h1>

      {!hasAnalysis ? (
        <>
          <div className="card-arth mt-8 p-8">
            <div className="mb-6 h-0.5 w-12 bg-accent" />
            <h2
              className="font-fraunces text-[22px] text-text-primary"
              style={{ fontVariationSettings: "'opsz' 72, 'wght' 700" }}
            >
              Upload your CAS to begin
            </h2>
            <p className="font-syne mt-4 max-w-xl text-sm leading-relaxed text-text-secondary">
              Your CAMS or KFintech Consolidated Account Statement contains everything we need. Nine
              agents will compute your XIRR, overlap, expense drag, and more.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/analyze"
                className="font-syne inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "hsl(var(--accent))" }}
              >
                Analyze My Portfolio
              </Link>
              <Link
                to="/demo"
                className="font-syne inline-flex h-11 items-center justify-center rounded-lg border border-white/[0.12] px-6 text-sm font-semibold text-text-secondary transition-colors hover:border-white/[0.2]"
              >
                Try Sample Data
              </Link>
            </div>
          </div>
          <p className="font-syne mt-6 text-xs text-text-muted">
            These tools work independently. Upload a CAS for personalized results.
          </p>
        </>
      ) : (
        data && (
          <>
            <div className="card-arth mt-8 p-6">
              <p className="font-mono text-xs uppercase tracking-[2px] text-text-muted">
                Portfolio snapshot
              </p>
              <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
                <div>
                  <p className="font-syne text-xs uppercase tracking-wider text-text-muted">
                    Total value
                  </p>
                  <p className="font-mono-dm mt-1 text-2xl text-text-primary">
                    {compactINR(data.portfolio_summary.total_current_value)}
                  </p>
                </div>
                <div>
                  <p className="font-syne text-xs uppercase tracking-wider text-text-muted">XIRR</p>
                  <p className="font-mono-dm mt-1 text-2xl text-text-primary">
                    {data.portfolio_xirr.display}
                  </p>
                </div>
                <div>
                  <p className="font-syne text-xs uppercase tracking-wider text-text-muted">
                    Health score
                  </p>
                  <p className="font-mono-dm mt-1 text-2xl text-text-primary">
                    {data.health_score.score}
                    <span className="ml-2 text-base text-text-secondary">
                      ({data.health_score.grade})
                    </span>
                  </p>
                </div>
                <div>
                  <p className="font-syne text-xs uppercase tracking-wider text-text-muted">Funds</p>
                  <p className="font-mono-dm mt-1 text-2xl text-text-primary">
                    {data.portfolio_summary.total_funds}
                  </p>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/analyze/report"
                  className="font-syne inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "hsl(var(--accent))" }}
                >
                  View Full Report
                </Link>
                <Link
                  to="/analyze"
                  className="font-syne inline-flex h-11 items-center justify-center rounded-lg border border-white/[0.12] px-6 text-sm font-semibold text-text-secondary transition-colors hover:border-white/[0.2]"
                >
                  New Analysis
                </Link>
              </div>
            </div>

            <div className="card-arth mt-8 p-6">
              <p className="font-mono text-xs uppercase tracking-[2px] text-text-muted">
                Key insights
              </p>
              <ul className="mt-4 space-y-3">
                {typeof data.expense_summary.total_annual_drag === "number" ? (
                  <li className="flex gap-2 font-syne text-sm text-text-secondary">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    Annual expense drag: {formatINR(data.expense_summary.total_annual_drag)}
                  </li>
                ) : null}
                {data.portfolio_summary.total_funds > 0 ? (
                  <li className="flex gap-2 font-syne text-sm text-text-secondary">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {data.portfolio_summary.regular_plan_count} of{" "}
                    {data.portfolio_summary.total_funds} funds are regular plans
                  </li>
                ) : null}
                {overlapRow &&
                overlapRow.overlap != null &&
                overlapRow.fund_a &&
                overlapRow.fund_b ? (
                  <li className="flex gap-2 font-syne text-sm text-text-secondary">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    Highest overlap: {overlapRow.overlap.toFixed(0)}% (
                    {shortFundName(overlapRow.fund_a)} ↔ {shortFundName(overlapRow.fund_b)})
                  </li>
                ) : null}
                {typeof data.expense_summary.total_potential_annual_savings === "number" &&
                data.expense_summary.total_potential_annual_savings > 0 ? (
                  <li className="flex gap-2 font-syne text-sm text-text-secondary">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    Potential savings:{" "}
                    {formatINR(data.expense_summary.total_potential_annual_savings)}/year by switching
                    to direct
                  </li>
                ) : null}
              </ul>
            </div>
          </>
        )
      )}

      <p className="font-mono mt-12 text-xs uppercase tracking-[2px] text-text-muted">Tools</p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          to="/tax"
          className="card-arth block p-5 transition-colors hover:border-white/[0.12]"
        >
          <p className="font-mono text-xs text-text-muted">01</p>
          <div className="mt-2 h-0.5 w-full bg-accent" />
          <h3
            className="font-fraunces mt-3 text-lg text-text-primary"
            style={{ fontVariationSettings: "'opsz' 72, 'wght' 700" }}
          >
            Tax Calculator
          </h3>
          <p className="font-syne mt-2 text-xs leading-relaxed text-text-secondary">
            Compare old and new tax regimes. See which saves more.
          </p>
        </Link>
        <Link
          to="/fire"
          className="card-arth block p-5 transition-colors hover:border-white/[0.12]"
        >
          <p className="font-mono text-xs text-text-muted">02</p>
          <div className="mt-2 h-0.5 w-full bg-warning" />
          <h3
            className="font-fraunces mt-3 text-lg text-text-primary"
            style={{ fontVariationSettings: "'opsz' 72, 'wght' 700" }}
          >
            FIRE Planner
          </h3>
          <p className="font-syne mt-2 text-xs leading-relaxed text-text-secondary">
            Set a retirement or education goal. Get a SIP roadmap.
          </p>
        </Link>
        <Link
          to="/mentor"
          className="card-arth block p-5 transition-colors hover:border-white/[0.12]"
        >
          <p className="font-mono text-xs text-text-muted">03</p>
          <div className="mt-2 h-0.5 w-full bg-positive" />
          <h3
            className="font-fraunces mt-3 text-lg text-text-primary"
            style={{ fontVariationSettings: "'opsz' 72, 'wght' 700" }}
          >
            AI Mentor
          </h3>
          <p className="font-syne mt-2 text-xs leading-relaxed text-text-secondary">
            Ask anything about fees, overlap, tax, or goals.
          </p>
        </Link>
      </div>
    </div>
  );
}
