import { useEffect, useState, type ComponentType } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageCircle,
  Scale,
  Search,
  Target,
  ToggleRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchMe, signOut } from "@/lib/auth";
import { useAnalysis } from "@/context/analysis-context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Vite serves `Frontend/public/logo.webp` at `/logo.webp`. */
const LOGO_SRC = "/logo.webp";

export interface AppSidebarProps {
  expanded: boolean;
  onToggleExpanded: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  isMobile: boolean;
  /** Public /demo without session: hide sign-out, show sign-in CTA instead. */
  guestMode?: boolean;
}

function SidebarLogoMark({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={cn(
          "flex items-center justify-center rounded-lg bg-white/[0.1] font-fraunces text-sm font-bold leading-none text-text-primary",
          className,
        )}
        style={{ fontVariationSettings: "'opsz' 72, 'wght' 700" }}
        aria-hidden
      >
        A
      </span>
    );
  }

  return (
    <img
      src={LOGO_SRC}
      alt=""
      width={36}
      height={36}
      decoding="async"
      className={cn("object-contain", className)}
      onError={() => setFailed(true)}
    />
  );
}

function NavItem({
  to,
  end,
  icon: Icon,
  label,
  expanded: ex,
  disabled,
  onAfterNavigate,
  activateOnPathnames,
}: {
  to: string;
  end?: boolean;
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  expanded: boolean;
  disabled?: boolean;
  onAfterNavigate?: () => void;
  activateOnPathnames?: string[];
}) {
  const location = useLocation();
  const body = ({ isActive }: { isActive: boolean }) => {
    const alsoActive = activateOnPathnames?.includes(location.pathname) ?? false;
    const active = isActive || alsoActive;
    return cn(
      "group relative flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-[13px] font-medium leading-snug transition-colors font-syne",
      !ex && "justify-center px-2",
      disabled && "pointer-events-none opacity-40",
      !disabled &&
        (active
          ? "bg-[hsla(213,60%,56%,0.14)] text-text-primary shadow-[inset_0_0_0_1px_hsla(213,60%,56%,0.22)]"
          : "text-text-muted hover:bg-white/[0.05] hover:text-text-secondary"),
    );
  };

  const inner = (
    <>
      <Icon
        size={ex ? 19 : 20}
        strokeWidth={1.5}
        className="shrink-0 opacity-90 group-hover:opacity-100"
      />
      {ex ? <span className="min-w-0 flex-1 truncate">{label}</span> : null}
    </>
  );

  if (disabled) {
    return (
      <div className={body({ isActive: false })} title={label}>
        {inner}
      </div>
    );
  }

  const link = (
    <NavLink
      to={to}
      end={end}
      className={body}
      onClick={() => onAfterNavigate?.()}
    >
      {inner}
    </NavLink>
  );

  if (!ex) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="font-syne text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

export function AppSidebar({
  expanded,
  onToggleExpanded,
  mobileOpen,
  onMobileOpenChange,
  isMobile,
  guestMode = false,
}: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAnalysis();
  const hasResult = Boolean(state.result);
  const [email, setEmail] = useState("");
  const [initial, setInitial] = useState("");

  useEffect(() => {
    if (guestMode) {
      setEmail("");
      setInitial("?");
      return;
    }
    let cancelled = false;
    fetchMe()
      .then((u) => {
        if (cancelled) return;
        const e = u.email || "";
        setEmail(e);
        const d = (u.username || e || "U").trim();
        setInitial(d.charAt(0).toUpperCase());
      })
      .catch(() => {
        if (cancelled) return;
        setEmail("");
        setInitial("?");
      });
    return () => {
      cancelled = true;
    };
  }, [guestMode]);

  const handleSignOut = async () => {
    await signOut();
    onMobileOpenChange(false);
    navigate("/login");
  };

  const showExpanded = isMobile ? true : expanded;
  const collapsedDesktop = !isMobile && !expanded;
  const widthClass = isMobile ? "w-64" : expanded ? "w-64" : "w-16";

  if (isMobile && !mobileOpen) {
    return null;
  }

  const toggleBtnClass =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-white/[0.08] hover:text-text-secondary";

  const aside = (
    <aside
      className={cn(
        "fixed left-0 top-0 z-[60] flex h-dvh max-h-screen flex-col border-r border-white/[0.08] shadow-[4px_0_24px_rgba(0,0,0,0.12)] transition-[width] duration-200 ease-out",
        widthClass,
        isMobile && "shadow-2xl",
      )}
      style={{ background: "hsl(var(--sidebar-background))" }}
    >
      {collapsedDesktop ? (
        <div className="flex shrink-0 flex-col items-center gap-2 border-b border-white/[0.08] px-1.5 py-3">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link
                to="/dashboard"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] outline-none ring-offset-2 ring-offset-[hsl(var(--sidebar-background))] transition-colors hover:bg-white/[0.07] focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                aria-label="ArthSaathi — Dashboard"
              >
                <SidebarLogoMark className="h-7 w-7" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-syne text-xs">
              ArthSaathi
            </TooltipContent>
          </Tooltip>
          <button
            type="button"
            onClick={onToggleExpanded}
            className={toggleBtnClass}
            aria-label="Expand sidebar"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>
      ) : (
        <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.08] px-2.5 py-3">
          <Link
            to="/dashboard"
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-1 py-1 no-underline outline-none ring-offset-2 ring-offset-[hsl(var(--sidebar-background))] transition-colors hover:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
            onClick={() => isMobile && onMobileOpenChange(false)}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04]">
              <SidebarLogoMark className="h-8 w-8" />
            </div>
            {showExpanded ? (
              <div className="min-w-0 flex-1 text-left">
                <span
                  className="font-fraunces block truncate text-sm leading-tight text-text-primary"
                  style={{ fontVariationSettings: "'opsz' 72, 'wght' 700" }}
                >
                  ArthSaathi
                </span>
                <span className="font-syne mt-0.5 block truncate text-[11px] leading-tight text-text-muted">
                  अर्थसाथी
                </span>
              </div>
            ) : null}
          </Link>
          {!isMobile ? (
            <button
              type="button"
              onClick={onToggleExpanded}
              className={toggleBtnClass}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onMobileOpenChange(false)}
              className={toggleBtnClass}
              aria-label="Close menu"
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>
          )}
        </div>
      )}

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-2 py-4">
        <NavItem
          to="/dashboard"
          end
          icon={LayoutDashboard}
          label="Dashboard"
          expanded={showExpanded}
          onAfterNavigate={() => isMobile && onMobileOpenChange(false)}
        />
        <NavItem
          to="/analyze"
          icon={Search}
          label="Portfolio X-Ray"
          expanded={showExpanded}
          activateOnPathnames={["/demo"]}
          onAfterNavigate={() => isMobile && onMobileOpenChange(false)}
        />
        <NavItem
          to="/analyze/report"
          icon={ToggleRight}
          label="What-If"
          expanded={showExpanded}
          disabled={!hasResult}
          onAfterNavigate={() => isMobile && onMobileOpenChange(false)}
        />

        <div
          className="my-4 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent"
          role="separator"
        />

        <NavItem
          to="/tax"
          icon={Scale}
          label="Tax Calculator"
          expanded={showExpanded}
          onAfterNavigate={() => isMobile && onMobileOpenChange(false)}
        />
        <NavItem
          to="/fire"
          icon={Target}
          label="FIRE Planner"
          expanded={showExpanded}
          onAfterNavigate={() => isMobile && onMobileOpenChange(false)}
        />
        <NavItem
          to="/mentor"
          icon={MessageCircle}
          label="AI Mentor"
          expanded={showExpanded}
          onAfterNavigate={() => isMobile && onMobileOpenChange(false)}
        />
      </nav>

      <div className="shrink-0 border-t border-white/[0.08] p-2.5">
        {guestMode ? (
          <div
            className={cn(
              "flex items-center gap-2",
              !showExpanded && "flex-col gap-2",
            )}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.1] font-syne text-xs font-medium text-text-muted"
              title="Guest"
            >
              ?
            </div>
            {showExpanded ? (
              <Link
                to="/login"
                state={{ from: location.pathname }}
                className="min-w-0 flex-1 rounded-lg border border-white/[0.1] px-2 py-2 text-center font-syne text-xs font-semibold text-accent transition-colors hover:bg-white/[0.04] no-underline"
                onClick={() => isMobile && onMobileOpenChange(false)}
              >
                Sign in
              </Link>
            ) : (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    to="/login"
                    state={{ from: location.pathname }}
                    className="inline-flex rounded-lg p-2 text-accent transition-colors hover:bg-white/[0.06] no-underline"
                    aria-label="Sign in"
                    onClick={() => isMobile && onMobileOpenChange(false)}
                  >
                    <LogIn size={18} strokeWidth={1.5} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Sign in</TooltipContent>
              </Tooltip>
            )}
          </div>
        ) : (
          <div
            className={cn(
              "flex items-center gap-2",
              !showExpanded && "flex-col gap-2",
            )}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white/[0.12] to-white/[0.06] font-syne text-xs font-semibold text-text-primary ring-1 ring-white/[0.08]"
              title={email}
            >
              {initial}
            </div>
            {showExpanded ? (
              <>
                <span className="min-w-0 flex-1 truncate font-syne text-[11px] leading-tight text-text-muted">
                  {email || "—"}
                </span>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="shrink-0 rounded-lg p-2 text-text-muted transition-colors hover:bg-white/[0.06] hover:text-[hsl(var(--negative))]"
                  aria-label="Sign out"
                >
                  <LogOut size={18} strokeWidth={1.5} />
                </button>
              </>
            ) : (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => void handleSignOut()}
                    className="rounded-lg p-2 text-text-muted transition-colors hover:bg-white/[0.06] hover:text-[hsl(var(--negative))]"
                    aria-label="Sign out"
                  >
                    <LogOut size={18} strokeWidth={1.5} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign out</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </aside>
  );

  if (isMobile) {
    return (
      <>
        <button
          type="button"
          className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm"
          aria-label="Close menu"
          onClick={() => onMobileOpenChange(false)}
        />
        {aside}
      </>
    );
  }

  return aside;
}
