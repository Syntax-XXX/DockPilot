# DockPilot browser demo

The `deploy-pages.yml` GitHub Actions workflow publishes this demo at `https://OWNER.github.io/REPOSITORY/demo/` and the wiki at the root URL. The assets are relative, so the demo works under the repository's Pages subpath.

The demo opens directly into an interactive dashboard—there is no sign-in. It includes three simulated Docker nodes with live-changing telemetry, sample containers, images, volumes, networks, activity, and security views. Explore all sidebar pages, inspect node details and logs, filter lists, start/stop/restart/remove or deploy sample containers, add nodes, run the simulated security scan, export activity, and reset the sample state.

This is a UI preview only—not a DockPilot server. All state is stored in this browser; no action connects to Docker, calls an API, or changes real infrastructure. Refresh telemetry is simulated. Reset demo restores the initial sample data.
