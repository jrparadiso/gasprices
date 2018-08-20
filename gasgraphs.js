var dataArray = []; //  ['Month', 'Gas' 'Petro]];
let url =
  "http://api.eia.gov/series/?api_key=4d75913d7c91526d1f80ae5f79dccf49&series_id=PET.EMM_EPMR_PTE_NUS_DPG.M;PET.F000000033.M&end=201805&start=200212";

$.getJSON(url, {}, data => {
  var array = [...data.series[0].data].reverse();
  var array2 = [...data.series[1].data].reverse();
  for (let i = 0; i < array.length; i++) {
    let mmyy = array[i][0];
    let month = `${mmyy.substr(4, 2)}/${mmyy.substr(2, 2)}`;
    let gas = Number(array[i][1]).toFixed(2);
    let petro = Number(array2[i][1]).toFixed(2);
    if (gas == 0) continue;

    $("#list").append(
      `<li>On ${month} gasoline was $${gas} per gallon and petroleum was $${petro} a barrel.</li>`
    );
    let points = [month, Number(gas), Number(petro)];
    dataArray.push(points);
  }
})
  .done(() => {
    prepCharts();
  })
  .fail(() => {
    alert(
      "The application data is not available. Please try again later or contact Management."
    );
  })
  .always(() => {});

var resizeTimer;
$(window).on("resize", function(e) {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    // reset to media query
    if ($(window).width() > 768) {
      $("#left, #right").show();
    } else {
      $("#left").hide();
    }
    drawChart(points);
  }, 250);
});

const swap = ($a, $b) => {
  $a.slideUp("300");
  $b.delay(100).slideDown("slow");
};

var chartType = "AreaChart";
var threeD = "false";
var points = 0;
const goChart = (type, n) => {
  threeD = type === "PieChart" ? "true" : "false";
  chartType = type === "DonutChart" ? "PieChart" : type;
  points = n;
  drawChart(n);
};

/* Google Visualization Code  */
const prepCharts = () => {
  google.charts.load("current", { packages: ["corechart"] });
  google.charts.setOnLoadCallback(drawChart);
};
const drawChart = n => {
  var data = new google.visualization.DataTable();
  data.addColumn("string", "Month");
  data.addColumn("number", "Gas per Gallon");
  data.addColumn("number", "Petro per Barrel");
  if (n === 0) {
    // use all data set rows
    data.addRows(dataArray);
  } else {
    let start = dataArray.length - n;
    let end = dataArray.length;
    data.addRows(dataArray.slice(start, end));
  }
  var options = {
    title: "",
    hAxis: { title: "MONTH", titleTextStyle: { color: "#333", bold: true } },
    vAxes: [
      {
        title: "GAS",
        gridlines: { count: 6 },
        format: "currency",
        titleTextStyle: { bold: true }
      },
      {
        title: "PETRO",
        viewWindow: { min: 0, max: 150 },
        gridlines: { count: 6, color: "transparent" },
        format: "$ #",
        titleTextStyle: { bold: true }
      }
    ],
    series: [{ targetAxisIndex: 0 }, { targetAxisIndex: 1 }],
    displayAnnotations: true,
    is3D: threeD,
    pieHole: 0.4
  };

  var chart = new google.visualization[chartType](
    document.getElementById("chart_div")
  );
  chart.draw(data, options);
};
