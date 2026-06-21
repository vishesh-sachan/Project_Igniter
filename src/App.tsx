import { useState } from "react";
import ProjectSelectionPage from "./pages/ProjectSelectionPage";
import ProjectOverviewPage from "./pages/ProjectOverviewPage";
import WorkflowBuilder from "./pages/WorkflowBuilder";

type AppState =
  | {
    page: "projectSelection";
  }
  | {
    page: "projectOverview";
    projectPath: string;
  }
  | {
    page: "workflowBuilder";
    projectPath: string;
    workflowId?: string;
  };

function App() {
  const [state, setState] =
    useState<AppState>({
      page: "projectSelection",
    });

  switch (state.page) {
    case "projectSelection":
      return (
        <ProjectSelectionPage
          onProjectSelected={(
            projectPath
          ) =>
            setState({
              page:
                "projectOverview",
              projectPath,
            })
          }
        />
      );

    case "projectOverview":
      return (
        <ProjectOverviewPage
          projectPath={
            state.projectPath
          }
          onBack={() =>
            setState({
              page:
                "projectSelection",
            })
          }
          onOpenEditor={(
            workflowId
          ) =>
            setState({
              page:
                "workflowBuilder",
              projectPath:
                state.projectPath,
              workflowId,
            })
          }
        />
      );

    case "workflowBuilder":
      return (
        <WorkflowBuilder
          projectPath={
            state.projectPath
          }
          workflowId={
            state.workflowId
          }
          onBack={() =>
            setState({
              page: "projectOverview",
              projectPath:
                state.projectPath,
            })
          }
        />
      );
  }
}

export default App;