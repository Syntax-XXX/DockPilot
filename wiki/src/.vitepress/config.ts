import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'DockPilot wiki',
  description: 'A lightweight wiki for the DockPilot repository.',
  base: process.env.DOCS_BASE || '/',
  ignoreDeadLinks: [
    { path: 'README.md', message: 'Repo-level README is not part of the wiki site.' },
    {
      path: 'ARCHITECTURE.md',
      message: 'Repo-level architecture doc is not part of the wiki site.',
    },
    { path: 'WIKI_HANDOFF.md', message: 'Repo-level handoff note is not part of the wiki site.' },
  ],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'MCP', link: '/mcp' },
      { text: 'Admin', link: '/admin' },
      { text: 'Security', link: '/security' },
    ],
    sidebar: [
      {
        text: 'Overview',
        items: [
          { text: 'Home', link: '/' },
          { text: 'Repository layout', link: '/layout' },
          { text: 'What works and what is missing', link: '/status' },
        ],
      },
      {
        text: 'MCP control layer',
        items: [
          { text: 'MCP', link: '/mcp' },
          { text: 'AI credentials', link: '/credentials' },
          { text: 'Approval workflow', link: '/approvals' },
          { text: 'Audit logging', link: '/audit' },
        ],
      },
      {
        text: 'Operations',
        items: [
          { text: 'Admin surface', link: '/admin' },
          { text: 'Security notes', link: '/security' },
          { text: 'Testing', link: '/testing' },
          { text: 'Configuration', link: '/configuration' },
        ],
      },
    ],
  },
});
