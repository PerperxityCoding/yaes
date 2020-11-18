import {
  loadSentry,
  queueVueGlobalErrorHandler,
} from "@/services/sentry/loader";
import Options from "./Options.vue";
import { createApp } from "vue";
import uniqueId from "./utils/plugins/unique-id";
import "./utils/plugins/vee-validate";
import "intro.js/minified/introjs.min.css";

async function main() {
  if (!window.Cypress) {
    loadSentry();
  }

  const app = createApp(Options);
  const startApp = () => {
    app.use(uniqueId);
    app.mount("#app");
  };

  queueVueGlobalErrorHandler(app);

  // eslint-disable-next-line no-constant-condition
  if (window.Cypress) {
    window.startApp = startApp;
  } else {
    startApp();
  }
}

main();
