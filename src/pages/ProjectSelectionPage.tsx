import { open } from "@tauri-apps/plugin-dialog";

type Props = {
  onProjectSelected: (
    projectPath: string
  ) => void;
};

export default function ProjectSelectionPage({
  onProjectSelected,
}: Props) {
  async function selectProject() {
    const path = await open({
      directory: true,
      multiple: false,
    });

    if (
      typeof path !== "string"
    ) {
      return;
    }

    onProjectSelected(path);
  }

  return (
    <section className="relative h-screen flex flex-col items-center justify-center px-6 pb-20 pt-32">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0 gradient-glow" />

      <div className="relative flex flex-col items-center text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 text-xs border border-[var(--border)] rounded-full text-[var(--muted)]">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          v0.1.0 — Early Development
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6">
          <span className="text-[var(--text)]">PROJECT<span className="text-[#7cff6b]">_</span>IGNITER</span>
        </h1>

        <p className="text-lg sm:text-xl text-[var(--muted)] max-w-2xl leading-relaxed mb-8">
          <span className="text-[var(--text)]">Analyze </span> your project &middot;
          <span className="text-[var(--text)]"> compose </span> visual workflows &middot;
          <span className="text-[var(--text)]"> forge</span> zero-dependency setup scripts
        </p>

        <button
          onClick={selectProject}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--accent)] text-[var(--background)] font-bold rounded-lg hover:brightness-110 transition-all cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          Open Project
        </button>
      </div>

      <a
        href="https://github.com/vishesh-sachan/Project_Igniter"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-8 inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        Give us a star
      </a>
    </section>
  );
}