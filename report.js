const gridDiv = document.querySelector("#snpDataGrid");
const genotypeCountSpan = document.querySelector("#genotype-count");
const matchedCountSpan = document.querySelector("#matched-count");

const filter = { Matched: "True" };

function updateFilters(e) {
  if (e.currentTarget.checked) {
    filter.Matched = "True";
  } else {
    delete filter.Matched;
  }
  gridOptions.api.onFilterChanged();
}

function isExternalFilterPresent() {
  return filter.Matched;
}

function doesExternalFilterPass(node) {
  if (node.data) {
    return node.data.Matched === filter.Matched;
  }
  return true;
}

const gridOptions = {
  defaultColDef: {
    flex: 1,
    minWidth: 120,
    filter: true,
  },
  animateRows: true,
  isExternalFilterPresent,
  doesExternalFilterPass,
};
new agGrid.Grid(gridDiv, gridOptions);

Papa.parse("./snp.tsv", {
  complete: function (results) {
    console.log("Finished:", results.data);

    const urlRenderer = ({ data: { URL }, value }) =>
      `<a href="${URL}" target="_blank">${value}</a>`;

    const columnDefs = results.meta.fields
      .filter((field) => field !== "URL")
      .map((field) =>
        field === "Name"
          ? {
              field,
              cellRenderer: urlRenderer,
            }
          : { field }
      );

    gridOptions.api.setRowData(results.data);
    gridOptions.api.setColumnDefs(columnDefs);

    genotypeCountSpan.innerText = results.data.length;
    matchedCountSpan.innerText = results.data.filter(
      (d) => d.Matched === "True"
    ).length;
  },
  download: true,
  delimeter: "\t",
  header: true,
  quoteChar: "",
});

//   fetch("./snp.tsv").then(response => {
//     const reader = response.body.getReader();
//     return new ReadableStream({
//       start(controller) {
//         return pump();
//         function pump() {
//           return reader.read().then(({ done, value }) => {
//             // When no more data needs to be consumed, close the stream
//             if (done) {
//               controller.close();
//               return;
//             }
//             // Enqueue the next data chunk into our target stream
//             controller.enqueue(value);
//             return pump();
//           });
//         }
//       }
//     })
//   })
//   .then(stream => new Response(stream))
//   .then(response => response.blob())
//   .then(blob => blob.text())
//   .then(contents => {
//     console.log("contents", contents);

//     const lines = contents.split("\n");
//     for (const line of lines) {
//       // const [name, genotype, matched, repute, summary, url] = line.split("\t");
//       const values = line.split("\t");

//       const tr = document.createElement("tr");
//       for (const value of values) {
//         const td = document.createElement("td");
//         td.append(value);
//         tr.append(td);
//       }
//       snpDataTable.append(tr);
//     }

//     genotypeCount += lines.length;
//     console.log("genotypeCount", genotypeCount);
//     genotypeCountSpan.append(genotypeCount);

//   })
//   .catch(err => console.error(err));
