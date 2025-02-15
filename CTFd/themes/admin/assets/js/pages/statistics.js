import "./main";
import CTFd from "../compat/CTFd";
import $ from "jquery";
import echarts from "echarts/dist/echarts.common";
import { colorHash } from "../compat/styles";

const graph_configs = {
  "#solves-graph": {
    data: () => CTFd.api.get_challenge_solve_statistics(),
    format: (response) => {
      const data = response.data;
      const chals = [];
      const counts = [];
      const solves = {};
      for (let c = 0; c < data.length; c++) {
        solves[data[c]["id"]] = {
          name: data[c]["name"],
          solves: data[c]["solves"],
        };
      }

      const solves_order = Object.keys(solves).sort(function (a, b) {
        return solves[b].solves - solves[a].solves;
      });

      $.each(solves_order, function (key, value) {
        chals.push(solves[value].name);
        counts.push(solves[value].solves);
      });

      const option = {
        title: {
          left: "center",
          text: "Количество решений"
        },
        tooltip: {
          trigger: "item",
        },
        toolbox: {
          show: true,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ["line", "bar"] },
            restore: { show: true },
            saveAsImage: { show: true },
          },
        },
        xAxis: {
          name: "Количество решений",
          nameLocation: "middle",
          type: "value",
        },
        yAxis: {
          name: "Название задания",
          nameLocation: "middle",
          nameGap: 60,
          type: "category",
          data: chals,
          axisLabel: {
            interval: 0,
            rotate: 0, //If the label names are too long you can manage this by rotating the label.
          },
        },
        dataZoom: [
          {
            show: false,
            start: 0,
            end: 100,
          },
          {
            type: "inside",
            yAxisIndex: 0,
            show: true,
            width: 20,
          },
          {
            fillerColor: "rgba(233, 236, 241, 0.4)",
            show: true,
            yAxisIndex: 0,
            width: 20,
          },
        ],
        series: [
          {
            itemStyle: { normal: { color: "#1f76b4" } },
            data: counts,
            type: "bar",
          },
        ],
      };

      return option;
    },
  },

  "#keys-pie-graph": {
    data: () => CTFd.api.get_submission_property_counts({ column: "type" }),
    format: (response) => {
      const data = response.data;
      const solves = data["correct"];
      const fails = data["incorrect"];

      let option = {
        title: {
          left: "center",
          text: "Процент отправленного"
        },
        tooltip: {
          trigger: "item",
        },
        toolbox: {
          show: true,
          feature: {
            dataView: { show: true, readOnly: false },
            saveAsImage: {},
          },
        },
        legend: {
          orient: "vertical",
          top: "middle",
          right: 0,
          data: ["Ошибок", "Решений"]
        },
        series: [
          {
            name: "Процент отправленного",
            type: "pie",
            radius: ["30%", "50%"],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: "center",
            },
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  formatter: function (data) {
                    return `${data.name} (${data.value})\n${data.percent.toFixed(1)}%`;
                  },
                },
                labelLine: {
                  show: true,
                },
              },
              emphasis: {
                label: {
                  show: true,
                  position: "center",
                  textStyle: {
                    fontSize: "14",
                    fontWeight: "normal",
                  },
                },
              },
            },
            emphasis: {
              label: {
                show: true,
                fontSize: "30",
                fontWeight: "bold",
              },
            },
            labelLine: {
              show: false,
            },
            data: [
              {
                value: fails,
                name: "Ошибки",
                itemStyle: { color: "rgb(207, 38, 0)" }
              },
              {
                value: solves,
                name: "Решения",
                itemStyle: { color: "rgb(0, 209, 64)" }
              }
            ]
          }
        ]
      };

      return option;
    },
  },

  "#categories-pie-graph": {
    data: () => CTFd.api.get_challenge_property_counts({ column: "category" }),
    format: (response) => {
      const data = response.data;

      const categories = [];
      const count = [];

      for (let category in data) {
        if (Object.hasOwn(data, category)) {
          categories.push(category);
          count.push(data[category]);
        }
      }

      for (let i = 0; i < data.length; i++) {
        categories.push(data[i].category);
        count.push(data[i].count);
      }

      let option = {
        title: {
          left: "center",
          text: "Категории"
        },
        tooltip: {
          trigger: "item",
        },
        toolbox: {
          show: true,
          feature: {
            dataView: { show: true, readOnly: false },
            saveAsImage: {},
          },
        },
        legend: {
          type: "plain",
          orient: "horizontal",
          top: "bottom",
          data: [],
        },
        series: [
          {
            name: "Категории",
            type: "pie",
            radius: ["30%", "50%"],
            label: {
              show: false,
              position: "center",
            },
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  formatter: function (data) {
                    return `${data.name} (${data.value})\n${data.percent.toFixed(1)}%`;
                  },
                },
                labelLine: {
                  show: true,
                },
              },
              emphasis: {
                label: {
                  show: true,
                  position: "center",
                  textStyle: {
                    fontSize: "14",
                    fontWeight: "normal",
                  },
                },
              },
            },
            emphasis: {
              label: {
                show: true,
                fontSize: "30",
                fontWeight: "bold",
              },
            },
            data: [],
          },
        ],
      };

      categories.forEach((category, index) => {
        option.legend.data.push(category);
        option.series[0].data.push({
          value: count[index],
          name: category,
          itemStyle: { color: colorHash(category) },
        });
      });

      return option;
    },
  },

  "#points-pie-graph": {
    data: () => {
      return CTFd.fetch(
        "/api/v1/statistics/challenges/category?function=sum&target=value",
        {
          method: "GET",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      ).then(function (response) {
        return response.json();
      });
    },
    format: (response) => {
      const data = response.data;

      const categories = [];
      const count = [];

      for (let category in data) {
        if (Object.hasOwn(data, category)) {
          categories.push(category);
          count.push(data[category]);
        }
      }

      for (let i = 0; i < data.length; i++) {
        categories.push(data[i].category);
        count.push(data[i].count);
      }

      let option = {
        title: {
          left: "center",
          text: "Point Breakdown",
        },
        tooltip: {
          trigger: "item",
        },
        toolbox: {
          show: true,
          feature: {
            dataView: { show: true, readOnly: false },
            saveAsImage: {},
          },
        },
        legend: {
          type: "plain",
          orient: "horizontal",
          top: "bottom",
          data: [],
        },
        series: [
          {
            name: "Point Breakdown",
            type: "pie",
            radius: ["30%", "50%"],
            label: {
              show: false,
              position: "center",
            },
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  formatter: function (data) {
                    return `${data.name} (${data.value})\n${data.percent.toFixed(1)}%`;
                  },
                },
                labelLine: {
                  show: true,
                },
              },
              emphasis: {
                label: {
                  show: true,
                  position: "center",
                  textStyle: {
                    fontSize: "14",
                    fontWeight: "normal",
                  },
                },
              },
            },
            emphasis: {
              label: {
                show: true,
                fontSize: "30",
                fontWeight: "bold",
              },
            },
            data: [],
          },
        ],
      };

      categories.forEach((category, index) => {
        option.legend.data.push(category);
        option.series[0].data.push({
          value: count[index],
          name: category,
          itemStyle: { color: colorHash(category) },
        });
      });

      return option;
    },
  },

  "#solve-percentages-graph": {
    layout: annotations => ({
      title: "Процент решений на задание",
      xaxis: {
        title: "Имя задания"
      },
      yaxis: {
        title: `Процент ${
          CTFd.config.userMode.charAt(0).toUpperCase() +
          CTFd.config.userMode.slice(1)
        } (%)`,
        range: [0, 100],
      },
      annotations: annotations,
    }),
    data: () => CTFd.api.get_challenge_solve_percentages(),
    format: (response) => {
      const data = response.data;

      const names = [];
      const percents = [];

      const annotations = [];

      for (let key in data) {
        names.push(data[key].name);
        percents.push(data[key].percentage * 100);

        const result = {
          x: data[key].name,
          y: data[key].percentage * 100,
          text: Math.round(data[key].percentage * 100) + "%",
          xanchor: "center",
          yanchor: "bottom",
          showarrow: false,
        };
        annotations.push(result);
      }

      const option = {
        title: {
          left: "center",
          text: "Процент решений на задание"
        },
        tooltip: {
          trigger: "item",
          formatter: function (data) {
            return `${data.name} - ${(Math.round(data.value * 10) / 10).toFixed(
              1,
            )}%`;
          },
        },
        toolbox: {
          show: true,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ["line", "bar"] },
            restore: { show: true },
            saveAsImage: { show: true },
          },
        },
        xAxis: {
          name: "Имя задания",
          nameGap: 40,
          nameLocation: "middle",
          type: "category",
          data: names,
          axisLabel: {
            interval: 0,
            rotate: 50,
          },
        },
        yAxis: {
          name: `Процент ${
            CTFd.config.userMode.charAt(0).toUpperCase() +
            CTFd.config.userMode.slice(1)
          } (%)`,
          nameGap: 50,
          nameLocation: "middle",
          type: "value",
          min: 0,
          max: 100,
        },
        dataZoom: [
          {
            show: false,
            start: 0,
            end: 100,
          },
          {
            type: "inside",
            show: true,
            start: 0,
            end: 100,
          },
          {
            fillerColor: "rgba(233, 236, 241, 0.4)",
            show: true,
            right: 60,
            yAxisIndex: 0,
            width: 20,
          },
          {
            type: "slider",
            fillerColor: "rgba(233, 236, 241, 0.4)",
            top: 35,
            height: 20,
            show: true,
            start: 0,
            end: 100,
          },
        ],
        series: [
          {
            itemStyle: { normal: { color: "#1f76b4" } },
            data: percents,
            type: "bar",
          },
        ],
      };

      return option;
    },
  },

  "#score-distribution-graph": {
    layout: (annotations) => ({
      title: "Распределение очков",
      xaxis: {
        title: "Очки",
        showticklabels: true,
        type: "category",
      },
      yaxis: {
        title: `Количество ${
          CTFd.config.userMode.charAt(0).toUpperCase() +
          CTFd.config.userMode.slice(1)
        }`,
      },
      annotations: annotations,
    }),
    data: () =>
      CTFd.fetch("/api/v1/statistics/scores/distribution").then(
        function (response) {
          return response.json();
        },
      ),
    format: (response) => {
      const data = response.data.brackets;
      const keys = [];
      const brackets = [];
      const sizes = [];

      for (let key in data) {
        keys.push(parseInt(key));
      }
      keys.sort((a, b) => a - b);

      let start = "<0";
      keys.map((key) => {
        brackets.push(`${start} - ${key}`);
        sizes.push(data[key]);
        start = key;
      });

      const option = {
        title: {
          left: "center",
          text: "Распределение очков"
        },
        tooltip: {
          trigger: "item",
        },
        toolbox: {
          show: true,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ["line", "bar"] },
            restore: { show: true },
            saveAsImage: { show: true },
          },
        },
        xAxis: {
          name: "Очки",
          nameGap: 40,
          nameLocation: "middle",
          type: "category",
          data: brackets,
        },
        yAxis: {
          name: `Количество ${
            CTFd.config.userMode.charAt(0).toUpperCase() +
            CTFd.config.userMode.slice(1)
          }`,
          nameGap: 50,
          nameLocation: "middle",
          type: "value",
        },
        dataZoom: [
          {
            show: false,
            start: 0,
            end: 100,
          },
          {
            type: "inside",
            show: true,
            start: 0,
            end: 100,
          },
          {
            fillerColor: "rgba(233, 236, 241, 0.4)",
            show: true,
            right: 60,
            yAxisIndex: 0,
            width: 20,
          },
          {
            type: "slider",
            fillerColor: "rgba(233, 236, 241, 0.4)",
            top: 35,
            height: 20,
            show: true,
            start: 0,
            end: 100,
          },
        ],
        series: [
          {
            itemStyle: { normal: { color: "#1f76b4" } },
            data: sizes,
            type: "bar",
          },
        ],
      };

      return option;
    },
  },
};

const createGraphs = () => {
  for (let key in graph_configs) {
    const cfg = graph_configs[key];

    const $elem = $(key);
    $elem.empty();

    let chart = echarts.init(document.querySelector(key));

    cfg
      .data()
      .then(cfg.format)
      .then((option) => {
        chart.setOption(option);
        $(window).on("resize", function () {
          if (chart != null && chart != undefined) {
            chart.resize();
          }
        });
      });
  }
};

function updateGraphs() {
  for (let key in graph_configs) {
    const cfg = graph_configs[key];
    let chart = echarts.init(document.querySelector(key));
    cfg
      .data()
      .then(cfg.format)
      .then((option) => {
        chart.setOption(option);
      });
  }
}

$(() => {
  createGraphs();
  setInterval(updateGraphs, 300000);
});
