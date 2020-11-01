import deepmerge from "deepmerge";
import { mount } from "@vue/test-utils";
import EditorFormConfigProject from "@/components/options/EditorFormConfigProject";
import EditorFormConfig from "@/components/options/EditorFormConfig";
import { waitFor } from "@/services/utils";
import UniqueId from "@/utils/plugins/unique-id";

describe("EditorFormConfig.vue", () => {
  const config = {
    version: "1.1.0",
    projects: [
      {
        id: 0,
        name: "Project1",
        envs: [2, 1]
      },
      {
        id: 1,
        name: "Project2",
        envs: [3]
      }
    ],
    envs: [
      {
        id: 1,
        name: "FR",
        url: "https://www.google.fr/sdfsdf"
      },
      {
        id: 2,
        name: "DE",
        url: "https://www.google.de/sdfsdf"
      },
      {
        id: 3,
        name: "ES",
        url: "https://www.google.es/"
      }
    ],
    options: {}
  };

  function createDefaultWrapper() {
    const wrapper = mount(EditorFormConfig, {
      props: {
        config: deepmerge({}, config)
      },
      global: {
        plugins: [UniqueId]
      }
    });

    return wrapper;
  }

  function checkUpdateConfig(wrapper, newConfig) {
    const updatedConfig = wrapper.emitted()["update:config"][0][0];
    expect(updatedConfig).toEqual({
      ...config,
      ...newConfig
    });
  }

  it("renders projects name", () => {
    const wrapper = createDefaultWrapper();

    const projects = wrapper.findAllComponents(EditorFormConfigProject);
    const expectName = (project, name) =>
      expect(project.html()).toContain(name);

    expectName(projects[0], "Project1");
    expectName(projects[1], "Project2");
  });

  it("add new env 1st button", async () => {
    const wrapper = createDefaultWrapper();

    const firstButton = wrapper.find("button.add-new-env");
    await firstButton.trigger("click");
    await waitFor(10);

    const inputs = wrapper.findAll(".right-pane input");
    await inputs[0].setValue("My New Env");
    await inputs[1].setValue("https://gogo.fr");
    await waitFor(10);

    await wrapper.find("button.create-env-btn").trigger("click");
    await waitFor();

    checkUpdateConfig(wrapper, {
      projects: [
        {
          id: 0,
          name: "Project1",
          envs: [2, 1, 4]
        },
        {
          id: 1,
          name: "Project2",
          envs: [3]
        }
      ],
      envs: [
        ...config.envs,
        {
          id: 4,
          name: "My New Env",
          url: "https://gogo.fr"
        }
      ]
    });
  });

  it("add new env 2nd button", async () => {
    const wrapper = createDefaultWrapper();

    const secondButton = wrapper.findAll("button.add-new-env")[1];
    await secondButton.trigger("click");
    await waitFor(20);

    const inputs = wrapper.findAll(".right-pane input");
    await inputs[0].setValue("My New Env 2");
    await inputs[1].setValue("https://gogo2.fr");
    await waitFor(10);

    await wrapper.find("button.create-env-btn").trigger("click");
    await waitFor();

    checkUpdateConfig(wrapper, {
      projects: [
        {
          id: 0,
          name: "Project1",
          envs: [2, 1]
        },
        {
          id: 1,
          name: "Project2",
          envs: [3, 4]
        }
      ],
      envs: [
        ...config.envs,
        {
          id: 4,
          name: "My New Env 2",
          url: "https://gogo2.fr"
        }
      ]
    });
  });

  it("clone env", async () => {
    const wrapper = createDefaultWrapper();
    await waitFor();

    const selectEnvButton = wrapper.find(".project-env");
    await selectEnvButton.trigger("click");
    await waitFor();

    const firstButton = wrapper.find("button.clone-env");
    await firstButton.trigger("click");

    checkUpdateConfig(wrapper, {
      projects: [
        {
          id: 0,
          name: "Project1",
          envs: [2, 1, 4]
        },
        {
          id: 1,
          name: "Project2",
          envs: [3]
        }
      ],
      envs: [
        {
          id: 1,
          name: "FR",
          url: "https://www.google.fr/sdfsdf"
        },
        {
          id: 2,
          name: "DE",
          url: "https://www.google.de/sdfsdf"
        },
        {
          id: 3,
          name: "ES",
          url: "https://www.google.es/"
        },
        {
          id: 4,
          name: "DE",
          url: "https://www.google.de/sdfsdf"
        }
      ]
    });
  });

  it("delete env", async () => {
    const wrapper = createDefaultWrapper();
    await waitFor();

    const selectEnvButton = wrapper.find(".project-env");
    await selectEnvButton.trigger("click");
    await waitFor();

    const firstButton = wrapper.find(".side-panel button.delete-btn");
    await firstButton.trigger("click");

    const confirmButton = wrapper.find(".side-panel button.delete-confirm-btn");
    await confirmButton.trigger("click");

    checkUpdateConfig(wrapper, {
      projects: [
        {
          id: 0,
          name: "Project1",
          envs: [1]
        },
        {
          id: 1,
          name: "Project2",
          envs: [3]
        }
      ],
      envs: [
        {
          id: 1,
          name: "FR",
          url: "https://www.google.fr/sdfsdf"
        },
        {
          id: 3,
          name: "ES",
          url: "https://www.google.es/"
        }
      ]
    });
  });

  it("add new project", () => {
    const wrapper = createDefaultWrapper();

    const button = wrapper.find("button.new-project");
    button.trigger("click");

    checkUpdateConfig(wrapper, {
      projects: [
        ...config.projects,
        {
          id: 2,
          name: "New Project",
          envs: []
        }
      ]
    });
  });

  it("delete project 1st button", async () => {
    const wrapper = createDefaultWrapper();

    const firstButton = wrapper.find(".project-item button.delete-btn");
    await firstButton.trigger("click");

    const confirmButton = wrapper.find("button.delete-confirm-btn");
    await confirmButton.trigger("click");
    await waitFor();

    checkUpdateConfig(wrapper, {
      projects: [
        {
          id: 1,
          name: "Project2",
          envs: [3]
        }
      ],
      envs: [
        {
          id: 3,
          name: "ES",
          url: "https://www.google.es/"
        }
      ]
    });
  });

  it("delete project 2nd button", async () => {
    const wrapper = createDefaultWrapper();

    const secondButton = wrapper.findAll(".project-item button.delete-btn")[1];
    await secondButton.trigger("click");

    const confirmButton = wrapper.find("button.delete-confirm-btn");
    await confirmButton.trigger("click");
    await waitFor();

    checkUpdateConfig(wrapper, {
      projects: [
        {
          id: 0,
          name: "Project1",
          envs: [2, 1]
        }
      ],
      envs: [
        {
          id: 1,
          name: "FR",
          url: "https://www.google.fr/sdfsdf"
        },
        {
          id: 2,
          name: "DE",
          url: "https://www.google.de/sdfsdf"
        }
      ]
    });
  });

  it("drag and drop env", () => {
    const wrapper = createDefaultWrapper();

    const button = wrapper.find(".env-sortable");
    button.trigger("sortupdate", {
      detail: {
        origin: {
          index: 0
        },
        destination: {
          index: 1
        }
      }
    });

    checkUpdateConfig(wrapper, {
      projects: [
        {
          id: 0,
          name: "Project1",
          envs: [1, 2]
        },
        {
          id: 1,
          name: "Project2",
          envs: [3]
        }
      ]
    });
  });

  it("drag and drop project", () => {
    const wrapper = createDefaultWrapper();

    const elem = wrapper.find(".project-sortable");
    elem.trigger("sortupdate", {
      detail: {
        origin: {
          index: 0
        },
        destination: {
          index: 1
        }
      }
    });

    checkUpdateConfig(wrapper, {
      projects: [
        {
          id: 1,
          name: "Project2",
          envs: [3]
        },
        {
          id: 0,
          name: "Project1",
          envs: [2, 1]
        }
      ]
    });
  });

  it("edit project name", async () => {
    const wrapper = createDefaultWrapper();

    const elem = wrapper.find(".edit-project-name");
    await elem.trigger("click");

    const input = wrapper.find(".project-name input");
    await input.setValue("ProjectX");
    await input.trigger("focusout");

    checkUpdateConfig(wrapper, {
      projects: [
        {
          id: 0,
          name: "ProjectX",
          envs: [2, 1]
        },
        {
          id: 1,
          name: "Project2",
          envs: [3]
        }
      ]
    });
  });
});