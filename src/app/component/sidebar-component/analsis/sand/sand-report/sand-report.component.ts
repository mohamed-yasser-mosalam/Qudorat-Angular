import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Chart from "chart.js/auto";
import {SieveAnalysis} from "../../../../../model/sieve-analysis";
import {SieveAnalysisService} from "../../../../../service/sieve-analysis/sieve-analysis.service";
import {ActivatedRoute} from "@angular/router";
import {CommonModule, NgFor, NgIf} from "@angular/common";
import {AuthenticationService} from "../../../../../service/authentication/authentication.service";

declare let AmiriFont: any;

@Component({
  selector: 'app-sand-report',
  standalone: true,
  imports: [
    NgIf  , CommonModule
  ],
  templateUrl: './sand-report.component.html',
  styleUrl: './sand-report.component.css'
})
export class SandReportComponent implements AfterViewInit, OnInit {
[x: string]: any;

  currentDate = new Date().toLocaleDateString();

  @ViewChild('chartCanvas', {static: true}) chartCanvas!: ElementRef;
  chart!: Chart;
  sieveAnalysis: SieveAnalysis = {} as SieveAnalysis;
  role: string = '';
  id: number = 0;

  constructor(private authenticationService: AuthenticationService, private sieveAnalysisService: SieveAnalysisService, private activatedRoute: ActivatedRoute) {
  }

  gravelRowResult: number = 0;
  siltRowResult: number = 0;
  sandRowResult: number = 0;

  calcRetainedPercent(cumulative: number, totalWeight: number) {
    return totalWeight > 0 ? (Number(cumulative) / Number(totalWeight)) * 100 : 0;
  }

  calcPassingPercent(cumulative: number, totalWeight: number) {
    const retained = this.calcRetainedPercent(cumulative, totalWeight);
    return 100 - retained;
  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.role = this.authenticationService.getAuthority();

    this.sieveAnalysisService.findById(this.id).subscribe(res => {
      this.sieveAnalysis = res;

      const total = Number(this.sieveAnalysis.totalWeigh) || 0;
      this.gravelRowResult = this.calcRetainedPercent(this.sieveAnalysis.cumulativeI, total);
      this.siltRowResult = this.calcPassingPercent(this.sieveAnalysis.cumulativeM, total);
      this.sandRowResult = 100 - (this.gravelRowResult + this.siltRowResult);

      for (let i = 0; i < 13; i++) {
        const char = String.fromCharCode(65 + i);
        const key = `expand${char}`;
        if (!this.sieveAnalysis[key] || this.sieveAnalysis[key] === '\u0000') {
          this.sieveAnalysis[key] = '';
        }
      }

      this.createChart();
    });
  }


  ngAfterViewInit() {
    this.createChart();
  }

  createChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    // ASTM C-136 Standard Sieve Sizes (mm) - matching the image grid
    const sieveSizes: number[] = [
      1000,   // Starting point (left edge)
      75,     // 3"
      50,     // 2"
      37.5,   // 1.5"
      25,     // 1"
      19,     // 3/4"
      12.5,   // 1/2"
      9.5,    // 3/8"
      4.75,   // #4
      2.0,    // #10
      0.425,  // #40
      0.15,   // #100
      0.075,  // #200
      0.01    // End point (right edge)
    ];

    // Calculate passing percentages from your sieve analysis data
    const totalWeight = Number(this.sieveAnalysis.totalWeigh) || 0;

    const calcPassingPercent = (cumulative: number) => {
      if (totalWeight <= 0) return 100;
      const retained = (cumulative / totalWeight) * 100;
      return Math.max(0, 100 - retained);
    };

    // Cumulative % Passing from backend data
    const passingPercentages: number[] = [
      100, // Starting at 100% (left edge)
      calcPassingPercent(this.sieveAnalysis.cumulativeA || 0),  // 3" (75mm)
      calcPassingPercent(this.sieveAnalysis.cumulativeC || 0),  // 2" (50mm)
      calcPassingPercent(this.sieveAnalysis.cumulativeD || 0),  // 1.5" (37.5mm)
      calcPassingPercent(this.sieveAnalysis.cumulativeE || 0),  // 1" (25mm)
      calcPassingPercent(this.sieveAnalysis.cumulativeF || 0),  // 3/4" (19mm)
      calcPassingPercent(this.sieveAnalysis.cumulativeG || 0),  // 1/2" (12.5mm)
      calcPassingPercent(this.sieveAnalysis.cumulativeH || 0),  // 3/8" (9.5mm)
      calcPassingPercent(this.sieveAnalysis.cumulativeI || 0),  // #4 (4.75mm)
      calcPassingPercent(this.sieveAnalysis.cumulativeJ || 0),  // #10 (2mm)
      calcPassingPercent(this.sieveAnalysis.cumulativeK || 0),  // #40 (0.425mm)
      calcPassingPercent(this.sieveAnalysis.cumulativeL || 0),  // #100 (0.15mm)
      calcPassingPercent(this.sieveAnalysis.cumulativeM || 0),  // #200 (0.075mm)
      0    // End at 0% (right edge)
    ];

// Parse Specification Limits dynamically from input (e.g. "100-90")
const parseSpec = (val: any) => {
  if (!val) return { upper: null, lower: null };
  const parts = val.toString().split('-').map((v: string) => parseFloat(v.trim()));
  return {
    upper: parts[0] ?? null,
    lower: parts[1] ?? null
  };
};

// Read each sieve's Specification Limits (e.g. from your table inputs)
const specs = [
  this.sieveAnalysis.specificationLimitsA,
  this.sieveAnalysis.specificationLimitsB,
  this.sieveAnalysis.specificationLimitsC,
  this.sieveAnalysis.specificationLimitsD,
  this.sieveAnalysis.specificationLimitsE,
  this.sieveAnalysis.specificationLimitsF,
  this.sieveAnalysis.specificationLimitsG,
  this.sieveAnalysis.specificationLimitsH,
  this.sieveAnalysis.specificationLimitsI,
  this.sieveAnalysis.specificationLimitsJ,
  this.sieveAnalysis.specificationLimitsK,
  this.sieveAnalysis.specificationLimitsL,
  this.sieveAnalysis.specificationLimitsM
];

    // Convert them into upper & lower arrays
    const specUpper: number[] = [100]; // start point (left)
    const specLower: number[] = [100]; // start point (left)

    specs.forEach(spec => {
      const { upper, lower } = parseSpec(spec);
      specUpper.push(upper ?? null);
      specLower.push(lower ?? null);
    });

    specUpper.push(0); // end point
    specLower.push(0);


    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: sieveSizes,
        datasets: [
          {
            label: 'Sample Curve',
            data: passingPercentages,
            borderColor: 'black',
            backgroundColor: 'black',
            borderWidth: 3,
            tension: 0.2,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: 'black',
            pointBorderColor: 'black',
            pointBorderWidth: 1,
            pointStyle: 'circle'
          },
          {
            label: 'Specification Limits',
            data: specUpper,
            borderColor: 'red',
            backgroundColor: 'red',
            borderWidth: 2,
            borderDash: [6, 4],  // Dashed line
            tension: 0.2,
            fill: false,
            pointRadius: 4, // Visible points like in image
            pointBackgroundColor: 'red',
            pointBorderColor: 'red',
            pointBorderWidth: 1,
            pointStyle: 'circle'
          },
          {
            data: specLower,
            borderColor: 'red',
            backgroundColor: 'red',
            borderWidth: 2,
            borderDash: [6, 4],
            tension: 0.2,
            fill: false,
            pointRadius: 4, // Visible points
            pointBackgroundColor: 'red',
            pointBorderColor: 'red',
            pointBorderWidth: 1,
            pointStyle: 'circle',
            // Hide from legend
            showLine: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 0
        },
        plugins: {
          legend: {
            display: false // Hide legend to match image
          },
          tooltip: {
            enabled: true,
            mode: 'nearest',
            intersect: false
          }
        },
        scales: {
          x: {
            type: 'logarithmic',
            reverse: true, // 1000 on left, 0.01 on right
            position: 'bottom',
            title: {
              display: true,
              text: 'GRAIN DIAMETER IN MILLIMETERS',
              font: {
                weight: 'bold',
                size: 12,
                family: 'Arial'
              },
              padding: { top: 10 }
            },
            ticks: {
              callback: function (value) {
                const labels = [1000.0, 100.0, 10.0, 1.0, 0.1];
                return labels.includes(value as number) ? value.toString() : '';
              },
              font: {
                weight: 'bold',
                size: 11,
                family: 'Arial'
              },
              color: 'black',
              padding: 5
            },
            grid: {
              display: true,
              color: 'black',
              lineWidth: 1,
              drawTicks: true,
              tickLength: 6
            },
            border: {
              display: true,
              color: 'black',
              width: 2
            },
            min: 0.01,
            max: 1000
          },
          y: {
            min: 0,
            max: 100,
            position: 'left',
            title: {
              display: true,
              text: 'PERCENT PASSING',
              font: {
                weight: 'bold',
                size: 12,
                family: 'Arial'
              },
              padding: { bottom: 10 }
            },
            ticks: {
              stepSize: 10,
              font: {
                weight: 'bold',
                size: 11,
                family: 'Arial'
              },
              color: 'black',
              padding: 5,
              callback: function(value) {
                return value.toString();
              }
            },
            grid: {
              display: true,
              color: 'black',
              lineWidth: 1,
              drawTicks: true,
              tickLength: 6
            },
            border: {
              display: true,
              color: 'black',
              width: 2
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        elements: {
          point: {
            hoverRadius: 6
          }
        }
      }
    });
  }

  formatValue(value: number, sieveName: string): string {
    if (value === null || value === undefined || isNaN(value)) {
      return "-";
    }

    const num = Number(value);

    if (sieveName === '#200') {
      if (num < 10) {
        return num.toFixed(1);
      } else {
        return Math.round(num).toString();
      }
    }

    if (num < 10) {
      return num.toFixed(1);
    }

    return Math.round(num).toString();
  }


  generatePDF() {
    if (!this.sieveAnalysis || Object.keys(this.sieveAnalysis).length === 0) {
      console.error("Sieve Analysis data is not available. Please try again later.");
      alert("Data is not yet loaded. Please wait and try again.");
      return;
    }

    const doc = new jsPDF();
    doc.addFileToVFS('Amiri-Regular.ttf', AmiriFont);
    doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.setFont('Amiri');
    const head = new Image();
    const tail = new Image();
    const qr = new Image();

    head.src = 'assets/ApproveHead.png';
    tail.src = 'assets/tail.jpeg';
    qr.src = 'assets/barcode.jpg';

    head.onload = () => {
      doc.addImage(head, 'PNG', 0, 0, 210, 33);

      doc.setFontSize(9);
      doc.setFont('Amiri', 'bold');

      const headerText = 'Standarded Test Method For Sieve Analysis Of Fine And Coarse Aggregates  AsTM C-136/ SAMPLING ASTM D75, ASTM D75M';
      const textX = 12;
      const textY = 34;

      doc.text(headerText, textX, textY);

      const textWidth = doc.getTextWidth(headerText);

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(textX - 1, textY + .5 , textX + textWidth + 2, textY + .5 ); // Line 1 unit below text

      doc.setFont('Amiri', 'normal');
      doc.setFontSize(9);

      const infoRows = [
        ['Project', {
          content: this.sieveAnalysis.projectName,
          colSpan: 4
        }, 'Sampling Date', this.sieveAnalysis.samplingDate],
        ['Client', {
          content: this.sieveAnalysis.clientName,
          colSpan: 4
        }, 'Testing Date', this.sieveAnalysis.testingDate],
        ['Location', {content: this.sieveAnalysis.location, colSpan: 4}, 'Sample By', this.sieveAnalysis.sampleBy],
        ['Sample No', this.sieveAnalysis.sampleNo, 'Test Location', {
          content: this.sieveAnalysis.location,
          colSpan: 2
        }, 'Report Date', this.sieveAnalysis.reportDate],
        ['Report No', `${this.sieveAnalysis.testCode}`, 'Source Of Sample', {
          content: this.sieveAnalysis.sourceOfSample,
          colSpan: 2
        }, 'Material Type', this.sieveAnalysis.materialType],
        ['Description', {content: this.sieveAnalysis.description, colSpan: 2}, {
          content: this.sieveAnalysis.totalWeigh + ' gm',
          colSpan: 2
        }, '', '', '', ''],
      ];

      const pageWidth = doc.internal.pageSize.getWidth();
      const tableWidth = 190;
      const marginLeft = (pageWidth - tableWidth) / 2;

      autoTable(doc, {
        startY: 37,
        body: infoRows,
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 0.5,
          font: 'Amiri',
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.5
        },
        columnStyles: {
          0: {cellWidth: 25},
          1: {cellWidth: 43},
          2: {cellWidth: 25},
          3: {cellWidth: 25},
          4: {cellWidth: 12},
          5: {cellWidth: 25},
          6: {cellWidth: 35},
        },
        tableLineColor: [0, 0, 0],
        tableLineWidth: 0.5,
        tableWidth: tableWidth,
        margin: {left: marginLeft}
      });


      const tableStartY = (doc as any).lastAutoTable.finalY;

      const chartCanvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (chartCanvas) {
        const chartImage = chartCanvas.toDataURL('image/png');
        const pageWidth = doc.internal.pageSize.getWidth();
        const borderW = 190;
        const borderH = 70;
        const scale = 1;
        const scaledBorderW = borderW * scale;
        const scaledBorderH = borderH * scale;
        const borderX = (pageWidth - scaledBorderW) / 2;
        const borderY = tableStartY ;
        const chartW = scaledBorderW - 2;
        const chartH = scaledBorderH - 10;
        const chartX = borderX + (scaledBorderW - chartW) / 2;
        const chartY = borderY + (scaledBorderH - chartH) / 2;

        doc.addImage(chartImage, 'PNG', chartX, chartY, chartW, chartH);

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.rect(borderX, borderY, scaledBorderW, scaledBorderH);
      }


      const afterChartY = tableStartY + 70;

      const totalWeight = Number(this.sieveAnalysis.totalWeigh) || 0;

      const calcRetainedPercent = (cumulative: number) => {
        return totalWeight > 0 ? (cumulative / totalWeight) * 100 : 0;
      };

      const calcPassingPercent = (cumulative: number) => {
        const retained = calcRetainedPercent(cumulative);
        return 100 - retained;
      };

      const gravel = calcRetainedPercent(this.sieveAnalysis.cumulativeI) || 0;
      const silt = calcPassingPercent(this.sieveAnalysis.cumulativeM) || 0;
      const sand = 100 - (gravel + silt);


      autoTable(doc, {
        startY: afterChartY,
        body: [
          [
            {content: "%Gravel", styles: {halign: 'center' as const, valign: 'middle' as const}},
            {content: "%Sand", styles: {halign: 'center' as const, valign: 'middle' as const}},
            {content: "%Silt", styles: {halign: 'center' as const, valign: 'middle' as const}},
            {content: "%Clay", styles: {halign: 'center' as const, valign: 'middle' as const}}
          ],
          [
            {content: gravel.toFixed(2), styles: {halign: 'center'}},
            {content: sand.toFixed(2), styles: {halign: 'center'}},
            {content: silt.toFixed(2), colSpan: 2, styles: {halign: 'center'}}
          ],
        ],
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 1,
          font: 'Amiri',
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.5
        },
        columnStyles: {
          0: {cellWidth: 48},
          1: {cellWidth: 47},
          2: {cellWidth: 48},
          3: {cellWidth: 47},
        },
        tableLineColor: [0, 0, 0],
        tableWidth: tableWidth,
        margin: {left: marginLeft}
      });


      const afterMiniTableY = (doc as any).lastAutoTable.finalY;


      const tableColumn = [
        {content: "Sieve sizes", colSpan: 2, styles: {halign: 'center' as const, valign: 'middle' as const}},
        {content: "Retained Weight (gm)", colSpan: 2, styles: {halign: 'center' as const, valign: 'middle' as const}},
        {content: "Percent", colSpan: 2, styles: {halign: 'center' as const, valign: 'middle' as const}},
        {content: "U.Expand", styles: {halign: 'center' as const, valign: 'middle' as const}},
        {content: "Specification Limits", rowSpan: 2, styles: {halign: 'center' as const, valign: 'middle' as const}}
      ];

      const tableColumn1 = [
        {content: "Inch", styles: {halign: 'center' as const, valign: 'middle' as const}},
        {content: "mm", styles: {halign: 'center' as const, valign: 'middle' as const}},
        {content: "Individual", styles: {halign: 'center' as const, valign: 'middle' as const}},
        {content: "Cumulative", styles: {halign: 'center' as const, valign: 'middle' as const}},
        {content: "Retained%", styles: {halign: 'center' as const, valign: 'middle' as const}},
        {content: "Passing%", styles: {halign: 'center' as const, valign: 'middle' as const}},
        {content: "K.2", styles: {halign: 'center' as const, valign: 'middle' as const}}
      ];
      const tableRows: any[] = [];

      const sieveData = [
        ["3", 75.0,
          this.sieveAnalysis.individualA,
          this.sieveAnalysis.cumulativeA,
          calcRetainedPercent(this.sieveAnalysis.cumulativeA).toFixed(0),
          calcPassingPercent(this.sieveAnalysis.cumulativeA).toFixed(0),
          `${'±'} ${this.sieveAnalysis.expandA}`,
          this.sieveAnalysis.specificationLimitsA
        ],
        ["21/2", 62.5,
          this.sieveAnalysis.individualB,
          this.sieveAnalysis.cumulativeB,
          calcRetainedPercent(this.sieveAnalysis.cumulativeB).toFixed(0),
          calcPassingPercent(this.sieveAnalysis.cumulativeB).toFixed(0),
          `${'±'} ${this.sieveAnalysis.expandB}`,
          this.sieveAnalysis.specificationLimitsB
        ],
        ["2", 50.0,
          this.sieveAnalysis.individualC,
          this.sieveAnalysis.cumulativeC,
          calcRetainedPercent(this.sieveAnalysis.cumulativeC).toFixed(0),
          calcPassingPercent(this.sieveAnalysis.cumulativeC).toFixed(0),
          `${'±'} ${this.sieveAnalysis.expandC}`,
          this.sieveAnalysis.specificationLimitsC
        ],
        ["11/2", 37.5,
          this.sieveAnalysis.individualD,
          this.sieveAnalysis.cumulativeD,
          calcRetainedPercent(this.sieveAnalysis.cumulativeD).toFixed(0),
          calcPassingPercent(this.sieveAnalysis.cumulativeD).toFixed(0),
          `${'±'} ${this.sieveAnalysis.expandD}`,
          this.sieveAnalysis.specificationLimitsD
        ],
        ["1", 25.0,
          this.sieveAnalysis.individualE,
          this.sieveAnalysis.cumulativeE,
          calcRetainedPercent(this.sieveAnalysis.cumulativeE).toFixed(0),
          calcPassingPercent(this.sieveAnalysis.cumulativeE).toFixed(0),
          `${'±'} ${this.sieveAnalysis.expandE}`,
          this.sieveAnalysis.specificationLimitsE
        ],
        ["3/4", 19.0,
          this.sieveAnalysis.individualF,
          this.sieveAnalysis.cumulativeF,
          calcRetainedPercent(this.sieveAnalysis.cumulativeF).toFixed(0),
          calcPassingPercent(this.sieveAnalysis.cumulativeF).toFixed(0),
          `${'±'} ${this.sieveAnalysis.expandF}`,
          this.sieveAnalysis.specificationLimitsF
        ],
        ["1/2", 12.5,
          this.sieveAnalysis.individualG,
          this.sieveAnalysis.cumulativeG,
          calcRetainedPercent(this.sieveAnalysis.cumulativeG).toFixed(0),
          calcPassingPercent(this.sieveAnalysis.cumulativeG).toFixed(0),
          `${'±'} ${this.sieveAnalysis.expandG}`,
          this.sieveAnalysis.specificationLimitsG
        ],
        ["3/8", 9.5,
          this.sieveAnalysis.individualH,
          this.sieveAnalysis.cumulativeH,
          calcRetainedPercent(this.sieveAnalysis.cumulativeH).toFixed(0),
          calcPassingPercent(this.sieveAnalysis.cumulativeH).toFixed(0),
          `${'±'} ${this.sieveAnalysis.expandH}`,
          this.sieveAnalysis.specificationLimitsH
        ],
        ["#4", 4.75,
          this.sieveAnalysis.individualI,
          this.sieveAnalysis.cumulativeI,
          calcRetainedPercent(this.sieveAnalysis.cumulativeI).toFixed(0),
          calcPassingPercent(this.sieveAnalysis.cumulativeI).toFixed(0),
          `${'±'} ${this.sieveAnalysis.expandI}`,
          this.sieveAnalysis.specificationLimitsI
        ],
        ["#10", 2.00,
          this.sieveAnalysis.individualJ,
          this.sieveAnalysis.cumulativeJ,
          calcRetainedPercent(this.sieveAnalysis.cumulativeJ).toFixed(0),
          calcPassingPercent(this.sieveAnalysis.cumulativeJ).toFixed(0),
          `${'±'} ${this.sieveAnalysis.expandJ}`,
          this.sieveAnalysis.specificationLimitsJ
        ],
        ["#40", 0.425,
          this.sieveAnalysis.individualK,
          this.sieveAnalysis.cumulativeK,
          calcRetainedPercent(this.sieveAnalysis.cumulativeK).toFixed(0),
          calcPassingPercent(this.sieveAnalysis.cumulativeK).toFixed(0),
          `${'±'} ${this.sieveAnalysis.expandK}`,
          this.sieveAnalysis.specificationLimitsK
        ],
        ["#100", 0.150,
          this.sieveAnalysis.individualL,
          this.sieveAnalysis.cumulativeL,
          calcRetainedPercent(this.sieveAnalysis.cumulativeL).toFixed(0),
          calcPassingPercent(this.sieveAnalysis.cumulativeL).toFixed(0),
          `${'±'} ${this.sieveAnalysis.expandL}`,
          this.sieveAnalysis.specificationLimitsL
        ],
        [
          "#200",
          0.075,
          this.sieveAnalysis.individualM,
          this.sieveAnalysis.cumulativeM,
          this.formatValue(calcRetainedPercent(this.sieveAnalysis.cumulativeM), "#200"),
          this.formatValue(calcPassingPercent(this.sieveAnalysis.cumulativeM), "#200"),
          `${'±'} ${this.sieveAnalysis.expandM}`,
          this.sieveAnalysis.specificationLimitsM
        ],

        [{content: "Total Wt." , colSpan: 2}, "", this.sieveAnalysis.totalWeigh, "", "", "", ""]
      ];

      sieveData.forEach(row => tableRows.push(row));

      autoTable(doc, {
        startY: afterMiniTableY,
        head: [tableColumn, tableColumn1],
        body: tableRows,
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 1.7,
          halign: 'center',
          valign: 'middle',
          lineWidth: 0.5,
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0]
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          halign: 'center',
          valign: 'middle',
          lineWidth: 0.5,
          lineColor: [0, 0, 0]
        },
        tableLineColor: [0, 0, 0],
        tableLineWidth: 0.5,
        tableWidth: tableWidth,
        margin: {left: marginLeft}
      });

      const finalY = (doc as any).lastAutoTable.finalY ?? 100;

      setTimeout(() => {
        let footerY = finalY;
        doc.setFontSize(8);

        // Use the same centering logic as your tables
        const pageWidth = doc.internal.pageSize.getWidth();
        const tableWidth = 190; // Use your table width here
        const startX = (pageWidth - tableWidth) / 2;
        const endX = startX + tableWidth;
        const boxWidth = tableWidth;

        // Remarks - centered
        let remarksHeight = 0;
        if (this.sieveAnalysis.notes) {
          const splitNotes = doc.splitTextToSize(
            `Remarks: ${this.sieveAnalysis.notes || ""}`,
            boxWidth - 8
          );

          doc.setFont("Amiri", "bold");
          doc.text(splitNotes, startX + 1, footerY + 3);

          remarksHeight = splitNotes.length * 5;
          footerY += remarksHeight + 5;
        }

        doc.line(startX, 260, endX, 260);

        doc.setFontSize(6);
        const sectionWidth = tableWidth / 3;

        doc.text(`Approved by: ${this.sieveAnalysis.lastApproveBy || " "}`, startX + 1, 264);

        doc.text(`Test by: ${this.sieveAnalysis.testBy || " "}`, startX + sectionWidth + 4, 264);

        doc.text(`Checked by: ${this.sieveAnalysis.adopter || " "}`, startX + (sectionWidth * 2) + 4, 264);

        const blockTop = finalY;
        const blockBottom = 266;
        const blockHeight = blockBottom - blockTop;

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.rect(startX, blockTop, tableWidth, blockHeight);

        doc.addImage(tail, 'PNG', 0, 267, 210, 33);

        doc.setFontSize(5);
        const formatDateTime = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day} ${hours}:${minutes}`;
        };
        const currentDateTime = formatDateTime(new Date());
        doc.text(`Report Date: ${currentDateTime}`, 1, 293);

        doc.save('Sieve_Analysis_Report.pdf');
      }, 1000);


    };

    head.onerror = () => {
      console.error("Error loading image from assets.");
    };
  }

}
