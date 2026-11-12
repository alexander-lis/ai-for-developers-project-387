// Global OpenCode plugin for the workflows: the shell of the model gets no model key.
// OpenCode itself reads OPENROUTER_API_KEY from its own environment; commands it runs for the
// model inherit that environment, so `echo $OPENROUTER_API_KEY` would show the key. The
// `shell.env` hook overrides it with an empty value for every shell command.
export default {
  id: "scrub-shell-env",
  server: async () => ({
    "shell.env": async (_input, output) => {
      output.env.OPENROUTER_API_KEY = "";
    },
  }),
};
