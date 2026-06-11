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
    <div className="h-screen flex items-center justify-center">
      <div className="panel w-full max-w-2xl p-10 text-left">
        <div className="text-3xl font-bold uppercase tracking-tight">
          PROJECT
          <span className="text-[#7CFF6B]">
            _
          </span>
          INSTALLER
        </div>

        <div className="mt-4 text-[var(--muted)] text-align-center">
          Analyze, create and manage
          installation workflows for
          your projects.
        </div>

        <div className="mt-10">
          <button
            className="workflow-button primary px-6 py-3"
            onClick={
              selectProject
            }
          >
            Open Project
          </button>
        </div>
      </div>
    </div>
  );
}